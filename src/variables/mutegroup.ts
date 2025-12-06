import { CompanionVariableDefinition } from '@companion-module/base'
import { ModelSpec } from '../models/types.js'

export function getMuteGroupVariables(model: ModelSpec): CompanionVariableDefinition[] {
	const variables: CompanionVariableDefinition[] = []

	for (let mgrp = 1; mgrp <= model.mutegroups; mgrp++) {
		variables.push({
			variableId: `mgrp${mgrp}_name`,
			name: `Mutegroup ${mgrp} Name`,
		})
		variables.push({
			variableId: `mgrp${mgrp}_mute`,
			name: `Mutegroup ${mgrp} Mute`,
		})
	}

	return variables
}
