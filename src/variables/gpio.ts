import { CompanionVariableDefinition } from '@companion-module/base'
import { ModelSpec } from '../models/types.js'

export function getGpioVariables(model: ModelSpec): CompanionVariableDefinition[] {
	const variables: CompanionVariableDefinition[] = []

	for (let gpio = 1; gpio <= model.gpio; gpio++) {
		variables.push({ variableId: `gpio${gpio}`, name: `GPIO ${gpio} state (true = pressed/connected)` })
	}

	return variables
}
