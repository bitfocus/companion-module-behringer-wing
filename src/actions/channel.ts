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
	getIconChoices,
} from '../choices/common.js'
import { getSourceGroupChoices } from '../choices/common.js'
import { getChannelProcessOrderChoices, getFilterModelOptions } from '../choices/channel.js'
import { ChannelCommands as Commands } from '../commands/channel.js'
import * as ActionUtil from './utils.js'
import { FadeDurationChoice } from '../choices/fades.js'
import { CompanionActionWithCallback } from './common.js'
import { EqModelDropdown, EqParameterDropdown } from '../choices/eq.js'
import { EqModelChoice } from '../choices/eq.js'
import { InstanceBaseExt } from '../types.js'
import { WingConfig } from '../config.js'
import { getStringFromState } from '../state/utils.js'

export enum ChannelActions {
	SetChannelMainConnection = 'set-channel-main-connection',
	SetChannelColor = 'set-channel-color',
	SetChannelName = 'set-channel-name',
	SetChannelGain = 'set-channel-gain',
	ChannelGainStore = 'channel-gain-store',
	ChannelGainRestore = 'channel-gain-restore',
	ChannelGainDelta = 'channel-gain-delta',
	ChannelGainUndoDelta = 'channel-undo-gain-delta',
	ChannelFaderStore = 'channel-fader-store',
	ChannelFaderRestore = 'channel-fader-restore',
	ChannelFaderDelta = 'channel-fader-delta',
	ChannelFaderUndoDelta = 'channel-fader-undo-delta',
	SetChannelMute = 'set-channel-mute',
	SetChannelFader = 'set-channel-fader',
	SetChannelPanorama = 'set-channel-panorama',
	ChannelPanoramaStore = 'channel-panorama-store',
	ChannelPanoramaRestore = 'channel-panorama-restore',
	ChannelPanoramaDelta = 'channel-panorama-delta',
	ChannelPanoramaUndoDelta = 'channel-undo-panorama-delta',
	SetChannelSendMute = 'set-channel-send-mute',
	SetChannelSendLevel = 'set-channel-send-level',
	ChannelToSendFaderStore = 'channel-to-send-fader-store',
	ChannelToSendFaderRestore = 'channel-to-send-fader-restore',
	ChannelToSendFaderDelta = 'channel-to-send-fader-delta',
	ChannelToSendFaderUndoDelta = 'channel-to-send-fader-undo-delta',
	SetChannelSendPanorama = 'set-channel-send-panorama',
	ChannelToSendPanoramaStore = 'channel-to-send-panorama-store',
	ChannelToSendPanoramaRestore = 'channel-to-send-panorama-restore',
	ChannelToSendPanoramaDelta = 'channel-to-send-panorama-delta',
	ChannelToSendPanoramaUndoDelta = 'channel-to-send-undo-panorama-delta',
	SetChannelFilterModel = 'set-channel-filter-model',
	SetChannelEqType = 'set-channel-eq-type',
	SetChannelEqParameter = 'set-channel-eq-parameter',
	SetChannelProcessOrder = 'set-channel-process-order',
	SetChannelIcon = 'set-channel-icon',
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
			options: [
				GetDropdown('Channel', 'channel', state.namedChoices.channels),
				...EqModelDropdown('model'),
				...EqParameterDropdown('band', 'model'),
			],
			callback: async (event) => {
				const cmd = Commands.EqModel(ActionUtil.getNodeNumber(event, 'channel'))
				send(cmd, ActionUtil.getString(event, 'model'))
			},
			subscribe: (event) => {
				ensureLoaded(Commands.EqModel(ActionUtil.getNodeNumber(event, 'channel')))
			},
			learn: (event) => {
				return {
					...event.options,
					model: getStringFromState(Commands.EqModel(ActionUtil.getNodeNumber(event, 'channel')), state),
				}
			},
		},
		[ChannelActions.SetChannelProcessOrder]: {
			name: 'Set Channel Process Order',
			options: [
				GetDropdown('Channel', 'channel', state.namedChoices.channels),
				GetDropdown('Order', 'order', getChannelProcessOrderChoices()),
			],
			callback: async (event) => {
				const cmd = Commands.ProcessOrder(ActionUtil.getNodeNumber(event, 'channel'))
				send(cmd, ActionUtil.getString(event, 'order'))
			},
		},
		[ChannelActions.SetChannelIcon]: {
			name: 'Set Channel Icon',
			options: [
				GetDropdown('Channel', 'channel', state.namedChoices.channels),
				GetDropdown('Icon', 'icon', getIconChoices()),
			],
			callback: async (event) => {
				const cmd = Commands.Icon(ActionUtil.getNodeNumber(event, 'channel'))
				send(cmd, ActionUtil.getNumber(event, 'icon'))
			},
		},
		////////////////////////////////////////////////////////////
		// Channel Gain
		////////////////////////////////////////////////////////////
		[ChannelActions.SetChannelGain]: {
			name: 'Set Channel Gain',
			options: [
				GetDropdown('Channel', 'channel', state.namedChoices.channels),
				GetNumberField('Gain (dB)', 'gain', -3.0, 45.5, 0.5, 0, true),
				...FadeDurationChoice,
			],
			callback: async (event) => {
				const cmd = Commands.InputGain(ActionUtil.getNodeNumber(event, 'channel'))
				ActionUtil.runTransition(cmd, 'gain', event, state, transitions)
			},
		},
		[ChannelActions.ChannelGainStore]: {
			name: 'Store Channel Gain',
			options: [GetDropdown('Channel', 'channel', state.namedChoices.channels)],
			callback: async (event) => {
				const cmd = Commands.InputGain(ActionUtil.getNodeNumber(event, 'channel'))
				StateUtil.storeValueForCommand(cmd, state)
			},
			subscribe: (event) => {
				ensureLoaded(Commands.InputGain(ActionUtil.getNodeNumber(event, 'channel')))
			},
		},
		[ChannelActions.ChannelGainRestore]: {
			name: 'Restore Channel Gain',
			options: [GetDropdown('Channel', 'channel', state.namedChoices.channels), ...FadeDurationChoice],
			callback: async (event) => {
				const cmd = Commands.InputGain(ActionUtil.getNodeNumber(event, 'channel'))
				const restoreVal = StateUtil.getValueFromKey(cmd, state)
				ActionUtil.runTransition(cmd, 'level', event, state, transitions, restoreVal)
			},
		},
		[ChannelActions.ChannelGainDelta]: {
			name: 'Adjust Channel Gain',
			options: [
				GetDropdown('Channel', 'channel', state.namedChoices.channels),
				GetNumberField('Gain (dB)', 'gain', -48.5, 48.5, 0.5, 0, true),
				...FadeDurationChoice,
			],
			callback: async (event) => {
				const cmd = Commands.InputGain(ActionUtil.getNodeNumber(event, 'channel'))
				let targetValue = StateUtil.getNumberFromState(cmd, state)
				const delta = event.options.delta as number
				state.storeDelta(cmd, delta)
				if (targetValue) {
					targetValue += delta
					ActionUtil.runTransition(cmd, 'level', event, state, transitions, targetValue)
				}
			},
			subscribe: (event) => {
				ensureLoaded(Commands.InputGain(ActionUtil.getNodeNumber(event, 'channel')))
			},
		},
		[ChannelActions.ChannelGainUndoDelta]: {
			name: 'Undo Channel Gain Adjust',
			options: [GetDropdown('Channel', 'channel', state.namedChoices.channels), ...FadeDurationChoice],
			callback: async (event) => {
				const cmd = Commands.InputGain(ActionUtil.getNodeNumber(event, 'channel'))
				let targetValue = StateUtil.getNumberFromState(cmd, state)
				const delta = state.restoreDelta(cmd)
				if (targetValue) {
					targetValue -= delta
					ActionUtil.runTransition(cmd, 'level', event, state, transitions, targetValue)
				}
			},
			subscribe: (event) => {
				ensureLoaded(Commands.InputGain(ActionUtil.getNodeNumber(event, 'channel')))
			},
		},
		////////////////////////////////////////////////////////////
		// Channel Fader
		////////////////////////////////////////////////////////////
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
		},
		[ChannelActions.ChannelFaderStore]: {
			name: 'Store Channel Level',
			options: [GetDropdown('Channel', 'channel', state.namedChoices.channels)],
			callback: async (event) => {
				const cmd = Commands.Fader(ActionUtil.getNodeNumber(event, 'channel'))
				StateUtil.storeValueForCommand(cmd, state)
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
				let targetValue = StateUtil.getNumberFromState(cmd, state)
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
		[ChannelActions.ChannelFaderUndoDelta]: {
			name: 'Undo Channel Level Adjust',
			options: [GetDropdown('Channel', 'channel', state.namedChoices.channels), ...FadeDurationChoice],
			callback: async (event) => {
				const cmd = Commands.Fader(ActionUtil.getNodeNumber(event, 'channel'))
				let targetValue = StateUtil.getNumberFromState(cmd, state)
				const delta = state.restoreDelta(cmd)
				if (targetValue) {
					targetValue -= delta
					ActionUtil.runTransition(cmd, 'level', event, state, transitions, targetValue)
				}
			},
			subscribe: (event) => {
				ensureLoaded(Commands.Fader(ActionUtil.getNodeNumber(event, 'channel')))
			},
		},
		////////////////////////////////////////////////////////////
		// Channel Panorama
		////////////////////////////////////////////////////////////
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
		[ChannelActions.ChannelPanoramaStore]: {
			name: 'Store Channel Panorama',
			options: [GetDropdown('Channel', 'channel', state.namedChoices.channels)],
			callback: async (event) => {
				const cmd = Commands.Pan(ActionUtil.getNodeNumber(event, 'channel'))
				StateUtil.storeValueForCommand(cmd, state)
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
				let targetValue = StateUtil.getNumberFromState(cmd, state)
				const delta = event.options.delta as number
				state.storeDelta(cmd, delta)
				if (targetValue) {
					targetValue += delta
					ActionUtil.runTransition(cmd, 'pan', event, state, transitions, targetValue)
				}
			},
			subscribe: (event) => {
				ensureLoaded(Commands.Pan(ActionUtil.getNodeNumber(event, 'channel')))
			},
		},
		[ChannelActions.ChannelPanoramaUndoDelta]: {
			name: 'Undo Channel Panorama Adjust',
			options: [GetDropdown('Channel', 'channel', state.namedChoices.channels), ...FadeDurationChoice],
			callback: async (event) => {
				const cmd = Commands.Pan(ActionUtil.getNodeNumber(event, 'channel'))
				let targetValue = StateUtil.getNumberFromState(cmd, state)
				const delta = state.restoreDelta(cmd) ?? 0
				if (targetValue) {
					targetValue -= delta
					ActionUtil.runTransition(cmd, 'pan', event, state, transitions, targetValue)
				}
			},
			subscribe: (event) => {
				ensureLoaded(Commands.Pan(ActionUtil.getNodeNumber(event, 'channel')))
			},
		},
		////////////////////////////////////////////////////////////
		// Channel to Bus Fader
		////////////////////////////////////////////////////////////
		[ChannelActions.SetChannelSendLevel]: {
			name: 'Set Channel to Bus Level',
			options: [
				GetDropdown('From Channel', 'channel', state.namedChoices.channels),
				GetDropdown('To Bus', 'bus', state.namedChoices.busses),
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
		[ChannelActions.ChannelToSendFaderStore]: {
			name: 'Store Channel to Bus Level',
			options: [
				GetDropdown('Channel', 'channel', state.namedChoices.channels),
				GetDropdown('To Bus', 'bus', state.namedChoices.busses),
			],
			callback: async (event) => {
				const cmd = Commands.SendLevel(
					ActionUtil.getNodeNumber(event, 'channel'),
					ActionUtil.getNodeNumber(event, 'bus'),
				)
				StateUtil.storeValueForCommand(cmd, state)
			},
			subscribe: (event) => {
				ensureLoaded(
					Commands.SendLevel(ActionUtil.getNodeNumber(event, 'channel'), ActionUtil.getNodeNumber(event, 'bus')),
				)
			},
		},
		[ChannelActions.ChannelToSendFaderRestore]: {
			name: 'Restore Channel to Bus Level',
			options: [
				GetDropdown('Channel', 'channel', state.namedChoices.channels),
				GetDropdown('To Bus', 'bus', state.namedChoices.busses),
				...FadeDurationChoice,
			],
			callback: async (event) => {
				const cmd = Commands.SendLevel(
					ActionUtil.getNodeNumber(event, 'channel'),
					ActionUtil.getNodeNumber(event, 'bus'),
				)
				const restoreVal = StateUtil.getValueFromKey(cmd, state)
				ActionUtil.runTransition(cmd, 'level', event, state, transitions, restoreVal)
			},
		},
		[ChannelActions.ChannelToSendFaderDelta]: {
			name: 'Adjust Channel to Bus Level',
			options: [
				GetDropdown('Channel', 'channel', state.namedChoices.channels),
				GetDropdown('To Bus', 'bus', state.namedChoices.busses),
				...GetFaderDeltaInputField('delta', 'Adjust (dB)'),
			],
			callback: async (event) => {
				const cmd = Commands.SendLevel(
					ActionUtil.getNodeNumber(event, 'channel'),
					ActionUtil.getNodeNumber(event, 'bus'),
				)
				let targetValue = StateUtil.getNumberFromState(cmd, state)
				const delta = event.options.delta as number
				state.storeDelta(cmd, delta)
				if (targetValue) {
					targetValue += delta
					ActionUtil.runTransition(cmd, 'level', event, state, transitions, targetValue)
				}
			},
			subscribe: (event) => {
				ensureLoaded(
					Commands.SendLevel(ActionUtil.getNodeNumber(event, 'channel'), ActionUtil.getNodeNumber(event, 'bus')),
				)
			},
		},
		[ChannelActions.ChannelToSendFaderUndoDelta]: {
			name: 'Undo Channel to Bus Level Adjust',
			options: [
				GetDropdown('Channel', 'channel', state.namedChoices.channels),
				GetDropdown('To Bus', 'bus', state.namedChoices.busses),
				...FadeDurationChoice,
			],
			callback: async (event) => {
				const cmd = Commands.SendLevel(
					ActionUtil.getNodeNumber(event, 'channel'),
					ActionUtil.getNodeNumber(event, 'bus'),
				)
				let targetValue = StateUtil.getNumberFromState(cmd, state)
				const delta = state.restoreDelta(cmd)
				if (targetValue) {
					targetValue -= delta
					ActionUtil.runTransition(cmd, 'level', event, state, transitions, targetValue)
				}
			},
			subscribe: (event) => {
				ensureLoaded(
					Commands.SendLevel(ActionUtil.getNodeNumber(event, 'channel'), ActionUtil.getNodeNumber(event, 'bus')),
				)
			},
		},
		////////////////////////////////////////////////////////////
		// Channel to Bus Panorama
		////////////////////////////////////////////////////////////
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
		[ChannelActions.ChannelToSendPanoramaStore]: {
			name: 'Store Channel to Bus Panorama',
			options: [GetDropdown('Channel', 'channel', state.namedChoices.channels)],
			callback: async (event) => {
				const cmd = Commands.SendPan(ActionUtil.getNodeNumber(event, 'channel'), ActionUtil.getNodeNumber(event, 'bus'))
				StateUtil.storeValueForCommand(cmd, state)
			},
			subscribe: (event) => {
				ensureLoaded(
					Commands.SendPan(ActionUtil.getNodeNumber(event, 'channel'), ActionUtil.getNodeNumber(event, 'bus')),
				)
			},
		},
		[ChannelActions.ChannelToSendPanoramaRestore]: {
			name: 'Restore Channel to Bus Panorama',
			options: [
				GetDropdown('Channel', 'channel', state.namedChoices.channels),
				GetDropdown('To Bus', 'bus', state.namedChoices.busses),
				...FadeDurationChoice,
			],
			callback: async (event) => {
				const cmd = Commands.SendPan(ActionUtil.getNodeNumber(event, 'channel'), ActionUtil.getNodeNumber(event, 'bus'))
				const restoreVal = StateUtil.getValueFromKey(cmd, state)
				ActionUtil.runTransition(cmd, 'pan', event, state, transitions, restoreVal)
			},
		},
		[ChannelActions.ChannelToSendPanoramaDelta]: {
			name: 'Adjust Channel to Bus Panorama',
			options: [
				GetDropdown('Channel', 'channel', state.namedChoices.channels),
				GetDropdown('To Bus', 'bus', state.namedChoices.busses),
				...GetPanoramaDeltaSlider('delta', 'Adjust'),
			],
			callback: async (event) => {
				const cmd = Commands.SendPan(ActionUtil.getNodeNumber(event, 'channel'), ActionUtil.getNodeNumber(event, 'bus'))
				let targetValue = StateUtil.getNumberFromState(cmd, state)
				const delta = event.options.delta as number
				state.storeDelta(cmd, delta)
				if (targetValue) {
					targetValue += delta
					ActionUtil.runTransition(cmd, 'pan', event, state, transitions, targetValue)
				}
			},
			subscribe: (event) => {
				ensureLoaded(
					Commands.SendPan(ActionUtil.getNodeNumber(event, 'channel'), ActionUtil.getNodeNumber(event, 'bus')),
				)
			},
		},
		[ChannelActions.ChannelToSendPanoramaUndoDelta]: {
			name: 'Undo Channel to Bus Panorama Adjust',
			options: [
				GetDropdown('Channel', 'channel', state.namedChoices.channels),
				GetDropdown('To Bus', 'bus', state.namedChoices.busses),
				...FadeDurationChoice,
			],
			callback: async (event) => {
				const cmd = Commands.SendPan(ActionUtil.getNodeNumber(event, 'channel'), ActionUtil.getNodeNumber(event, 'bus'))
				let targetValue = StateUtil.getNumberFromState(cmd, state)
				const delta = state.restoreDelta(cmd) ?? 0
				if (targetValue) {
					targetValue -= delta
					ActionUtil.runTransition(cmd, 'pan', event, state, transitions, targetValue)
				}
			},
			subscribe: (event) => {
				ensureLoaded(
					Commands.SendPan(ActionUtil.getNodeNumber(event, 'channel'), ActionUtil.getNodeNumber(event, 'bus')),
				)
			},
		},
	}

	return actions
}
