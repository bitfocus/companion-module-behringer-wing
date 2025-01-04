import { WingState } from '../state/index.js'
import { WingTransitions } from '../transitions.js'
import { CompanionActionDefinitions } from '@companion-module/base'
import {
	GetFaderInputField,
	GetDropdown,
	GetPanoramaSlider,
	GetNumberField,
	GetMuteDropdown,
	GetTextField,
} from '../choices/common.js'
import { getNodeNumber, getNumber, runTransition } from './utils.js'
import { CompanionActionWithCallback } from './common.js'
import { BusCommands as Commands } from '../commands/bus.js'

export enum BusActions {
	SetBusColor = 'set-bus-color',
	SetBusName = 'set-bus-name',
	SetBusMute = 'set-bus-mute',
	SetBusFader = 'set-bus-fader',
	SetBusPanorama = 'set-bus-panorama',
	SetBusToBusLevel = 'set-bus-to-bus-level',
	SetBusToBusMute = 'set-bus-to-bus-mute',
}

export function createBusActions(
	state: WingState,
	transitions: WingTransitions,
	send: (cmd: string, argument?: number | string) => void,
	ensureLoaded: (path: string) => void,
): CompanionActionDefinitions {
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
	}

	return actions
}
