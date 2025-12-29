import { CompanionVariableDefinition } from '@companion-module/base'
import { ModelSpec } from '../models/types.js'

export function getDcaVariables(model: ModelSpec): CompanionVariableDefinition[] {
	const variables: CompanionVariableDefinition[] = []

	for (let dca = 1; dca <= model.dcas; dca++) {
		variables.push({
			variableId: `dca${dca}_name`,
			name: `DCA ${dca} Name`,
		})
		variables.push({
			variableId: `dca${dca}_mute`,
			name: `DCA ${dca} Mute`,
		})
		variables.push({
			variableId: `dca${dca}_level`,
			name: `DCA ${dca} Level`,
		})

		variables.push({
			variableId: `dca${dca}_color`,
			name: `DCA ${dca} Color`,
		})
	}

	return variables
}
