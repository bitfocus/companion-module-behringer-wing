import { CompanionActionDefinition } from '@companion-module/base'
import { SetRequired } from 'type-fest' // eslint-disable-line n/no-missing-import

export type CompanionActionWithCallback = SetRequired<CompanionActionDefinition, 'callback'>

import { CompanionActionDefinitions } from '@companion-module/base'
import {
	GetFaderInputField,
	GetDropdown,
	GetPanoramaSlider,
	GetMuteDropdown,
	GetTextField,
	GetFaderDeltaInputField,
	GetPanoramaDeltaSlider,
	GetColorDropdown,
	GetNumberField,
	GetOnOffToggleDropdown,
	getDelayModes,
} from '../choices/common.js'
import { getNodeNumber, getNumber, runTransition } from './utils.js'
import { InstanceBaseExt } from '../types.js'
import { WingConfig } from '../config.js'
import * as ActionUtil from './utils.js'
import { StateUtil } from '../state/index.js'
import { FadeDurationChoice } from '../choices/fades.js'
import { getIdLabelPair } from '../choices/utils.js'

export enum CommonActions {
	SetScribbleLight = 'set-scribble-light',
	SetScribbleLightColor = 'set-scribble-light-color',
	SetName = 'set-name',
	SetSolo = 'set-solo',
	ClearSolo = 'clear-solo',
	// Gain
	SetGain = 'set-gain',
	StoreGain = 'store-gain',
	RestoreGain = 'restore-gain',
	DeltaGain = 'delta-gain',
	UndoDeltaGain = 'undo-delta-gain',
	//////////// NORMAL
	SetMute = 'set-mute',
	// Fader
	SetFader = 'set-fader',
	StoreFader = 'store-fader',
	RestoreFader = 'restore-fader',
	DeltaFader = 'fader-delta',
	UndoDeltaFader = 'undo-fader-delta',
	// Panorama
	SetPanorama = 'set-panorama',
	StorePanorama = 'store-panorama',
	RestorePanorama = 'restore-panorama',
	DeltaPanorama = 'panorama-delta',
	UndoDeltaPanorama = 'undo-panorama',
	// Delay
	SetDelay = 'set-delay',
	SetDelayAmount = 'set-delay-amount',

	//////////// SEND
	SetSendMute = 'set-send-mute',
	// Send Fader
	SetSendFader = 'set-send-fader',
	StoreSendFader = 'store-send-fader',
	RestoreSendFader = 'restore-send-fader',
	DeltaSendFader = 'delta-send-fader',
	UndoDeltaSendFader = 'undo-send-fader',
	// Send Panorama
	SetSendPanorama = 'set-send-panorama',
	StoreSendPanorama = 'store-send-panorama',
	RestoreSendPanorama = 'restore-send-panorama',
	DeltaSendPanorama = 'delta-send-panorama',
	UndoDeltaSendPanorama = 'undo-send-panorama',
	// Main Send
	SetMainSendMute = 'set-main-send-mute',
	SetMainSendFader = 'set-main-send-fader',
	StoreMainSendFader = 'store-main-send-fader',
	RestoreMainSendFader = 'restore-main-send-fader',
	DeltaMainSendFader = 'delta-main-send-fader',
	UndoDeltaMainSendFader = 'undo-main-send-fader',
}

export function createCommonActions(self: InstanceBaseExt<WingConfig>): CompanionActionDefinitions {
	const send = self.sendCommand
	const ensureLoaded = self.ensureLoaded
	const state = self.state
	const transitions = self.transitions

	const allChannels = [
		...state.namedChoices.channels,
		...state.namedChoices.auxes,
		...state.namedChoices.busses,
		...state.namedChoices.matrices,
		...state.namedChoices.mains,
	]

	const allSendSources = [...state.namedChoices.channels, ...state.namedChoices.auxes, ...state.namedChoices.busses]

	const actions: { [id in CommonActions]: CompanionActionWithCallback | undefined } = {
		[CommonActions.SetScribbleLight]: {
			name: 'Set Scribble Light',
			description: 'Set or toggle the scribble light state of a channel, aux, bus, dca, matrix, or main.',
			options: [
				GetDropdown('Selection', 'sel', [...allChannels, ...state.namedChoices.dcas]),
				GetDropdown(
					'Scribble Light',
					'led',
					[getIdLabelPair('1', 'On'), getIdLabelPair('0', 'Off'), getIdLabelPair('2', 'Toggle')],
					'1',
				),
			],
			callback: async (event) => {
				const sel = event.options.sel as string
				const cmd = ActionUtil.getScribblelightCommand(sel, getNodeNumber(event, 'sel'))
				const val = ActionUtil.getSetOrToggleValue(cmd, ActionUtil.getNumber(event, 'led'), state)
				send(cmd, val)
			},
			subscribe: (event) => {
				if (event.options.led ?? 0 > 2) {
					const sel = event.options.sel as string
					const cmd = ActionUtil.getScribblelightCommand(sel, getNodeNumber(event, 'sel'))
					ensureLoaded(cmd)
				}
			},
		},
		[CommonActions.SetScribbleLightColor]: {
			name: 'Set Scribble Light Color',
			description: 'Set the scribble light color of a channel, aux, bus, dca, matrix, or main.',
			options: [
				GetDropdown('Selection', 'sel', [...allChannels, ...state.namedChoices.dcas]),
				GetColorDropdown('color', 'Color'),
			],
			callback: async (event) => {
				const sel = event.options.sel as string
				const cmd = ActionUtil.getColorCommand(sel, getNodeNumber(event, 'sel'))
				send(cmd, getNumber(event, 'color'))
			},
		},
		[CommonActions.SetName]: {
			name: 'Set Name',
			description: 'Set the name of a channel, aux, bus, dca, matrix, main, or a mutegroup.',
			options: [
				GetDropdown('Selection', 'sel', [...allChannels, ...state.namedChoices.dcas, ...state.namedChoices.mutegroups]),
				GetTextField('Name', 'name'),
			],
			callback: async (event) => {
				const sel = event.options.sel as string
				const cmd = ActionUtil.getNameCommand(sel, getNodeNumber(event, 'sel'))
				send(cmd, event.options.name as string)
			},
		},
		////////////////////////////////////////////////////////////////
		// Gain
		////////////////////////////////////////////////////////////////
		[CommonActions.SetGain]: {
			name: 'Set Gain',
			description: 'Set the input gain of a channel or aux.',
			options: [
				GetDropdown('Channel', 'channel', [...state.namedChoices.channels, ...state.namedChoices.auxes]),
				GetNumberField('Gain (dB)', 'gain', -3.0, 45.5, 0.5, 0, true),
				...FadeDurationChoice,
			],
			callback: async (event) => {
				const sel = event.options.sel as string
				const cmd = ActionUtil.getGainCommand(sel, getNodeNumber(event, 'sel'))
				ActionUtil.runTransition(cmd, 'gain', event, state, transitions)
			},
			subscribe: (event) => {
				const sel = event.options.sel as string
				const cmd = ActionUtil.getGainCommand(sel, getNodeNumber(event, 'sel'))
				ensureLoaded(cmd)
			},
			learn: (event) => {
				const sel = event.options.sel as string
				const cmd = ActionUtil.getGainCommand(sel, getNodeNumber(event, 'sel'))
				return { level: StateUtil.getNumberFromState(cmd, state) }
			},
		},
		[CommonActions.StoreGain]: {
			name: 'Store Gain',
			description: 'Store the gain of a channel or aux.',
			options: [GetDropdown('Selection', 'sel', allChannels)],
			callback: async (event) => {
				const sel = event.options.sel as string
				const cmd = ActionUtil.getGainCommand(sel, getNodeNumber(event, 'sel'))
				StateUtil.storeValueForCommand(cmd, state)
			},
			subscribe: (event) => {
				const sel = event.options.sel as string
				const cmd = ActionUtil.getGainCommand(sel, getNodeNumber(event, 'sel'))
				ensureLoaded(cmd)
			},
		},
		[CommonActions.RestoreGain]: {
			name: 'Restore Gain',
			description: 'Restore the gain of a channel or aux.',
			options: [GetDropdown('Selection', 'sel', allChannels), ...FadeDurationChoice],
			callback: async (event) => {
				const sel = event.options.sel as string
				const cmd = ActionUtil.getGainCommand(sel, getNodeNumber(event, 'sel'))
				const restoreVal = StateUtil.getValueFromKey(cmd, state)
				ActionUtil.runTransition(cmd, 'gain', event, state, transitions, restoreVal)
			},
		},
		[CommonActions.DeltaGain]: {
			name: 'Adjust Gain',
			description: 'Adjust the input gain of a channel or aux.',
			options: [
				GetDropdown('Selection', 'sel', allChannels),
				GetNumberField('Gain (dB)', 'gain', -48.5, 48.5, 0.5, 0, true),
			],
			callback: async (event) => {
				const sel = event.options.sel as string
				const cmd = ActionUtil.getGainCommand(sel, getNodeNumber(event, 'sel'))
				let targetValue = StateUtil.getNumberFromState(cmd, state)
				const delta = event.options.delta as number
				state.storeDelta(cmd, delta)
				if (targetValue != undefined) {
					targetValue += delta
					console.log('targetValue', targetValue)
					ActionUtil.runTransition(cmd, 'gain', event, state, transitions, targetValue)
				}
			},
			subscribe: (event) => {
				const sel = event.options.sel as string
				const cmd = ActionUtil.getGainCommand(sel, getNodeNumber(event, 'sel'))
				ensureLoaded(cmd)
			},
		},
		[CommonActions.UndoDeltaGain]: {
			name: 'Undo Gain Adjust',
			description: 'Undo the previous input gain adjustment on a channel or aux.',
			options: [GetDropdown('Selection', 'sel', allChannels), ...FadeDurationChoice],
			callback: async (event) => {
				const sel = event.options.sel as string
				const cmd = ActionUtil.getGainCommand(sel, getNodeNumber(event, 'sel'))
				let targetValue = StateUtil.getNumberFromState(cmd, state)
				const delta = state.restoreDelta(cmd)
				if (targetValue != undefined) {
					targetValue -= delta
					ActionUtil.runTransition(cmd, 'gain', event, state, transitions, targetValue)
				}
			},
			subscribe: (event) => {
				const sel = event.options.sel as string
				const cmd = ActionUtil.getGainCommand(sel, getNodeNumber(event, 'sel'))
				ensureLoaded(cmd)
			},
		},
		////////////////////////////////////////////////////////////////
		// NORMAL
		////////////////////////////////////////////////////////////////
		[CommonActions.SetMute]: {
			name: 'Set Mute',
			description: 'Set or toggle the mute state of a channel, aux, bus, dca, matrix or main.',
			options: [
				GetDropdown('Selection', 'sel', [...allChannels, ...state.namedChoices.dcas, ...state.namedChoices.mutegroups]),
				GetMuteDropdown('mute'),
			],
			callback: async (event) => {
				const sel = event.options.sel as string
				const cmd = ActionUtil.getMuteCommand(sel, getNodeNumber(event, 'sel'))
				const val = ActionUtil.getSetOrToggleValue(cmd, ActionUtil.getNumber(event, 'mute'), state)
				send(cmd, val)
			},
			subscribe: (event) => {
				if (event.options.sel ?? 0 >= 2) {
					const sel = event.options.sel as string
					const cmd = ActionUtil.getMuteCommand(sel, getNodeNumber(event, 'sel'))
					ensureLoaded(cmd)
				}
			},
		},
		////////////////////////////////////////////////////////////////
		// Fader
		////////////////////////////////////////////////////////////////
		[CommonActions.SetFader]: {
			name: 'Set Level',
			description: 'Set the fader level of a channel, aux, bus, dca, matrix or main to a value.',
			options: [
				GetDropdown('Selection', 'sel', [...allChannels, ...state.namedChoices.dcas]),
				...GetFaderInputField('level'),
			],
			callback: async (event) => {
				const sel = event.options.sel as string
				const cmd = ActionUtil.getFaderCommand(sel, getNodeNumber(event, 'sel'))
				runTransition(cmd, 'level', event, state, transitions)
			},
			subscribe: (event) => {
				const sel = event.options.sel as string
				const cmd = ActionUtil.getFaderCommand(sel, getNodeNumber(event, 'sel'))
				ensureLoaded(cmd)
			},
			learn: (event) => {
				const sel = event.options.sel as string
				const cmd = ActionUtil.getFaderCommand(sel, getNodeNumber(event, 'sel'))
				return { level: StateUtil.getNumberFromState(cmd, state) }
			},
		},
		[CommonActions.StoreFader]: {
			name: 'Store Level',
			description: 'Store the fader level of a channel, aux, bus, dca, matrix or main.',
			options: [GetDropdown('Selection', 'sel', [...allChannels, ...state.namedChoices.dcas])],
			callback: async (event) => {
				const sel = event.options.sel as string
				const cmd = ActionUtil.getFaderCommand(sel, getNodeNumber(event, 'sel'))
				StateUtil.storeValueForCommand(cmd, state)
			},
			subscribe: (event) => {
				const sel = event.options.sel as string
				const cmd = ActionUtil.getFaderCommand(sel, getNodeNumber(event, 'sel'))
				ensureLoaded(cmd)
			},
		},
		[CommonActions.RestoreFader]: {
			name: 'Restore Level',
			description: 'Restore the fader level of a channel, aux, bus, dca, matrix or main.',
			options: [GetDropdown('Selection', 'sel', [...allChannels, ...state.namedChoices.dcas]), ...FadeDurationChoice],
			callback: async (event) => {
				const sel = event.options.sel as string
				const cmd = ActionUtil.getFaderCommand(sel, getNodeNumber(event, 'sel'))
				const restoreVal = StateUtil.getValueFromKey(cmd, state)
				ActionUtil.runTransition(cmd, 'level', event, state, transitions, restoreVal)
			},
		},
		[CommonActions.DeltaFader]: {
			name: 'Adjust Fader Level',
			description: 'Adjust the level of a channel, aux, bus, dca, matrix or main.',
			options: [
				GetDropdown('Selection', 'sel', [...allChannels, ...state.namedChoices.dcas]),
				...GetFaderDeltaInputField('delta', 'Adjust (dB)'),
			],
			callback: async (event) => {
				const sel = event.options.sel as string
				const cmd = ActionUtil.getFaderCommand(sel, getNodeNumber(event, 'sel'))
				let targetValue = StateUtil.getNumberFromState(cmd, state)
				const delta = event.options.delta as number
				state.storeDelta(cmd, delta)
				if (targetValue != undefined) {
					targetValue += delta
					console.log('targetValue', targetValue)
					ActionUtil.runTransition(cmd, 'level', event, state, transitions, targetValue)
				}
			},
			subscribe: (event) => {
				const sel = event.options.sel as string
				const cmd = ActionUtil.getFaderCommand(sel, getNodeNumber(event, 'sel'))
				ensureLoaded(cmd)
			},
		},
		[CommonActions.UndoDeltaFader]: {
			name: 'Undo Level Adjust',
			description: 'Undo the previous level adjustment on a channel, aux, bus, dca, matrix or main.',
			options: [GetDropdown('Selection', 'sel', [...allChannels, ...state.namedChoices.dcas]), ...FadeDurationChoice],
			callback: async (event) => {
				const sel = event.options.sel as string
				const cmd = ActionUtil.getFaderCommand(sel, getNodeNumber(event, 'sel'))
				let targetValue = StateUtil.getNumberFromState(cmd, state)
				const delta = state.restoreDelta(cmd)
				if (targetValue != undefined) {
					targetValue -= delta
					ActionUtil.runTransition(cmd, 'level', event, state, transitions, targetValue)
				}
			},
			subscribe: (event) => {
				const sel = event.options.sel as string
				const cmd = ActionUtil.getFaderCommand(sel, getNodeNumber(event, 'sel'))
				ensureLoaded(cmd)
			},
		},

		////////////////////////////////////////////////////////////////
		// Panorama
		////////////////////////////////////////////////////////////////
		[CommonActions.SetPanorama]: {
			name: 'Set Panorama',
			description: 'Set the panorama of a channel, aux, bus, matrix or main.',
			options: [GetDropdown('Selection', 'sel', allChannels), ...GetPanoramaSlider('pan')],
			callback: async (event) => {
				const sel = event.options.sel as string
				const cmd = ActionUtil.getPanoramaCommand(sel, getNodeNumber(event, 'sel'))
				runTransition(cmd, 'pan', event, state, transitions)
			},
			subscribe: (event) => {
				const sel = event.options.sel as string
				const cmd = ActionUtil.getPanoramaCommand(sel, getNodeNumber(event, 'sel'))
				ensureLoaded(cmd)
			},
			learn: (event) => {
				const sel = event.options.sel as string
				const cmd = ActionUtil.getPanoramaCommand(sel, getNodeNumber(event, 'sel'))
				return { pan: StateUtil.getNumberFromState(cmd, state) }
			},
		},
		[CommonActions.StorePanorama]: {
			name: 'Store Panorama',
			description: 'Store the panorama of a channel, aux, bus, matrix or main.',
			options: [GetDropdown('Selection', 'sel', allChannels)],
			callback: async (event) => {
				const sel = event.options.sel as string
				const cmd = ActionUtil.getPanoramaCommand(sel, getNodeNumber(event, 'sel'))
				StateUtil.storeValueForCommand(cmd, state)
			},
			subscribe: (event) => {
				const sel = event.options.sel as string
				const cmd = ActionUtil.getPanoramaCommand(sel, getNodeNumber(event, 'sel'))
				ensureLoaded(cmd)
			},
		},
		[CommonActions.RestorePanorama]: {
			name: 'Restore Panorama',
			description: 'Restore the panorama of a channel, aux, bus, matrix or main.',
			options: [GetDropdown('Selection', 'sel', allChannels), ...FadeDurationChoice],
			callback: async (event) => {
				const sel = event.options.sel as string
				const cmd = ActionUtil.getPanoramaCommand(sel, getNodeNumber(event, 'sel'))
				const restoreVal = StateUtil.getValueFromKey(cmd, state)
				ActionUtil.runTransition(cmd, 'pan', event, state, transitions, restoreVal)
			},
		},
		[CommonActions.DeltaPanorama]: {
			name: 'Adjust Panorama',
			description: 'Adjust the panorama of a channel, aux, bus, matrix or main.',
			options: [GetDropdown('Selection', 'sel', allChannels), ...GetPanoramaDeltaSlider('pan', 'Panorama')],
			callback: async (event) => {
				const sel = event.options.sel as string
				const cmd = ActionUtil.getPanoramaCommand(sel, getNodeNumber(event, 'sel'))
				let targetValue = StateUtil.getNumberFromState(cmd, state)
				const delta = event.options.pan as number
				state.storeDelta(cmd, delta)
				if (targetValue != undefined) {
					targetValue += delta
					console.log('targetValue', targetValue)
					ActionUtil.runTransition(cmd, 'pan', event, state, transitions, targetValue)
				}
			},
			subscribe: (event) => {
				const sel = event.options.sel as string
				const cmd = ActionUtil.getPanoramaCommand(sel, getNodeNumber(event, 'sel'))
				ensureLoaded(cmd)
			},
		},
		[CommonActions.UndoDeltaPanorama]: {
			name: 'Undo Panorama Adjust',
			description: 'Undo the previous adjustment on the panorama of a channel, aux, bus, matrix or main.',
			options: [GetDropdown('Selection', 'sel', allChannels), ...FadeDurationChoice],
			callback: async (event) => {
				const sel = event.options.sel as string
				const cmd = ActionUtil.getPanoramaCommand(sel, getNodeNumber(event, 'sel'))
				let targetValue = StateUtil.getNumberFromState(cmd, state)
				const delta = state.restoreDelta(cmd)
				if (targetValue != undefined) {
					targetValue -= delta
					ActionUtil.runTransition(cmd, 'pan', event, state, transitions, targetValue)
				}
			},
			subscribe: (event) => {
				const sel = event.options.sel as string
				const cmd = ActionUtil.getPanoramaCommand(sel, getNodeNumber(event, 'sel'))
				ensureLoaded(cmd)
			},
		},
		////////////////////////////////////////////////////////////////
		// Solo
		////////////////////////////////////////////////////////////////
		[CommonActions.SetSolo]: {
			name: 'Set Solo',
			description: 'Set the solo state for a channel, aux, bux, matrix or main',
			options: [GetDropdown('Selection', 'sel', allChannels), GetOnOffToggleDropdown('solo', 'Solo')],
			callback: async (event) => {
				const sel = event.options.sel as string
				const cmd = ActionUtil.getSoloCommand(sel, getNodeNumber(event, 'sel'))
				const val = ActionUtil.getSetOrToggleValue(cmd, ActionUtil.getNumber(event, 'solo'), state)
				send(cmd, val)
			},
			subscribe: (event) => {
				if (event.options.sel ?? 0 >= 2) {
					const sel = event.options.sel as string
					const cmd = ActionUtil.getSoloCommand(sel, getNodeNumber(event, 'sel'))
					ensureLoaded(cmd)
				}
			},
		},
		[CommonActions.ClearSolo]: {
			name: 'Clear Solo',
			description: 'Clear the Solo from all channels, auxes, busses, matrices and mains.',
			options: [],
			callback: async (_) => {
				const extractNumber = (id: string): number | null => {
					const match = id.match(/\/(\d+)$/)
					return match ? parseInt(match[1], 10) : null
				}

				for (const channel of allChannels) {
					const id = channel.id as string
					const number = extractNumber(id)
					if (number !== null) {
						const cmd = ActionUtil.getSoloCommand(id, number)
						send(cmd, 0)
					}
				}
			},
		},
		////////////////////////////////////////////////////////////////
		// Delay
		////////////////////////////////////////////////////////////////
		[CommonActions.SetDelay]: {
			name: 'Set Delay',
			description: 'Enable or disable the delay of a bus, matrix or main.',
			options: [
				GetDropdown('Selection', 'sel', [
					...state.namedChoices.mains,
					...state.namedChoices.matrices,
					...state.namedChoices.busses,
				]),
				GetOnOffToggleDropdown('delay', 'Delay'),
			],
			callback: async (event) => {
				const sel = event.options.sel as string
				const cmd = ActionUtil.getDelayOnCommand(sel, getNodeNumber(event, 'sel'))
				const val = ActionUtil.getNumber(event, 'delay')
				if (val < 2) {
					send(cmd, val)
				} else {
					const currentVal = StateUtil.getBooleanFromState(cmd, state)
					send(cmd, Number(!currentVal))
				}
			},
			subscribe: (event) => {
				const sel = event.options.sel as string
				const cmd = ActionUtil.getDelayOnCommand(sel, getNodeNumber(event, 'sel'))
				ensureLoaded(cmd)
			},
		},

		[CommonActions.SetDelayAmount]: {
			name: 'Set Delay Mode',
			description: 'Set the delay mode of a bus, matrix or main.',
			options: [
				GetDropdown('Selection', 'sel', [
					...state.namedChoices.mains,
					...state.namedChoices.matrices,
					...state.namedChoices.busses,
				]),
				GetDropdown('Delay Mode', 'mode', getDelayModes()),
				{
					type: 'number',
					label: 'Amount (meters)',
					id: 'amount_m',
					min: 0,
					max: 150,
					step: 0.1,
					default: 0,
					range: true,
					isVisible: (options) => {
						console.log('options: ', options)
						return (options.mode as string) === 'M'
					},
				},
				{
					type: 'number',
					label: 'Amount (ft)',
					id: 'amount_ft',
					min: 0.5,
					max: 500,
					step: 0.5,
					default: 0.5,
					range: true,
					isVisible: (options) => {
						return options.mode === 'FT'
					},
				},
				{
					type: 'number',
					label: 'Amount (ms)',
					id: 'amount_ms',
					min: 0.5,
					max: 500,
					step: 0.1,
					default: 0.5,
					range: true,
					isVisible: (options) => {
						return options.mode === 'MS'
					},
				},
				{
					type: 'number',
					label: 'Amount (samples)',
					id: 'amount_samples',
					min: 16,
					max: 500,
					step: 1,
					default: 16,
					range: true,
					isVisible: (options) => {
						return options.mode === 'SMP'
					},
				},
			],
			callback: async (event) => {
				const sel = event.options.sel as string
				const mode = event.options.mode as string
				send(ActionUtil.getDelayModeCommand(sel, getNodeNumber(event, 'sel')), mode)
				switch (mode) {
					case 'M':
						send(
							ActionUtil.getDelayAmountCommand(sel, getNodeNumber(event, 'sel')),
							event.options.amount_m as number,
							true,
						)
						break
					case 'FT':
						send(
							ActionUtil.getDelayAmountCommand(sel, getNodeNumber(event, 'sel')),
							event.options.amount_ft as number,
							true,
						)
						break
					case 'MS':
						send(
							ActionUtil.getDelayAmountCommand(sel, getNodeNumber(event, 'sel')),
							event.options.amount_ms as number,
							true,
						)
						break
					case 'SMP':
						send(
							ActionUtil.getDelayAmountCommand(sel, getNodeNumber(event, 'sel')),
							event.options.amount_samples as number,
							true,
						)
						break
				}
			},
		},

		////////////////////////////////////////////////////////////////
		// Send Fader
		////////////////////////////////////////////////////////////////
		[CommonActions.SetSendFader]: {
			name: 'Set Send Level',
			description: 'Set the send level from a channel, aux or bus to a bus.',
			options: [
				GetDropdown('From', 'src', allSendSources),
				GetDropdown('To Bus', 'dest', state.namedChoices.busses),
				...GetFaderInputField('level'),
			],
			callback: async (event) => {
				const src = event.options.src as string
				const cmd = ActionUtil.getSendLevelCommand(src, getNodeNumber(event, 'src'), getNodeNumber(event, 'dest'))
				runTransition(cmd, 'level', event, state, transitions)
			},
			subscribe: (event) => {
				const src = event.options.src as string
				const cmd = ActionUtil.getSendLevelCommand(src, getNodeNumber(event, 'src'), getNodeNumber(event, 'dest'))
				ensureLoaded(cmd)
			},
		},
		[CommonActions.StoreSendFader]: {
			name: 'Store Send Level',
			description: 'Store the send level from a channel, aux or bus to a bus.',
			options: [
				GetDropdown('From', 'src', allSendSources),
				GetDropdown('To Bus', 'dest', state.namedChoices.busses),
				...FadeDurationChoice,
			],
			callback: async (event) => {
				const src = event.options.src as string
				const cmd = ActionUtil.getSendLevelCommand(src, getNodeNumber(event, 'src'), getNodeNumber(event, 'dest'))
				StateUtil.storeValueForCommand(cmd, state)
			},
			subscribe: (event) => {
				const src = event.options.src as string
				const cmd = ActionUtil.getSendLevelCommand(src, getNodeNumber(event, 'src'), getNodeNumber(event, 'dest'))
				ensureLoaded(cmd)
			},
		},
		[CommonActions.RestoreSendFader]: {
			name: 'Restore Send Level',
			description: 'Restore the send level from a channel, aux or bus to a bus.',
			options: [
				GetDropdown('From', 'src', allSendSources),
				GetDropdown('To Bus', 'dest', state.namedChoices.busses),
				...FadeDurationChoice,
			],
			callback: async (event) => {
				const src = event.options.src as string
				const cmd = ActionUtil.getSendLevelCommand(src, getNodeNumber(event, 'src'), getNodeNumber(event, 'dest'))
				const restoreVal = StateUtil.getValueFromKey(cmd, state)
				ActionUtil.runTransition(cmd, 'level', event, state, transitions, restoreVal)
			},
		},
		[CommonActions.DeltaSendFader]: {
			name: 'Adjust Send Level',
			description: 'Adjust the send level from a channel, aux or bus to a bus.',
			options: [
				GetDropdown('From', 'src', allSendSources),
				GetDropdown('To Bus', 'dest', state.namedChoices.busses),
				...GetFaderDeltaInputField('delta', 'Adjust (dB)'),
			],
			callback: async (event) => {
				const src = event.options.src as string
				const cmd = ActionUtil.getSendLevelCommand(src, getNodeNumber(event, 'src'), getNodeNumber(event, 'dest'))
				let targetValue = StateUtil.getNumberFromState(cmd, state)
				const delta = event.options.delta as number
				state.storeDelta(cmd, delta)
				if (targetValue != undefined) {
					targetValue += delta
					console.log('targetValue', targetValue)
					ActionUtil.runTransition(cmd, 'level', event, state, transitions, targetValue)
				}
			},
			subscribe: (event) => {
				const src = event.options.src as string
				const cmd = ActionUtil.getSendLevelCommand(src, getNodeNumber(event, 'src'), getNodeNumber(event, 'dest'))
				ensureLoaded(cmd)
			},
		},
		[CommonActions.UndoDeltaSendFader]: {
			name: 'Undo Send Level Adjust',
			description: 'Undo the previous send level adjustment from a channel, aux or bus to a bus.',
			options: [
				GetDropdown('From', 'src', allSendSources),
				GetDropdown('To Bus', 'dest', state.namedChoices.busses),
				...FadeDurationChoice,
			],
			callback: async (event) => {
				const src = event.options.src as string
				const cmd = ActionUtil.getSendLevelCommand(src, getNodeNumber(event, 'src'), getNodeNumber(event, 'dest'))
				let targetValue = StateUtil.getNumberFromState(cmd, state)
				const delta = state.restoreDelta(cmd)
				if (targetValue != undefined) {
					targetValue -= delta
					ActionUtil.runTransition(cmd, 'level', event, state, transitions, targetValue)
				}
			},
			subscribe: (event) => {
				const src = event.options.src as string
				const cmd = ActionUtil.getSendLevelCommand(src, getNodeNumber(event, 'src'), getNodeNumber(event, 'dest'))
				ensureLoaded(cmd)
			},
		},
		[CommonActions.SetSendMute]: {
			name: 'Set Send Mute',
			description: 'Set or toggle the mute state of a send from a channel, aux or bus to a bus.',
			options: [
				GetDropdown('Selection', 'src', allSendSources),
				GetDropdown('To Bus', 'dest', state.namedChoices.busses),
				GetMuteDropdown('mute'),
			],
			callback: async (event) => {
				const sel = event.options.src as string
				const cmd = ActionUtil.getSendMuteCommand(sel, getNodeNumber(event, 'src'), getNodeNumber(event, 'dest'))
				let val = ActionUtil.getNumber(event, 'mute')
				val = ActionUtil.getSetOrToggleValue(cmd, val, state, true)
				send(cmd, val)
			},
			subscribe: (event) => {
				if (event.options.sel ?? 0 >= 2) {
					const sel = event.options.sel as string
					const cmd = ActionUtil.getSendMuteCommand(sel, getNodeNumber(event, 'src'), getNodeNumber(event, 'dest'))
					ensureLoaded(cmd)
				}
			},
		},
		////////////////////////////////////////////////////////////////
		// Send Panorama
		////////////////////////////////////////////////////////////////
		[CommonActions.SetSendPanorama]: {
			name: 'Set Send Panorama',
			description: 'Set the panorama of a send from a channel or aux to a bus.',
			options: [
				GetDropdown('From', 'src', [...state.namedChoices.channels, ...state.namedChoices.auxes]),
				GetDropdown('To Bus', 'dest', state.namedChoices.busses),
				...GetPanoramaSlider('pan'),
			],
			callback: async (event) => {
				const src = event.options.src as string
				const cmd = ActionUtil.getSendPanoramaCommand(src, getNodeNumber(event, 'src'), getNodeNumber(event, 'dest'))
				runTransition(cmd, 'pan', event, state, transitions)
			},
			subscribe: (event) => {
				const src = event.options.src as string
				const cmd = ActionUtil.getSendPanoramaCommand(src, getNodeNumber(event, 'src'), getNodeNumber(event, 'dest'))
				ensureLoaded(cmd)
			},
		},
		[CommonActions.StoreSendPanorama]: {
			name: 'Store Send Panorama',
			description: 'Store the panorama of a send from a channel or aux to a bus.',
			options: [
				GetDropdown('From', 'src', [...state.namedChoices.channels, ...state.namedChoices.auxes]),
				GetDropdown('To Bus', 'dest', state.namedChoices.busses),
			],
			callback: async (event) => {
				const src = event.options.src as string
				const cmd = ActionUtil.getSendPanoramaCommand(src, getNodeNumber(event, 'src'), getNodeNumber(event, 'dest'))
				StateUtil.storeValueForCommand(cmd, state)
			},
			subscribe: (event) => {
				const src = event.options.src as string
				const cmd = ActionUtil.getSendPanoramaCommand(src, getNodeNumber(event, 'src'), getNodeNumber(event, 'dest'))
				ensureLoaded(cmd)
			},
		},
		[CommonActions.RestoreSendPanorama]: {
			name: 'Restore Send Panorama',
			description: 'Restore the panorama of a send from a channel or aux to a bus.',
			options: [
				GetDropdown('From', 'src', [...state.namedChoices.channels, ...state.namedChoices.auxes]),
				GetDropdown('To Bus', 'dest', state.namedChoices.busses),
				...FadeDurationChoice,
			],
			callback: async (event) => {
				const src = event.options.src as string
				const cmd = ActionUtil.getSendPanoramaCommand(src, getNodeNumber(event, 'src'), getNodeNumber(event, 'dest'))
				const restoreVal = StateUtil.getValueFromKey(cmd, state)
				ActionUtil.runTransition(cmd, 'pan', event, state, transitions, restoreVal)
			},
		},
		[CommonActions.DeltaSendPanorama]: {
			name: 'Adjust Send Panorama',
			description: 'Adjust the panorama of a send from a channel or aux to a bus.',
			options: [
				GetDropdown('From', 'src', [...state.namedChoices.channels, ...state.namedChoices.auxes]),
				GetDropdown('To Bus', 'dest', state.namedChoices.busses),
				...GetPanoramaDeltaSlider('delta', 'Panorama'),
			],
			callback: async (event) => {
				const src = event.options.src as string
				const cmd = ActionUtil.getSendPanoramaCommand(src, getNodeNumber(event, 'src'), getNodeNumber(event, 'dest'))
				let targetValue = StateUtil.getNumberFromState(cmd, state)
				const delta = event.options.delta as number
				state.storeDelta(cmd, delta)
				if (targetValue != undefined) {
					targetValue += delta
					console.log('targetValue', targetValue)
					ActionUtil.runTransition(cmd, 'pan', event, state, transitions, targetValue)
				}
			},
			subscribe: (event) => {
				const src = event.options.src as string
				const cmd = ActionUtil.getSendPanoramaCommand(src, getNodeNumber(event, 'src'), getNodeNumber(event, 'dest'))
				ensureLoaded(cmd)
			},
		},
		[CommonActions.UndoDeltaSendPanorama]: {
			name: 'Undo Send Panorama Adjust',
			description: 'Undo the panorama adjustment of a send from a channel or aux to a bus.',
			options: [
				GetDropdown('From', 'src', [...state.namedChoices.channels, ...state.namedChoices.auxes]),
				GetDropdown('To Bus', 'dest', state.namedChoices.busses),
				...FadeDurationChoice,
			],
			callback: async (event) => {
				const src = event.options.src as string
				const cmd = ActionUtil.getSendPanoramaCommand(src, getNodeNumber(event, 'src'), getNodeNumber(event, 'dest'))
				let targetValue = StateUtil.getNumberFromState(cmd, state)
				const delta = state.restoreDelta(cmd)
				if (targetValue != undefined) {
					targetValue -= delta
					ActionUtil.runTransition(cmd, 'pan', event, state, transitions, targetValue)
				}
			},
			subscribe: (event) => {
				const src = event.options.src as string
				const cmd = ActionUtil.getSendPanoramaCommand(src, getNodeNumber(event, 'src'), getNodeNumber(event, 'dest'))
				ensureLoaded(cmd)
			},
		},

		////////////////////////////////////////////////////////////////
		// Main Send Fader
		////////////////////////////////////////////////////////////////
		[CommonActions.SetMainSendMute]: {
			name: 'Set Main Send Mute',
			description: 'Set or toggle the mute state of a main send from a channel, aux or bus to a main.',
			options: [
				GetDropdown('Selection', 'src', allSendSources),
				GetDropdown('To Main', 'dest', state.namedChoices.mains),
				GetMuteDropdown('mute'),
			],
			callback: async (event) => {
				const sel = event.options.src as string
				const cmd = ActionUtil.getMainSendMuteCommand(sel, getNodeNumber(event, 'src'), getNodeNumber(event, 'dest'))
				let val = ActionUtil.getNumber(event, 'mute')
				val = Number(ActionUtil.getSetOrToggleValue(cmd, val, state, true))
				send(cmd, val)
			},
			subscribe: (event) => {
				if (event.options.mute ?? 0 > 2) {
					const sel = event.options.sel as string
					const cmd = ActionUtil.getMainSendMuteCommand(sel, getNodeNumber(event, 'src'), getNodeNumber(event, 'dest'))
					ensureLoaded(cmd)
				}
			},
		},
		[CommonActions.SetMainSendFader]: {
			name: 'Set Main Send Level',
			description: 'Set the send level from a channel, aux or bus to a main.',
			options: [
				GetDropdown('From', 'src', allSendSources),
				GetDropdown('To Main', 'dest', state.namedChoices.mains),
				...GetFaderInputField('level'),
			],
			callback: async (event) => {
				const src = event.options.src as string
				const cmd = ActionUtil.getMainSendLevelCommand(src, getNodeNumber(event, 'src'), getNodeNumber(event, 'dest'))
				runTransition(cmd, 'level', event, state, transitions)
			},
			subscribe: (event) => {
				const src = event.options.src as string
				const cmd = ActionUtil.getMainSendLevelCommand(src, getNodeNumber(event, 'src'), getNodeNumber(event, 'dest'))
				ensureLoaded(cmd)
			},
		},
		[CommonActions.StoreMainSendFader]: {
			name: 'Store Main Send Level',
			description: 'Store the Main send level from a channel, aux or bus to a main.',
			options: [GetDropdown('From', 'src', allSendSources), GetDropdown('To Main', 'dest', state.namedChoices.mains)],
			callback: async (event) => {
				const src = event.options.src as string
				const cmd = ActionUtil.getMainSendLevelCommand(src, getNodeNumber(event, 'src'), getNodeNumber(event, 'dest'))
				StateUtil.storeValueForCommand(cmd, state)
			},
			subscribe: (event) => {
				const src = event.options.src as string
				const cmd = ActionUtil.getMainSendLevelCommand(src, getNodeNumber(event, 'src'), getNodeNumber(event, 'dest'))
				ensureLoaded(cmd)
			},
		},
		[CommonActions.RestoreMainSendFader]: {
			name: 'Restore Main Send Level',
			description: 'Restore the Main send level from a channel, aux or bus to a main.',
			options: [
				GetDropdown('From', 'src', allSendSources),
				GetDropdown('To Main', 'dest', state.namedChoices.mains),
				...FadeDurationChoice,
			],
			callback: async (event) => {
				const src = event.options.src as string
				const cmd = ActionUtil.getMainSendLevelCommand(src, getNodeNumber(event, 'src'), getNodeNumber(event, 'dest'))
				const restoreVal = StateUtil.getValueFromKey(cmd, state)
				ActionUtil.runTransition(cmd, 'level', event, state, transitions, restoreVal)
			},
		},
		[CommonActions.DeltaMainSendFader]: {
			name: 'Adjust Main Send Level',
			description: 'Adjust the Main send level from a channel, aux or bus to a main.',
			options: [
				GetDropdown('From', 'src', allSendSources),
				GetDropdown('To Main', 'dest', state.namedChoices.mains),
				...GetFaderDeltaInputField('delta', 'Adjust (dB)'),
			],
			callback: async (event) => {
				const src = event.options.src as string
				const cmd = ActionUtil.getMainSendLevelCommand(src, getNodeNumber(event, 'src'), getNodeNumber(event, 'dest'))
				let targetValue = StateUtil.getNumberFromState(cmd, state)
				const delta = event.options.delta as number
				state.storeDelta(cmd, delta)
				if (targetValue != undefined) {
					targetValue += delta
					console.log('targetValue', targetValue)
					ActionUtil.runTransition(cmd, 'level', event, state, transitions, targetValue)
				}
			},
			subscribe: (event) => {
				const src = event.options.src as string
				const cmd = ActionUtil.getMainSendLevelCommand(src, getNodeNumber(event, 'src'), getNodeNumber(event, 'dest'))
				ensureLoaded(cmd)
			},
		},
		[CommonActions.UndoDeltaMainSendFader]: {
			name: 'Undo Main Send Level Adjust',
			description: 'Undo the previous Main send level adjustment from a channel, aux or bus to a main.',
			options: [
				GetDropdown('From', 'src', allSendSources),
				GetDropdown('To Main', 'dest', state.namedChoices.mains),
				...FadeDurationChoice,
			],
			callback: async (event) => {
				const src = event.options.src as string
				const cmd = ActionUtil.getMainSendLevelCommand(src, getNodeNumber(event, 'src'), getNodeNumber(event, 'dest'))
				let targetValue = StateUtil.getNumberFromState(cmd, state)
				console.log(targetValue)
				const delta = state.restoreDelta(cmd)
				if (targetValue != undefined) {
					targetValue -= delta
					ActionUtil.runTransition(cmd, 'level', event, state, transitions, targetValue)
				}
			},
			subscribe: (event) => {
				const src = event.options.src as string
				const cmd = ActionUtil.getMainSendLevelCommand(src, getNodeNumber(event, 'src'), getNodeNumber(event, 'dest'))
				ensureLoaded(cmd)
			},
		},
	}

	return actions
}
