import { CompanionActionDefinitions } from '@companion-module/base'
import {
	GetFaderDeltaInputFieldWithVariables,
	GetDropdownWithVariables,
	GetMuteDropdownWithVariables,
	GetOnOffToggleDropdownWithVariables,
	GetFaderInputFieldWithVariables,
} from '../choices/common.js'
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
			options: [
				...GetDropdownWithVariables('Selection', 'sel', state.namedChoices.matrices),
				...GetMuteDropdownWithVariables('mute', 'Mute', true),
			],
			callback: async (event) => {
				const sel = await ActionUtil.getStringWithVariables(event, 'sel')
				const mute = await ActionUtil.getNumberWithVariables(event, 'mute')
				const cmd = Commands.DirectInputSwitch(ActionUtil.getNodeNumberFromID(sel))

				send(cmd, mute)
			},
		},
		[MatrixActions.MatrixDirectInInput]: {
			name: 'Set Direct Input Source',
			description: 'Set the source of a direct input on a matrix',
			options: [
				...GetDropdownWithVariables('Selection', 'sel', state.namedChoices.matrices),
				...GetDropdownWithVariables('Source', 'source', getMatrixDirectInInputs()),
			],
			callback: async (event) => {
				const sel = await ActionUtil.getStringWithVariables(event, 'sel')
				const source = await ActionUtil.getStringWithVariables(event, 'source')
				const cmd = Commands.DirectInputIn(ActionUtil.getNodeNumberFromID(sel))
				send(cmd, source)
			},
		},
		[MatrixActions.MatrixDirectInInvert]: {
			name: 'Invert Direct Input',
			description: 'Invert the polarity of a direct input on a matrix',
			options: [
				...GetDropdownWithVariables('Selection', 'sel', state.namedChoices.matrices),
				...GetOnOffToggleDropdownWithVariables('invert', 'Invert', true),
			],
			callback: async (event) => {
				const sel = await ActionUtil.getStringWithVariables(event, 'sel')
				const invert = await ActionUtil.getNumberWithVariables(event, 'invert')
				const cmd = Commands.DirectInputInvert(ActionUtil.getNodeNumberFromID(sel))
				send(cmd, invert)
			},
		},
		[MatrixActions.MatrixDirectInDeltaFader]: {
			name: 'Adjust Direct Input Level',
			description: 'Adjust the level of a direct input on a matrix',
			options: [
				...GetDropdownWithVariables('Selection', 'sel', state.namedChoices.matrices),
				...GetFaderDeltaInputFieldWithVariables('delta', 'Adjust (dB)'),
			],
			callback: async (event) => {
				const sel = await ActionUtil.getStringWithVariables(event, 'sel')
				const cmd = Commands.DirectInputLevel(ActionUtil.getNodeNumberFromID(sel))
				let targetValue = StateUtil.getNumberFromState(cmd, state)
				const usePercentage = event.options.delta_use_percentage as boolean
				let delta: number
				if (usePercentage) {
					const useVariables = event.options.delta_use_variables as boolean
					if (useVariables) {
						delta = Number(event.options.delta_percent_variables) / 100
					} else {
						delta = Number(event.options.delta_percent) / 100
					}
				} else {
					delta = await ActionUtil.getNumberWithVariables(event, 'delta')
				}
				state.storeDelta(cmd, delta)
				if (targetValue != undefined) {
					targetValue += delta
					ActionUtil.runTransition(cmd, 'level', event, state, transitions, targetValue, !usePercentage)
				}
			},
			subscribe: async (event) => {
				const sel = await ActionUtil.getStringWithVariables(event, 'sel')
				ensureLoaded(Commands.DirectInputLevel(ActionUtil.getNodeNumberFromID(sel)))
			},
		},
		[MatrixActions.MatrixDirectInUndoDeltaFader]: {
			name: 'Undo Direct Input Level Adjustment',
			description: 'Undo the previous level adjustment of a direct input on a matrix',
			options: [...GetDropdownWithVariables('Selection', 'sel', state.namedChoices.matrices), ...FadeDurationChoice()],
			callback: async (event) => {
				const sel = await ActionUtil.getStringWithVariables(event, 'sel')
				const cmd = Commands.DirectInputLevel(ActionUtil.getNodeNumberFromID(sel))
				let targetValue = StateUtil.getNumberFromState(cmd, state)
				const delta = state.restoreDelta(cmd)
				if (targetValue != undefined) {
					targetValue -= delta
					ActionUtil.runTransition(cmd, 'level', event, state, transitions, targetValue)
				}
			},
			subscribe: async (event) => {
				const sel = await ActionUtil.getStringWithVariables(event, 'sel')
				ensureLoaded(Commands.DirectInputLevel(ActionUtil.getNodeNumberFromID(sel)))
			},
		},
		[MatrixActions.MatrixDirectInRecallFader]: {
			name: 'Recall Direct Input Level',
			description: 'Recall the level of a direct input on a matrix',
			options: [...GetDropdownWithVariables('Selection', 'sel', state.namedChoices.matrices), ...FadeDurationChoice()],
			callback: async (event) => {
				const sel = await ActionUtil.getStringWithVariables(event, 'sel')
				const cmd = Commands.DirectInputLevel(ActionUtil.getNodeNumberFromID(sel))
				const restoreVal = StateUtil.getValueFromKey(cmd, state)
				ActionUtil.runTransition(cmd, 'level', event, state, transitions, restoreVal)
			},
			subscribe: async (event) => {
				const sel = await ActionUtil.getStringWithVariables(event, 'sel')
				ensureLoaded(Commands.DirectInputLevel(ActionUtil.getNodeNumberFromID(sel)))
			},
		},
		[MatrixActions.MatrixDirectInSetFader]: {
			name: 'Set Direct Input Level',
			description: 'Set the level of a direct input on a matrix',
			options: [
				...GetDropdownWithVariables('Selection', 'sel', state.namedChoices.matrices),
				...GetFaderInputFieldWithVariables('level'),
			],
			callback: async (event) => {
				const sel = await ActionUtil.getStringWithVariables(event, 'sel')
				const level = await ActionUtil.getNumberWithVariables(event, 'level')
				const cmd = Commands.DirectInputLevel(ActionUtil.getNodeNumberFromID(sel))
				ActionUtil.runTransition(cmd, 'level', event, state, transitions, level)
			},
			subscribe: async (event) => {
				const sel = await ActionUtil.getStringWithVariables(event, 'sel')
				ensureLoaded(Commands.DirectInputLevel(ActionUtil.getNodeNumberFromID(sel)))
			},
		},
		[MatrixActions.MatrixDirectInStoreFader]: {
			name: 'Store Direct Input Level',
			description: 'Store the fader level of a direct input on a matrix',
			options: [...GetDropdownWithVariables('Selection', 'sel', state.namedChoices.matrices)],
			callback: async (event) => {
				const sel = await ActionUtil.getStringWithVariables(event, 'sel')
				const cmd = Commands.DirectInputLevel(ActionUtil.getNodeNumberFromID(sel))
				StateUtil.storeValueForCommand(cmd, state)
			},
			subscribe: async (event) => {
				const sel = await ActionUtil.getStringWithVariables(event, 'sel')
				ensureLoaded(Commands.DirectInputLevel(ActionUtil.getNodeNumberFromID(sel)))
			},
		},
	}
	return actions
}
