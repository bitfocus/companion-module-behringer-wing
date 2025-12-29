import { CompanionVariableDefinition } from '@companion-module/base'
import { ModelSpec } from '../models/types.js'

export function getTalkbackVariables(model: ModelSpec): CompanionVariableDefinition[] {
	const variables: CompanionVariableDefinition[] = []

	for (let bus = 1; bus <= model.busses; bus++) {
		variables.push({ variableId: `talkback_a_bus${bus}_assign`, name: `Talkback A to Bus ${bus} assign` })
		variables.push({ variableId: `talkback_b_bus${bus}_assign`, name: `Talkback B to Bus ${bus} assign` })
	}
	for (let mtx = 1; mtx <= model.matrices; mtx++) {
		variables.push({ variableId: `talkback_a_mtx${mtx}_assign`, name: `Talkback A to Matrix ${mtx} assign` })
		variables.push({ variableId: `talkback_b_mtx${mtx}_assign`, name: `Talkback B to Matrix ${mtx} assign` })
	}
	for (let main = 1; main <= model.mains; main++) {
		variables.push({ variableId: `talkback_a_main${main}_assign`, name: `Talkback A to Main ${main} assign` })
		variables.push({ variableId: `talkback_b_main${main}_assign`, name: `Talkback B to Main ${main} assign` })
	}

	return variables
}
