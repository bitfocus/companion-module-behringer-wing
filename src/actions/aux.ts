import { CompanionActionDefinitions } from '@companion-module/base'
import { CompanionActionWithCallback } from './common.js'
import { InstanceBaseExt } from '../types.js'
import { WingConfig } from '../config.js'

export enum AuxActions {}

export function createAuxActions(_self: InstanceBaseExt<WingConfig>): CompanionActionDefinitions {
	const actions: { [id in AuxActions]: CompanionActionWithCallback | undefined } = {}

	return actions
}
