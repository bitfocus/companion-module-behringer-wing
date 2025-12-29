import { CompanionVariableDefinition } from '@companion-module/base'
import { ModelSpec } from '../models/types.js'

export function getMainVariables(model: ModelSpec): CompanionVariableDefinition[] {
	const variables: CompanionVariableDefinition[] = []

	for (let main = 1; main <= model.mains; main++) {
		variables.push({
			variableId: `main${main}_name`,
			name: `Main ${main} Name`,
		})
		variables.push({
			variableId: `main${main}_mute`,
			name: `Main ${main} Mute`,
		})
		variables.push({
			variableId: `main${main}_level`,
			name: `Main ${main} Level`,
		})
		variables.push({
			variableId: `main${main}_pan`,
			name: `Main ${main} Pan`,
		})
		for (let send = 1; send <= model.matrices; send++) {
			variables.push({
				variableId: `main${main}_mtx${send}_mute`,
				name: `Main ${main} to Matrix ${send} Mute`,
			})
			variables.push({
				variableId: `main${main}_mtx${send}_level`,
				name: `Main ${main} to Matrix ${send} Level`,
			})
		}

		variables.push({
			variableId: `main${main}_color`,
			name: `Main ${main} Color`,
		})
	}

	return variables
}
