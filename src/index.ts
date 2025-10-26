import { InstanceBase, runEntrypoint, InstanceStatus, SomeCompanionConfigField } from '@companion-module/base'
import { InstanceBaseExt } from './types.js'
import { GetConfigFields, WingConfig } from './config.js'
import { UpgradeScripts } from './upgrades.js'
import { createActions } from './actions/index.js'
import { GetFeedbacksList } from './feedbacks.js'
import { WingState, WingSubscriptions } from './state/index.js'
import { OscMessage } from 'osc'
import { WingTransitions } from './transitions.js'
import { WingDeviceDetectorInstance } from './device-detector.js'
import { ModelSpec, WingModel } from './models/types.js'
import { getDeskModel } from './models/index.js'
import { GetPresets } from './presets.js'
import { ConnectionHandler } from './connection-handler.js'
import { ModuleLogger } from './logger.js'
import { StateHandler } from './state-handler.js'
import { FeedbackHandler } from './feedback-handler.js'
import { VariableHandler } from './variables/variable-handler.js'

export class WingInstance extends InstanceBase<WingConfig> implements InstanceBaseExt<WingConfig> {
	config!: WingConfig
	model: ModelSpec
	subscriptions: WingSubscriptions
	connected: boolean = false
	state: WingState = new WingState(getDeskModel(WingModel.Full))

	private reconnectTimer: NodeJS.Timeout | undefined
	private syncInterval: NodeJS.Timeout | undefined
	private statusUpdateInterval: NodeJS.Timeout | undefined

	private logger: ModuleLogger | undefined
	private connection: ConnectionHandler | undefined
	private stateHandler: StateHandler | undefined
	private feedbackHandler: FeedbackHandler | undefined
	private variableHandler: VariableHandler | undefined
	transitions: WingTransitions

	constructor(internal: unknown) {
		super(internal)

		this.subscriptions = new WingSubscriptions()
		this.model = getDeskModel(WingModel.Full) // default, later set in init

		this.transitions = new WingTransitions(this)
	}

	async init(config: WingConfig): Promise<void> {
		// Setup Logger
		this.logger = new ModuleLogger('Wing')
		this.logger.setLoggerFn((level, message) => {
			this.log(level, message)
		})

		await this.configUpdated(config)

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

		WingDeviceDetectorInstance.unsubscribe(this.id)
		this.transitions.stopAll()

		this.connection?.close()
		this.stateHandler?.clearState()
		this.variableHandler?.destroy()
	}

	async configUpdated(config: WingConfig): Promise<void> {
		this.config = config
		this.model = getDeskModel(this.config.model)
		this.subscriptions = new WingSubscriptions()

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
				this.stateHandler?.clearState()
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
				this.feedbackHandler?.processMessage(msg)
				this.variableHandler?.processMessage(msg)
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
					this.checkFeedbacks()
				})
			}

			// Setup Feedback Handler
			this.feedbackHandler = new FeedbackHandler(this.logger)
			this.subscriptions = this.feedbackHandler.subscriptions! // TODO: get rid of this
			this.feedbackHandler?.on('check-feedbacks', (feedbacks: string[]) => {
				this.checkFeedbacks(...feedbacks)
			})
		}

		// Setup Variable Handler
		this.variableHandler = new VariableHandler(this.model, this.config.variableUpdateRate, this.logger)
		this.variableHandler.on('create-variables', (variables) => {
			this.setVariableDefinitions(variables)
		})
		this.variableHandler.on('update-variable', (variable, value) => {
			this.setVariableValues({ [variable]: value })
		})
		this.variableHandler.on('send', (cmd: string, arg?: number | string) => {
			this.connection?.sendCommand(cmd, arg).catch(() => {})
		})
		this.variableHandler?.setupVariables()

		this.transitions.setUpdateRate(this.config.fadeUpdateRate ?? 50)
		this.updateStatus(InstanceStatus.Connecting)
		this.updateActions()
		this.updateFeedbacks()

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

	// TODO: get rid of this
	sendCommand = (cmd: string, argument?: number | string, preferFloat?: boolean): void => {
		this.connection?.sendCommand(cmd, argument, preferFloat).catch((err) => {
			this.logger?.error(`Error sending command ${cmd}: ${err.message}`)
		})
	}

	// TODO: get rid of this
	ensureLoaded = (path: string, arg?: string | number): void => {
		this.stateHandler?.ensureLoaded(path, arg).catch((err) => {
			this.logger?.error(`Error ensuring loaded ${path}: ${err.message}`)
		})
	}
}

runEntrypoint(WingInstance, UpgradeScripts)
