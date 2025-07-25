import { CompanionActionDefinitions } from '@companion-module/base'
import { CompanionActionWithCallback } from './common.js'
import { InstanceBaseExt } from '../types.js'
import { WingConfig } from '../config.js'

export enum BusActions {}

export function createBusActions(_self: InstanceBaseExt<WingConfig>): CompanionActionDefinitions {
	const actions: { [id in BusActions]: CompanionActionWithCallback | undefined } = {}

	return actions
}
