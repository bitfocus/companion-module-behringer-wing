import { InstanceBase } from '@companion-module/base'
import osc from 'osc'
import { WingTransitions } from './transitions.js'
import { WingState, WingSubscriptions } from './state/state.js'
import { ModelSpec } from './models/types.js'

export interface InstanceBaseExt<TConfig> extends InstanceBase<TConfig> {
	config: TConfig
	osc: osc.UDPPort
	transitions: WingTransitions
	state: WingState
	model: ModelSpec
	subscriptions: WingSubscriptions
	model: ModelSpec
	sendCommand: (cmd: string, argument?: number | string, preferFloat?: boolean) => void
	ensureLoaded: (path: string, arg?: string | number) => void
}
