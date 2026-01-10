import { ModelSpec } from '../models/types.js'
import { VariableDefinition } from './index.js'
import * as Commands from '../commands/index.js'

export function getAuxVariables(model: ModelSpec): VariableDefinition[] {
	const variables: VariableDefinition[] = []

	for (let aux = 1; aux <= model.auxes; aux++) {
		variables.push({
			variableId: `aux${aux}_name`,
			name: `Aux ${aux} Name`,
			path: Commands.Aux.Name(aux),
		})
		variables.push({
			variableId: `aux${aux}_gain`,
			name: `Aux ${aux} Gain`,
			path: Commands.Aux.InputGain(aux),
		})
		variables.push({
			variableId: `aux${aux}_mute`,
			name: `Aux ${aux} Mute`,
			path: Commands.Aux.Mute(aux),
		})
		variables.push({
			variableId: `aux${aux}_level`,
			name: `Aux ${aux} Level`,
			path: Commands.Aux.Fader(aux),
		})
		variables.push({
			variableId: `aux${aux}_pan`,
			name: `Aux ${aux} Pan`,
			path: Commands.Aux.Pan(aux),
		})
		for (let main = 1; main <= model.mains; main++) {
			variables.push({
				variableId: `aux${aux}_main${main}_mute`,
				name: `Aux ${aux} to Main ${main} Mute`,
				path: Commands.Aux.MainSendOn(aux, main),
			})
			variables.push({
				variableId: `aux${aux}_main${main}_level`,
				name: `Aux ${aux} to Main ${main} Level`,
				path: Commands.Aux.MainSendLevel(aux, main),
			})
		}
		for (let bus = 1; bus <= model.busses; bus++) {
			variables.push({
				variableId: `aux${aux}_bus${bus}_mute`,
				name: `Aux ${aux} to Bus ${bus} Mutes`,
				path: Commands.Aux.SendOn(aux, bus),
			})
			variables.push({
				variableId: `aux${aux}_bus${bus}_level`,
				name: `Aux ${aux} to Bus ${bus} Level`,
				path: Commands.Aux.SendLevel(aux, bus),
			})
			variables.push({
				variableId: `aux${aux}_bus${bus}_pan`,
				name: `Aux ${aux} to Bus ${bus} Pan`,
				path: Commands.Aux.SendPan(aux, bus),
			})
		}
		for (let mtx = 1; mtx <= model.matrices; mtx++) {
			variables.push({
				variableId: `aux${aux}_mtx${mtx}_mute`,
				name: `Aux ${aux} to Matrix ${mtx} Mute`,
				path: Commands.Aux.MatrixSendOn(aux, mtx),
			})
			variables.push({
				variableId: `aux${aux}_mtx${mtx}_level`,
				name: `Aux ${aux} to Matrix ${mtx} Level`,
				path: Commands.Aux.MatrixSendLevel(aux, mtx),
			})
			variables.push({
				variableId: `aux${aux}_mtx${mtx}_pan`,
				name: `Aux ${aux} to Matrix ${mtx} Pan`,
				path: Commands.Aux.MatrixSendPan(aux, mtx),
			})
		}

		variables.push({
			variableId: `aux${aux}_color`,
			name: `Aux ${aux} Color`,
			path: Commands.Aux.Color(aux),
		})
	}

	return variables
}
