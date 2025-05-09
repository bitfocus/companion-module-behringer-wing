import { CompanionActionDefinitions } from '@companion-module/base'
import { GetFaderInputField, GetDropdown, GetMuteDropdown, GetFaderDeltaInputField } from '../choices/common.js'
import { getNodeNumber, runTransition } from './utils.js'
import { CompanionActionWithCallback } from './common.js'
import { MatrixCommands as Commands } from '../commands/matrix.js'
import { InstanceBaseExt } from '../types.js'
import { WingConfig } from '../config.js'
import * as ActionUtil from './utils.js'
import { StateUtil } from '../state/index.js'
import { getMatrixDirectInInputs } from '../choices/matrix.js'
import { FadeDurationChoice } from '../choices/fades.js'

export enum MatrixActions {
	MatrixDirectInOn = 'matrix_direct_in_level_on',
	MatrixDirectInInput = 'matrix_direct_in_input',
	MatrixDirectInInvert = 'matrix_direct_in_invert',
	MatrixDirectInDeltaFader = 'matrix_direct_in_delta_fader',
	MatrixDirectInUndoDeltaFader = 'matrix_direct_in_undo_delta_fader',
	MatrixDirectInRecallFader = 'matrix_direct_in_recall_fader',
	MatrixDirectInSetFader = 'matrix_direct_in_set_fader',
	MatrixDirectInStoreFader = 'matrix_direct_in_store_fader',
}

export function createMatrixActions(self: InstanceBaseExt<WingConfig>): CompanionActionDefinitions {
	const send = self.sendCommand
	const ensureLoaded = self.ensureLoaded
	const state = self.state
	const transitions = self.transitions

	const actions: { [id in MatrixActions]: CompanionActionWithCallback | undefined } = {
		[MatrixActions.MatrixDirectInOn]: {
			name: 'Set Direct Input Mute',
			description: 'Set or toggle the direct input on a matrix',
			options: [GetDropdown('Selection', 'sel', state.namedChoices.matrices), GetMuteDropdown('mute')],
			callback: async (event) => {
				const cmd = Commands.DirectInputSwitch(getNodeNumber(event, 'sel'))
				const val = ActionUtil.getNumber(event, 'mute')

				if (val < 2) {
					if (val === 1) {
						send(cmd, 0)
					} else {
						send(cmd, 1)
					}
				} else {
					const currentVal = StateUtil.getBooleanFromState(cmd, state)
					send(cmd, Number(!currentVal))
				}
			},
			subscribe: (event) => {
				ensureLoaded(Commands.DirectInputSwitch(getNodeNumber(event, 'sel')))
			},
		},
		[MatrixActions.MatrixDirectInInput]: {
			name: 'Set Direct Input Source',
			description: 'Set the source of a direct input on a matrix',
			options: [
				GetDropdown('Selection', 'sel', state.namedChoices.matrices),
				GetDropdown('Source', 'source', getMatrixDirectInInputs()),
			],
			callback: async (event) => {
				const cmd = Commands.DirectInputIn(getNodeNumber(event, 'sel'))
				send(cmd, event.options.source as string)
			},
		},
		[MatrixActions.MatrixDirectInInvert]: {
			name: 'Invert Direct Input',
			description: 'Invert the polarity of a direct input on a matrix',
			options: [
				GetDropdown('Selection', 'sel', state.namedChoices.matrices),
				{
					type: 'checkbox',
					id: 'invert',
					label: 'Invert',
					default: false,
				},
			],
			callback: async (event) => {
				const cmd = Commands.DirectInputInvert(getNodeNumber(event, 'sel'))
				send(cmd, event.options.invert ? 1 : 0)
			},
		},
		[MatrixActions.MatrixDirectInDeltaFader]: {
			name: 'Adjust Direct Input Level',
			description: 'Adjust the level of a direct input on a matrix',
			options: [
				GetDropdown('Selection', 'sel', state.namedChoices.matrices),
				...GetFaderDeltaInputField('delta', 'Adjust (dB)'),
			],
			callback: async (event) => {
				const cmd = Commands.DirectInputLevel(getNodeNumber(event, 'sel'))
				let targetValue = StateUtil.getNumberFromState(cmd, state)
				const delta = event.options.delta as number
				state.storeDelta(cmd, delta)
				if (targetValue != undefined) {
					targetValue += delta
					ActionUtil.runTransition(cmd, 'level', event, state, transitions, targetValue)
				}
			},
			subscribe: (event) => {
				ensureLoaded(Commands.DirectInputLevel(getNodeNumber(event, 'sel')))
			},
		},
		[MatrixActions.MatrixDirectInUndoDeltaFader]: {
			name: 'Undo Direct Input Level Adjustment',
			description: 'Undo the previous level adjustment of a direct input on a matrix',
			options: [GetDropdown('Selection', 'sel', state.namedChoices.matrices), ...FadeDurationChoice],
			callback: async (event) => {
				const cmd = Commands.DirectInputLevel(getNodeNumber(event, 'sel'))
				let targetValue = StateUtil.getNumberFromState(cmd, state)
				const delta = state.restoreDelta(cmd)
				if (targetValue != undefined) {
					targetValue -= delta
					ActionUtil.runTransition(cmd, 'level', event, state, transitions, targetValue)
				}
			},
			subscribe: (event) => {
				ensureLoaded(Commands.DirectInputLevel(getNodeNumber(event, 'sel')))
			},
		},
		[MatrixActions.MatrixDirectInRecallFader]: {
			name: 'Recall Direct Input Level',
			description: 'Recall the level of a direct input on a matrix',
			options: [GetDropdown('Selection', 'sel', state.namedChoices.matrices), ...FadeDurationChoice],
			callback: async (event) => {
				const cmd = Commands.DirectInputLevel(getNodeNumber(event, 'sel'))
				const restoreVal = StateUtil.getValueFromKey(cmd, state)
				ActionUtil.runTransition(cmd, 'level', event, state, transitions, restoreVal)
			},
			subscribe: (event) => {
				ensureLoaded(Commands.DirectInputLevel(getNodeNumber(event, 'sel')))
			},
		},
		[MatrixActions.MatrixDirectInSetFader]: {
			name: 'Set Direct Input Level',
			description: 'Set the level of a direct input on a matrix',
			options: [GetDropdown('Selection', 'sel', state.namedChoices.matrices), ...GetFaderInputField('level')],
			callback: async (event) => {
				const cmd = Commands.DirectInputLevel(getNodeNumber(event, 'sel'))
				runTransition(cmd, 'level', event, state, transitions)
			},
			subscribe: (event) => {
				ensureLoaded(Commands.DirectInputLevel(getNodeNumber(event, 'sel')))
			},
		},
		[MatrixActions.MatrixDirectInStoreFader]: {
			name: 'Store Direct Input Level',
			description: 'Store the fader level of a direct input on a matrix',
			options: [GetDropdown('Selection', 'sel', state.namedChoices.matrices)],
			callback: async (event) => {
				const cmd = Commands.DirectInputLevel(getNodeNumber(event, 'sel'))
				StateUtil.storeValueForCommand(cmd, state)
			},
			subscribe: (event) => {
				ensureLoaded(Commands.DirectInputLevel(getNodeNumber(event, 'sel')))
			},
		},
	}
	return actions
}
