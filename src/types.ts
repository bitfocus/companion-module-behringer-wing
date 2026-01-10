import { InstanceBase } from '@companion-module/base'
import { WingTransitions } from './handlers/transitions.js'
import { ModelSpec } from './models/types.js'
import { ModuleLogger } from './handlers/logger.js'

export interface InstanceBaseExt<TConfig> extends InstanceBase<TConfig> {
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
