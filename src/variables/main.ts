import { ModelSpec } from '../models/types.js'
import { VariableDefinition } from './index.js'
import * as Commands from '../commands/index.js'

export function getMainVariables(model: ModelSpec): VariableDefinition[] {
	const variables: VariableDefinition[] = []

	for (let main = 1; main <= model.mains; main++) {
		variables.push({
			variableId: `main${main}_name`,
			name: `Main ${main} Name`,
			path: Commands.Main.Name(main),
		})
		variables.push({
			variableId: `main${main}_mute`,
			name: `Main ${main} Mute`,
			path: Commands.Main.Mute(main),
		})
		variables.push({
			variableId: `main${main}_level`,
			name: `Main ${main} Level`,
			path: Commands.Main.Fader(main),
		})
		variables.push({
			variableId: `main${main}_pan`,
			name: `Main ${main} Pan`,
			path: Commands.Main.Pan(main),
		})
		for (let send = 1; send <= model.matrices; send++) {
			variables.push({
				variableId: `main${main}_mtx${send}_mute`,
				name: `Main ${main} to Matrix ${send} Mute`,
				path: Commands.Main.MatrixSendOn(main, send),
			})
			variables.push({
				variableId: `main${main}_mtx${send}_level`,
				name: `Main ${main} to Matrix ${send} Level`,
				path: Commands.Main.MatrixSendLevel(main, send),
			})
		}

		variables.push({
			variableId: `main${main}_color`,
			name: `Main ${main} Color`,
			path: Commands.Main.Color(main),
		})
	}

	return variables
}
