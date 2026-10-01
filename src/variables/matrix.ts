import { ModelSpec } from '../models/types.js'
import { VariableDefinition } from './index.js'
import * as Commands from '../commands/index.js'

export function getMatrixVariables(model: ModelSpec): VariableDefinition[] {
	const variables: VariableDefinition[] = []

	for (let mtx = 1; mtx <= model.matrices; mtx++) {
		variables.push({
			variableId: `mtx${mtx}_name`,
			name: `Matrix ${mtx} Name`,
			path: Commands.Matrix.Name(mtx),
		})
		variables.push({
			variableId: `mtx${mtx}_mute`,
			name: `Matrix ${mtx} Mute`,
			path: Commands.Matrix.Mute(mtx),
		})
		variables.push({
			variableId: `mtx${mtx}_level`,
			name: `Matrix ${mtx} Level`,
			path: Commands.Matrix.Fader(mtx),
		})
		variables.push({
			variableId: `mtx${mtx}_pan`,
			name: `Matrix ${mtx} Pan`,
			path: Commands.Matrix.Pan(mtx),
		})

		variables.push({
			variableId: `mtx${mtx}_color`,
			name: `Matrix ${mtx} Color`,
			path: `${Commands.Matrix.Node(mtx)}/$col`,
		})
		variables.push({
			variableId: `mtx${mtx}_color_index`,
			name: `Matrix ${mtx} Color Index`,
			path: `${Commands.Matrix.Node(mtx)}/$col`,
		})
		variables.push({
			variableId: `mtx${mtx}_icon_id`,
			name: `Matrix ${mtx} Icon ID`,
			path: Commands.Matrix.Icon(mtx),
		})
		variables.push({
			variableId: `mtx${mtx}_icon_image`,
			name: `Matrix ${mtx} Icon Image Data URI`,
			path: Commands.Matrix.Icon(mtx),
		})
	}

	return variables
}
