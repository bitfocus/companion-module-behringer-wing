import { CompanionActionDefinitions } from '@companion-module/base'
import { CompanionActionWithCallback } from './common.js'
import { InstanceBaseExt } from '../types.js'
import { WingConfig } from '../config.js'

export enum MainActions {}

export function createMainActions(_self: InstanceBaseExt<WingConfig>): CompanionActionDefinitions {
	const actions: { [id in MainActions]: CompanionActionWithCallback | undefined } = {}
	return actions
}
