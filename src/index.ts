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
import {
	UpdateVariables as UpdateAllVariables,
	UpdateShowControlVariables,
	UpdateVariableDefinitions,
} from './variables.js'
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
	oscForwarder: osc.UDPPort | undefined
	subscriptions: WingSubscriptions
	connected: boolean = false

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

	// Precompiled regexes to avoid per-message allocations
	private readonly reCtlLib = /\/\$ctl\/lib/
	private readonly reChName = /\/ch\/\d+\/\$name/
	private readonly reAuxName = /\/aux\/\d+\/\$name/
	private readonly reBusName = /\/bus\/\d+\/\$name/
	private readonly reMtxName = /\/mtx\/\d+\/\$name/
	private readonly reMainName = /\/main\/\d+\/\$name/

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

		this.transitions.setUpdateRate(this.config.fadeUpdateRate ?? 50)
		this.updateStatus(InstanceStatus.Connecting)
		this.updateActions()
		this.updateFeedbacks()
		this.updateVariableDefinitions()

		if (this.config.host !== undefined) {
			this.setupOscSocket()
		}

		this.setupOscForwarder()

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

		if (this.oscForwarder) {
			try {
				this.oscForwarder.close()
			} catch (_e) {
				// Ignore
			}
			this.oscForwarder = undefined
		}
	}

	async configUpdated(config: WingConfig): Promise<void> {
		this.config = config
		this.model = getDeskModel(this.config.model)
		this.state = new WingState(this.model)

		this.subscriptions = new WingSubscriptions()
		this.state = new WingState(this.model)

		if (this.subscribeInterval) {
			clearInterval(this.subscribeInterval)
			this.subscribeInterval = undefined
		}
		if (this.variableUpdateInterval) {
			clearInterval(this.variableUpdateInterval)
			this.variableUpdateInterval = undefined
		}

		WingDeviceDetectorInstance.unsubscribe(this.id)
		this.transitions.stopAll()

		this.transitions.setUpdateRate(this.config.fadeUpdateRate ?? 50)
		this.updateStatus(InstanceStatus.Connecting)
		this.updateActions()
		this.updateFeedbacks()
		this.updateVariableDefinitions()

		if (this.config.host !== undefined) {
			this.setupOscSocket()
			this.updateCompanionWithState()
		}

		this.setupOscForwarder()

		this.variableUpdateInterval = setInterval(() => {
			this.UpdateVariables()
		}, this.config.variableUpdateRate)

		WingDeviceDetectorInstance.subscribe(this.id)
	}

	getConfigFields(): SomeCompanionConfigField[] {
		return GetConfigFields(this)
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
			this.connected = false
			this.log('error', `Error: ${err.message}`)
			this.updateStatus(InstanceStatus.ConnectionFailure, err.message)

			this.requestQueue.clear()
			this.inFlightRequests = {}

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
			this.updateStatus(InstanceStatus.Connecting)

			this.subscribeForUpdates()
			this.subscribeInterval = setInterval(() => {
				this.subscribeForUpdates()
			}, 9000)
			this.statusUpdateInterval = setInterval(() => {
				this.requestStatusUpdates()
			}, this.config.statusPollUpdateRate ?? 3000)

			this.state.requestNames(this)
			if (this.config.prefetchVariablesOnStartup) {
				this.state.requestAllVariables(this)
			}
		})

		this.osc.on('close' as any, () => {
			this.updateStatus(InstanceStatus.Disconnected, 'OSC connection closed')
			this.connected = false
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
			if (this.reconnectTimer) {
				clearTimeout(this.reconnectTimer)
				this.reconnectTimer = undefined
			}
			if (this.connected == false) {
				this.updateStatus(InstanceStatus.Ok)
				this.connected = true
			}
			const args = message.args as osc.MetaArgument[]
			this.log('debug', `Received ${JSON.stringify(message)}`)
			this.state.set(message.address, args)

			// Forward OSC message if forwarding is enabled
			if (this.config.enableOscForwarding && this.oscForwarder) {
				try {
					this.oscForwarder.send(message)
				} catch (err) {
					this.log('warn', `Failed to forward OSC message: ${err}`)
				}
			}

			if (this.inFlightRequests[message.address]) {
				this.log('debug', `Received answer for request ${message.address}`)
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

	private setupOscForwarder(): void {
		// Clean up existing forwarder if any
		if (this.oscForwarder) {
			try {
				this.oscForwarder.close()
			} catch (_e) {
				// Ignore
			}
			this.oscForwarder = undefined
		}

		// Setup new forwarder if enabled
		if (this.config.enableOscForwarding && this.config.oscForwardingHost && this.config.oscForwardingPort) {
			try {
				this.oscForwarder = new osc.UDPPort({
					localAddress: '0.0.0.0',
					localPort: 0,
					metadata: true,
					remoteAddress: this.config.oscForwardingHost,
					remotePort: this.config.oscForwardingPort,
				})

				this.oscForwarder.on('error', (err: Error): void => {
					this.log('warn', `OSC Forwarder Error: ${err.message}`)
				})

				this.oscForwarder.open()
				this.log('info', `OSC forwarding enabled to ${this.config.oscForwardingHost}:${this.config.oscForwardingPort}`)
			} catch (err) {
				this.log('error', `Failed to setup OSC forwarder: ${err}`)
			}
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
		// create timeout to verify that the desk is still connected, if we are actively polling
		if (this.subscriptions.getPollPaths().length > 0) {
			if (this.reconnectTimer) {
				clearTimeout(this.reconnectTimer)
				this.reconnectTimer = undefined
			}
			this.reconnectTimer = setTimeout(() => {
				this.updateStatus(InstanceStatus.Disconnected, 'Connection timed out')
				this.connected = false
			}, this.config.statusPollUpdateRate ?? 3000)
		}
		this.subscriptions.getPollPaths().forEach((c) => {
			this.sendCommand(c)
		})
	}

	private updateLists(msg: osc.OscMessage): void {
		const args = msg.args as osc.MetaArgument[]

		if (this.reCtlLib.test(msg.address)) {
			const content = String(args[0]?.value ?? '')
			const scenes = content.match(/\$scenes\s+list\s+\[([^\]]+)\]/)
			UpdateShowControlVariables(this)
			if (scenes) {
				const sceneList = scenes[1].split(',').map((s) => s.trim())
				const newScenes = sceneList.map((s) => ({ id: s, label: s }))
				const newSceneNameToIdMap = new Map(sceneList.map((s, i) => [s, i + 1]))

				const mapsEqual = (a: Map<string, number>, b: Map<string, number>): boolean => {
					if (a.size !== b.size) return false
					for (const [k, v] of a.entries()) {
						if (b.get(k) !== v) return false
					}
					return true
				}

				if (!mapsEqual(this.state.sceneNameToIdMap, newSceneNameToIdMap)) {
					this.log('info', 'Updating scene map')
					this.state.namedChoices.scenes = newScenes
					this.state.sceneNameToIdMap = newSceneNameToIdMap
					this.debounceUpdateCompanion()
				}
			}
		}
	}

	private checkFeedbackChanges(msg: osc.OscMessage): void {
		const toUpdate = this.subscriptions.getFeedbacks(msg.address)
		if (toUpdate.length > 0) {
			toUpdate.forEach((f) => this.messageFeedbacks.add(f))
			this.debounceMessageFeedbacks()
		}

		if (
			this.reChName.test(msg.address) ||
			this.reBusName.test(msg.address) ||
			this.reAuxName.test(msg.address) ||
			this.reMtxName.test(msg.address) ||
			this.reMainName.test(msg.address)
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
				this.log('warn', `Request failed (${_e}) for ${path}`)
			})
	}
}

runEntrypoint(WingInstance, UpgradeScripts)
