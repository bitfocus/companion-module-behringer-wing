import { CompanionActionDefinitions } from '@companion-module/base'
import {
	GetFaderInputField,
	GetDropdown,
	GetPanoramaSlider,
	GetMuteDropdown,
	GetFaderDeltaInputField,
	GetPanoramaDeltaSlider,
} from '../choices/common.js'
import { getNodeNumber, getNumber, runTransition } from './utils.js'
import { CompanionActionWithCallback } from './common.js'
import { MainCommands as Commands } from '../commands/main.js'
import { InstanceBaseExt } from '../types.js'
import { WingConfig } from '../config.js'
import * as ActionUtil from './utils.js'
import { StateUtil } from '../state/index.js'
import { FadeDurationChoice } from '../choices/fades.js'

export enum MainActions {
	SetMainMute = 'set-main-mute',
	SetMainFader = 'set-main-fader',
	MainFaderStore = 'main-fader-store',
	MainFaderRestore = 'main-fader-restore',
	MainFaderDelta = 'main-fader-delta',
	AuxFaderUndoDelta = 'main-fader-undo-delta',
	SetMainPanorama = 'set-main-panorama',
	MainPanoramaStore = 'main-panorama-store',
	MainPanoramaRestore = 'main-panorama-restore',
	MainPanoramaDelta = 'main-panorama-delta',
	MainPanoramaUndoDelta = 'main-undo-panorama-delta',
	MainToMatrixMute = 'main-to-matrix-mute',
	MainToMatrixLevel = 'main-to-matrix-level',
	MainToMatrixLevelStore = 'main-to-matrix-level-store',
	MainToMatrixLevelRestore = 'main-to-matrix-level-restore',
	MainToMatrixLevelDelta = 'main-to-matrix-level-delta',
	MainToMatrixLevelUndoDelta = 'main-to-matrix-level-undo-delta',
}

export function createMainActions(self: InstanceBaseExt<WingConfig>): CompanionActionDefinitions {
	const send = self.sendCommand
	const ensureLoaded = self.ensureLoaded
	const state = self.state
	const transitions = self.transitions
	const actions: { [id in MainActions]: CompanionActionWithCallback | undefined } = {
		[MainActions.SetMainMute]: {
			name: 'Set Main Mute',
			options: [GetDropdown('Main', 'main', state.namedChoices.mains), GetMuteDropdown('mute')],
			callback: async (event) => {
				const cmd = Commands.Mute(getNodeNumber(event, 'main'))
				send(cmd, getNumber(event, 'mute'))
			},
		},

		////////////////////////////////////////////////////////////
		// Main Fader
		////////////////////////////////////////////////////////////
		[MainActions.SetMainFader]: {
			name: 'Set Main Level',
			options: [GetDropdown('Main', 'main', state.namedChoices.mains), ...GetFaderInputField('level')],
			callback: async (event) => {
				const cmd = Commands.Fader(getNodeNumber(event, 'main'))
				runTransition(cmd, 'level', event, state, transitions)
			},
			subscribe: (event) => {
				ensureLoaded(Commands.Fader(getNodeNumber(event, 'main')))
			},
		},
		[MainActions.MainFaderStore]: {
			name: 'Store Main Level',
			options: [GetDropdown('Main', 'main', state.namedChoices.mains)],
			callback: async (event) => {
				const cmd = Commands.Fader(getNodeNumber(event, 'main'))
				StateUtil.storeValueForCommand(cmd, state)
			},
			subscribe: (event) => {
				ensureLoaded(Commands.Fader(getNodeNumber(event, 'main')))
			},
		},
		[MainActions.MainFaderRestore]: {
			name: 'Restore Main Level',
			options: [GetDropdown('Main', 'main', state.namedChoices.mains), ...FadeDurationChoice],
			callback: async (event) => {
				const cmd = Commands.Fader(getNodeNumber(event, 'main'))
				const restoreVal = StateUtil.getValueFromKey(cmd, state)
				ActionUtil.runTransition(cmd, 'level', event, state, transitions, restoreVal)
			},
			subscribe: (event) => {
				ensureLoaded(Commands.Fader(getNodeNumber(event, 'main')))
			},
		},
		[MainActions.MainFaderDelta]: {
			name: 'Adjust Main Level',
			options: [
				GetDropdown('Main', 'main', state.namedChoices.mains),
				...GetFaderDeltaInputField('delta', 'Adjust (dB)'),
			],
			callback: async (event) => {
				const cmd = Commands.Fader(ActionUtil.getNodeNumber(event, 'main'))
				let targetValue = StateUtil.getNumberFromState(cmd, state)
				const delta = event.options.delta as number
				state.storeDelta(cmd, delta)
				if (targetValue) {
					targetValue += delta
					ActionUtil.runTransition(cmd, 'level', event, state, transitions, targetValue)
				}
			},
			subscribe: (event) => {
				ensureLoaded(Commands.Fader(ActionUtil.getNodeNumber(event, 'main')))
			},
		},
		[MainActions.AuxFaderUndoDelta]: {
			name: 'Undo Main Level Adjust',
			options: [GetDropdown('Main', 'main', state.namedChoices.mains), ...FadeDurationChoice],
			callback: async (event) => {
				const cmd = Commands.Fader(ActionUtil.getNodeNumber(event, 'main'))
				let targetValue = StateUtil.getNumberFromState(cmd, state)
				const delta = state.restoreDelta(cmd)
				if (targetValue) {
					targetValue -= delta
					ActionUtil.runTransition(cmd, 'level', event, state, transitions, targetValue)
				}
			},
			subscribe: (event) => {
				ensureLoaded(Commands.Fader(ActionUtil.getNodeNumber(event, 'main')))
			},
		},
		////////////////////////////////////////////////////////////
		// Main Panorama
		////////////////////////////////////////////////////////////
		[MainActions.SetMainPanorama]: {
			name: 'Set Main Panorama',
			options: [GetDropdown('Main', 'main', state.namedChoices.mains), ...GetPanoramaSlider('pan')],
			callback: async (event) => {
				const cmd = Commands.Pan(getNodeNumber(event, 'main'))
				runTransition(cmd, 'pan', event, state, transitions)
			},
			subscribe: (event) => {
				ensureLoaded(Commands.Pan(getNodeNumber(event, 'main')))
			},
		},
		[MainActions.MainPanoramaStore]: {
			name: 'Store Main Panorama',
			options: [GetDropdown('Main', 'main', state.namedChoices.mains)],
			callback: async (event) => {
				const cmd = Commands.Pan(getNodeNumber(event, 'main'))
				StateUtil.storeValueForCommand(cmd, state)
			},
			subscribe: (event) => {
				ensureLoaded(Commands.Pan(getNodeNumber(event, 'main')))
			},
		},
		[MainActions.MainPanoramaRestore]: {
			name: 'Restore Main Panorama',
			options: [GetDropdown('Main', 'main', state.namedChoices.mains), ...FadeDurationChoice],
			callback: async (event) => {
				const cmd = Commands.Pan(getNodeNumber(event, 'main'))
				const restoreVal = StateUtil.getValueFromKey(cmd, state)
				ActionUtil.runTransition(cmd, 'level', event, state, transitions, restoreVal)
			},
			subscribe: (event) => {
				ensureLoaded(Commands.Pan(getNodeNumber(event, 'main')))
			},
		},
		[MainActions.MainPanoramaDelta]: {
			name: 'Adjust Main Panorama',
			options: [GetDropdown('Main', 'main', state.namedChoices.mains), ...GetPanoramaDeltaSlider('pan', 'Panorama')],
			callback: async (event) => {
				const cmd = Commands.Pan(ActionUtil.getNodeNumber(event, 'main'))
				let targetValue = StateUtil.getNumberFromState(cmd, state)
				const delta = event.options.delta as number
				state.storeDelta(cmd, delta)
				if (targetValue) {
					targetValue += delta
					ActionUtil.runTransition(cmd, 'pan', event, state, transitions, targetValue)
				}
			},
			subscribe: (event) => {
				ensureLoaded(Commands.Pan(ActionUtil.getNodeNumber(event, 'main')))
			},
		},
		[MainActions.MainPanoramaUndoDelta]: {
			name: 'Undo Main Panorama Adjust',
			options: [GetDropdown('Main', 'main', state.namedChoices.mains), ...FadeDurationChoice],
			callback: async (event) => {
				const cmd = Commands.Pan(ActionUtil.getNodeNumber(event, 'main'))
				let targetValue = StateUtil.getNumberFromState(cmd, state)
				const delta = state.restoreDelta(cmd)
				if (targetValue) {
					targetValue -= delta
					ActionUtil.runTransition(cmd, 'level', event, state, transitions, targetValue)
				}
			},
			subscribe: (event) => {
				ensureLoaded(Commands.Pan(ActionUtil.getNodeNumber(event, 'main')))
			},
		},
		[MainActions.MainToMatrixMute]: {
			name: 'Set Main to Matrix Mute',
			options: [
				GetDropdown('From Main', 'bus', state.namedChoices.mains),
				GetDropdown('To Matrix', 'matrix', state.namedChoices.matrices),
				GetMuteDropdown('mute'),
			],
			callback: async (event) => {
				const cmd = Commands.MatrixSendMute(getNodeNumber(event, 'bus'), getNodeNumber(event, 'matrix'))
				send(cmd, event.options.mute as number)
			},
		},
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
				if (targetValue) {
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
				if (targetValue) {
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
