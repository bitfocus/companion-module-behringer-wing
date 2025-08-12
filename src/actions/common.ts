import { CompanionActionDefinition, CompanionOptionValues } from '@companion-module/base'
import { SetRequired } from 'type-fest' // eslint-disable-line n/no-missing-import

export type CompanionActionWithCallback = SetRequired<CompanionActionDefinition, 'callback'>

import { CompanionActionDefinitions } from '@companion-module/base'
import {
	GetFaderInputField,
	GetDropdown,
	GetPanoramaSlider,
	GetMuteDropdown,
	GetTextFieldWithVariables,
	GetFaderDeltaInputField,
	GetPanoramaDeltaSlider,
	GetColorDropdown,
	GetNumberField,
	GetOnOffToggleDropdown,
	getDelayModes,
} from '../choices/common.js'
import { getNodeNumber, getNumber, runTransition, getStringWithVariables } from './utils.js'
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
	// Gate
	SetGateOn = 'set-gate-on',
	// EQ
	SetEqOn = 'set-eq-on',
	// Dynamics
	SetDynamicsOn = 'set-dynamics-on',

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

	// Inserts
	SetInsertOn = 'set-insert-on',
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

	const allSendSources = [
		...state.namedChoices.channels,
		...state.namedChoices.auxes,
		...state.namedChoices.busses,
		...state.namedChoices.mains,
	]

	const channelAuxBusSendDestinations = [
		...state.namedChoices.busses,
		...state.namedChoices.mains,
		...state.namedChoices.matrices,
	]
	const mainSendDestinations = [...state.namedChoices.matrices]

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
				if (event.options.led ?? 0 >= 2) {
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
				...GetTextFieldWithVariables('Name', 'name'),
			],
			callback: async (event) => {
				const name = await getStringWithVariables(self, event, 'name')
				const sel = event.options.sel as string
				const cmd = ActionUtil.getNameCommand(sel, getNodeNumber(event, 'sel'))
				send(cmd, name)
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
				ActionUtil.runTransition(cmd, 'gain', event, state, transitions, undefined, false)
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
				ActionUtil.runTransition(cmd, 'gain', event, state, transitions, restoreVal, false)
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
					ActionUtil.runTransition(cmd, 'gain', event, state, transitions, targetValue, false)
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
					ActionUtil.runTransition(cmd, 'gain', event, state, transitions, targetValue, false)
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
					if (targetValue < -90) {
						targetValue = -90
					}
					targetValue += delta
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
				runTransition(cmd, 'pan', event, state, transitions, undefined, false)
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
				ActionUtil.runTransition(cmd, 'pan', event, state, transitions, restoreVal, false)
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
					ActionUtil.runTransition(cmd, 'pan', event, state, transitions, targetValue, false)
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
					ActionUtil.runTransition(cmd, 'pan', event, state, transitions, targetValue, false)
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
			options: [
				GetDropdown('Selection', 'sel', [...allChannels, ...state.namedChoices.dcas]),
				GetOnOffToggleDropdown('solo', 'Solo'),
			],
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
			description: 'Enable or disable the delay of a channel, bus, matrix or main.',
			options: [
				GetDropdown('Selection', 'sel', [
					...state.namedChoices.channels,
					...state.namedChoices.matrices,
					...state.namedChoices.busses,
					...state.namedChoices.mains,
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
			description: 'Set the delay mode of a channel, bus, matrix or main.',
			options: [
				GetDropdown('Selection', 'sel', [
					...state.namedChoices.channels,
					...state.namedChoices.matrices,
					...state.namedChoices.busses,
					...state.namedChoices.mains,
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
		// Gate
		////////////////////////////////////////////////////////////////
		[CommonActions.SetGateOn]: {
			name: 'Set Gate On',
			description: 'Enable, disable or toggle the on-state of a gate on a channel',
			options: [
				GetDropdown('Selection', 'sel', state.namedChoices.channels),
				GetOnOffToggleDropdown('enable', 'Enable'),
			],
			callback: async (event) => {
				const sel = event.options.sel as string
				const cmd = ActionUtil.getGateEnableCommand(sel, getNodeNumber(event, 'sel'))
				const val = ActionUtil.getNumber(event, 'enable')
				if (val < 2) {
					send(cmd, val)
				} else {
					const currentVal = StateUtil.getBooleanFromState(cmd, state)
					send(cmd, Number(!currentVal))
				}
			},
			subscribe: (event) => {
				const sel = event.options.sel as string
				const cmd = ActionUtil.getGateEnableCommand(sel, getNodeNumber(event, 'sel'))
				ensureLoaded(cmd)
			},
		},
		////////////////////////////////////////////////////////////////
		// EQ
		////////////////////////////////////////////////////////////////
		[CommonActions.SetEqOn]: {
			name: 'Set EQ On',
			description: 'Enable, disable or toggle the on-state of an EQ on a channel, bus, aux, matrix or main.',
			options: [GetDropdown('Selection', 'sel', allChannels), GetOnOffToggleDropdown('enable', 'Enable')],
			callback: async (event) => {
				const sel = event.options.sel as string
				const cmd = ActionUtil.getEqEnableCommand(sel, getNodeNumber(event, 'sel'))
				const val = ActionUtil.getNumber(event, 'enable')
				const currentVal = StateUtil.getBooleanFromState(cmd, state)
				if (val < 2) {
					send(cmd, val)
				} else {
					send(cmd, Number(!currentVal))
				}
			},
			subscribe: (event) => {
				const sel = event.options.sel as string
				const cmd = ActionUtil.getSoloCommand(sel, getNodeNumber(event, 'sel'))
				ensureLoaded(cmd)
			},
		},
		////////////////////////////////////////////////////////////////
		// Dynamics
		////////////////////////////////////////////////////////////////
		[CommonActions.SetDynamicsOn]: {
			name: 'Set Dynamics On',
			description: 'Enable, disable or toggle the on-state of dynamics on a channel, bus, aux, matrix or main.',
			options: [GetDropdown('Selection', 'sel', allChannels), GetOnOffToggleDropdown('enable', 'Enable')],
			callback: async (event) => {
				const sel = event.options.sel as string
				const cmd = ActionUtil.getDynamicsEnableCommand(sel, getNodeNumber(event, 'sel'))
				const val = ActionUtil.getNumber(event, 'enable')
				const currentVal = StateUtil.getBooleanFromState(cmd, state)
				if (val < 2) {
					send(cmd, val)
				} else {
					send(cmd, Number(!currentVal))
				}
			},
			subscribe: (event) => {
				const sel = event.options.sel as string
				const cmd = ActionUtil.getDynamicsEnableCommand(sel, getNodeNumber(event, 'sel'))
				ensureLoaded(cmd)
			},
		},
		////////////////////////////////////////////////////////////////
		// Send Fader
		////////////////////////////////////////////////////////////////
		[CommonActions.SetSendFader]: {
			name: 'Set Send Level',
			description: 'Set the send level from a destination channel strip to a source',
			options: [
				GetDropdown('From', 'src', allSendSources),
				{
					...GetDropdown('To', 'dest', channelAuxBusSendDestinations),
					isVisible: (options: CompanionOptionValues): boolean => {
						const source = options.src as string
						return !source.startsWith('/main')
					},
				},
				{
					...GetDropdown('To', 'mainDest', mainSendDestinations),
					isVisible: (options: CompanionOptionValues): boolean => {
						const source = options.src as string
						return source.startsWith('/main')
					},
				},
				...GetFaderInputField('level'),
			],
			callback: async (event) => {
				const src = event.options.src as string
				let dest = ''
				if (src.startsWith('/main')) {
					dest = event.options.mainDest as string
				} else {
					dest = event.options.dest as string
				}
				const cmd = ActionUtil.getSendLevelCommand(src, dest)
				runTransition(cmd, 'level', event, state, transitions)
			},
			subscribe: (event) => {
				const src = event.options.src as string
				let dest = ''
				if (src.startsWith('/main')) {
					dest = event.options.mainDest as string
				} else {
					dest = event.options.dest as string
				}
				const cmd = ActionUtil.getSendLevelCommand(src, dest)
				ensureLoaded(cmd)
			},
		},
		[CommonActions.StoreSendFader]: {
			name: 'Store Send Level',
			description: 'Store the send level from a destination channel strip to a source',
			options: [
				GetDropdown('From', 'src', allSendSources),
				{
					...GetDropdown('To', 'dest', channelAuxBusSendDestinations),
					isVisible: (options: CompanionOptionValues): boolean => {
						const source = options.src as string
						return !source.startsWith('/main')
					},
				},
				{
					...GetDropdown('To', 'mainDest', mainSendDestinations),
					isVisible: (options: CompanionOptionValues): boolean => {
						const source = options.src as string
						return source.startsWith('/main')
					},
				},
			],
			callback: async (event) => {
				const src = event.options.src as string
				let dest = ''
				if (src.startsWith('/main')) {
					dest = event.options.mainDest as string
				} else {
					dest = event.options.dest as string
				}
				const cmd = ActionUtil.getSendLevelCommand(src, dest)
				StateUtil.storeValueForCommand(cmd, state)
			},
			subscribe: (event) => {
				const src = event.options.src as string
				let dest = ''
				if (src.startsWith('/main')) {
					dest = event.options.mainDest as string
				} else {
					dest = event.options.dest as string
				}
				const cmd = ActionUtil.getSendLevelCommand(src, dest)
				ensureLoaded(cmd)
			},
		},
		[CommonActions.RestoreSendFader]: {
			name: 'Restore Send Level',
			description: 'Restore the send level from a destination channel strip to a source',
			options: [
				GetDropdown('From', 'src', allSendSources),
				{
					...GetDropdown('To', 'dest', channelAuxBusSendDestinations),
					isVisible: (options: CompanionOptionValues): boolean => {
						const source = options.src as string
						return !source.startsWith('/main')
					},
				},
				{
					...GetDropdown('To', 'mainDest', mainSendDestinations),
					isVisible: (options: CompanionOptionValues): boolean => {
						const source = options.src as string
						return source.startsWith('/main')
					},
				},
				...FadeDurationChoice,
			],
			callback: async (event) => {
				const src = event.options.src as string
				let dest = ''
				if (src.startsWith('/main')) {
					dest = event.options.mainDest as string
				} else {
					dest = event.options.dest as string
				}
				const cmd = ActionUtil.getSendLevelCommand(src, dest)
				const restoreVal = StateUtil.getValueFromKey(cmd, state)
				ActionUtil.runTransition(cmd, 'level', event, state, transitions, restoreVal)
			},
		},
		[CommonActions.DeltaSendFader]: {
			name: 'Adjust Send Level',
			description: 'Adjust the send level from a destination channel strip to a source',
			options: [
				GetDropdown('From', 'src', allSendSources),
				{
					...GetDropdown('To', 'dest', channelAuxBusSendDestinations),
					isVisible: (options: CompanionOptionValues): boolean => {
						const source = options.src as string
						return !source.startsWith('/main')
					},
				},
				{
					...GetDropdown('To', 'mainDest', mainSendDestinations),
					isVisible: (options: CompanionOptionValues): boolean => {
						const source = options.src as string
						return source.startsWith('/main')
					},
				},
				...GetFaderDeltaInputField('delta', 'Adjust (dB)'),
			],
			callback: async (event) => {
				const src = event.options.src as string
				let dest = ''
				if (src.startsWith('/main')) {
					dest = event.options.mainDest as string
				} else {
					dest = event.options.dest as string
				}
				const cmd = ActionUtil.getSendLevelCommand(src, dest)
				let targetValue = StateUtil.getNumberFromState(cmd, state)
				const delta = event.options.delta as number
				state.storeDelta(cmd, delta)
				if (targetValue != undefined) {
					targetValue += delta
					ActionUtil.runTransition(cmd, 'level', event, state, transitions, targetValue)
				}
			},
			subscribe: (event) => {
				const src = event.options.src as string
				let dest = ''
				if (src.startsWith('/main')) {
					dest = event.options.mainDest as string
				} else {
					dest = event.options.dest as string
				}
				const cmd = ActionUtil.getSendLevelCommand(src, dest)
				ensureLoaded(cmd)
			},
		},
		[CommonActions.UndoDeltaSendFader]: {
			name: 'Undo Send Level Adjust',
			description: 'Undo the previous send level adjustment from a destination channel strip to a source',
			options: [
				GetDropdown('From', 'src', allSendSources),
				{
					...GetDropdown('To', 'dest', channelAuxBusSendDestinations),
					isVisible: (options: CompanionOptionValues): boolean => {
						const source = options.src as string
						return !source.startsWith('/main')
					},
				},
				{
					...GetDropdown('To', 'mainDest', mainSendDestinations),
					isVisible: (options: CompanionOptionValues): boolean => {
						const source = options.src as string
						return source.startsWith('/main')
					},
				},
				...FadeDurationChoice,
			],
			callback: async (event) => {
				const src = event.options.src as string
				let dest = ''
				if (src.startsWith('/main')) {
					dest = event.options.mainDest as string
				} else {
					dest = event.options.dest as string
				}
				const cmd = ActionUtil.getSendLevelCommand(src, dest)
				let targetValue = StateUtil.getNumberFromState(cmd, state)
				const delta = state.restoreDelta(cmd)
				if (targetValue != undefined) {
					targetValue -= delta
					ActionUtil.runTransition(cmd, 'level', event, state, transitions, targetValue)
				}
			},
			subscribe: (event) => {
				const src = event.options.src as string
				let dest = ''
				if (src.startsWith('/main')) {
					dest = event.options.mainDest as string
				} else {
					dest = event.options.dest as string
				}
				const cmd = ActionUtil.getSendLevelCommand(src, dest)
				ensureLoaded(cmd)
			},
		},
		[CommonActions.SetSendMute]: {
			name: 'Set Send Mute',
			description: 'Set or toggle the mute state of a send from a destination channel strip to a source',
			options: [
				GetDropdown('From', 'src', allSendSources),
				{
					...GetDropdown('To', 'dest', channelAuxBusSendDestinations),
					isVisible: (options: CompanionOptionValues): boolean => {
						const source = options.src as string
						return !source.startsWith('/main')
					},
				},
				{
					...GetDropdown('To', 'mainDest', mainSendDestinations),
					isVisible: (options: CompanionOptionValues): boolean => {
						const source = options.src as string
						return source.startsWith('/main')
					},
				},
				GetMuteDropdown('mute'),
			],
			callback: async (event) => {
				const src = event.options.src as string
				let dest = ''
				if (src.startsWith('/main')) {
					dest = event.options.mainDest as string
				} else {
					dest = event.options.dest as string
				}
				const cmd = ActionUtil.getSendMuteCommand(src, dest)
				let val = ActionUtil.getNumber(event, 'mute')
				val = ActionUtil.getSetOrToggleValue(cmd, val, state, true)
				send(cmd, val)
			},
			subscribe: (event) => {
				if (event.options.sel ?? 0 >= 2) {
					const src = event.options.src as string
					let dest = ''
					if (src.startsWith('/main')) {
						dest = event.options.mainDest as string
					} else {
						dest = event.options.dest as string
					}
					const cmd = ActionUtil.getSendMuteCommand(src, dest)
					ensureLoaded(cmd)
				}
			},
		},
		////////////////////////////////////////////////////////////////
		// Send Panorama
		////////////////////////////////////////////////////////////////
		[CommonActions.SetSendPanorama]: {
			name: 'Set Send Panorama',
			description: 'Set the panorama of a send from a channel or aux to a bus or matrix.',
			options: [
				GetDropdown('From', 'src', [...state.namedChoices.channels, ...state.namedChoices.auxes]),
				GetDropdown('To', 'dest', [...state.namedChoices.busses, ...state.namedChoices.matrices]),
				...GetPanoramaSlider('pan'),
			],
			callback: async (event) => {
				const src = event.options.src as string
				const dest = event.options.dest as string
				const cmd = ActionUtil.getSendPanoramaCommand(src, dest)
				runTransition(cmd, 'pan', event, state, transitions, undefined, false)
			},
			subscribe: (event) => {
				const src = event.options.src as string
				const dest = event.options.dest as string
				const cmd = ActionUtil.getSendPanoramaCommand(src, dest)
				ensureLoaded(cmd)
			},
		},
		[CommonActions.StoreSendPanorama]: {
			name: 'Store Send Panorama',
			description: 'Store the panorama of a send from a channel or aux to a bus or matrix.',
			options: [
				GetDropdown('From', 'src', [...state.namedChoices.channels, ...state.namedChoices.auxes]),
				GetDropdown('To', 'dest', [...state.namedChoices.busses, ...state.namedChoices.matrices]),
			],
			callback: async (event) => {
				const src = event.options.src as string
				const dest = event.options.dest as string
				const cmd = ActionUtil.getSendPanoramaCommand(src, dest)
				StateUtil.storeValueForCommand(cmd, state)
			},
			subscribe: (event) => {
				const src = event.options.src as string
				const dest = event.options.dest as string
				const cmd = ActionUtil.getSendPanoramaCommand(src, dest)
				ensureLoaded(cmd)
			},
		},
		[CommonActions.RestoreSendPanorama]: {
			name: 'Restore Send Panorama',
			description: 'Restore the panorama of a send from a channel or aux to a bus or matrix.',
			options: [
				GetDropdown('From', 'src', [...state.namedChoices.channels, ...state.namedChoices.auxes]),
				GetDropdown('To', 'dest', [...state.namedChoices.busses, ...state.namedChoices.matrices]),
				...FadeDurationChoice,
			],
			callback: async (event) => {
				const src = event.options.src as string
				const dest = event.options.dest as string
				const cmd = ActionUtil.getSendPanoramaCommand(src, dest)
				const restoreVal = StateUtil.getValueFromKey(cmd, state)
				ActionUtil.runTransition(cmd, 'pan', event, state, transitions, restoreVal, false)
			},
		},
		[CommonActions.DeltaSendPanorama]: {
			name: 'Adjust Send Panorama',
			description: 'Adjust the panorama of a send from a channel or aux to a bus or matrix.',
			options: [
				GetDropdown('From', 'src', [...state.namedChoices.channels, ...state.namedChoices.auxes]),
				GetDropdown('To', 'dest', [...state.namedChoices.busses, ...state.namedChoices.matrices]),
				...GetPanoramaDeltaSlider('delta', 'Panorama'),
			],
			callback: async (event) => {
				const src = event.options.src as string
				const dest = event.options.dest as string
				const cmd = ActionUtil.getSendPanoramaCommand(src, dest)
				let targetValue = StateUtil.getNumberFromState(cmd, state)
				const delta = event.options.delta as number
				state.storeDelta(cmd, delta)
				if (targetValue != undefined) {
					targetValue += delta
					ActionUtil.runTransition(cmd, 'pan', event, state, transitions, targetValue, false)
				}
			},
			subscribe: (event) => {
				const src = event.options.src as string
				const dest = event.options.dest as string
				const cmd = ActionUtil.getSendPanoramaCommand(src, dest)
				ensureLoaded(cmd)
			},
		},
		[CommonActions.UndoDeltaSendPanorama]: {
			name: 'Undo Send Panorama Adjust',
			description: 'Undo the panorama adjustment of a send from a channel or aux to a bus or matrix.',
			options: [
				GetDropdown('From', 'src', [...state.namedChoices.channels, ...state.namedChoices.auxes]),
				GetDropdown('To', 'dest', [...state.namedChoices.busses, ...state.namedChoices.matrices]),
				...FadeDurationChoice,
			],
			callback: async (event) => {
				const src = event.options.src as string
				const dest = event.options.dest as string
				const cmd = ActionUtil.getSendPanoramaCommand(src, dest)
				let targetValue = StateUtil.getNumberFromState(cmd, state)
				const delta = state.restoreDelta(cmd)
				if (targetValue != undefined) {
					targetValue -= delta
					ActionUtil.runTransition(cmd, 'pan', event, state, transitions, targetValue, false)
				}
			},
			subscribe: (event) => {
				const src = event.options.src as string
				const dest = event.options.dest as string
				const cmd = ActionUtil.getSendPanoramaCommand(src, dest)
				ensureLoaded(cmd)
			},
		},
		[CommonActions.SetInsertOn]: {
			name: 'Set Insert On',
			description: 'Enable or disable an insert for a channel, aux, bus, matrix or main.',
			options: [
				GetDropdown('Insert', 'insert', [
					getIdLabelPair('pre', 'Pre-Insert'),
					getIdLabelPair('post', 'Post-Insert'),
					getIdLabelPair('pre-post', 'Both'),
				]),
				GetDropdown('Selection', 'sel', [...allChannels]),
				GetOnOffToggleDropdown('enable', 'Enable'),
			],
			callback: async (event) => {
				const insert = event.options.insert as string
				const sel = event.options.sel as string
				const val = ActionUtil.getNumber(event, 'enable')
				if (insert.includes('pre')) {
					const cmd = ActionUtil.getPreInsertOnCommand(sel, getNodeNumber(event, 'sel'))
					const currentVal = StateUtil.getBooleanFromState(cmd, state)
					if (val < 2) {
						send(cmd, val)
					} else {
						send(cmd, Number(!currentVal))
					}
				}
				if (insert.includes('post')) {
					const cmd = ActionUtil.getPostInsertCommand(sel, getNodeNumber(event, 'sel'))
					if (cmd == '') return // if an aux is requested
					const currentVal = StateUtil.getBooleanFromState(cmd, state)
					if (val < 2) {
						send(cmd, val)
					} else {
						send(cmd, Number(!currentVal))
					}
				}
			},
			subscribe: (event) => {
				const insert = event.options.insert as string
				const sel = event.options.sel as string
				if (insert.includes('pre')) {
					const cmd = ActionUtil.getPreInsertOnCommand(sel, getNodeNumber(event, 'sel'))
					ensureLoaded(cmd)
				}
				if (insert.includes('post')) {
					const cmd = ActionUtil.getPreInsertOnCommand(sel, getNodeNumber(event, 'sel'))
					ensureLoaded(cmd)
				}
			},
		},
	}

	return actions
}
