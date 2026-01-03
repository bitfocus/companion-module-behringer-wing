import { InstanceBase, runEntrypoint, InstanceStatus, SomeCompanionConfigField, Regex } from '@companion-module/base'
import { InstanceBaseExt } from './types.js'
import { GetConfigFields, WingConfig } from './config.js'
import { UpgradeScripts } from './upgrades.js'
import { createActions } from './actions/index.js'
import { GetFeedbacksList } from './feedbacks.js'
import { OscMessage } from 'osc'
import { WingTransitions } from './handlers/transitions.js'
import { WingDeviceDetector } from './handlers/device-detector.js'
import { ModelSpec, WingModel } from './models/types.js'
import { getDeskModel } from './models/index.js'
import { GetPresets } from './presets.js'
import { ConnectionHandler } from './handlers/connection-handler.js'
import { ModuleLogger } from './handlers/logger.js'
import { StateHandler } from './handlers/state-handler.js'
import { FeedbackHandler } from './handlers/feedback-handler.js'
import { VariableHandler } from './variables/variable-handler.js'
import { OscForwarder } from './handlers/osc-forwarder.js'
import { CustomControlsHandler } from './handlers/cc-handler.js'

export class WingInstance extends InstanceBase<WingConfig> implements InstanceBaseExt<WingConfig> {
	config!: WingConfig
	model: ModelSpec

	connected: boolean = false

	deviceDetector: WingDeviceDetector | undefined
	logger: ModuleLogger | undefined
	connection: ConnectionHandler | undefined
	stateHandler: StateHandler | undefined
	feedbackHandler: FeedbackHandler | undefined
	variableHandler: VariableHandler | undefined
	transitions: WingTransitions
	oscForwarder: OscForwarder | undefined
	ccHandler: CustomControlsHandler | undefined

	constructor(internal: unknown) {
		super(internal)
		this.model = getDeskModel(WingModel.Full) // later populated correctly
		this.transitions = new WingTransitions(this)
	}

	async init(config: WingConfig): Promise<void> {
		this.logger = new ModuleLogger('Wing')
		this.logger.setLoggerFn((level, message) => {
			this.log(level, message)
		})
		this.logger.debugMode = config.debugMode ?? false
		this.logger.timestamps = config.debugMode ?? false

		await this.configUpdated(config)
	}

	async destroy(): Promise<void> {
		this.deviceDetector?.unsubscribe(this.id)
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

		if (config.debugMode === true) {
			this.logger!.debugMode = true
			this.logger!.timestamps = true
		}

		this.setupDeviceDetector()
		this.transitions.stopAll()

		this.setupConnectionHandler()
		this.setupStateHandler()
		this.setupFeedbackHandler()

		this.setupVariableHandler()

		this.transitions.setUpdateRate(this.config.fadeUpdateRate ?? 50)
		this.updateActions()
		this.updateFeedbacks()

		this.setupOscForwarder()

		this.setupCcSurfaces().catch((err) => {
			this.logger?.error(`Error setting up CC Surfaces: ${err.message}`)
		})

		this.deviceDetector?.subscribe(this.id)
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

	private setupDeviceDetector(): void {
		this.deviceDetector = new WingDeviceDetector(this.logger)
		this.deviceDetector?.unsubscribe(this.id)

		if (this.deviceDetector) {
			;(this.deviceDetector as any).on?.('no-device-detected', () => {
				this.logger?.warn('No console detected on the network')
				this.updateStatus(InstanceStatus.Disconnected, 'Unable to detect a console on the network')
			})
		}
	}

	private setupConnectionHandler(): void {
		this.connection = new ConnectionHandler(this.logger)

		const ipPattern = Regex.IP.replace(/^\/|\/$/g, '')
		const ipRegex = new RegExp(ipPattern)

		if (!ipRegex.test(this.config.host ?? '')) {
			this.updateStatus(InstanceStatus.BadConfig, 'No host configured')
			return
		}

		this.connection.open('0.0.0.0', 0, this.config.host!, 2223)
		this.connection.setSubscriptionInterval(this.config.subscriptionInterval ?? 9000)
		this.connection.startSubscription()

		this.connection?.on('ready', () => {
			this.updateStatus(InstanceStatus.Connecting, 'waiting for response from console...')
			void this.connection?.sendCommand('/*', undefined, undefined, true) // send something to trigger response from console
		})

		this.connection?.on('error', (err: Error) => {
			this.updateStatus(InstanceStatus.ConnectionFailure, err.message)
		})

		this.connection?.on('close', () => {
			this.updateStatus(InstanceStatus.Disconnected, 'OSC connection closed')
			this.connected = false
			this.feedbackHandler?.startPolling()
			this.stateHandler?.clearState()
		})

		this.connection?.on('message', (msg: OscMessage) => {
			if (this.connected == false) {
				this.updateStatus(InstanceStatus.Ok)
				this.connected = true

				this.logger?.info('OSC connection established')

				this.feedbackHandler?.startPolling()
				this.stateHandler?.state?.requestNames(this)
				if (this.config.prefetchVariablesOnStartup) {
					this.stateHandler?.state?.requestAllVariables(this)
				}
				this.stateHandler?.requestUpdate()
			}
			this.feedbackHandler?.clearPollTimeout()
			this.stateHandler?.processMessage(msg)
			this.feedbackHandler?.processMessage(msg)
			this.variableHandler?.processMessage(msg)
			if (this.config.useCcSurfaces) {
				void this.ccHandler?.processMessage(msg)
			}
			this.oscForwarder?.send(msg)
		})
	}

	private setupStateHandler(): void {
		this.stateHandler = new StateHandler(this.model, this.logger)
		this.stateHandler.setTimeout(this.config.requestTimeout ?? 200)

		this.stateHandler.on('request', (path: string, arg?: string | number) => {
			this.connection?.sendCommand(path, arg).catch(() => {})
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

	private setupFeedbackHandler(): void {
		this.feedbackHandler = new FeedbackHandler(this.logger)
		this.feedbackHandler.setPollInterval(this.config.statusPollUpdateRate ?? 3000)

		this.feedbackHandler.on('check-feedbacks', (feedbacks: string[]) => {
			this.checkFeedbacks(...feedbacks)
		})

		this.feedbackHandler.on('poll-request', (paths: string[]) => {
			paths.forEach((path) => {
				this.logger?.info(path)
				this.stateHandler?.ensureLoaded(path)
			})
		})

		this.feedbackHandler.on('poll-connection-timeout', () => {
			this.updateStatus(InstanceStatus.Disconnected, 'Connection timed out')
			this.connected = false
		})
	}

	private setupVariableHandler(): void {
		this.variableHandler = new VariableHandler(this.model, this.config.variableUpdateRate, this.logger)

		this.variableHandler.on('create-variables', (variables) => {
			this.setVariableDefinitions(variables)
		})

		this.variableHandler.on('update-variable', (variable, value) => {
			let rounded = Math.round((value + Number.EPSILON) * 10) / 10
			if (Number.isInteger(value)) {
				rounded = Math.round(value)
			}
			this.setVariableValues({ [variable]: rounded })
		})

		this.variableHandler.on('send', (cmd: string, arg?: number | string) => {
			this.connection?.sendCommand(cmd, arg).catch(() => {})
		})

		this.variableHandler?.setupVariables()
	}

	private setupOscForwarder(): void {
		if (!this.oscForwarder && this.logger) {
			this.oscForwarder = new OscForwarder(this.logger)
		}
		this.oscForwarder?.setup(
			this.config.enableOscForwarding,
			this.config.oscForwardingHost,
			this.config.oscForwardingPort,
		)
	}

	private async setupCcSurfaces(): Promise<void> {
		if (this.config.useCcSurfaces) {
			this.ccHandler = new CustomControlsHandler(this.model)
			await this.ccHandler.setupSurfaces({
				useCcUserPages: this.config.useCcUserPages,
				ccUserPagesToCreate: this.config.ccUserPagesToCreate,
				useCcGpio: this.config.useCcGpio,
				useCcUser: this.config.useCcUser,
				useCcDaw: this.config.useCcDaw,
			})
		}
	}
}

runEntrypoint(WingInstance, UpgradeScripts)
