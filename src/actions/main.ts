import { CompanionActionDefinitions } from '@companion-module/base'
import { GetFaderInputField, GetDropdown, GetPanoramaDeltaSlider } from '../choices/common.js'
import { getNodeNumber, runTransition } from './utils.js'
import { CompanionActionWithCallback } from './common.js'
import { MainCommands as Commands } from '../commands/main.js'
import { InstanceBaseExt } from '../types.js'
import { WingConfig } from '../config.js'
import * as ActionUtil from './utils.js'
import { StateUtil } from '../state/index.js'
import { FadeDurationChoice } from '../choices/fades.js'

export enum MainActions {
	MainToMatrixLevel = 'main-to-matrix-level',
	MainToMatrixLevelStore = 'main-to-matrix-level-store',
	MainToMatrixLevelRestore = 'main-to-matrix-level-restore',
	MainToMatrixLevelDelta = 'main-to-matrix-level-delta',
	MainToMatrixLevelUndoDelta = 'main-to-matrix-level-undo-delta',
}

export function createMainActions(self: InstanceBaseExt<WingConfig>): CompanionActionDefinitions {
	const ensureLoaded = self.ensureLoaded
	const state = self.state
	const transitions = self.transitions
	const actions: { [id in MainActions]: CompanionActionWithCallback | undefined } = {
		[MainActions.MainToMatrixLevel]: {
			name: 'Set Main to Matrix Level',
			options: [
				GetDropdown('From Main', 'bus', state.namedChoices.mains),
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
		[MainActions.MainToMatrixLevelStore]: {
			name: 'Store Main to Matrix Level',
			options: [GetDropdown('Main', 'main', state.namedChoices.mains)],
			callback: async (event) => {
				const cmd = Commands.MatrixSendLevel(getNodeNumber(event, 'main'), getNodeNumber(event, 'matrix'))
				StateUtil.storeValueForCommand(cmd, state)
			},
			subscribe: (event) => {
				ensureLoaded(Commands.MatrixSendLevel(getNodeNumber(event, 'main'), getNodeNumber(event, 'matrix')))
			},
		},
		[MainActions.MainToMatrixLevelRestore]: {
			name: 'Restore Main to Matrix Level',
			options: [GetDropdown('Main', 'main', state.namedChoices.mains), ...FadeDurationChoice],
			callback: async (event) => {
				const cmd = Commands.MatrixSendLevel(getNodeNumber(event, 'main'), getNodeNumber(event, 'matrix'))
				const restoreVal = StateUtil.getValueFromKey(cmd, state)
				ActionUtil.runTransition(cmd, 'level', event, state, transitions, restoreVal)
			},
			subscribe: (event) => {
				ensureLoaded(Commands.MatrixSendLevel(getNodeNumber(event, 'main'), getNodeNumber(event, 'matrix')))
			},
		},
		[MainActions.MainToMatrixLevelDelta]: {
			name: 'Adjust Main to Matrix Level',
			options: [GetDropdown('Main', 'main', state.namedChoices.mains), ...GetPanoramaDeltaSlider('pan', 'Panorama')],
			callback: async (event) => {
				const cmd = Commands.MatrixSendLevel(getNodeNumber(event, 'main'), getNodeNumber(event, 'matrix'))
				let targetValue = StateUtil.getNumberFromState(cmd, state)
				const delta = event.options.delta as number
				state.storeDelta(cmd, delta)
				if (targetValue != undefined) {
					targetValue += delta
					ActionUtil.runTransition(cmd, 'level', event, state, transitions, targetValue)
				}
			},
			subscribe: (event) => {
				ensureLoaded(Commands.MatrixSendLevel(getNodeNumber(event, 'main'), getNodeNumber(event, 'matrix')))
			},
		},
		[MainActions.MainToMatrixLevelUndoDelta]: {
			name: 'Undo Main to Matrix Level Adjust',
			options: [GetDropdown('Main', 'main', state.namedChoices.mains), ...FadeDurationChoice],
			callback: async (event) => {
				const cmd = Commands.MatrixSendLevel(getNodeNumber(event, 'main'), getNodeNumber(event, 'matrix'))
				let targetValue = StateUtil.getNumberFromState(cmd, state)
				const delta = state.restoreDelta(cmd)
				if (targetValue != undefined) {
					targetValue -= delta
					ActionUtil.runTransition(cmd, 'level', event, state, transitions, targetValue)
				}
			},
			subscribe: (event) => {
				ensureLoaded(Commands.MatrixSendLevel(getNodeNumber(event, 'main'), getNodeNumber(event, 'matrix')))
			},
		},
	}

	return actions
}
