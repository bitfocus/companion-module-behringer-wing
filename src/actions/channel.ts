import { StateUtil } from '../state/index.js'
import { CompanionActionDefinitions } from '@companion-module/base'
import {
	GetFaderInputField,
	GetDropdown,
	GetPanoramaSlider,
	GetNumberField,
	GetMuteDropdown,
	GetColorDropdown,
	GetTextField,
	GetFaderDeltaInputField,
	GetPanoramaDeltaSlider,
} from '../choices/common.js'
import { getSourceGroupChoices } from '../choices/common.js'
import { getFilterModelOptions } from '../choices/channel.js'
import { ChannelCommands as Commands } from '../commands/channel.js'
import * as ActionUtil from './utils.js'
import { FadeDurationChoice } from '../choices/fades.js'
import { CompanionActionWithCallback } from './common.js'
import { GetEqParameterChoice } from '../choices/eq.js'
import { EqModelChoice } from '../choices/eq.js'
import { InstanceBaseExt } from '../types.js'
import { WingConfig } from '../config.js'

export enum ChannelActions {
	SetChannelMainConnection = 'set-channel-main-connection',
	SetChannelColor = 'set-channel-color',
	SetChannelName = 'set-channel-name',
	SetChannelMute = 'set-channel-mute',
	SetChannelFader = 'set-channel-fader',
	SetChannelPanorama = 'set-channel-panorama',
	SetChannelSendMute = 'set-channel-send-mute',
	SetChannelSendLevel = 'set-channel-send-level',
	SetChannelSendPanorama = 'set-channel-send-panorama',
	SetChannelFilterModel = 'set-channel-filter-model',
	SetChannelEqType = 'set-channel-eq-type',
	SetChannelEqParameter = 'set-channel-eq-parameter',
	ChannelFaderStore = 'channel-fader-store',
	ChannelFaderRestore = 'channel-fader-restore',
	ChannelFaderDelta = 'channel-fader-delta',
	ChannelUndoFaderDelta = 'channel-undo-fader-delta',
	ChannelPanoramaStore = 'channel-panorama-store',
	ChannelPanoramaRestore = 'channel-panorama-restore',
	ChannelPanoramaDelta = 'channel-panorama-delta',
	ChannelUndoPanoramaDelta = 'channel-undo-panorama-delta',
}

export function createChannelActions(self: InstanceBaseExt<WingConfig>): CompanionActionDefinitions {
	const send = self.sendCommand
	const ensureLoaded = self.ensureLoaded
	const transitions = self.transitions
	const state = self.state

	const actions: { [id in ChannelActions]: CompanionActionWithCallback | undefined } = {
		[ChannelActions.SetChannelMainConnection]: {
			name: 'Set Channel Main Connection',
			options: [
				GetDropdown('Channel', 'channel', state.namedChoices.channels),
				GetDropdown('Group', 'group', getSourceGroupChoices()),
				GetNumberField('Index', 'index', 1, 64, 1, 1),
			],
			callback: async (event) => {
				let cmd = Commands.MainInputConnectionGroup(ActionUtil.getNodeNumber(event, 'channel'))
				send(cmd, event.options.group as string)
				cmd = Commands.MainInputConnectionIndex(ActionUtil.getNodeNumber(event, 'channel'))
				send(cmd, ActionUtil.getNumber(event, 'index'))
			},
		},
		[ChannelActions.SetChannelColor]: {
			name: 'Set Channel Color',
			options: [GetDropdown('Channel', 'channel', state.namedChoices.channels), GetColorDropdown('color')],
			callback: async (event) => {
				const cmd = Commands.Color(ActionUtil.getNodeNumber(event, 'channel'))
				send(cmd, ActionUtil.getNumber(event, 'color'))
			},
		},
		[ChannelActions.SetChannelName]: {
			name: 'Set Channel Name',
			options: [
				GetDropdown('Channel', 'channel', state.namedChoices.channels),
				GetTextField('Channel Name', 'name', undefined, 'The name of the channel must be shorter than 16 characters'),
			],
			callback: async (event) => {
				const cmd = Commands.Name(ActionUtil.getNodeNumber(event, 'channel'))
				send(cmd, event.options.name as string)
			},
		},
		[ChannelActions.SetChannelMute]: {
			name: 'Set Channel Mute',
			options: [GetDropdown('Channel', 'channel', state.namedChoices.channels), GetMuteDropdown('mute')],
			callback: async (event) => {
				const cmd = Commands.Mute(ActionUtil.getNodeNumber(event, 'channel'))
				send(cmd, ActionUtil.getNumber(event, 'mute'))
			},
		},
		[ChannelActions.SetChannelFader]: {
			name: 'Set Channel Level',
			options: [GetDropdown('Channel', 'channel', state.namedChoices.channels), ...GetFaderInputField('level')],
			callback: async (event) => {
				const cmd = Commands.Fader(ActionUtil.getNodeNumber(event, 'channel'))
				ActionUtil.runTransition(cmd, 'level', event, state, transitions)
			},
			subscribe: (event) => {
				ensureLoaded(Commands.Fader(ActionUtil.getNodeNumber(event, 'channel')))
			},
			// learn: (event) => {
			// 	const cmd = ChannelCommands.Fader(getObjectNumberFromAction(event, 'channel'))
			// 	const level = ActionUtil.getStringValueForCommand(cmd, state)
			// 	return {
			// 		...event.options,
			// 		level: level ?? event.options.level
			// 	}
			// },
		},
		[ChannelActions.SetChannelPanorama]: {
			name: 'Set Channel Panorama',
			options: [GetDropdown('Channel', 'channel', state.namedChoices.channels), ...GetPanoramaSlider('pan')],
			callback: async (event) => {
				const cmd = Commands.Pan(ActionUtil.getNodeNumber(event, 'channel'))
				ActionUtil.runTransition(cmd, 'pan', event, state, transitions)
			},
			subscribe: (event) => {
				ensureLoaded(Commands.Pan(ActionUtil.getNodeNumber(event, 'channel')))
			},
		},
		[ChannelActions.SetChannelSendMute]: {
			name: 'Set Channel to Bus Mute',
			options: [
				GetDropdown('From Channel', 'channel', state.namedChoices.channels),
				GetDropdown('To Bus', 'bus', state.namedChoices.busses),
				GetMuteDropdown('mute'),
			],
			callback: async (event) => {
				const cmd = Commands.SendOn(ActionUtil.getNodeNumber(event, 'channel'), ActionUtil.getNodeNumber(event, 'bus'))
				send(cmd, ActionUtil.getNodeNumber(event, 'mute'))
			},
		},
		[ChannelActions.SetChannelSendLevel]: {
			name: 'Set Channel to Bus Level',
			options: [
				GetDropdown('From Channel', 'channel', state.namedChoices.channels),
				GetDropdown('To Bus', 'bus', state.namedChoices.busses),
				GetDropdown('aux', 'aux', state.namedChoices.auxes),
				GetDropdown('matrices', 'mtx', state.namedChoices.matrices),
				GetDropdown('mains', 'main', state.namedChoices.mains),
				...GetFaderInputField('level'),
			],
			callback: async (event) => {
				const cmd = Commands.SendLevel(
					ActionUtil.getNodeNumber(event, 'channel'),
					ActionUtil.getNodeNumber(event, 'bus'),
				)
				ActionUtil.runTransition(cmd, 'level', event, state, transitions)
			},
			subscribe: (event) => {
				ensureLoaded(
					Commands.SendLevel(ActionUtil.getNodeNumber(event, 'channel'), ActionUtil.getNodeNumber(event, 'bus')),
				)
			},
		},
		[ChannelActions.SetChannelSendPanorama]: {
			name: 'Set Channel to Bus Panorama',
			options: [
				GetDropdown('From Channel', 'channel', state.namedChoices.channels),
				GetDropdown('To Bus', 'bus', state.namedChoices.busses),
				...GetPanoramaSlider('pan'),
			],
			callback: async (event) => {
				const cmd = Commands.SendPan(ActionUtil.getNodeNumber(event, 'channel'), ActionUtil.getNodeNumber(event, 'bus'))
				ActionUtil.runTransition(cmd, 'pan', event, state, transitions)
			},
			subscribe: (event) => {
				ensureLoaded(
					Commands.SendPan(ActionUtil.getNodeNumber(event, 'channel'), ActionUtil.getNodeNumber(event, 'bus')),
				)
			},
		},
		[ChannelActions.SetChannelFilterModel]: {
			name: 'Set Channel Filter Model',
			options: [
				GetDropdown('Channel', 'channel', state.namedChoices.channels),
				GetDropdown('Filter', 'filter', getFilterModelOptions()),
			],
			callback: async (event) => {
				const cmd = Commands.FilterModel(ActionUtil.getNodeNumber(event, 'channel'))
				send(cmd, ActionUtil.getString(event, 'filter'))
			},
		},
		[ChannelActions.SetChannelEqType]: {
			name: 'Set Channel EQ Model',
			options: [
				GetDropdown('Channel', 'channel', state.namedChoices.channels),
				GetDropdown('EQ Model', 'model', EqModelChoice),
			],
			callback: async (event) => {
				const cmd = Commands.EqModel(ActionUtil.getNodeNumber(event, 'channel'))
				send(cmd, ActionUtil.getString(event, 'model'))
			},
		},
		[ChannelActions.SetChannelEqParameter]: {
			name: 'Set Channel EQ Parameter',
			options: [GetDropdown('Channel', 'channel', state.namedChoices.channels), ...GetEqParameterChoice('STD', 'band')],
			callback: async (event) => {
				const cmd = Commands.EqModel(ActionUtil.getNodeNumber(event, 'channel'))
				send(cmd, ActionUtil.getString(event, 'model'))
			},
			subscribe: (event) => {
				ensureLoaded(Commands.EqModel(ActionUtil.getNodeNumber(event, 'channel')))
			},
		},
		[ChannelActions.ChannelFaderStore]: {
			name: 'Store Channel Level',
			options: [GetDropdown('Channel', 'channel', state.namedChoices.channels)],
			callback: async (event) => {
				const cmd = Commands.Fader(ActionUtil.getNodeNumber(event, 'channel'))
				const currentVal = ActionUtil.getNumberFromState(cmd, state)
				StateUtil.storeValueWithKey(cmd, state, currentVal)
			},
			subscribe: (event) => {
				ensureLoaded(Commands.Fader(ActionUtil.getNodeNumber(event, 'channel')))
			},
		},
		[ChannelActions.ChannelFaderRestore]: {
			name: 'Restore Channel Level',
			options: [GetDropdown('Channel', 'channel', state.namedChoices.channels), ...FadeDurationChoice],
			callback: async (event) => {
				const cmd = Commands.Fader(ActionUtil.getNodeNumber(event, 'channel'))
				const restoreVal = StateUtil.getValueFromKey(cmd, state)
				ActionUtil.runTransition(cmd, 'level', event, state, transitions, restoreVal)
			},
		},
		[ChannelActions.ChannelFaderDelta]: {
			name: 'Adjust Channel Level',
			options: [
				GetDropdown('Channel', 'channel', state.namedChoices.channels),
				...GetFaderDeltaInputField('delta', 'Adjust (dB)'),
			],
			callback: async (event) => {
				const cmd = Commands.Fader(ActionUtil.getNodeNumber(event, 'channel'))
				let targetValue = ActionUtil.getNumberFromState(cmd, state)
				const delta = event.options.delta as number
				state.storeDelta(cmd, delta)
				if (targetValue) {
					targetValue += delta
					ActionUtil.runTransition(cmd, 'level', event, state, transitions, targetValue)
				}
			},
			subscribe: (event) => {
				ensureLoaded(Commands.Fader(ActionUtil.getNodeNumber(event, 'channel')))
			},
		},
		[ChannelActions.ChannelUndoFaderDelta]: {
			name: 'Undo Channel Level Adjust',
			options: [GetDropdown('Channel', 'channel', state.namedChoices.channels), ...FadeDurationChoice],
			callback: async (event) => {
				const cmd = Commands.Fader(ActionUtil.getNodeNumber(event, 'channel'))
				let targetValue = ActionUtil.getNumberFromState(cmd, state)
				const delta = state.restoreDelta(cmd)
				console.log(delta)
				if (targetValue) {
					targetValue -= delta
					ActionUtil.runTransition(cmd, 'level', event, state, transitions, targetValue)
				}
			},
			subscribe: (event) => {
				ensureLoaded(Commands.Fader(ActionUtil.getNodeNumber(event, 'channel')))
			},
		},
		[ChannelActions.ChannelPanoramaStore]: {
			name: 'Store Channel Panorama',
			options: [GetDropdown('Channel', 'channel', state.namedChoices.channels)],
			callback: async (event) => {
				const cmd = Commands.Pan(ActionUtil.getNodeNumber(event, 'channel'))
				const currentVal = ActionUtil.getNumberFromState(cmd, state)
				StateUtil.storeValueWithKey(cmd, state, currentVal)
			},
			subscribe: (event) => {
				ensureLoaded(Commands.Pan(ActionUtil.getNodeNumber(event, 'channel')))
			},
		},
		[ChannelActions.ChannelPanoramaRestore]: {
			name: 'Restore Channel Panorama',
			options: [GetDropdown('Channel', 'channel', state.namedChoices.channels), ...FadeDurationChoice],
			callback: async (event) => {
				const cmd = Commands.Pan(ActionUtil.getNodeNumber(event, 'channel'))
				const restoreVal = StateUtil.getValueFromKey(cmd, state)
				ActionUtil.runTransition(cmd, 'pan', event, state, transitions, restoreVal)
			},
		},
		[ChannelActions.ChannelPanoramaDelta]: {
			name: 'Adjust Channel Panorama',
			options: [
				GetDropdown('Channel', 'channel', state.namedChoices.channels),
				...GetPanoramaDeltaSlider('delta', 'Adjust'),
			],
			callback: async (event) => {
				const cmd = Commands.Pan(ActionUtil.getNodeNumber(event, 'channel'))
				let targetValue = ActionUtil.getNumberFromState(cmd, state)
				const delta = event.options.delta as number
				state.storeDelta(cmd, delta)
				if (targetValue) {
					targetValue += delta
					ActionUtil.runTransition(cmd, 'pan', event, state, transitions, targetValue)
				}
			},
			subscribe: (event) => {
				ensureLoaded(Commands.Fader(ActionUtil.getNodeNumber(event, 'channel')))
			},
		},
		[ChannelActions.ChannelUndoPanoramaDelta]: {
			name: 'Undo Channel Panorama Adjust',
			options: [GetDropdown('Channel', 'channel', state.namedChoices.channels), ...FadeDurationChoice],
			callback: async (event) => {
				const cmd = Commands.Pan(ActionUtil.getNodeNumber(event, 'channel'))
				let targetValue = ActionUtil.getNumberFromState(cmd, state)
				const delta = state.restoreDelta(cmd) ?? 0
				if (targetValue) {
					targetValue -= delta
					ActionUtil.runTransition(cmd, 'pan', event, state, transitions, targetValue)
				}
			},
			subscribe: (event) => {
				ensureLoaded(Commands.Fader(ActionUtil.getNodeNumber(event, 'channel')))
			},
		},
	}

	return actions
}
