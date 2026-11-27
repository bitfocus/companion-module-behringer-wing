import type { InstanceBase, InstanceTypes } from '@companion-module/base'
import type { WingConfig } from './config.js'
import type { WingTransitions } from './handlers/transitions.js'
import type { ModelSpec } from './models/types.js'
import type { ModuleLogger } from '@companion-module/base'

export interface WingTypes extends InstanceTypes {
	config: WingConfig
	secrets: undefined
}

export interface InstanceBaseExt<TConfig> extends InstanceBase<WingTypes> {
	config: TConfig
	transitions: WingTransitions
	// subscriptions: WingSubscriptions
	model: ModelSpec
	logger?: ModuleLogger

	connection?: import('./handlers/connection-handler.js').ConnectionHandler | undefined
	stateHandler?: import('./handlers/state-handler.js').StateHandler | undefined
	feedbackHandler?: import('./handlers/feedback-handler.js').FeedbackHandler | undefined
	variableHandler?: import('./handlers/variable-handler.js').VariableHandler | undefined
}
