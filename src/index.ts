import { InstanceBase, runEntrypoint, InstanceStatus, SomeCompanionConfigField } from '@companion-module/base'
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
import { ConnectionHandler } from './connection-handler.js'
import { ModuleLogger } from './logger.js'
import { StateHandler } from './state-handler.js'

export class WingInstance extends InstanceBase<WingConfig> implements InstanceBaseExt<WingConfig> {
	config!: WingConfig
	model: ModelSpec
	oscForwarder: osc.UDPPort | undefined
	subscriptions: WingSubscriptions
	connected: boolean = false
	state: WingState = new WingState(getDeskModel(WingModel.Full))

	private reconnectTimer: NodeJS.Timeout | undefined
	private syncInterval: NodeJS.Timeout | undefined
	// private subscribeInterval: NodeJS.Timeout | undefined
	private statusUpdateInterval: NodeJS.Timeout | undefined
	private variableUpdateInterval: NodeJS.Timeout | undefined

	private logger: ModuleLogger | undefined
	private connection: ConnectionHandler | undefined
	private stateHandler: StateHandler | undefined
	transitions: WingTransitions

	private readonly messageFeedbacks = new Set<FeedbackId>()
	private readonly debounceMessageFeedbacks: () => void

	private variableMessages: { [path: string]: OscMessage } = {}

	// Precompiled regexes to avoid per-message allocations
	private readonly reChName = /\/ch\/\d+\/\$name/
	private readonly reAuxName = /\/aux\/\d+\/\$name/
	private readonly reBusName = /\/bus\/\d+\/\$name/
	private readonly reMtxName = /\/mtx\/\d+\/\$name/
	private readonly reMainName = /\/main\/\d+\/\$name/

	constructor(internal: unknown) {
		super(internal)

		this.subscriptions = new WingSubscriptions()
		this.model = getDeskModel(WingModel.Full) // default, later set in init

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
		// Setup Logger
		this.logger = new ModuleLogger('Wing')
		this.logger.setLoggerFn((level, message) => {
			this.log(level, message)
		})

		await this.configUpdated(config)

		this.setupOscForwarder()

		this.variableUpdateInterval = setInterval(() => {
			this.UpdateVariables()
		}, this.config.variableUpdateRate ?? 1000)

		WingDeviceDetectorInstance.subscribe(this.id)
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

		this.connection?.close()
		this.stateHandler?.clearState()

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
		this.subscriptions = new WingSubscriptions()

		if (this.variableUpdateInterval) {
			clearInterval(this.variableUpdateInterval)
			this.variableUpdateInterval = undefined
		}

		WingDeviceDetectorInstance.unsubscribe(this.id)
		this.transitions.stopAll()

		if (this.config.host !== undefined) {
			// Setup OSC
			this.connection = new ConnectionHandler(this.logger)
			await this.connection?.open('0.0.0.0', 0, this.config.host, this.config.port ?? 2223)

			this.connection?.on('ready', () => {
				this.updateStatus(InstanceStatus.Ok)
				this.requestStatusUpdates()
			})

			this.connection?.on('error', (err: Error) => {
				this.updateStatus(InstanceStatus.ConnectionFailure, err.message)
				if (this.statusUpdateInterval) {
					clearInterval(this.statusUpdateInterval)
					this.statusUpdateInterval = undefined
				}
			})

			this.connection?.on('close', () => {
				this.updateStatus(InstanceStatus.Disconnected, 'OSC connection closed')
				this.connected = false
				if (this.statusUpdateInterval) {
					clearInterval(this.statusUpdateInterval)
					this.statusUpdateInterval = undefined
				}
				this.updateStatus(InstanceStatus.Disconnected, 'OSC connection closed')
			})

			this.connection?.on('message', (msg: OscMessage) => {
				if (this.reconnectTimer) {
					clearTimeout(this.reconnectTimer)
					this.reconnectTimer = undefined
				}
				if (this.connected == false) {
					this.updateStatus(InstanceStatus.Ok)
					this.connected = true
				}
				this.stateHandler?.processMessage(msg)

				this.checkFeedbackChanges(msg)
				this.variableMessages[msg.address] = msg
				this.oscForwarder?.send(msg)
			})

			// Setup State Handler
			this.stateHandler = new StateHandler(this.model, this.logger)
			if (this.stateHandler) {
				this.state = this.stateHandler.state ?? new WingState(this.model)

				this.stateHandler.on('request', (path: string, arg?: string | number) => {
					this.sendCommand(path, arg)
				})

				this.stateHandler.on('update', (state: WingState) => {
					this.setPresetDefinitions(GetPresets(this))
					this.setActionDefinitions(createActions(this))
					this.setFeedbackDefinitions(GetFeedbacksList(this, state, this.subscriptions, this.ensureLoaded))
					UpdateShowControlVariables(this)
					this.checkFeedbacks()
				})
			}
		}

		this.transitions.setUpdateRate(this.config.fadeUpdateRate ?? 50)
		this.updateStatus(InstanceStatus.Connecting)
		this.updateActions()
		this.updateFeedbacks()
		this.updateVariableDefinitions()

		this.setupOscForwarder()

		this.variableUpdateInterval = setInterval(() => {
			this.UpdateVariables()
		}, this.config.variableUpdateRate ?? 1000)

		WingDeviceDetectorInstance.subscribe(this.id)
	}

	getConfigFields(): SomeCompanionConfigField[] {
		return GetConfigFields(this)
	}

	updateActions(): void {
		this.setActionDefinitions(createActions(this))
	}

	updateFeedbacks(): void {
		this.setFeedbackDefinitions(
			GetFeedbacksList(
				this,
				this.stateHandler?.state ?? new WingState(this.model),
				this.subscriptions,
				this.ensureLoaded,
			),
		)
	}

	updateVariableDefinitions(): void {
		UpdateVariableDefinitions(this)
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
			this.stateHandler?.requestUpdate()
		}
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
		this.connection?.sendCommand(cmd, argument, preferFloat).catch((err) => {
			this.logger?.error(`Error sending command ${cmd}: ${err.message}`)
		})
	}

	ensureLoaded = (path: string, arg?: string | number): void => {
		this.stateHandler?.ensureLoaded(path, arg).catch((err) => {
			this.logger?.error(`Error ensuring loaded ${path}: ${err.message}`)
		})
	}
}

runEntrypoint(WingInstance, UpgradeScripts)
