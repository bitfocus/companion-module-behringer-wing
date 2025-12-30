import { CompanionVariableDefinition } from '@companion-module/base'
import { ModelSpec } from '../models/types.js'

export function getAuxVariables(model: ModelSpec): CompanionVariableDefinition[] {
	const variables: CompanionVariableDefinition[] = []

	for (let aux = 1; aux <= model.auxes; aux++) {
		variables.push({
			variableId: `aux${aux}_name`,
			name: `Aux ${aux} Name`,
		})
		variables.push({
			variableId: `aux${aux}_gain`,
			name: `Aux ${aux} Gain`,
		})
		variables.push({
			variableId: `aux${aux}_mute`,
			name: `Aux ${aux} Mute`,
		})
		variables.push({
			variableId: `aux${aux}_level`,
			name: `Aux ${aux} Level`,
		})
		variables.push({
			variableId: `aux${aux}_pan`,
			name: `Aux ${aux} Pan`,
		})
		for (let main = 1; main <= model.mains; main++) {
			variables.push({
				variableId: `aux${aux}_main${main}_mute`,
				name: `Aux ${aux} to Main ${main} Mute`,
			})
			variables.push({
				variableId: `aux${aux}_main${main}_level`,
				name: `Aux ${aux} to Main ${main} Level`,
			})
		}
		for (let bus = 1; bus <= model.busses; bus++) {
			variables.push({
				variableId: `aux${aux}_bus${bus}_mute`,
				name: `Aux ${aux} to Bus ${bus} Mutes`,
			})
			variables.push({
				variableId: `aux${aux}_bus${bus}_level`,
				name: `Aux ${aux} to Bus ${bus} Level`,
			})
			variables.push({
				variableId: `aux${aux}_bus${bus}_pan`,
				name: `Aux ${aux} to Bus ${bus} Pan`,
			})
		}
		for (let mtx = 1; mtx <= model.matrices; mtx++) {
			variables.push({
				variableId: `aux${aux}_mtx${mtx}_mute`,
				name: `Aux ${aux} to Matrix ${mtx} Mute`,
			})
			variables.push({
				variableId: `aux${aux}_mtx${mtx}_level`,
				name: `Aux ${aux} to Matrix ${mtx} Level`,
			})
			variables.push({
				variableId: `aux${aux}_mtx${mtx}_pan`,
				name: `Aux ${aux} to Matrix ${mtx} Pan`,
			})
		}

		variables.push({
			variableId: `aux${aux}_color`,
			name: `Aux ${aux} Color`,
		})
	}

	return variables
}
