import {
	InstanceBase,
	runEntrypoint,
	InstanceStatus,
	SomeCompanionConfigField,
	Regex,
	CompanionVariableValues,
} from '@companion-module/base'
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
import { StateHandler } from './handlers/state-handler.js'
import { FeedbackHandler } from './handlers/feedback-handler.js'
import { VariableHandler } from './variables/variable-handler.js'
import { OscForwarder } from './handlers/osc-forwarder.js'
import debounceFn from 'debounce-fn'
import { ModuleLogger } from './handlers/logger.js'

export class WingInstance extends InstanceBase<WingConfig> implements InstanceBaseExt<WingConfig> {
	private readonly debounceHandleMessages: () => void
	private readonly messages = new Set<OscMessage>()

	config!: WingConfig
	model: ModelSpec

	connected: boolean = false

	deviceDetector: WingDeviceDetector | undefined
	connection: ConnectionHandler | undefined
	stateHandler: StateHandler | undefined
	feedbackHandler: FeedbackHandler | undefined
	variableHandler: VariableHandler | undefined
	transitions: WingTransitions
	oscForwarder: OscForwarder | undefined
	logger: ModuleLogger | undefined

	constructor(internal: unknown) {
		super(internal)
		this.model = getDeskModel(WingModel.Full) // later populated correctly
		this.transitions = new WingTransitions(this)
		this.debounceHandleMessages = debounceFn(
			() => {
				this.handleMessages()
				this.messages.clear()
			},
			{
				wait: 20,
				maxWait: 100,
				before: false,
				after: true,
			},
		)
	}

	async init(config: WingConfig): Promise<void> {
		this.logger = new ModuleLogger('Wing')
		this.logger.setLoggerFn((level, message) => {
			this.log(level, message)
		})
		this.logger.disable()
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
		this.updateStatus(InstanceStatus.Connecting, 'waiting for response from console...')

		this.connection?.on('ready', () => {
			this.updateStatus(InstanceStatus.Connecting, 'Waiting for answer from console...')
			void this.connection?.sendCommand('/*').catch(() => {})
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
			this.messages.add(msg)
			this.oscForwarder?.send(msg)
			this.debounceHandleMessages()
		})
	}

	private handleMessages(): void {
		if (this.connected == false) {
			this.updateStatus(InstanceStatus.Ok)
			this.connected = true

			this.logger?.info('OSC connection established')
			this.logger?.enable()

			this.feedbackHandler?.startPolling()
			this.stateHandler?.state?.requestNames(this)
			if (this.config.prefetchVariablesOnStartup) {
				void this.stateHandler?.state?.requestAllVariables(this)
			}
			this.stateHandler?.requestUpdate()
		}
		this.feedbackHandler?.clearPollTimeout()
		this.stateHandler?.processMessage(this.messages)
		this.feedbackHandler?.processMessage(this.messages)
		this.variableHandler?.processMessage(this.messages)
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
		this.variableHandler = new VariableHandler(this.model, this.config.variableUpdateRate)

		this.variableHandler.on('create-variables', (variables) => {
			this.setVariableDefinitions(variables)
		})

		this.variableHandler.on('update-variables', (updates: CompanionVariableValues) => {
			this.setVariableValues(updates)
		})

		this.variableHandler.on('send', (cmd: string, arg?: number | string) => {
			this.connection?.sendCommand(cmd, arg).catch(() => {})
		})

		this.variableHandler?.setupVariables()
	}

	private setupOscForwarder(): void {
		if (!this.oscForwarder) {
			this.oscForwarder = new OscForwarder(this.logger)
		}
		this.oscForwarder?.setup(
			this.config.enableOscForwarding,
			this.config.oscForwardingHost,
			this.config.oscForwardingPort,
		)
	}
}

runEntrypoint(WingInstance, UpgradeScripts)
