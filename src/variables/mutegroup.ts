import { ModelSpec } from '../models/types.js'
import { VariableDefinition } from './index.js'
import * as Commands from '../commands/index.js'

export function getMuteGroupVariables(model: ModelSpec): VariableDefinition[] {
	const variables: VariableDefinition[] = []

	for (let mgrp = 1; mgrp <= model.mutegroups; mgrp++) {
		variables.push({
			variableId: `mgrp${mgrp}_name`,
			name: `Mutegroup ${mgrp} Name`,
			path: Commands.MuteGroup.Name(mgrp),
		})
		variables.push({
			variableId: `mgrp${mgrp}_mute`,
			name: `Mutegroup ${mgrp} Mute`,
			path: Commands.MuteGroup.Mute(mgrp),
		})
	}

	return variables
}
