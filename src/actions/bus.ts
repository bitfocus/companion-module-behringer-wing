import { CompanionActionDefinitions } from '@companion-module/base'
import {
	GetFaderInputField,
	GetDropdown,
	GetPanoramaSlider,
	GetNumberField,
	GetMuteDropdown,
	GetTextField,
	GetFaderDeltaInputField,
	GetPanoramaDeltaSlider,
} from '../choices/common.js'
import { getNodeNumber, getNumber, runTransition } from './utils.js'
import { CompanionActionWithCallback } from './common.js'
import { BusCommands as Commands } from '../commands/bus.js'
import { InstanceBaseExt } from '../types.js'
import { WingConfig } from '../config.js'
import * as ActionUtil from './utils.js'
import { StateUtil } from '../state/index.js'
import { FadeDurationChoice } from '../choices/fades.js'

export enum BusActions {
	SetBusColor = 'set-bus-color',
	SetBusName = 'set-bus-name',
	SetBusMute = 'set-bus-mute',
	SetBusFader = 'set-bus-fader',
	SetBusPanorama = 'set-bus-panorama',
	SetBusToBusLevel = 'set-bus-to-bus-level',
	SetBusToBusMute = 'set-bus-to-bus-mute',
	SetBusToMatrixLevel = 'set-bus-to-matrix-level',
	SetBusToMatrixMute = 'set-bus-to-matrix-mute',
	BusFaderStore = 'bus-fader-store',
	BusFaderRestore = 'bus-fader-restore',
	BusFaderDelta = 'bus-fader-delta',
	BusUndoFaderDelta = 'bus-undo-fader-delta',
	BusPanoramaStore = 'bus-panorama-store',
	BusPanoramaRestore = 'bus-panorama-restore',
	BusPanoramaDelta = 'bus-panorama-delta',
	BusUndoPanoramaDelta = 'bus-undo-panorama-delta',
}

export function createBusActions(self: InstanceBaseExt<WingConfig>): CompanionActionDefinitions {
	const send = self.sendCommand
	const ensureLoaded = self.ensureLoaded
	const state = self.state
	const transitions = self.transitions
	const actions: { [id in BusActions]: CompanionActionWithCallback | undefined } = {
		[BusActions.SetBusColor]: {
			name: 'Set Bus Color',
			options: [GetDropdown('Bus', 'bus', state.namedChoices.busses), GetNumberField('Color', 'color', 1, 12, 1, 1)],
			callback: async (event) => {
				const cmd = Commands.Color(getNodeNumber(event, 'bus'))
				send(cmd, getNumber(event, 'color'))
			},
		},
		[BusActions.SetBusName]: {
			name: 'Set Bus Name',
			options: [GetDropdown('Bus', 'bus', state.namedChoices.busses), GetTextField('Name', 'name')],
			callback: async (event) => {
				const cmd = Commands.Name(getNodeNumber(event, 'bus'))
				send(cmd, event.options.name as string)
			},
		},
		[BusActions.SetBusMute]: {
			name: 'Set Bus Mute',
			options: [GetDropdown('Bus', 'bus', state.namedChoices.busses), GetMuteDropdown('mute')],
			callback: async (event) => {
				const cmd = Commands.Mute(getNodeNumber(event, 'bus'))
				send(cmd, getNumber(event, 'mute'))
			},
		},
		[BusActions.SetBusFader]: {
			name: 'Set Bus Level',
			options: [GetDropdown('Bus', 'bus', state.namedChoices.busses), ...GetFaderInputField('level')],
			callback: async (event) => {
				const cmd = Commands.Fader(getNodeNumber(event, 'bus'))
				runTransition(cmd, 'level', event, state, transitions)
			},
			subscribe: (event) => {
				ensureLoaded(Commands.Fader(getNodeNumber(event, 'bus')))
			},
		},
		[BusActions.SetBusPanorama]: {
			name: 'Set Bus Panorama',
			options: [GetDropdown('Bus', 'bus', state.namedChoices.busses), ...GetPanoramaSlider('pan')],
			callback: async (event) => {
				const cmd = Commands.Pan(getNodeNumber(event, 'bus'))
				runTransition(cmd, 'pan', event, state, transitions)
			},
			subscribe: (event) => {
				ensureLoaded(Commands.Pan(getNodeNumber(event, 'bus')))
			},
		},
		[BusActions.SetBusToBusLevel]: {
			name: 'Set Bus to Bus Level',
			options: [
				GetDropdown('From Bus', 'bus', state.namedChoices.busses),
				GetDropdown('To Bus', 'busTo', state.namedChoices.busses),
				...GetFaderInputField('level'),
			],
			callback: async (event) => {
				if (event.options.bus == event.options.busTo) {
					return
				}
				const cmd = Commands.SendLevel(getNodeNumber(event, 'bus'), getNodeNumber(event, 'busTo'))
				runTransition(cmd, 'level', event, state, transitions)
			},
			subscribe: (event) => {
				ensureLoaded(Commands.SendLevel(getNodeNumber(event, 'bus'), getNodeNumber(event, 'busTo')))
			},
		},
		[BusActions.SetBusToBusMute]: {
			name: 'Set Bus to Bus Mute',
			options: [
				GetDropdown('From Bus', 'bus', state.namedChoices.busses),
				GetDropdown('To Bus', 'busTo', state.namedChoices.busses),
				GetMuteDropdown('mute'),
			],
			callback: async (event) => {
				if (event.options.bus == event.options.busTo) {
					return
				}
				const cmd = Commands.SendOn(getNodeNumber(event, 'bus'), getNodeNumber(event, 'busTo'))
				send(cmd, event.options.mute as number)
			},
		},
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
		////////////////////////////////////////////////////////////
		// Bus Fader
		////////////////////////////////////////////////////////////
		[BusActions.BusFaderStore]: {
			name: 'Store Bus Level',
			options: [GetDropdown('Bus', 'bus', state.namedChoices.busses)],
			callback: async (event) => {
				const cmd = Commands.Fader(getNodeNumber(event, 'bus'))
				StateUtil.storeValueForCommand(cmd, state)
			},
			subscribe: (event) => {
				ensureLoaded(Commands.Fader(getNodeNumber(event, 'bus')))
			},
		},
		[BusActions.BusFaderRestore]: {
			name: 'Restore Bus Level',
			options: [GetDropdown('Bus', 'bus', state.namedChoices.busses), ...FadeDurationChoice],
			callback: async (event) => {
				const cmd = Commands.Fader(getNodeNumber(event, 'bus'))
				const restoreVal = StateUtil.getValueFromKey(cmd, state)
				ActionUtil.runTransition(cmd, 'level', event, state, transitions, restoreVal)
			},
			subscribe: (event) => {
				ensureLoaded(Commands.Fader(getNodeNumber(event, 'bus')))
			},
		},
		[BusActions.BusFaderDelta]: {
			name: 'Adjust Bus Level',
			options: [
				GetDropdown('Bus', 'bus', state.namedChoices.busses),
				...GetFaderDeltaInputField('delta', 'Adjust (dB)'),
			],
			callback: async (event) => {
				const cmd = Commands.Fader(ActionUtil.getNodeNumber(event, 'bus'))
				let targetValue = StateUtil.getNumberFromState(cmd, state)
				const delta = event.options.delta as number
				state.storeDelta(cmd, delta)
				if (targetValue) {
					targetValue += delta
					ActionUtil.runTransition(cmd, 'level', event, state, transitions, targetValue)
				}
			},
			subscribe: (event) => {
				ensureLoaded(Commands.Fader(ActionUtil.getNodeNumber(event, 'bus')))
			},
		},
		[BusActions.BusUndoFaderDelta]: {
			name: 'Undo Bus Level Adjust',
			options: [GetDropdown('Bus', 'bus', state.namedChoices.busses), ...FadeDurationChoice],
			callback: async (event) => {
				const cmd = Commands.Fader(ActionUtil.getNodeNumber(event, 'bus'))
				let targetValue = StateUtil.getNumberFromState(cmd, state)
				const delta = state.restoreDelta(cmd)
				if (targetValue) {
					targetValue -= delta
					ActionUtil.runTransition(cmd, 'level', event, state, transitions, targetValue)
				}
			},
			subscribe: (event) => {
				ensureLoaded(Commands.Fader(ActionUtil.getNodeNumber(event, 'bus')))
			},
		},
		////////////////////////////////////////////////////////////
		// Bus Panorama
		////////////////////////////////////////////////////////////
		[BusActions.BusPanoramaStore]: {
			name: 'Store Bus Panorama',
			options: [GetDropdown('Bus', 'bus', state.namedChoices.busses)],
			callback: async (event) => {
				const cmd = Commands.Pan(getNodeNumber(event, 'bus'))
				StateUtil.storeValueForCommand(cmd, state)
			},
			subscribe: (event) => {
				ensureLoaded(Commands.Pan(getNodeNumber(event, 'bus')))
			},
		},
		[BusActions.BusPanoramaRestore]: {
			name: 'Restore Bus Panorama',
			options: [GetDropdown('Bus', 'bus', state.namedChoices.busses), ...FadeDurationChoice],
			callback: async (event) => {
				const cmd = Commands.Pan(getNodeNumber(event, 'bus'))
				const restoreVal = StateUtil.getValueFromKey(cmd, state)
				ActionUtil.runTransition(cmd, 'level', event, state, transitions, restoreVal)
			},
			subscribe: (event) => {
				ensureLoaded(Commands.Pan(getNodeNumber(event, 'bus')))
			},
		},
		[BusActions.BusPanoramaDelta]: {
			name: 'Adjust Bus Panorama',
			options: [
				GetDropdown('Bus', 'bus', state.namedChoices.busses),
				...GetPanoramaDeltaSlider('delta', 'Adjust (dB)'),
			],
			callback: async (event) => {
				const cmd = Commands.Pan(ActionUtil.getNodeNumber(event, 'bus'))
				let targetValue = StateUtil.getNumberFromState(cmd, state)
				const delta = event.options.delta as number
				state.storeDelta(cmd, delta)
				if (targetValue) {
					targetValue += delta
					ActionUtil.runTransition(cmd, 'pan', event, state, transitions, targetValue)
				}
			},
			subscribe: (event) => {
				ensureLoaded(Commands.Pan(ActionUtil.getNodeNumber(event, 'bus')))
			},
		},
		[BusActions.BusUndoPanoramaDelta]: {
			name: 'Undo Bus Panorama Adjust',
			options: [GetDropdown('Bus', 'bus', state.namedChoices.busses), ...FadeDurationChoice],
			callback: async (event) => {
				const cmd = Commands.Pan(ActionUtil.getNodeNumber(event, 'bus'))
				let targetValue = StateUtil.getNumberFromState(cmd, state)
				const delta = state.restoreDelta(cmd)
				if (targetValue) {
					targetValue -= delta
					ActionUtil.runTransition(cmd, 'level', event, state, transitions, targetValue)
				}
			},
			subscribe: (event) => {
				ensureLoaded(Commands.Pan(ActionUtil.getNodeNumber(event, 'bus')))
			},
		},
	}

	return actions
}
