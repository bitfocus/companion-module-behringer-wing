import type { CompanionActionDefinitions } from '@companion-module/base'
import type { CompanionActionWithCallback } from './common.js'
import type { InstanceBaseExt } from '../types.js'
import type { WingConfig } from '../config.js'

export enum AuxActions {}

export function createAuxActions(_self: InstanceBaseExt<WingConfig>): CompanionActionDefinitions {
	const actions: { [id in AuxActions]: CompanionActionWithCallback | undefined } = {}

	return actions
}
