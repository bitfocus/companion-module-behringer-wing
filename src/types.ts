import { InstanceBase } from '@companion-module/base'
import osc from 'osc'

export interface InstanceBaseExt<TConfig> extends InstanceBase<TConfig> {
	config: TConfig
	osc: osc.UDPPort
}
