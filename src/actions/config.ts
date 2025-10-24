import { CompanionActionDefinition } from '@companion-module/base'
import { SetRequired } from 'type-fest' // eslint-disable-line n/no-missing-import

export type CompanionActionWithCallback = SetRequired<CompanionActionDefinition, 'callback'>

import { CompanionActionDefinitions } from '@companion-module/base'
import {
	GetDropdownWithVariables,
	GetFaderInputFieldWithVariables,
	GetMuteDropdownWithVariables,
	GetNumberFieldWithVariables,
	GetOnOffToggleDropdownWithVariables,
} from '../choices/common.js'
import { InstanceBaseExt } from '../types.js'
import { WingConfig } from '../config.js'
import * as ActionUtil from './utils.js'
import { ConfigurationCommands } from '../commands/config.js'
import { getIdLabelPair } from '../choices/utils.js'
import { getTalkbackOptions, getTalkbackModeOptions, getTalkbackIndividualOptions } from '../choices/config.js'
import { WingRack } from '../models/rack.js'

export enum ConfigActions {
	// Solo
	SetSoloMute = 'set-solo-mute',
	SetSoloDim = 'set-solo-dim',
	SetSoloMono = 'set-solo-mono',
	SetSoloLRSwap = 'set-solo-swap',

	// Monitor
	SetMonitorLevel = 'set-monitor-level',

	// Talkback
	TalkbackOn = 'talkback-on',
	TalkbackMode = 'talkback-mode',
	TalkbackMonitorDim = 'talkback-monitor-dim',
	TalkbackBusDim = 'talkback-bus-dim',
	TalkbackAssign = 'talkback-destination',
	TalkbackIndividualLevels = 'talkback-individual-levels',
}

export function createConfigurationActions(self: InstanceBaseExt<WingConfig>): CompanionActionDefinitions {
	const send = self.sendCommand
	const state = self.state
	const transitions = self.transitions
	const model = self.model

	const actions: { [id in ConfigActions]: CompanionActionWithCallback | undefined } = {
		////////////////////////////////////////////////////////////////
		// Solo
		////////////////////////////////////////////////////////////////
		[ConfigActions.SetSoloMute]: {
			name: 'Set Solo Mute',
			description: 'Set or toggle the mute state of the solo output.',
			options: [...GetMuteDropdownWithVariables('mute', 'Mute', true)],
			callback: async (event) => {
				const mute = await ActionUtil.getNumberWithVariables(event, 'mute')
				const cmd = ConfigurationCommands.SoloMute()
				send(cmd, mute)
			},
		},
		[ConfigActions.SetSoloDim]: {
			name: 'Set Solo Dim',
			description: 'Set or toggle the dim state of the solo output.',
			options: [...GetOnOffToggleDropdownWithVariables('dim', 'Dim', true)],
			callback: async (event) => {
				const cmd = ConfigurationCommands.SoloDim()
				const val = await ActionUtil.getNumberWithVariables(event, 'dim')
				send(cmd, val)
			},
		},
		[ConfigActions.SetSoloMono]: {
			name: 'Set Solo Mono',
			description: 'Set or toggle the mono state of the solo output.',
			options: [...GetOnOffToggleDropdownWithVariables('mono', 'Mono', true)],
			callback: async (event) => {
				const cmd = ConfigurationCommands.SoloMono()
				const val = await ActionUtil.getNumberWithVariables(event, 'mono')
				send(cmd, val)
			},
		},
		[ConfigActions.SetSoloLRSwap]: {
			name: 'Set Solo LR Swap',
			description: 'Set the left-right channel swap of the solo channel.',
			options: [
				...GetDropdownWithVariables(
					'Swap',
					'swap',
					[getIdLabelPair('1', 'Swap'), getIdLabelPair('0', "Don't Swap"), getIdLabelPair('-1', 'Toggle')],
					'1',
				),
			],
			callback: async (event) => {
				const cmd = ConfigurationCommands.SoloLRSwap()
				const val = await ActionUtil.getNumberWithVariables(event, 'swap')
				send(cmd, val)
			},
		},
		[ConfigActions.SetMonitorLevel]:
			model == WingRack
				? {
						name: 'Set Monitor Level',
						description:
							'Set the level of a monitor channel. ATTENTION: This command only works on the Rack and Compact Model, due to the full-size Wing having potentiometers as control knobs.',
						options: [
							...GetDropdownWithVariables(
								'Monitor',
								'mon',
								[getIdLabelPair('1', 'Monitor 1'), getIdLabelPair('2', 'Monitor 2')],
								'1',
							),
							...GetFaderInputFieldWithVariables('level'),
						],
						callback: async (event) => {
							const monitor = await ActionUtil.getNumberWithVariables(event, 'mon')
							const level = await ActionUtil.getNumberWithVariables(event, 'level')
							const cmd = ConfigurationCommands.MonitorLevel(monitor)
							ActionUtil.runTransition(cmd, 'level', event, state, transitions, level)
						},
					}
				: undefined,
		////////////////////////////////////////////////////////////////
		// Talkback
		////////////////////////////////////////////////////////////////
		[ConfigActions.TalkbackOn]: {
			name: 'Talkback On',
			description: 'Enable or disable the on state of a talkback.',
			options: [
				...GetDropdownWithVariables('Talkback', 'tb', getTalkbackOptions()),
				...GetOnOffToggleDropdownWithVariables('solo', 'Solo', true),
			],
			callback: async (event) => {
				const cmd = ConfigurationCommands.TalkbackOn(event.options.tb as string)
				const val = await ActionUtil.getNumberWithVariables(event, 'solo')
				send(cmd, val)
			},
		},
		[ConfigActions.TalkbackMode]: {
			name: 'Talkback Mode',
			description: 'Set the mode of a talkback channel.',
			options: [
				...GetDropdownWithVariables('Talkback', 'tb', getTalkbackOptions()),
				...GetDropdownWithVariables('Mode', 'mode', getTalkbackModeOptions()),
			],
			callback: async (event) => {
				const tb = await ActionUtil.getStringWithVariables(event, 'tb')
				const cmd = ConfigurationCommands.TalkbackMode(tb)
				const val = await ActionUtil.getStringWithVariables(event, 'mode')
				send(cmd, val)
			},
		},
		[ConfigActions.TalkbackMonitorDim]: {
			name: 'Talkback Monitor Dim',
			description: 'Set the the monitor dim amount of a talkback channel.',
			options: [
				...GetDropdownWithVariables('Talkback', 'tb', getTalkbackOptions()),
				...GetNumberFieldWithVariables('Dim [dB]', 'dim', 0, 40, 1, 10),
			],
			callback: async (event) => {
				const tb = await ActionUtil.getStringWithVariables(event, 'tb')
				const cmd = ConfigurationCommands.TalkbackMonitorDim(tb)
				const val = await ActionUtil.getNumberWithVariables(event, 'dim')
				send(cmd, val, true)
			},
		},
		[ConfigActions.TalkbackBusDim]: {
			name: 'Talkback Bus Dim',
			description: 'Set the the bus dim amount of a talkback channel.',
			options: [
				...GetDropdownWithVariables('Talkback', 'tb', getTalkbackOptions()),
				...GetNumberFieldWithVariables('Dim [dB]', 'dim', 0, 40, 1, 10),
			],
			callback: async (event) => {
				const tb = await ActionUtil.getStringWithVariables(event, 'tb')
				const cmd = ConfigurationCommands.TalkbackBusDim(tb)
				const val = await ActionUtil.getNumberWithVariables(event, 'dim')
				send(cmd, val, true)
			},
		},
		[ConfigActions.TalkbackAssign]: {
			name: 'Talkback Assign',
			description: 'Enable, disable or toggle the assignment of a talkback to a bus, matrix or main.',
			options: [
				...GetDropdownWithVariables('Talkback', 'tb', getTalkbackOptions()),
				...GetDropdownWithVariables('Destination', 'dest', [
					...state.namedChoices.busses,
					...state.namedChoices.matrices,
					...state.namedChoices.mains,
				]),
				...GetDropdownWithVariables('Assign', 'assign', [
					getIdLabelPair('1', 'Assign'),
					getIdLabelPair('0', 'Not Assign'),
					getIdLabelPair('-1', 'Toggle'),
				]),
			],
			callback: async (event) => {
				const talkback = await ActionUtil.getStringWithVariables(event, 'tb')
				const destination = await ActionUtil.getStringWithVariables(event, 'dest')
				const cmd = ActionUtil.getTalkbackAssignCommand(talkback, destination)
				const val = await ActionUtil.getNumberWithVariables(event, 'assign')
				send(cmd, val)
			},
		},
		[ConfigActions.TalkbackIndividualLevels]: {
			name: 'Talkback Individual Levels',
			description: 'Enable or disable individual bus and main talkback levels.',
			options: [
				...GetDropdownWithVariables('Talkback', 'tb', getTalkbackOptions()),
				...GetDropdownWithVariables('Mode', 'mode', getTalkbackIndividualOptions()),
			],
			callback: async (event) => {
				const tb = await ActionUtil.getStringWithVariables(event, 'tb')
				const cmd = ConfigurationCommands.TalkbackIndividual(tb)
				const val = await ActionUtil.getNumberWithVariables(event, 'mode')
				send(cmd, val)
			},
		},
	}
	return actions
}
