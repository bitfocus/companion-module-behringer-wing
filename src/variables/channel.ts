import { CompanionVariableDefinition } from '@companion-module/base'
import { ModelSpec } from '../models/types.js'

export function getChannelVariables(model: ModelSpec): CompanionVariableDefinition[] {
	const variables: CompanionVariableDefinition[] = []

	for (let ch = 1; ch <= model.channels; ch++) {
		variables.push({
			variableId: `ch${ch}_name`,
			name: `Channel ${ch} Name`,
		})
		variables.push({
			variableId: `ch${ch}_gain`,
			name: `Channel ${ch} Gain`,
		})
		variables.push({
			variableId: `ch${ch}_mute`,
			name: `Channel ${ch} Mute`,
		})
		variables.push({
			variableId: `ch${ch}_level`,
			name: `Channel ${ch} Level`,
		})
		variables.push({
			variableId: `ch${ch}_pan`,
			name: `Channel ${ch} Pan`,
		})
		for (let bus = 1; bus <= model.busses; bus++) {
			variables.push({
				variableId: `ch${ch}_bus${bus}_mute`,
				name: `Channel ${ch} to Bus ${bus} Mute`,
			})
			variables.push({
				variableId: `ch${ch}_bus${bus}_level`,
				name: `Channel ${ch} to Bus ${bus} Level`,
			})
			variables.push({
				variableId: `ch${ch}_bus${bus}_pan`,
				name: `Channel ${ch} to Bus ${bus} Pan`,
			})
		}
		for (let main = 1; main <= model.mains; main++) {
			variables.push({
				variableId: `ch${ch}_main${main}_mute`,
				name: `Channel ${ch} to Main ${main} Mute`,
			})
			variables.push({
				variableId: `ch${ch}_main${main}_level`,
				name: `Channel ${ch} to Main ${main} Level`,
			})
		}
		for (let mtx = 1; mtx <= model.matrices; mtx++) {
			variables.push({
				variableId: `ch${ch}_mtx${mtx}_mute`,
				name: `Channel ${ch} to Matrix ${mtx} Mute`,
			})
			variables.push({
				variableId: `ch${ch}_mtx${mtx}_level`,
				name: `Channel ${ch} to Matrix ${mtx} Level`,
			})
			variables.push({
				variableId: `ch${ch}_mtx${mtx}_pan`,
				name: `Channel ${ch} to Matrix ${mtx} Pan`,
			})
		}

		variables.push({
			variableId: `ch${ch}_color`,
			name: `Channel ${ch} Color`,
		})
	}

	return variables
}
