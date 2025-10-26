import { InstanceBase } from '@companion-module/base'
import { WingTransitions } from './handlers/transitions.js'
import { ModelSpec } from './models/types.js'

export interface InstanceBaseExt<TConfig> extends InstanceBase<TConfig> {
	config: TConfig
	transitions: WingTransitions
	// subscriptions: WingSubscriptions
	model: ModelSpec

	logger?: import('./handlers/logger.js').ModuleLogger
	connection?: import('./handlers/connection-handler.js').ConnectionHandler | undefined
	stateHandler?: import('./handlers/state-handler.js').StateHandler | undefined
	feedbackHandler?: import('./handlers/feedback-handler.js').FeedbackHandler | undefined
	variableHandler?: import('./variables/variable-handler.js').VariableHandler | undefined
}
