import { InstanceBase } from '@companion-module/base'
import osc from 'osc'
import { WingTransitions } from './transitions.js'
import { WingState } from './state/state.js'

export interface InstanceBaseExt<TConfig> extends InstanceBase<TConfig> {
	config: TConfig
	osc: osc.UDPPort
	transitions: WingTransitions
	state: WingState
	sendCommand: (cmd: string, argument?: number | string) => void
	ensureLoaded: (path: string) => void
}
