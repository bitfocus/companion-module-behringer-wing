import { CompanionActionDefinitions } from '@companion-module/base'
import { GetFaderInputField, GetDropdown, GetMuteDropdown } from '../choices/common.js'
import { getNodeNumber, runTransition } from './utils.js'
import { CompanionActionWithCallback } from './common.js'
import { BusCommands as Commands } from '../commands/bus.js'
import { InstanceBaseExt } from '../types.js'
import { WingConfig } from '../config.js'

export enum BusActions {
	SetBusToMatrixLevel = 'set-bus-to-matrix-level',
	SetBusToMatrixMute = 'set-bus-to-matrix-mute',
}

export function createBusActions(self: InstanceBaseExt<WingConfig>): CompanionActionDefinitions {
	const send = self.sendCommand
	const ensureLoaded = self.ensureLoaded
	const state = self.state
	const transitions = self.transitions

	const actions: { [id in BusActions]: CompanionActionWithCallback | undefined } = {
		[BusActions.SetBusToMatrixLevel]: {
			name: 'Set Bus to Matrix Level',
			options: [
				GetDropdown('From Bus', 'bus', state.namedChoices.busses),
				GetDropdown('To Matrix', 'matrix', state.namedChoices.matrices),
				...GetFaderInputField('level'),
			],
			callback: async (event) => {
				const cmd = Commands.MatrixSendLevel(getNodeNumber(event, 'bus'), getNodeNumber(event, 'matrix'))
				runTransition(cmd, 'level', event, state, transitions)
			},
			subscribe: (event) => {
				ensureLoaded(Commands.MatrixSendLevel(getNodeNumber(event, 'bus'), getNodeNumber(event, 'matrix')))
			},
		},
		[BusActions.SetBusToMatrixMute]: {
			name: 'Set Bus to Matrix Mute',
			options: [
				GetDropdown('From Bus', 'bus', state.namedChoices.busses),
				GetDropdown('To Matrix', 'matrix', state.namedChoices.matrices),
				GetMuteDropdown('mute'),
			],
			callback: async (event) => {
				const cmd = Commands.MatrixSendOn(getNodeNumber(event, 'bus'), getNodeNumber(event, 'matrix'))
				send(cmd, event.options.mute as number)
			},
		},
	}

	return actions
}
