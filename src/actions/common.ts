import { CompanionActionDefinition } from '@companion-module/base'
import { SetRequired } from 'type-fest' // eslint-disable-line n/no-missing-import

export type CompanionActionWithCallback = SetRequired<CompanionActionDefinition, 'callback'>

import { CompanionActionDefinitions } from '@companion-module/base'
import {
	GetDropdown,
	GetDropdownWithVariables,
	GetTextFieldWithVariables,
	GetColorDropdown,
	GetNumberFieldWithVariables,
	getDelayModes,
	getIconChoices,
	GetOnOffToggleDropdownWithVariables,
	GetMuteDropdownWithVariables,
	GetFaderInputFieldWithVariables,
	GetFaderDeltaInputFieldWithVariables,
	GetPanoramaSliderWithVariables,
	GetPanoramaDeltaSliderWithVariables,
	GetSendSourceDestinationFieldsWithVariables,
} from '../choices/common.js'
import { runTransition } from './utils.js'
import { InstanceBaseExt } from '../types.js'
import { WingConfig } from '../config.js'
import * as ActionUtil from './utils.js'
import { StateUtil } from '../state/index.js'
import { FadeDurationChoice } from '../choices/fades.js'
import { getIdLabelPair } from '../choices/utils.js'
import { getSourceGroupChoices } from '../choices/common.js'

export enum CommonActions {
	// Setup
	SetMainConnection = 'set-main-connection',
	SetAltConnection = 'set-alt-connection',
	SetAutoSourceSwitch = 'set-auto-source-switch',
	SetMainAlt = 'set-main-alt',
	SetScribbleLight = 'set-scribble-light',
	SetScribbleLightColor = 'set-scribble-light-color',
	SetName = 'set-name',
	SetIcon = 'set-icon',
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
		////////////////////////////////////////////////////////////////
		// Setup
		/////////////////////////////////////////////////////////////////
		[CommonActions.SetMainConnection]: {
			name: 'Set Channel/Aux Main Connection',
			description: 'Set the index of the main connection of a channel or aux',
			options: [
				...GetDropdownWithVariables('Channel', 'channel', [
					...state.namedChoices.channels,
					...state.namedChoices.auxes,
				]),
				...GetDropdownWithVariables('Group', 'group', getSourceGroupChoices()),
				...GetNumberFieldWithVariables('Index', 'index', 1, 64, 1, 1),
			],
			callback: async (event) => {
				const sel = await ActionUtil.getStringWithVariables(event, 'channel')
				const group = await ActionUtil.getStringWithVariables(event, 'group')
				const index = await ActionUtil.getNumberWithVariables(event, 'index')
				let cmd = ActionUtil.getMainInputConnectionGroupCommand(sel)
				send(cmd, group)
				cmd = ActionUtil.getMainInputConnectionIndexCommand(sel)
				send(cmd, index)
			},
		},
		[CommonActions.SetAltConnection]: {
			name: 'Set Channel/Aux Alt Connection',
			description: 'Set the index of the alt connection of a channel or aux',
			options: [
				...GetDropdownWithVariables('Channel', 'channel', [
					...state.namedChoices.channels,
					...state.namedChoices.auxes,
				]),
				...GetDropdownWithVariables('Group', 'group', getSourceGroupChoices()),
				...GetNumberFieldWithVariables('Index', 'index', 1, 64, 1, 1),
			],
			callback: async (event) => {
				const sel = await ActionUtil.getStringWithVariables(event, 'channel')
				const group = await ActionUtil.getStringWithVariables(event, 'group')
				const index = await ActionUtil.getNumberWithVariables(event, 'index')
				let cmd = ActionUtil.getAltInputConnectionGroupCommand(sel)
				send(cmd, group)
				cmd = ActionUtil.getAltInputConnectionIndexCommand(sel)
				send(cmd, index)
			},
		},
		[CommonActions.SetAutoSourceSwitch]: {
			name: 'Set Channel/Aux Auto Source Switch',
			description: 'Enable or disable the global switching between main and alt inputs on a channel or aux',
			options: [
				...GetDropdownWithVariables('Channel', 'channel', [
					...state.namedChoices.channels,
					...state.namedChoices.auxes,
				]),
				...GetDropdownWithVariables('Auto Source Switch', 'auto_source', [
					getIdLabelPair('0', 'Individual'),
					getIdLabelPair('1', 'Global'),
					getIdLabelPair('-1', 'Toggle'),
				]),
			],
			callback: async (event) => {
				const sel = await ActionUtil.getStringWithVariables(event, 'channel')
				const autoSource = await ActionUtil.getNumberWithVariables(event, 'auto_source')
				const cmd = ActionUtil.getInputAutoSourceSwitchCommand(sel)
				send(cmd, autoSource)
			},
		},
		[CommonActions.SetMainAlt]: {
			name: 'Set Channel/Aux Main/Alt',
			description: 'Set whether a channel or aux is using the main or alt input',
			options: [
				...GetDropdownWithVariables('Channel', 'channel', [
					...state.namedChoices.channels,
					...state.namedChoices.auxes,
				]),
				...GetDropdownWithVariables('Source', 'main_alt', [
					getIdLabelPair('0', 'Main'),
					getIdLabelPair('1', 'Alt'),
					getIdLabelPair('-1', 'Toggle'),
				]),
			],
			callback: async (event) => {
				const sel = await ActionUtil.getStringWithVariables(event, 'channel')
				const mainAlt = await ActionUtil.getNumberWithVariables(event, 'main_alt')
				const cmd = ActionUtil.getInputAltSourceCommand(sel)
				send(cmd, mainAlt)
			},
		},
		[CommonActions.SetScribbleLight]: {
			name: 'Set Scribble Light',
			description: 'Set or toggle the scribble light state of a channel, aux, bus, dca, matrix, or main.',
			options: [
				...GetDropdownWithVariables('Selection', 'sel', [...allChannels, ...state.namedChoices.dcas]),
				...GetOnOffToggleDropdownWithVariables('Scribble Light', 'led', true),
			],
			callback: async (event) => {
				const sel = await ActionUtil.getStringWithVariables(event, 'sel')
				const led = await ActionUtil.getNumberWithVariables(event, 'led')
				const cmd = ActionUtil.getScribblelightCommand(sel, ActionUtil.getNodeNumberFromID(sel))
				send(cmd, led)
			},
		},
		[CommonActions.SetScribbleLightColor]: {
			name: 'Set Scribble Light Color',
			description: 'Set the scribble light color of a channel, aux, bus, dca, matrix, or main.',
			options: [
				...GetDropdownWithVariables('Selection', 'sel', [...allChannels, ...state.namedChoices.dcas]),
				GetColorDropdown('color', 'Color'),
			],
			callback: async (event) => {
				const sel = await ActionUtil.getStringWithVariables(event, 'sel')
				const cmd = ActionUtil.getColorCommand(sel, ActionUtil.getNodeNumberFromID(sel))
				send(cmd, ActionUtil.getNumber(event, 'color'))
			},
		},
		[CommonActions.SetName]: {
			name: 'Set Name',
			description: 'Set the name of a channel, aux, bus, dca, matrix, main, or a mutegroup.',
			options: [
				...GetDropdownWithVariables('Selection', 'sel', [
					...allChannels,
					...state.namedChoices.dcas,
					...state.namedChoices.mutegroups,
				]),
				...GetTextFieldWithVariables('Name', 'name'),
			],
			callback: async (event) => {
				const name = await ActionUtil.getStringWithVariables(event, 'name')
				const sel = await ActionUtil.getStringWithVariables(event, 'sel')
				const cmd = ActionUtil.getNameCommand(sel, ActionUtil.getNodeNumberFromID(sel))
				send(cmd, name)
			},
		},
		[CommonActions.SetIcon]: {
			name: 'Set Channel Icon',
			description: 'Set the icon displayed for a channel.',
			options: [
				...GetDropdownWithVariables('Selection', 'sel', [...allChannels, ...state.namedChoices.dcas]),
				...GetDropdownWithVariables('Icon', 'icon', getIconChoices()),
			],
			callback: async (event) => {
				const sel = await ActionUtil.getStringWithVariables(event, 'sel')
				const icon = await ActionUtil.getNumberWithVariables(event, 'icon')
				const cmd = ActionUtil.getIconCommand(sel, ActionUtil.getNodeNumberFromID(sel))
				send(cmd, icon)
			},
		},
		////////////////////////////////////////////////////////////////
		// Gain
		////////////////////////////////////////////////////////////////
		[CommonActions.SetGain]: {
			name: 'Set Gain',
			description: 'Set the input gain of a channel or aux.',
			options: [
				...GetDropdownWithVariables('Channel', 'channel', [
					...state.namedChoices.channels,
					...state.namedChoices.auxes,
				]),
				...GetNumberFieldWithVariables('Gain (dB)', 'gain', -3.0, 45.5, 0.5, 0),
				...FadeDurationChoice(),
			],
			callback: async (event) => {
				const sel = await ActionUtil.getStringWithVariables(event, 'sel')
				const gain = await ActionUtil.getNumberWithVariables(event, 'gain')
				const cmd = ActionUtil.getGainCommand(sel, ActionUtil.getNodeNumberFromID(sel))
				ActionUtil.runTransition(cmd, 'gain', event, state, transitions, gain, false)
			},
			subscribe: async (event) => {
				const sel = await ActionUtil.getStringWithVariables(event, 'sel')
				const cmd = ActionUtil.getGainCommand(sel, ActionUtil.getNodeNumberFromID(sel))
				ensureLoaded(cmd)
			},
			learn: async (event) => {
				const sel = await ActionUtil.getStringWithVariables(event, 'sel')
				const cmd = ActionUtil.getGainCommand(sel, ActionUtil.getNodeNumberFromID(sel))
				return { gain: StateUtil.getNumberFromState(cmd, state), gain_use_variables: false }
			},
		},
		[CommonActions.StoreGain]: {
			name: 'Store Gain',
			description: 'Store the gain of a channel or aux.',
			options: [...GetDropdownWithVariables('Selection', 'sel', allChannels)],
			callback: async (event) => {
				const sel = await ActionUtil.getStringWithVariables(event, 'sel')
				const cmd = ActionUtil.getGainCommand(sel, ActionUtil.getNodeNumberFromID(sel))
				StateUtil.storeValueForCommand(cmd, state)
			},
			subscribe: async (event) => {
				const sel = await ActionUtil.getStringWithVariables(event, 'sel')
				const cmd = ActionUtil.getGainCommand(sel, ActionUtil.getNodeNumberFromID(sel))
				ensureLoaded(cmd)
			},
		},
		[CommonActions.RestoreGain]: {
			name: 'Restore Gain',
			description: 'Restore the gain of a channel or aux.',
			options: [...GetDropdownWithVariables('Selection', 'sel', allChannels), ...FadeDurationChoice()],
			callback: async (event) => {
				const sel = await ActionUtil.getStringWithVariables(event, 'sel')
				const cmd = ActionUtil.getGainCommand(sel, ActionUtil.getNodeNumberFromID(sel))
				const restoreVal = StateUtil.getValueFromKey(cmd, state)
				ActionUtil.runTransition(cmd, 'gain', event, state, transitions, restoreVal, false)
			},
		},
		[CommonActions.DeltaGain]: {
			name: 'Adjust Gain',
			description: 'Adjust the input gain of a channel or aux.',
			options: [
				...GetDropdownWithVariables('Selection', 'sel', allChannels),
				...GetNumberFieldWithVariables('Gain (dB)', 'gain', -48.5, 48.5, 0.5, 0),
			],
			callback: async (event) => {
				const sel = await ActionUtil.getStringWithVariables(event, 'sel')
				const cmd = ActionUtil.getGainCommand(sel, ActionUtil.getNodeNumberFromID(sel))
				let targetValue = StateUtil.getNumberFromState(cmd, state)
				const delta = await ActionUtil.getNumberWithVariables(event, 'gain')
				state.storeDelta(cmd, delta)
				if (targetValue != undefined) {
					targetValue += delta
					ActionUtil.runTransition(cmd, 'gain', event, state, transitions, targetValue, false)
				}
			},
			subscribe: async (event) => {
				const sel = await ActionUtil.getStringWithVariables(event, 'sel')
				const cmd = ActionUtil.getGainCommand(sel, ActionUtil.getNodeNumberFromID(sel))
				ensureLoaded(cmd)
			},
		},
		[CommonActions.UndoDeltaGain]: {
			name: 'Undo Gain Adjust',
			description: 'Undo the previous input gain adjustment on a channel or aux.',
			options: [...GetDropdownWithVariables('Selection', 'sel', allChannels), ...FadeDurationChoice()],
			callback: async (event) => {
				const sel = await ActionUtil.getStringWithVariables(event, 'sel')
				const cmd = ActionUtil.getGainCommand(sel, ActionUtil.getNodeNumberFromID(sel))
				let targetValue = StateUtil.getNumberFromState(cmd, state)
				const delta = state.restoreDelta(cmd)
				if (targetValue != undefined) {
					targetValue -= delta
					ActionUtil.runTransition(cmd, 'gain', event, state, transitions, targetValue, false)
				}
			},
			subscribe: async (event) => {
				const sel = await ActionUtil.getStringWithVariables(event, 'sel')
				const cmd = ActionUtil.getGainCommand(sel, ActionUtil.getNodeNumberFromID(sel))
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
				...GetDropdownWithVariables('Selection', 'sel', [
					...allChannels,
					...state.namedChoices.dcas,
					...state.namedChoices.mutegroups,
				]),
				...GetMuteDropdownWithVariables('mute', 'Mute', true),
			],
			callback: async (event) => {
				const sel = await ActionUtil.getStringWithVariables(event, 'sel')
				const mute = await ActionUtil.getNumberWithVariables(event, 'mute')
				const cmd = ActionUtil.getMuteCommand(sel, ActionUtil.getNodeNumberFromID(sel))
				send(cmd, mute)
			},
		},
		////////////////////////////////////////////////////////////////
		// Fader
		////////////////////////////////////////////////////////////////
		[CommonActions.SetFader]: {
			name: 'Set Level',
			description: 'Set the fader level of a channel, aux, bus, dca, matrix or main to a value.',
			options: [
				...GetDropdownWithVariables('Selection', 'sel', [...allChannels, ...state.namedChoices.dcas]),
				...GetFaderInputFieldWithVariables('level'),
			],
			callback: async (event) => {
				const sel = await ActionUtil.getStringWithVariables(event, 'sel')
				const level = await ActionUtil.getNumberWithVariables(event, 'level')
				const cmd = ActionUtil.getFaderCommand(sel, ActionUtil.getNodeNumberFromID(sel))
				runTransition(cmd, 'level', event, state, transitions, level)
			},
			subscribe: async (event) => {
				const sel = await ActionUtil.getStringWithVariables(event, 'sel')
				const cmd = ActionUtil.getFaderCommand(sel, ActionUtil.getNodeNumberFromID(sel))
				ensureLoaded(cmd)
			},
			learn: async (event) => {
				const sel = await ActionUtil.getStringWithVariables(event, 'sel')
				const cmd = ActionUtil.getFaderCommand(sel, ActionUtil.getNodeNumberFromID(sel))
				return { level: StateUtil.getNumberFromState(cmd, state), level_use_variables: false }
			},
		},
		[CommonActions.StoreFader]: {
			name: 'Store Level',
			description: 'Store the fader level of a channel, aux, bus, dca, matrix or main.',
			options: [...GetDropdownWithVariables('Selection', 'sel', [...allChannels, ...state.namedChoices.dcas])],
			callback: async (event) => {
				const sel = await ActionUtil.getStringWithVariables(event, 'sel')
				const cmd = ActionUtil.getFaderCommand(sel, ActionUtil.getNodeNumberFromID(sel))
				StateUtil.storeValueForCommand(cmd, state)
			},
			subscribe: async (event) => {
				const sel = await ActionUtil.getStringWithVariables(event, 'sel')
				const cmd = ActionUtil.getFaderCommand(sel, ActionUtil.getNodeNumberFromID(sel))
				ensureLoaded(cmd)
			},
		},
		[CommonActions.RestoreFader]: {
			name: 'Restore Level',
			description: 'Restore the fader level of a channel, aux, bus, dca, matrix or main.',
			options: [
				...GetDropdownWithVariables('Selection', 'sel', [...allChannels, ...state.namedChoices.dcas]),
				...FadeDurationChoice(),
			],
			callback: async (event) => {
				const sel = await ActionUtil.getStringWithVariables(event, 'sel')
				const cmd = ActionUtil.getFaderCommand(sel, ActionUtil.getNodeNumberFromID(sel))
				const restoreVal = StateUtil.getValueFromKey(cmd, state)
				ActionUtil.runTransition(cmd, 'level', event, state, transitions, restoreVal)
			},
		},
		[CommonActions.DeltaFader]: {
			name: 'Adjust Fader Level',
			description: 'Adjust the level of a channel, aux, bus, dca, matrix or main.',
			options: [
				...GetDropdownWithVariables('Selection', 'sel', [...allChannels, ...state.namedChoices.dcas]),
				...GetFaderDeltaInputFieldWithVariables('delta', 'Adjust (dB)'),
			],
			callback: async (event) => {
				const sel = await ActionUtil.getStringWithVariables(event, 'sel')
				const cmd = ActionUtil.getFaderCommand(sel, ActionUtil.getNodeNumberFromID(sel))
				let targetValue = StateUtil.getNumberFromState(cmd, state)
				const delta = await ActionUtil.getNumberWithVariables(event, 'delta')
				state.storeDelta(cmd, delta)
				if (targetValue != undefined) {
					if (targetValue < -90) {
						targetValue = -90
					}
					targetValue += delta
					ActionUtil.runTransition(cmd, 'level', event, state, transitions, targetValue)
				}
			},
			subscribe: async (event) => {
				const sel = await ActionUtil.getStringWithVariables(event, 'sel')
				const cmd = ActionUtil.getFaderCommand(sel, ActionUtil.getNodeNumberFromID(sel))
				ensureLoaded(cmd)
			},
		},
		[CommonActions.UndoDeltaFader]: {
			name: 'Undo Level Adjust',
			description: 'Undo the previous level adjustment on a channel, aux, bus, dca, matrix or main.',
			options: [
				...GetDropdownWithVariables('Selection', 'sel', [...allChannels, ...state.namedChoices.dcas]),
				...FadeDurationChoice(),
			],
			callback: async (event) => {
				const sel = await ActionUtil.getStringWithVariables(event, 'sel')
				const cmd = ActionUtil.getFaderCommand(sel, ActionUtil.getNodeNumberFromID(sel))
				let targetValue = StateUtil.getNumberFromState(cmd, state)
				const delta = state.restoreDelta(cmd)
				if (targetValue != undefined) {
					targetValue -= delta
					ActionUtil.runTransition(cmd, 'level', event, state, transitions, targetValue)
				}
			},
			subscribe: async (event) => {
				const sel = await ActionUtil.getStringWithVariables(event, 'sel')
				const cmd = ActionUtil.getFaderCommand(sel, ActionUtil.getNodeNumberFromID(sel))
				ensureLoaded(cmd)
			},
		},

		////////////////////////////////////////////////////////////////
		// Panorama
		////////////////////////////////////////////////////////////////
		[CommonActions.SetPanorama]: {
			name: 'Set Panorama',
			description: 'Set the panorama of a channel, aux, bus, matrix or main.',
			options: [...GetDropdownWithVariables('Selection', 'sel', allChannels), ...GetPanoramaSliderWithVariables('pan')],
			callback: async (event) => {
				const sel = await ActionUtil.getStringWithVariables(event, 'sel')
				const pan = await ActionUtil.getNumberWithVariables(event, 'pan')
				const cmd = ActionUtil.getPanoramaCommand(sel, ActionUtil.getNodeNumberFromID(sel))
				runTransition(cmd, 'pan', event, state, transitions, pan, false)
			},
			subscribe: async (event) => {
				const sel = await ActionUtil.getStringWithVariables(event, 'sel')
				const cmd = ActionUtil.getPanoramaCommand(sel, ActionUtil.getNodeNumberFromID(sel))
				ensureLoaded(cmd)
			},
			learn: async (event) => {
				const sel = await ActionUtil.getStringWithVariables(event, 'sel')
				const cmd = ActionUtil.getPanoramaCommand(sel, ActionUtil.getNodeNumberFromID(sel))
				return { pan: StateUtil.getNumberFromState(cmd, state), pan_use_variables: false }
			},
		},
		[CommonActions.StorePanorama]: {
			name: 'Store Panorama',
			description: 'Store the panorama of a channel, aux, bus, matrix or main.',
			options: [...GetDropdownWithVariables('Selection', 'sel', allChannels)],
			callback: async (event) => {
				const sel = await ActionUtil.getStringWithVariables(event, 'sel')
				const cmd = ActionUtil.getPanoramaCommand(sel, ActionUtil.getNodeNumberFromID(sel))
				StateUtil.storeValueForCommand(cmd, state)
			},
			subscribe: async (event) => {
				const sel = await ActionUtil.getStringWithVariables(event, 'sel')
				const cmd = ActionUtil.getPanoramaCommand(sel, ActionUtil.getNodeNumberFromID(sel))
				ensureLoaded(cmd)
			},
		},
		[CommonActions.RestorePanorama]: {
			name: 'Restore Panorama',
			description: 'Restore the panorama of a channel, aux, bus, matrix or main.',
			options: [...GetDropdownWithVariables('Selection', 'sel', allChannels), ...FadeDurationChoice()],
			callback: async (event) => {
				const sel = await ActionUtil.getStringWithVariables(event, 'sel')
				const cmd = ActionUtil.getPanoramaCommand(sel, ActionUtil.getNodeNumberFromID(sel))
				const restoreVal = StateUtil.getValueFromKey(cmd, state)
				ActionUtil.runTransition(cmd, 'pan', event, state, transitions, restoreVal, false)
			},
		},
		[CommonActions.DeltaPanorama]: {
			name: 'Adjust Panorama',
			description: 'Adjust the panorama of a channel, aux, bus, matrix or main.',
			options: [
				...GetDropdownWithVariables('Selection', 'sel', allChannels),
				...GetPanoramaDeltaSliderWithVariables('pan', 'Panorama'),
			],
			callback: async (event) => {
				const sel = await ActionUtil.getStringWithVariables(event, 'sel')
				const cmd = ActionUtil.getPanoramaCommand(sel, ActionUtil.getNodeNumberFromID(sel))
				let targetValue = StateUtil.getNumberFromState(cmd, state)
				const delta = await ActionUtil.getNumberWithVariables(event, 'pan')
				state.storeDelta(cmd, delta)
				if (targetValue != undefined) {
					targetValue += delta
					ActionUtil.runTransition(cmd, 'pan', event, state, transitions, targetValue, false)
				}
			},
			subscribe: async (event) => {
				const sel = await ActionUtil.getStringWithVariables(event, 'sel')
				const cmd = ActionUtil.getPanoramaCommand(sel, ActionUtil.getNodeNumberFromID(sel))
				ensureLoaded(cmd)
			},
		},
		[CommonActions.UndoDeltaPanorama]: {
			name: 'Undo Panorama Adjust',
			description: 'Undo the previous adjustment on the panorama of a channel, aux, bus, matrix or main.',
			options: [...GetDropdownWithVariables('Selection', 'sel', allChannels), ...FadeDurationChoice()],
			callback: async (event) => {
				const sel = await ActionUtil.getStringWithVariables(event, 'sel')
				const cmd = ActionUtil.getPanoramaCommand(sel, ActionUtil.getNodeNumberFromID(sel))
				let targetValue = StateUtil.getNumberFromState(cmd, state)
				const delta = state.restoreDelta(cmd)
				if (targetValue != undefined) {
					targetValue -= delta
					ActionUtil.runTransition(cmd, 'pan', event, state, transitions, targetValue, false)
				}
			},
			subscribe: async (event) => {
				const sel = await ActionUtil.getStringWithVariables(event, 'sel')
				const cmd = ActionUtil.getPanoramaCommand(sel, ActionUtil.getNodeNumberFromID(sel))
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
				...GetDropdownWithVariables('Selection', 'sel', [...allChannels, ...state.namedChoices.dcas]),
				...GetOnOffToggleDropdownWithVariables('solo', 'Solo', true),
			],
			callback: async (event) => {
				const sel = await ActionUtil.getStringWithVariables(event, 'sel')
				const solo = await ActionUtil.getNumberWithVariables(event, 'solo')
				const cmd = ActionUtil.getSoloCommand(sel, ActionUtil.getNodeNumberFromID(sel))
				send(cmd, solo)
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
				...GetDropdownWithVariables('Selection', 'sel', [
					...state.namedChoices.channels,
					...state.namedChoices.matrices,
					...state.namedChoices.busses,
					...state.namedChoices.mains,
				]),
				...GetOnOffToggleDropdownWithVariables('delay', 'Delay', true),
			],
			callback: async (event) => {
				const sel = await ActionUtil.getStringWithVariables(event, 'sel')
				const cmd = ActionUtil.getDelayOnCommand(sel, ActionUtil.getNodeNumberFromID(sel))
				const delay = await ActionUtil.getNumberWithVariables(event, 'delay')
				send(cmd, delay)
			},
		},

		[CommonActions.SetDelayAmount]: {
			name: 'Set Delay Mode',
			description: 'Set the delay mode of a channel, bus, matrix or main.',
			options: [
				...GetDropdownWithVariables('Selection', 'sel', [
					...state.namedChoices.channels,
					...state.namedChoices.matrices,
					...state.namedChoices.busses,
					...state.namedChoices.mains,
				]),
				GetDropdown('Delay Mode', 'mode', getDelayModes()),
				...GetNumberFieldWithVariables('Amount (meters)', 'amount_m', 0, 150, 0.1, 0, '', `$(options:mode) == 'M'`),
				...GetNumberFieldWithVariables('Amount (ft)', 'amount_ft', 0.5, 500, 0.5, 0.5, '', `$(options:mode) == 'FT'`),
				...GetNumberFieldWithVariables('Amount (ms)', 'amount_ms', 0.5, 500, 0.1, 0.5, '', `$(options:mode) == 'MS'`),
				...GetNumberFieldWithVariables(
					'Amount (samples)',
					'amount_samples',
					16,
					500,
					1,
					16,
					'',
					`$(options:mode) == 'SMP'`,
				),
			],
			callback: async (event) => {
				const sel = await ActionUtil.getStringWithVariables(event, 'sel')
				const mode = await ActionUtil.getStringWithVariables(event, 'mode')
				send(ActionUtil.getDelayModeCommand(sel, ActionUtil.getNodeNumberFromID(sel)), mode)
				switch (mode) {
					case 'M':
						send(
							ActionUtil.getDelayAmountCommand(sel, ActionUtil.getNodeNumberFromID(sel)),
							event.options.amount_m as number,
							true,
						)
						break
					case 'FT':
						send(
							ActionUtil.getDelayAmountCommand(sel, ActionUtil.getNodeNumberFromID(sel)),
							event.options.amount_ft as number,
							true,
						)
						break
					case 'MS':
						send(
							ActionUtil.getDelayAmountCommand(sel, ActionUtil.getNodeNumberFromID(sel)),
							event.options.amount_ms as number,
							true,
						)
						break
					case 'SMP':
						send(
							ActionUtil.getDelayAmountCommand(sel, ActionUtil.getNodeNumberFromID(sel)),
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
				...GetDropdownWithVariables('Selection', 'sel', state.namedChoices.channels),
				...GetOnOffToggleDropdownWithVariables('enable', 'Enable', true),
			],
			callback: async (event) => {
				const sel = await ActionUtil.getStringWithVariables(event, 'sel')
				const enable = await ActionUtil.getNumberWithVariables(event, 'enable')
				const cmd = ActionUtil.getGateEnableCommand(sel, ActionUtil.getNodeNumberFromID(sel))
				send(cmd, enable)
			},
		},
		////////////////////////////////////////////////////////////////
		// EQ
		////////////////////////////////////////////////////////////////
		[CommonActions.SetEqOn]: {
			name: 'Set EQ On',
			description: 'Enable, disable or toggle the on-state of an EQ on a channel, bus, aux, matrix or main.',
			options: [
				...GetDropdownWithVariables('Selection', 'sel', allChannels),
				...GetOnOffToggleDropdownWithVariables('enable', 'Enable', true),
			],
			callback: async (event) => {
				const sel = await ActionUtil.getStringWithVariables(event, 'sel')
				const cmd = ActionUtil.getEqEnableCommand(sel, ActionUtil.getNodeNumberFromID(sel))
				const enable = await ActionUtil.getNumberWithVariables(event, 'enable')
				send(cmd, enable)
			},
		},
		////////////////////////////////////////////////////////////////
		// Dynamics
		////////////////////////////////////////////////////////////////
		[CommonActions.SetDynamicsOn]: {
			name: 'Set Dynamics On',
			description: 'Enable, disable or toggle the on-state of dynamics on a channel, bus, aux, matrix or main.',
			options: [
				...GetDropdownWithVariables('Selection', 'sel', allChannels),
				...GetOnOffToggleDropdownWithVariables('enable', 'Enable', true),
			],
			callback: async (event) => {
				const sel = await ActionUtil.getStringWithVariables(event, 'sel')
				const cmd = ActionUtil.getDynamicsEnableCommand(sel, ActionUtil.getNodeNumberFromID(sel))
				const enable = await ActionUtil.getNumberWithVariables(event, 'enable')
				send(cmd, enable)
			},
		},
		////////////////////////////////////////////////////////////////
		// Send Fader
		////////////////////////////////////////////////////////////////
		[CommonActions.SetSendFader]: {
			name: 'Set Send Level',
			description: 'Set the send level from a destination channel strip to a source',
			options: [
				...GetSendSourceDestinationFieldsWithVariables(
					allSendSources,
					channelAuxBusSendDestinations,
					mainSendDestinations,
				),
				...GetFaderInputFieldWithVariables('level'),
			],
			callback: async (event) => {
				const { src, dest } = await ActionUtil.GetSendSourceDestinationFieldsWithVariables(event)
				const level = await ActionUtil.getNumberWithVariables(event, 'level')
				const cmd = ActionUtil.getSendLevelCommand(src, dest)
				runTransition(cmd, 'level', event, state, transitions, level)
			},
			subscribe: async (event) => {
				const { src, dest } = await ActionUtil.GetSendSourceDestinationFieldsWithVariables(event)
				const cmd = ActionUtil.getSendLevelCommand(src, dest)
				ensureLoaded(cmd)
			},
		},
		[CommonActions.StoreSendFader]: {
			name: 'Store Send Level',
			description: 'Store the send level from a destination channel strip to a source',
			options: [
				...GetSendSourceDestinationFieldsWithVariables(
					allSendSources,
					channelAuxBusSendDestinations,
					mainSendDestinations,
				),
			],
			callback: async (event) => {
				const { src, dest } = await ActionUtil.GetSendSourceDestinationFieldsWithVariables(event)
				const cmd = ActionUtil.getSendLevelCommand(src, dest)
				StateUtil.storeValueForCommand(cmd, state)
			},
			subscribe: async (event) => {
				const { src, dest } = await ActionUtil.GetSendSourceDestinationFieldsWithVariables(event)
				const cmd = ActionUtil.getSendLevelCommand(src, dest)
				ensureLoaded(cmd)
			},
		},
		[CommonActions.RestoreSendFader]: {
			name: 'Restore Send Level',
			description: 'Restore the send level from a destination channel strip to a source',
			options: [
				...GetSendSourceDestinationFieldsWithVariables(
					allSendSources,
					channelAuxBusSendDestinations,
					mainSendDestinations,
				),
				...FadeDurationChoice(),
			],
			callback: async (event) => {
				const { src, dest } = await ActionUtil.GetSendSourceDestinationFieldsWithVariables(event)
				const cmd = ActionUtil.getSendLevelCommand(src, dest)
				const restoreVal = StateUtil.getValueFromKey(cmd, state)
				ActionUtil.runTransition(cmd, 'level', event, state, transitions, restoreVal)
			},
		},
		[CommonActions.DeltaSendFader]: {
			name: 'Adjust Send Level',
			description: 'Adjust the send level from a destination channel strip to a source',
			options: [
				...GetSendSourceDestinationFieldsWithVariables(
					allSendSources,
					channelAuxBusSendDestinations,
					mainSendDestinations,
				),
				...GetFaderDeltaInputFieldWithVariables('delta', 'Adjust (dB)'),
			],
			callback: async (event) => {
				const { src, dest } = await ActionUtil.GetSendSourceDestinationFieldsWithVariables(event)
				const cmd = ActionUtil.getSendLevelCommand(src, dest)
				let targetValue = StateUtil.getNumberFromState(cmd, state)
				const delta = await ActionUtil.getNumberWithVariables(event, 'delta')
				state.storeDelta(cmd, delta)
				if (targetValue != undefined) {
					targetValue += delta
					ActionUtil.runTransition(cmd, 'level', event, state, transitions, targetValue)
				}
			},
			subscribe: async (event) => {
				const { src, dest } = await ActionUtil.GetSendSourceDestinationFieldsWithVariables(event)
				const cmd = ActionUtil.getSendLevelCommand(src, dest)
				ensureLoaded(cmd)
			},
		},
		[CommonActions.UndoDeltaSendFader]: {
			name: 'Undo Send Level Adjust',
			description: 'Undo the previous send level adjustment from a destination channel strip to a source',
			options: [
				...GetSendSourceDestinationFieldsWithVariables(
					allSendSources,
					channelAuxBusSendDestinations,
					mainSendDestinations,
				),
				...FadeDurationChoice(),
			],
			callback: async (event) => {
				const { src, dest } = await ActionUtil.GetSendSourceDestinationFieldsWithVariables(event)
				const cmd = ActionUtil.getSendLevelCommand(src, dest)
				let targetValue = StateUtil.getNumberFromState(cmd, state)
				const delta = state.restoreDelta(cmd)
				if (targetValue != undefined) {
					targetValue -= delta
					ActionUtil.runTransition(cmd, 'level', event, state, transitions, targetValue)
				}
			},
			subscribe: async (event) => {
				const { src, dest } = await ActionUtil.GetSendSourceDestinationFieldsWithVariables(event)
				const cmd = ActionUtil.getSendLevelCommand(src, dest)
				ensureLoaded(cmd)
			},
		},
		[CommonActions.SetSendMute]: {
			name: 'Set Send Mute',
			description: 'Set or toggle the mute state of a send from a destination channel strip to a source',
			options: [
				...GetSendSourceDestinationFieldsWithVariables(
					allSendSources,
					channelAuxBusSendDestinations,
					mainSendDestinations,
				),
				...GetMuteDropdownWithVariables('mute', 'Mute', true),
			],
			callback: async (event) => {
				const { src, dest } = await ActionUtil.GetSendSourceDestinationFieldsWithVariables(event)
				const cmd = ActionUtil.getSendMuteCommand(src, dest)
				let val = await ActionUtil.getNumberWithVariables(event, 'mute')
				val = ActionUtil.getSetOrToggleValue(cmd, val, state, true)
				send(cmd, val)
			},
		},
		////////////////////////////////////////////////////////////////
		// Send Panorama
		////////////////////////////////////////////////////////////////
		[CommonActions.SetSendPanorama]: {
			name: 'Set Send Panorama',
			description: 'Set the panorama of a send from a channel or aux to a bus or matrix.',
			options: [
				...GetDropdownWithVariables('From', 'src', [...state.namedChoices.channels, ...state.namedChoices.auxes]),
				...GetDropdownWithVariables('To', 'dest', [...state.namedChoices.busses, ...state.namedChoices.matrices]),
				...GetPanoramaSliderWithVariables('pan'),
			],
			callback: async (event) => {
				const src = await ActionUtil.getStringWithVariables(event, 'src')
				const dest = await ActionUtil.getStringWithVariables(event, 'dest')
				const pan = await ActionUtil.getNumberWithVariables(event, 'pan')
				const cmd = ActionUtil.getSendPanoramaCommand(src, dest)
				runTransition(cmd, 'pan', event, state, transitions, pan, false)
			},
			subscribe: async (event) => {
				const src = await ActionUtil.getStringWithVariables(event, 'src')
				const dest = await ActionUtil.getStringWithVariables(event, 'dest')
				const cmd = ActionUtil.getSendPanoramaCommand(src, dest)
				ensureLoaded(cmd)
			},
			learn: async (event) => {
				const src = await ActionUtil.getStringWithVariables(event, 'src')
				const dest = await ActionUtil.getStringWithVariables(event, 'dest')
				const cmd = ActionUtil.getSendPanoramaCommand(src, dest)
				return { pan: StateUtil.getNumberFromState(cmd, state), pan_use_variables: false }
			},
		},
		[CommonActions.StoreSendPanorama]: {
			name: 'Store Send Panorama',
			description: 'Store the panorama of a send from a channel or aux to a bus or matrix.',
			options: [
				...GetDropdownWithVariables('From', 'src', [...state.namedChoices.channels, ...state.namedChoices.auxes]),
				...GetDropdownWithVariables('To', 'dest', [...state.namedChoices.busses, ...state.namedChoices.matrices]),
			],
			callback: async (event) => {
				const src = await ActionUtil.getStringWithVariables(event, 'src')
				const dest = await ActionUtil.getStringWithVariables(event, 'dest')
				const cmd = ActionUtil.getSendPanoramaCommand(src, dest)
				StateUtil.storeValueForCommand(cmd, state)
			},
			subscribe: async (event) => {
				const src = await ActionUtil.getStringWithVariables(event, 'src')
				const dest = await ActionUtil.getStringWithVariables(event, 'dest')
				const cmd = ActionUtil.getSendPanoramaCommand(src, dest)
				ensureLoaded(cmd)
			},
		},
		[CommonActions.RestoreSendPanorama]: {
			name: 'Restore Send Panorama',
			description: 'Restore the panorama of a send from a channel or aux to a bus or matrix.',
			options: [
				...GetDropdownWithVariables('From', 'src', [...state.namedChoices.channels, ...state.namedChoices.auxes]),
				...GetDropdownWithVariables('To', 'dest', [...state.namedChoices.busses, ...state.namedChoices.matrices]),
				...FadeDurationChoice(),
			],
			callback: async (event) => {
				const src = await ActionUtil.getStringWithVariables(event, 'src')
				const dest = await ActionUtil.getStringWithVariables(event, 'dest')
				const cmd = ActionUtil.getSendPanoramaCommand(src, dest)
				const restoreVal = StateUtil.getValueFromKey(cmd, state)
				ActionUtil.runTransition(cmd, 'pan', event, state, transitions, restoreVal, false)
			},
		},
		[CommonActions.DeltaSendPanorama]: {
			name: 'Adjust Send Panorama',
			description: 'Adjust the panorama of a send from a channel or aux to a bus or matrix.',
			options: [
				...GetDropdownWithVariables('From', 'src', [...state.namedChoices.channels, ...state.namedChoices.auxes]),
				...GetDropdownWithVariables('To', 'dest', [...state.namedChoices.busses, ...state.namedChoices.matrices]),
				...GetPanoramaDeltaSliderWithVariables('delta', 'Panorama'),
			],
			callback: async (event) => {
				const src = await ActionUtil.getStringWithVariables(event, 'src')
				const dest = await ActionUtil.getStringWithVariables(event, 'dest')
				const cmd = ActionUtil.getSendPanoramaCommand(src, dest)
				let targetValue = StateUtil.getNumberFromState(cmd, state)
				const delta = await ActionUtil.getNumberWithVariables(event, 'delta')
				state.storeDelta(cmd, delta)
				if (targetValue != undefined) {
					targetValue += delta
					ActionUtil.runTransition(cmd, 'pan', event, state, transitions, targetValue, false)
				}
			},
			subscribe: async (event) => {
				const src = await ActionUtil.getStringWithVariables(event, 'src')
				const dest = await ActionUtil.getStringWithVariables(event, 'dest')
				const cmd = ActionUtil.getSendPanoramaCommand(src, dest)
				ensureLoaded(cmd)
			},
		},
		[CommonActions.UndoDeltaSendPanorama]: {
			name: 'Undo Send Panorama Adjust',
			description: 'Undo the panorama adjustment of a send from a channel or aux to a bus or matrix.',
			options: [
				...GetDropdownWithVariables('From', 'src', [...state.namedChoices.channels, ...state.namedChoices.auxes]),
				...GetDropdownWithVariables('To', 'dest', [...state.namedChoices.busses, ...state.namedChoices.matrices]),
				...FadeDurationChoice(),
			],
			callback: async (event) => {
				const src = await ActionUtil.getStringWithVariables(event, 'src')
				const dest = await ActionUtil.getStringWithVariables(event, 'dest')
				const cmd = ActionUtil.getSendPanoramaCommand(src, dest)
				let targetValue = StateUtil.getNumberFromState(cmd, state)
				const delta = state.restoreDelta(cmd)
				if (targetValue != undefined) {
					targetValue -= delta
					ActionUtil.runTransition(cmd, 'pan', event, state, transitions, targetValue, false)
				}
			},
			subscribe: async (event) => {
				const src = await ActionUtil.getStringWithVariables(event, 'src')
				const dest = await ActionUtil.getStringWithVariables(event, 'dest')
				const cmd = ActionUtil.getSendPanoramaCommand(src, dest)
				ensureLoaded(cmd)
			},
		},
		[CommonActions.SetInsertOn]: {
			name: 'Set Insert On',
			description: 'Enable or disable an insert for a channel, aux, bus, matrix or main.',
			options: [
				...GetDropdownWithVariables('Insert', 'insert', [
					getIdLabelPair('pre', 'Pre-Insert'),
					getIdLabelPair('post', 'Post-Insert'),
					getIdLabelPair('pre-post', 'Both'),
				]),
				...GetDropdownWithVariables('Selection', 'sel', [...allChannels]),
				...GetOnOffToggleDropdownWithVariables('enable', 'Enable'),
			],
			callback: async (event) => {
				const insert = await ActionUtil.getStringWithVariables(event, 'insert')
				const sel = await ActionUtil.getStringWithVariables(event, 'sel')
				const val = await ActionUtil.getNumberWithVariables(event, 'enable')
				const nodeNum = ActionUtil.getNodeNumberFromID(sel)
				if (insert.includes('pre')) {
					const cmd = ActionUtil.getPreInsertOnCommand(sel, nodeNum)
					const currentVal = StateUtil.getBooleanFromState(cmd, state)
					if (val < 2) {
						send(cmd, val)
					} else {
						send(cmd, Number(!currentVal))
					}
				}
				if (insert.includes('post')) {
					const cmd = ActionUtil.getPostInsertCommand(sel, nodeNum)
					if (cmd == '') return // if an aux is requested
					const currentVal = StateUtil.getBooleanFromState(cmd, state)
					if (val < 2) {
						send(cmd, val)
					} else {
						send(cmd, Number(!currentVal))
					}
				}
			},
			subscribe: async (event) => {
				const insert = await ActionUtil.getStringWithVariables(event, 'insert')
				const sel = await ActionUtil.getStringWithVariables(event, 'sel')
				const nodeNum = ActionUtil.getNodeNumberFromID(sel)
				if (insert.includes('pre')) {
					const cmd = ActionUtil.getPreInsertOnCommand(sel, nodeNum)
					ensureLoaded(cmd)
				}
				if (insert.includes('post')) {
					const cmd = ActionUtil.getPreInsertOnCommand(sel, nodeNum)
					ensureLoaded(cmd)
				}
			},
		},
	}

	return actions
}
