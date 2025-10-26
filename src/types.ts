import { InstanceBase } from '@companion-module/base'
import { WingTransitions } from './handlers/transitions.js'
import { WingState, WingSubscriptions } from './state/state.js'
import { ModelSpec } from './models/types.js'

export interface InstanceBaseExt<TConfig> extends InstanceBase<TConfig> {
	config: TConfig
	transitions: WingTransitions
	subscriptions: WingSubscriptions
	model: ModelSpec
	state: WingState
	sendCommand: (cmd: string, argument?: number | string, preferFloat?: boolean) => void
	ensureLoaded: (path: string, arg?: string | number) => void
}
