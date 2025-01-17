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
import { AuxCommands as Commands } from '../commands/aux.js'
import { InstanceBaseExt } from '../types.js'
import { WingConfig } from '../config.js'
import * as ActionUtil from './utils.js'
import { StateUtil } from '../state/index.js'
import { FadeDurationChoice } from '../choices/fades.js'

export enum AuxActions {
	SetAuxMute = 'set-aux-mute',
	SetAuxFader = 'set-aux-fader',
	AuxFaderStore = 'aux-fader-store',
	AuxFaderRestore = 'aux-fader-restore',
	AuxFaderDelta = 'aux-fader-delta',
	AuxFaderUndoDelta = 'aux-fader-undo-delta',
	SetAuxPanorama = 'set-aux-panorama',
	AuxPanoramaStore = 'aux-panorama-store',
	AuxPanoramaRestore = 'aux-panorama-restore',
	AuxPanoramaDelta = 'aux-panorama-delta',
	AuxPanoramaUndoDelta = 'aux-undo-panorama-delta',
	SetAuxToBusFader = 'set-aux-to-bus-fader',
	AuxToBusFaderStore = 'aux-to-bus-fader-store',
	AuxToBusFaderRestore = 'aux-to-bus-fader-restore',
	AuxToBusFaderDelta = 'aux-to-bus-fader-delta',
	AuxToBusFaderUndoDelta = 'aux-to-bus-fader-undo-delta',
	SetAuxToBusPanorama = 'set-aux-to-bus-panorama',
	AuxToBusPanoramaStore = 'aux-to-bus-panorama-store',
	AuxToBusPanoramaRestore = 'aux-to-bus-panorama-restore',
	AuxToBusPanoramaDelta = 'aux-to-bus-panorama-delta',
	AuxToBusPanoramaUndoDelta = 'aux-to-bus-undo-panorama-delta',
}

export function createAuxActions(self: InstanceBaseExt<WingConfig>): CompanionActionDefinitions {
	const send = self.sendCommand
	const ensureLoaded = self.ensureLoaded
	const state = self.state
	const transitions = self.transitions
	const actions: { [id in AuxActions]: CompanionActionWithCallback | undefined } = {
		[AuxActions.SetAuxMute]: {
			name: 'Set Aux Mute',
			options: [GetDropdown('Aux', 'aux', state.namedChoices.auxes), GetMuteDropdown('mute')],
			callback: async (event) => {
				const cmd = Commands.Mute(getNodeNumber(event, 'aux'))
				send(cmd, getNumber(event, 'mute'))
			},
		},

		////////////////////////////////////////////////////////////
		// Aux Fader
		////////////////////////////////////////////////////////////
		[AuxActions.SetAuxFader]: {
			name: 'Set Aux Level',
			options: [GetDropdown('Aux', 'aux', state.namedChoices.auxes), ...GetFaderInputField('level')],
			callback: async (event) => {
				const cmd = Commands.Fader(getNodeNumber(event, 'aux'))
				runTransition(cmd, 'level', event, state, transitions)
			},
			subscribe: (event) => {
				ensureLoaded(Commands.Fader(getNodeNumber(event, 'aux')))
			},
		},
		[AuxActions.AuxFaderStore]: {
			name: 'Store Aux Level',
			options: [GetDropdown('Aux', 'aux', state.namedChoices.auxes)],
			callback: async (event) => {
				const cmd = Commands.Fader(getNodeNumber(event, 'aux'))
				StateUtil.storeValueForCommand(cmd, state)
			},
			subscribe: (event) => {
				ensureLoaded(Commands.Fader(getNodeNumber(event, 'aux')))
			},
		},
		[AuxActions.AuxFaderRestore]: {
			name: 'Restore Aux Level',
			options: [GetDropdown('Aux', 'aux', state.namedChoices.auxes), ...FadeDurationChoice],
			callback: async (event) => {
				const cmd = Commands.Fader(getNodeNumber(event, 'aux'))
				const restoreVal = StateUtil.getValueFromKey(cmd, state)
				ActionUtil.runTransition(cmd, 'level', event, state, transitions, restoreVal)
			},
			subscribe: (event) => {
				ensureLoaded(Commands.Fader(getNodeNumber(event, 'aux')))
			},
		},
		[AuxActions.AuxFaderDelta]: {
			name: 'Adjust Aux Level',
			options: [
				GetDropdown('Aux', 'aux', state.namedChoices.auxes),
				...GetFaderDeltaInputField('delta', 'Adjust (dB)'),
			],
			callback: async (event) => {
				const cmd = Commands.Fader(ActionUtil.getNodeNumber(event, 'aux'))
				let targetValue = StateUtil.getNumberFromState(cmd, state)
				const delta = event.options.delta as number
				state.storeDelta(cmd, delta)
				if (targetValue) {
					targetValue += delta
					ActionUtil.runTransition(cmd, 'level', event, state, transitions, targetValue)
				}
			},
			subscribe: (event) => {
				ensureLoaded(Commands.Fader(ActionUtil.getNodeNumber(event, 'aux')))
			},
		},
		[AuxActions.AuxFaderUndoDelta]: {
			name: 'Undo Aux Level Adjust',
			options: [GetDropdown('Aux', 'aux', state.namedChoices.auxes), ...FadeDurationChoice],
			callback: async (event) => {
				const cmd = Commands.Fader(ActionUtil.getNodeNumber(event, 'aux'))
				let targetValue = StateUtil.getNumberFromState(cmd, state)
				const delta = state.restoreDelta(cmd)
				if (targetValue) {
					targetValue -= delta
					ActionUtil.runTransition(cmd, 'level', event, state, transitions, targetValue)
				}
			},
			subscribe: (event) => {
				ensureLoaded(Commands.Fader(ActionUtil.getNodeNumber(event, 'aux')))
			},
		},
		////////////////////////////////////////////////////////////
		// Aux Panorama
		////////////////////////////////////////////////////////////
		[AuxActions.SetAuxPanorama]: {
			name: 'Set Aux Panorama',
			options: [GetDropdown('Aux', 'aux', state.namedChoices.auxes), ...GetPanoramaSlider('pan')],
			callback: async (event) => {
				const cmd = Commands.Pan(getNodeNumber(event, 'aux'))
				runTransition(cmd, 'pan', event, state, transitions)
			},
			subscribe: (event) => {
				ensureLoaded(Commands.Pan(getNodeNumber(event, 'aux')))
			},
		},
		[AuxActions.AuxPanoramaStore]: {
			name: 'Store Aux Panorama',
			options: [GetDropdown('Aux', 'aux', state.namedChoices.auxes)],
			callback: async (event) => {
				const cmd = Commands.Pan(getNodeNumber(event, 'aux'))
				StateUtil.storeValueForCommand(cmd, state)
			},
			subscribe: (event) => {
				ensureLoaded(Commands.Pan(getNodeNumber(event, 'aux')))
			},
		},
		[AuxActions.AuxPanoramaRestore]: {
			name: 'Restore Aux Panorama',
			options: [GetDropdown('Aux', 'aux', state.namedChoices.auxes), ...FadeDurationChoice],
			callback: async (event) => {
				const cmd = Commands.Pan(getNodeNumber(event, 'aux'))
				const restoreVal = StateUtil.getValueFromKey(cmd, state)
				ActionUtil.runTransition(cmd, 'level', event, state, transitions, restoreVal)
			},
			subscribe: (event) => {
				ensureLoaded(Commands.Pan(getNodeNumber(event, 'aux')))
			},
		},
		[AuxActions.AuxPanoramaDelta]: {
			name: 'Adjust Aux Panorama',
			options: [GetDropdown('Aux', 'aux', state.namedChoices.auxes), ...GetPanoramaDeltaSlider('pan', 'Panorama')],
			callback: async (event) => {
				const cmd = Commands.Pan(ActionUtil.getNodeNumber(event, 'aux'))
				let targetValue = StateUtil.getNumberFromState(cmd, state)
				const delta = event.options.delta as number
				state.storeDelta(cmd, delta)
				if (targetValue) {
					targetValue += delta
					ActionUtil.runTransition(cmd, 'pan', event, state, transitions, targetValue)
				}
			},
			subscribe: (event) => {
				ensureLoaded(Commands.Pan(ActionUtil.getNodeNumber(event, 'aux')))
			},
		},
		[AuxActions.AuxPanoramaUndoDelta]: {
			name: 'Undo Aux Panorama Adjust',
			options: [GetDropdown('Aux', 'aux', state.namedChoices.auxes), ...FadeDurationChoice],
			callback: async (event) => {
				const cmd = Commands.Pan(ActionUtil.getNodeNumber(event, 'aux'))
				let targetValue = StateUtil.getNumberFromState(cmd, state)
				const delta = state.restoreDelta(cmd)
				if (targetValue) {
					targetValue -= delta
					ActionUtil.runTransition(cmd, 'level', event, state, transitions, targetValue)
				}
			},
			subscribe: (event) => {
				ensureLoaded(Commands.Pan(ActionUtil.getNodeNumber(event, 'aux')))
			},
		},
		////////////////////////////////////////////////////////////
		// Aux to Bus Level
		////////////////////////////////////////////////////////////
		[AuxActions.SetAuxToBusFader]: {
			name: 'Set Aux to Bus Level',
			options: [
				GetDropdown('Aux', 'aux', state.namedChoices.auxes),
				GetDropdown('Bus', 'bus', state.namedChoices.busses),
				...GetFaderInputField('level'),
			],
			callback: async (event) => {
				const cmd = Commands.SendLevel(getNodeNumber(event, 'aux'), ActionUtil.getNodeNumber(event, 'bus'))
				runTransition(cmd, 'level', event, state, transitions)
			},
			subscribe: (event) => {
				ensureLoaded(Commands.SendLevel(getNodeNumber(event, 'aux'), ActionUtil.getNodeNumber(event, 'bus')))
			},
		},
		[AuxActions.AuxToBusFaderStore]: {
			name: 'Store Aux to Bus Level',
			options: [
				GetDropdown('Aux', 'aux', state.namedChoices.auxes),
				GetDropdown('Bus', 'bus', state.namedChoices.busses),
			],
			callback: async (event) => {
				const cmd = Commands.SendLevel(getNodeNumber(event, 'aux'), ActionUtil.getNodeNumber(event, 'bus'))
				StateUtil.storeValueForCommand(cmd, state)
			},
			subscribe: (event) => {
				ensureLoaded(Commands.SendLevel(getNodeNumber(event, 'aux'), ActionUtil.getNodeNumber(event, 'bus')))
			},
		},
		[AuxActions.AuxToBusFaderRestore]: {
			name: 'Restore Aux to Bus Level',
			options: [
				GetDropdown('Aux', 'aux', state.namedChoices.auxes),
				GetDropdown('Bus', 'bus', state.namedChoices.busses),
				...FadeDurationChoice,
			],
			callback: async (event) => {
				const cmd = Commands.SendLevel(getNodeNumber(event, 'aux'), ActionUtil.getNodeNumber(event, 'bus'))
				const restoreVal = StateUtil.getValueFromKey(cmd, state)
				ActionUtil.runTransition(cmd, 'level', event, state, transitions, restoreVal)
			},
			subscribe: (event) => {
				ensureLoaded(Commands.SendLevel(getNodeNumber(event, 'aux'), ActionUtil.getNodeNumber(event, 'bus')))
			},
		},
		[AuxActions.AuxToBusFaderDelta]: {
			name: 'Adjust Aux to Bus Level',
			options: [
				GetDropdown('Aux', 'aux', state.namedChoices.auxes),
				GetDropdown('Bus', 'bus', state.namedChoices.busses),
				...GetPanoramaDeltaSlider('level', 'Panorama'),
			],
			callback: async (event) => {
				const cmd = Commands.SendLevel(ActionUtil.getNodeNumber(event, 'aux'), ActionUtil.getNodeNumber(event, 'bus'))
				let targetValue = StateUtil.getNumberFromState(cmd, state)
				const delta = event.options.delta as number
				state.storeDelta(cmd, delta)
				if (targetValue) {
					targetValue += delta
					ActionUtil.runTransition(cmd, 'level', event, state, transitions, targetValue)
				}
			},
			subscribe: (event) => {
				ensureLoaded(Commands.SendLevel(ActionUtil.getNodeNumber(event, 'aux'), ActionUtil.getNodeNumber(event, 'bus')))
			},
		},
		[AuxActions.AuxToBusFaderUndoDelta]: {
			name: 'Undo Aux to Bus Adjust Level',
			options: [
				GetDropdown('Aux', 'aux', state.namedChoices.auxes),
				GetDropdown('Bus', 'bus', state.namedChoices.busses),
				...FadeDurationChoice,
			],
			callback: async (event) => {
				const cmd = Commands.SendLevel(ActionUtil.getNodeNumber(event, 'aux'), ActionUtil.getNodeNumber(event, 'bus'))
				let targetValue = StateUtil.getNumberFromState(cmd, state)
				const delta = state.restoreDelta(cmd)
				if (targetValue) {
					targetValue -= delta
					ActionUtil.runTransition(cmd, 'level', event, state, transitions, targetValue)
				}
			},
			subscribe: (event) => {
				ensureLoaded(Commands.SendLevel(ActionUtil.getNodeNumber(event, 'aux'), ActionUtil.getNodeNumber(event, 'bus')))
			},
		},
		////////////////////////////////////////////////////////////
		// Aux to Bus Pan
		////////////////////////////////////////////////////////////
		[AuxActions.SetAuxToBusPanorama]: {
			name: 'Set Aux to Bus Panorama',
			options: [
				GetDropdown('Aux', 'aux', state.namedChoices.auxes),
				GetDropdown('Bus', 'bus', state.namedChoices.busses),
				...GetPanoramaSlider('pan'),
			],
			callback: async (event) => {
				const cmd = Commands.SendPan(getNodeNumber(event, 'aux'), ActionUtil.getNodeNumber(event, 'bus'))
				runTransition(cmd, 'pan', event, state, transitions)
			},
			subscribe: (event) => {
				ensureLoaded(Commands.SendPan(getNodeNumber(event, 'aux'), ActionUtil.getNodeNumber(event, 'bus')))
			},
		},
		[AuxActions.AuxToBusPanoramaStore]: {
			name: 'Store Aux to Bus Panorama',
			options: [
				GetDropdown('Aux', 'aux', state.namedChoices.auxes),
				GetDropdown('Bus', 'bus', state.namedChoices.busses),
			],
			callback: async (event) => {
				const cmd = Commands.SendPan(getNodeNumber(event, 'aux'), ActionUtil.getNodeNumber(event, 'bus'))
				StateUtil.storeValueForCommand(cmd, state)
			},
			subscribe: (event) => {
				ensureLoaded(Commands.SendPan(getNodeNumber(event, 'aux'), ActionUtil.getNodeNumber(event, 'bus')))
			},
		},
		[AuxActions.AuxToBusPanoramaRestore]: {
			name: 'Restore Aux to Bus Panorama',
			options: [
				GetDropdown('Aux', 'aux', state.namedChoices.auxes),
				GetDropdown('Bus', 'bus', state.namedChoices.busses),
				...FadeDurationChoice,
			],
			callback: async (event) => {
				const cmd = Commands.SendPan(getNodeNumber(event, 'aux'), ActionUtil.getNodeNumber(event, 'bus'))
				const restoreVal = StateUtil.getValueFromKey(cmd, state)
				ActionUtil.runTransition(cmd, 'pan', event, state, transitions, restoreVal)
			},
			subscribe: (event) => {
				ensureLoaded(Commands.SendPan(getNodeNumber(event, 'aux'), ActionUtil.getNodeNumber(event, 'bus')))
			},
		},
		[AuxActions.AuxToBusPanoramaDelta]: {
			name: 'Adjust Aux to Bus Panorama',
			options: [
				GetDropdown('Aux', 'aux', state.namedChoices.auxes),
				GetDropdown('Bus', 'bus', state.namedChoices.busses),
				...GetFaderDeltaInputField('delta', 'Adjust (dB)'),
			],
			callback: async (event) => {
				const cmd = Commands.SendPan(ActionUtil.getNodeNumber(event, 'aux'), ActionUtil.getNodeNumber(event, 'bus'))
				let targetValue = StateUtil.getNumberFromState(cmd, state)
				const delta = event.options.delta as number
				state.storeDelta(cmd, delta)
				if (targetValue) {
					targetValue += delta
					ActionUtil.runTransition(cmd, 'level', event, state, transitions, targetValue)
				}
			},
			subscribe: (event) => {
				ensureLoaded(Commands.SendPan(ActionUtil.getNodeNumber(event, 'aux'), ActionUtil.getNodeNumber(event, 'bus')))
			},
		},
		[AuxActions.AuxToBusPanoramaUndoDelta]: {
			name: 'Undo Aux to Bus Adjust Panorama',
			options: [
				GetDropdown('Aux', 'aux', state.namedChoices.auxes),
				GetDropdown('Bus', 'bus', state.namedChoices.busses),
				...FadeDurationChoice,
			],
			callback: async (event) => {
				const cmd = Commands.SendPan(ActionUtil.getNodeNumber(event, 'aux'), ActionUtil.getNodeNumber(event, 'bus'))
				let targetValue = StateUtil.getNumberFromState(cmd, state)
				const delta = state.restoreDelta(cmd)
				if (targetValue) {
					targetValue -= delta
					ActionUtil.runTransition(cmd, 'pan', event, state, transitions, targetValue)
				}
			},
			subscribe: (event) => {
				ensureLoaded(Commands.SendPan(ActionUtil.getNodeNumber(event, 'aux'), ActionUtil.getNodeNumber(event, 'bus')))
			},
		},
	}

	return actions
}
