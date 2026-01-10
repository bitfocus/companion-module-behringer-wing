import { ModelSpec } from '../models/types.js'
import { VariableDefinition } from './index.js'
import * as Commands from '../commands/index.js'

export function getGpioVariables(model: ModelSpec): VariableDefinition[] {
	const variables: VariableDefinition[] = []

	for (let gpio = 1; gpio <= model.gpio; gpio++) {
		variables.push({
			variableId: `gpio${gpio}`,
			name: `GPIO ${gpio} state (true = pressed/connected)`,
			path: Commands.Control.GpioReadState(gpio),
		})
	}

	return variables
}
