import { InstanceBase, runEntrypoint, InstanceStatus, SomeCompanionConfigField } from '@companion-module/base'
import { InstanceBaseExt } from './types.js'
import { GetConfigFields, WingConfig } from './config.js'
import { UpgradeScripts } from './upgrades.js'
import { createActions } from './actions/index.js'
import { GetFeedbacksList } from './feedbacks.js'
import { OscMessage } from 'osc'
import { WingTransitions } from './handlers/transitions.js'
import { WingDeviceDetectorInstance } from './handlers/device-detector.js'
import { ModelSpec, WingModel } from './models/types.js'
import { getDeskModel } from './models/index.js'
import { GetPresets } from './presets.js'
import { ConnectionHandler } from './handlers/connection-handler.js'
import { ModuleLogger } from './handlers/logger.js'
import { StateHandler } from './handlers/state-handler.js'
import { FeedbackHandler } from './handlers/feedback-handler.js'
import { VariableHandler } from './variables/variable-handler.js'
import { OscForwarder } from './handlers/osc-forwarder.js'

export class WingInstance extends InstanceBase<WingConfig> implements InstanceBaseExt<WingConfig> {
	config!: WingConfig
	model: ModelSpec
	connected: boolean = false

	private reconnectTimer: NodeJS.Timeout | undefined
	private statusUpdateInterval: NodeJS.Timeout | undefined

	logger: ModuleLogger | undefined
	connection: ConnectionHandler | undefined
	stateHandler: StateHandler | undefined
	feedbackHandler: FeedbackHandler | undefined
	variableHandler: VariableHandler | undefined
	transitions: WingTransitions
	oscForwarder: OscForwarder | undefined

	constructor(internal: unknown) {
		super(internal)

		// this.subscriptions = new WingSubscriptions()
		this.model = getDeskModel(WingModel.Full) // default, later set in init

		this.transitions = new WingTransitions(this)
	}

	async init(config: WingConfig): Promise<void> {
		// Setup Logger
		this.logger = new ModuleLogger('Wing')
		this.logger.setLoggerFn((level, message) => {
			this.log(level, message)
		})
		if (config.debugMode === true) {
			this.logger.debugMode = true
			this.logger.timestamps = true
		}

		await this.configUpdated(config)

		WingDeviceDetectorInstance.subscribe(this.id)
	}

	async destroy(): Promise<void> {
		if (this.statusUpdateInterval) {
			clearInterval(this.statusUpdateInterval)
			this.statusUpdateInterval = undefined
		}
		if (this.reconnectTimer) {
			clearTimeout(this.reconnectTimer)
			this.reconnectTimer = undefined
		}

		WingDeviceDetectorInstance.unsubscribe(this.id)
		this.transitions.stopAll()

		this.connection?.close()
		this.stateHandler?.clearState()

		this.oscForwarder?.close()
		this.oscForwarder = undefined
		this.variableHandler?.destroy()
	}

	async configUpdated(config: WingConfig): Promise<void> {
		this.config = config
		this.model = getDeskModel(this.config.model)
		// this.subscriptions = new WingSubscriptions()

		if (config.debugMode === true) {
			this.logger!.debugMode = true
			this.logger!.timestamps = true
		}

		WingDeviceDetectorInstance.unsubscribe(this.id)
		this.transitions.stopAll()

		if (this.config.host !== undefined) {
			// Setup OSC
			this.connection = new ConnectionHandler(this.logger)
			this.connection.setSubscriptionInterval(this.config.subscriptionInterval)
			await this.connection?.open('0.0.0.0', 0, this.config.host, 2223)

			this.connection?.on('ready', () => {
				this.updateStatus(InstanceStatus.Ok, 'Connection Ready')
				void this.requestStatusUpdates()
				this.stateHandler?.state?.requestNames(this)
				if (this.config.prefetchVariablesOnStartup) {
					this.stateHandler?.state?.requestAllVariables(this)
				}
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
				if (this.connected == false) {
					this.updateStatus(InstanceStatus.Ok)
					this.connected = true
				}
				if (this.reconnectTimer) {
					clearTimeout(this.reconnectTimer)
					this.reconnectTimer = undefined
				}
				this.stateHandler?.processMessage(msg)
				this.feedbackHandler?.processMessage(msg)
				this.variableHandler?.processMessage(msg)
				this.oscForwarder?.send(msg)
			})

			// Setup State Handler
			this.stateHandler = new StateHandler(this.model, this.logger)
			this.stateHandler.setTimeout(this.config.requestTimeout ?? 200)
			if (this.stateHandler) {
				this.stateHandler.on('request', (path: string, arg?: string | number) => {
					this.connection!.sendCommand(path, arg).catch(() => {})
				})
				this.stateHandler.on('request-failed', (path: string) => {
					if (this.config.panicOnLostRequest) {
						this.updateStatus(InstanceStatus.ConnectionFailure, `Request failed for ${path}`)
					}
				})

				this.stateHandler.on('update', () => {
					this.setPresetDefinitions(GetPresets(this))
					this.setActionDefinitions(createActions(this))
					this.setFeedbackDefinitions(GetFeedbacksList(this))
					this.checkFeedbacks()
				})
			}

			// Setup Feedback Handler
			this.feedbackHandler = new FeedbackHandler(this.logger)
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
		this.updateStatus(InstanceStatus.Connecting, 'waiting for response from console...')
		this.updateActions()
		this.updateFeedbacks()

		// Setup OSC forwarder
		if (!this.oscForwarder && this.logger) {
			this.oscForwarder = new OscForwarder(this.logger)
		}
		this.oscForwarder?.setup(
			this.config.enableOscForwarding,
			this.config.oscForwardingHost,
			this.config.oscForwardingPort,
		)

		if (this.reconnectTimer) {
			clearTimeout(this.reconnectTimer)
			this.reconnectTimer = undefined
		}

		WingDeviceDetectorInstance.subscribe(this.id)
	}

	private async requestStatusUpdates(): Promise<void> {
		const subs = this.feedbackHandler?.subscriptions
		if (!subs) return
		// create timeout to verify that the desk is still connected, if we are actively polling
		if (subs.getPollPaths().length > 0) {
			if (this.reconnectTimer) {
				clearTimeout(this.reconnectTimer)
				this.reconnectTimer = undefined
			}
			this.reconnectTimer = setTimeout(() => {
				this.updateStatus(InstanceStatus.Disconnected, 'Connection timed out')
				this.connected = false
			}, this.config.statusPollUpdateRate ?? 3000)
		}
		subs.getPollPaths().forEach((c) => {
			void this.connection?.sendCommand(c)
		})
	}

	getConfigFields(): SomeCompanionConfigField[] {
		return GetConfigFields(this)
	}

	updateActions(): void {
		this.setActionDefinitions(createActions(this))
	}

	updateFeedbacks(): void {
		this.setFeedbackDefinitions(GetFeedbacksList(this))
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
		this.setFeedbackDefinitions(GetFeedbacksList(this))
	}
}

runEntrypoint(WingInstance, UpgradeScripts)
