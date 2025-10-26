import { CompanionVariableDefinition } from '@companion-module/base'
import { ModelSpec } from '../models/types.js'

export function getMatrixVariables(model: ModelSpec): CompanionVariableDefinition[] {
	const variables: CompanionVariableDefinition[] = []

	for (let mtx = 1; mtx <= model.matrices; mtx++) {
		variables.push({
			variableId: `mtx${mtx}_name`,
			name: `Matrix ${mtx} Name`,
		})
		variables.push({
			variableId: `mtx${mtx}_mute`,
			name: `Matrix ${mtx} Mute`,
		})
		variables.push({
			variableId: `mtx${mtx}_level`,
			name: `Matrix ${mtx} Level`,
		})
		variables.push({
			variableId: `mtx${mtx}_pan`,
			name: `Matrix ${mtx} Pan`,
		})

		variables.push({
			variableId: `mtx${mtx}_color`,
			name: `Matrix ${mtx} Color`,
		})
	}

	return variables
}
