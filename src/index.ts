import {
	InstanceBase,
	runEntrypoint,
	InstanceStatus,
	SomeCompanionConfigField,
	OSCSomeArguments,
} from '@companion-module/base'
import PQueue from 'p-queue'
import { InstanceBaseExt } from './types.js'
import { GetConfigFields, WingConfig } from './config.js'
import { UpdateVariables as UpdateAllVariables, UpdateVariableDefinitions } from './variables.js'
import { UpgradeScripts } from './upgrades.js'
import { createActions } from './actions/index.js'
import { FeedbackId, GetFeedbacksList } from './feedbacks.js'
import { WingState, WingSubscriptions } from './state/index.js'
import osc, { OscMessage } from 'osc'
import debounceFn from 'debounce-fn'
import { WingTransitions } from './transitions.js'
import { WingDeviceDetectorInstance } from './device-detector.js'
import { ModelSpec, WingModel } from './models/types.js'
import { getDeskModel } from './models/index.js'
import { GetPresets } from './presets.js'

export class WingInstance extends InstanceBase<WingConfig> implements InstanceBaseExt<WingConfig> {
	config!: WingConfig
	state: WingState
	model: ModelSpec
	osc: osc.UDPPort
	subscriptions: WingSubscriptions

	private heartbeatTimer: NodeJS.Timeout | undefined
	private reconnectTimer: NodeJS.Timeout | undefined
	private syncInterval: NodeJS.Timeout | undefined
	private subscribeInterval: NodeJS.Timeout | undefined
	private statusUpdateInterval: NodeJS.Timeout | undefined
	private variableUpdateInterval: NodeJS.Timeout | undefined

	/**
	 * Keeps track of sent requests for values that have been sent and not yet answered.
	 */
	private inFlightRequests: { [path: string]: () => void } = {}

	private readonly debounceUpdateCompanion: () => void
	private readonly requestQueue: PQueue = new PQueue({
		concurrency: 100,
		timeout: 200,
		throwOnTimeout: true,
	})
	transitions: WingTransitions

	private readonly messageFeedbacks = new Set<FeedbackId>()
	private readonly debounceMessageFeedbacks: () => void

	private variableMessages: { [path: string]: OscMessage } = {}

	constructor(internal: unknown) {
		super(internal)

		this.osc = new osc.UDPPort({})
		this.subscriptions = new WingSubscriptions()
		this.model = getDeskModel(WingModel.Full) // default, later set in init
		this.state = new WingState(this.model) // default, later set in init

		this.debounceUpdateCompanion = debounceFn(this.updateCompanionWithState.bind(this), {
			wait: 200,
			maxWait: 2000,
			before: false,
			after: true,
		})

		this.debounceMessageFeedbacks = debounceFn(
			() => {
				const feedbacks = Array.from(this.messageFeedbacks).map((feedback) => feedback.toString())
				this.messageFeedbacks.clear()
				this.checkFeedbacks(...feedbacks)
			},
			{
				wait: 100,
				maxWait: 500,
				before: true,
				after: true,
			},
		)

		this.transitions = new WingTransitions(this)
	}

	async init(config: WingConfig): Promise<void> {
		this.config = config
		this.model = getDeskModel(this.config.model)
		this.state = new WingState(this.model)
		this.log('error', `${this.model.gpio}`)

		this.transitions.setUpdateRate(this.config.fadeUpdateRate ?? 50)
		this.updateStatus(InstanceStatus.Connecting)
		this.updateActions()
		this.updateFeedbacks()
		this.updateVariableDefinitions()

		if (this.config.host !== undefined) {
			this.setupOscSocket()
		}

		this.variableUpdateInterval = setInterval(() => {
			this.UpdateVariables()
		}, this.config.variableUpdateRate)

		WingDeviceDetectorInstance.subscribe(this.id)

		this.updateCompanionWithState()
	}

	async destroy(): Promise<void> {
		if (this.reconnectTimer) {
			clearTimeout(this.reconnectTimer)
			this.reconnectTimer = undefined
		}
		if (this.syncInterval) {
			clearInterval(this.syncInterval)
			this.syncInterval = undefined
		}
		if (this.subscribeInterval) {
			clearInterval(this.subscribeInterval)
			this.subscribeInterval = undefined
		}
		if (this.statusUpdateInterval) {
			clearInterval(this.statusUpdateInterval)
			this.statusUpdateInterval = undefined
		}
		if (this.variableUpdateInterval) {
			clearInterval(this.variableUpdateInterval)
			this.variableUpdateInterval = undefined
		}

		WingDeviceDetectorInstance.unsubscribe(this.id)
		this.transitions.stopAll()

		if (this.osc) {
			try {
				this.osc.close()
			} catch (_e) {
				// Ignore
			}
		}
	}

	async configUpdated(config: WingConfig): Promise<void> {
		this.config = config
		this.model = getDeskModel(this.config.model)
		this.state = new WingState(this.model)

		this.subscriptions = new WingSubscriptions()
		this.state = new WingState(this.model)

		this.transitions.stopAll()
		this.transitions.setUpdateRate(this.config.fadeUpdateRate ?? 50)

		if (this.config.host !== undefined) {
			this.updateStatus(InstanceStatus.Connecting)
			this.setupOscSocket()
			this.updateCompanionWithState()
		}

		this.variableUpdateInterval = setInterval(() => {
			this.UpdateVariables()
		}, this.config.variableUpdateRate)
	}

	getConfigFields(): SomeCompanionConfigField[] {
		return GetConfigFields()
	}

	updateActions(): void {
		this.setActionDefinitions(createActions(this))
	}

	updateFeedbacks(): void {
		this.setFeedbackDefinitions(GetFeedbacksList(this, this.state, this.subscriptions, this.ensureLoaded))
	}

	updateVariableDefinitions(): void {
		UpdateVariableDefinitions(this)
	}

	private setupOscSocket(): void {
		this.updateStatus(InstanceStatus.Connecting)

		if (this.reconnectTimer) {
			clearTimeout(this.reconnectTimer)
			this.reconnectTimer = undefined
		}
		if (this.syncInterval) {
			clearInterval(this.syncInterval)
			this.syncInterval = undefined
		}
		if (this.statusUpdateInterval) {
			clearInterval(this.statusUpdateInterval)
			this.statusUpdateInterval = undefined
		}

		if (this.osc) {
			try {
				this.osc.close()
			} catch (_e) {
				// Ignore
			}
		}

		this.osc = new osc.UDPPort({
			localAddress: '0.0.0.0',
			localPort: 0,
			broadcast: true,
			metadata: true,
			remoteAddress: this.config.host,
			remotePort: 2223,
		})

		this.osc.on('error', (err: Error): void => {
			this.log('error', `Error: ${err.message}`)
			this.updateStatus(InstanceStatus.ConnectionFailure, err.message)

			this.requestQueue.clear()
			this.inFlightRequests = {}

			if (this.heartbeatTimer) {
				clearInterval(this.heartbeatTimer)
				this.heartbeatTimer = undefined
			}
			if (this.subscribeInterval) {
				clearInterval(this.subscribeInterval)
				this.subscribeInterval = undefined
			}
			if (this.statusUpdateInterval) {
				clearInterval(this.statusUpdateInterval)
				this.statusUpdateInterval = undefined
			}
		})
		this.osc.on('ready', () => {
			this.pulse()
			this.heartbeatTimer = setInterval(() => {
				this.pulse()
			}, 1500)

			this.subscribeForUpdates()
			this.subscribeInterval = setInterval(() => {
				this.subscribeForUpdates()
			}, 9000)
			this.statusUpdateInterval = setInterval(() => {
				this.requestStatusUpdates()
			}, this.config.statusPollUpdateRate ?? 3000)

			this.state.requestNames(this.model, this.ensureLoaded)
			this.requestQueue.clear()
			this.inFlightRequests = {}

			this.updateStatus(InstanceStatus.Connecting)
		})

		this.osc.on('close' as any, () => {
			if (this.heartbeatTimer !== undefined) {
				clearInterval(this.heartbeatTimer)
				this.heartbeatTimer = undefined
			}

			if (this.subscribeInterval) {
				clearInterval(this.subscribeInterval)
				this.subscribeInterval = undefined
			}
			if (this.statusUpdateInterval) {
				clearInterval(this.statusUpdateInterval)
				this.statusUpdateInterval = undefined
			}
		})

		this.osc.on('message', (message): void => {
			this.updateStatus(InstanceStatus.Ok)
			const args = message.args as osc.MetaArgument[]
			// this.log('debug', `Received ${JSON.stringify(message)}`)
			this.state.set(message.address, args)

			if (this.inFlightRequests[message.address]) {
				// this.log('debug', `Received answer for request ${message.address}`)
				this.inFlightRequests[message.address]()
				delete this.inFlightRequests[message.address]
			}

			// setImmediate(() => {
			this.checkFeedbackChanges(message)

			this.updateLists(message)

			this.variableMessages[message.address] = message
			// this.debounceUpdateVariables()

			// })
		})

		this.osc.open()
	}

	private pulse(): void {
		try {
			this.sendCommand('/WING?')
		} catch (_e) {
			// Ignore
		}
	}
	private subscribeForUpdates(): void {
		if (this.osc) {
			try {
				this.sendCommand('/*S', undefined)
			} catch (_e) {
				// Ignore
			}
		}
	}

	private requestStatusUpdates(): void {
		this.subscriptions.getPollPaths().forEach((c) => {
			this.sendCommand(c)
		})
	}

	private updateLists(msg: osc.OscMessage): void {
		const args = msg.args as osc.MetaArgument[]

		const libRe = /\/\$ctl\/lib/
		// const usbRe = /\/play/
		// const sd1Re = /\cards\/wlive\/1\/\$stat/
		// const sd2Re = /\cards\/wlive\/2\/\$stat/

		// scene list
		if (libRe.test(msg.address)) {
			const content = String(args[0]?.value ?? '')
			const scenes = content.match(/\$scenes\s+list\s+\[([^\]]+)\]/)
			console.log(scenes)
			if (scenes) {
				const sceneList = scenes[1].split(',').map((s) => s.trim())
				this.state.namedChoices.scenes = sceneList.map((s) => ({ id: s, label: s }))
				this.state.sceneNameToIdMap = new Map(sceneList.map((s, i) => [s, i + 1]))
			}
		}
	}

	private checkFeedbackChanges(msg: osc.OscMessage): void {
		const toUpdate = this.subscriptions.getFeedbacks(msg.address)
		if (toUpdate.length > 0) {
			toUpdate.forEach((f) => this.messageFeedbacks.add(f))
			this.debounceMessageFeedbacks()
		}

		const channelNameRe = /\/ch\/\d+\/\$name/
		const auxNameRe = /\/aux\/\d+\/\$name/
		const busNameRe = /\/bus\/\d+\/\$name/
		const mtxNameRe = /\/mtx\/\d+\/\$name/
		const mainNameRe = /\/main\/\d+\/\$name/
		const libRe = /\/\$ctl\/lib/
		if (
			channelNameRe.test(msg.address) ||
			busNameRe.test(msg.address) ||
			auxNameRe.test(msg.address) ||
			mtxNameRe.test(msg.address) ||
			mainNameRe.test(msg.address) ||
			libRe.test(msg.address)
		) {
			// this.log('info', 'Would update now')

			this.debounceUpdateCompanion()
		}
	}

	private updateCompanionWithState(): void {
		this.state.updateNames(this.model)

		this.setPresetDefinitions(GetPresets(this))
		this.setActionDefinitions(createActions(this))
		this.setFeedbackDefinitions(GetFeedbacksList(this, this.state, this.subscriptions, this.ensureLoaded))
		this.checkFeedbacks()
	}

	private UpdateVariables(): void {
		const messages: OscMessage[] = Object.values(this.variableMessages)
		if (messages.length === 0) {
			return
		}
		UpdateAllVariables(this, messages)
		this.variableMessages = {}
	}

	sendCommand = (cmd: string, argument?: number | string, preferFloat?: boolean): void => {
		if (!this.config.host) {
			return
		}

		let args: OSCSomeArguments = []
		if (typeof argument === 'number') {
			if (preferFloat) {
				args = {
					type: 'f',
					value: argument,
				}
			} else {
				if (Number.isInteger(argument)) {
					args = {
						type: 'i',
						value: argument,
					}
				} else {
					args = {
						type: 'f',
						value: argument,
					}
				}
			}
		} else if (typeof argument === 'string') {
			args = {
				type: 's',
				value: argument,
			}
		} else if (argument == undefined) {
			args = []
		} else {
			console.error('Unsupported argument type. Command aborted.')
		}
		const command = {
			address: cmd,
			args: args,
		}
		this.osc.send(command)
		this.osc.send({ address: cmd, args: [] }) // a bit ugly, but needed to keep the desk state up to date in companion
	}

	ensureLoaded = (path: string, arg?: string | number): void => {
		this.requestQueue
			.add(async () => {
				if (this.inFlightRequests[path]) {
					return
				}

				if (this.state.get(path)) {
					return
				}

				this.log('debug', `Requesting ${path}`)

				const p = new Promise<void>((resolve) => {
					this.inFlightRequests[path] = resolve
				})

				this.sendCommand(path, arg ?? undefined)

				await p
			})
			.catch((_e: unknown) => {
				delete this.inFlightRequests[path]
				// this.log('error', `Request failed for ${path}`)
			})
	}
}

runEntrypoint(WingInstance, UpgradeScripts)
