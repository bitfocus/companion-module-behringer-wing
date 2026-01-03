import { ModelSpec } from '../models/types.js'
import { VariableDefinition } from './index.js'
import * as Commands from '../commands/index.js'

export function getDcaVariables(model: ModelSpec): VariableDefinition[] {
	const variables: VariableDefinition[] = []

	for (let dca = 1; dca <= model.dcas; dca++) {
		variables.push({
			variableId: `dca${dca}_name`,
			name: `DCA ${dca} Name`,
			path: Commands.Dca.Name(dca),
		})
		variables.push({
			variableId: `dca${dca}_mute`,
			name: `DCA ${dca} Mute`,
			path: Commands.Dca.Mute(dca),
		})
		variables.push({
			variableId: `dca${dca}_level`,
			name: `DCA ${dca} Level`,
			path: Commands.Dca.Fader(dca),
		})

		variables.push({
			variableId: `dca${dca}_color`,
			name: `DCA ${dca} Color`,
			path: Commands.Dca.Color(dca),
		})
	}

	return variables
}
