import { CompanionActionDefinition } from '@companion-module/base'
import { SetRequired } from 'type-fest' // eslint-disable-line n/no-missing-import

export type CompanionActionWithCallback = SetRequired<CompanionActionDefinition, 'callback'>

import { CompanionActionDefinitions } from '@companion-module/base'
import {
	GetDropdown,
	GetFaderInputField,
	GetMuteDropdown,
	GetNumberField,
	GetOnOffToggleDropdown,
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
	const ensureLoaded = self.ensureLoaded
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
			options: [GetMuteDropdown('mute')],
			callback: async (event) => {
				const cmd = ConfigurationCommands.SoloMute()
				const val = ActionUtil.getSetOrToggleValue(cmd, ActionUtil.getNumber(event, 'mute'), state)
				send(cmd, val)
			},
		},
		[ConfigActions.SetSoloDim]: {
			name: 'Set Solo Dim',
			description: 'Set or toggle the dim state of the solo output.',
			options: [
				GetDropdown(
					'Dim',
					'dim',
					[getIdLabelPair('1', 'On'), getIdLabelPair('0', 'Off'), getIdLabelPair('2', 'Toggle')],
					'1',
				),
			],
			callback: async (event) => {
				const cmd = ConfigurationCommands.SoloDim()
				const val = ActionUtil.getSetOrToggleValue(cmd, ActionUtil.getNumber(event, 'dim'), state)
				send(cmd, val)
			},
		},
		[ConfigActions.SetSoloMono]: {
			name: 'Set Solo Mono',
			description: 'Set or toggle the mono state of the solo output.',
			options: [
				GetDropdown(
					'Mono',
					'mono',
					[getIdLabelPair('1', 'On'), getIdLabelPair('0', 'Off'), getIdLabelPair('2', 'Toggle')],
					'1',
				),
			],
			callback: async (event) => {
				const cmd = ConfigurationCommands.SoloMono()
				const val = ActionUtil.getSetOrToggleValue(cmd, ActionUtil.getNumber(event, 'mono'), state)
				send(cmd, val)
			},
		},
		[ConfigActions.SetSoloLRSwap]: {
			name: 'Set Solo LR Swap',
			description: 'Set the left-right channel swap of the solo channel.',
			options: [
				GetDropdown(
					'Swap',
					'swap',
					[getIdLabelPair('1', 'Swap'), getIdLabelPair('0', "Don't Swap"), getIdLabelPair('2', 'Toggle')],
					'1',
				),
			],
			callback: async (event) => {
				const cmd = ConfigurationCommands.SoloLRSwap()
				const val = ActionUtil.getSetOrToggleValue(cmd, ActionUtil.getNumber(event, 'swap'), state)
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
							GetDropdown('Monitor', 'mon', [getIdLabelPair('1', 'Monitor 1'), getIdLabelPair('2', 'Monitor 2')], '1'),
							...GetFaderInputField('level'),
						],
						callback: async (event) => {
							const cmd = ConfigurationCommands.MonitorLevel(event.options.mon as number)
							ActionUtil.runTransition(cmd, 'level', event, state, transitions)
						},
						subscribe: (event) => {
							if (event.options.swap ?? 0 >= 2) {
								const cmd = ConfigurationCommands.MonitorLevel(event.options.mon as number)
								ensureLoaded(cmd)
							}
						},
					}
				: undefined,
		////////////////////////////////////////////////////////////////
		// Talkback
		////////////////////////////////////////////////////////////////
		[ConfigActions.TalkbackOn]: {
			name: 'Talkback On',
			description: 'Enable or disable the on state of a talkback.',
			options: [GetDropdown('Talkback', 'tb', getTalkbackOptions()), GetOnOffToggleDropdown('solo', 'Solo')],
			callback: async (event) => {
				const cmd = ConfigurationCommands.TalkbackOn(event.options.tb as string)
				const val = ActionUtil.getSetOrToggleValue(cmd, ActionUtil.getNumber(event, 'solo'), state)
				send(cmd, val)
			},
		},
		[ConfigActions.TalkbackMode]: {
			name: 'Talkback Mode',
			description: 'Set the mode of a talkback channel.',
			options: [
				GetDropdown('Talkback', 'tb', getTalkbackOptions()),
				GetDropdown('Mode', 'mode', getTalkbackModeOptions()),
			],
			callback: async (event) => {
				const cmd = ConfigurationCommands.TalkbackMode(event.options.tb as string)
				const val = event.options.mode as string
				send(cmd, val)
			},
		},
		[ConfigActions.TalkbackMonitorDim]: {
			name: 'Talkback Monitor Dim',
			description: 'Set the the monitor dim amount of a talkback channel.',
			options: [
				GetDropdown('Talkback', 'tb', getTalkbackOptions()),
				GetNumberField('Dim [dB]', 'dim', 0, 40, 1, 10, true),
			],
			callback: async (event) => {
				const cmd = ConfigurationCommands.TalkbackMonitorDim(event.options.tb as string)
				const val = event.options.dim as number
				send(cmd, val, true)
			},
		},
		[ConfigActions.TalkbackBusDim]: {
			name: 'Talkback Bus Dim',
			description: 'Set the the bus dim amount of a talkback channel.',
			options: [
				GetDropdown('Talkback', 'tb', getTalkbackOptions()),
				GetNumberField('Dim [dB]', 'dim', 0, 40, 1, 10, true),
			],
			callback: async (event) => {
				const cmd = ConfigurationCommands.TalkbackBusDim(event.options.tb as string)
				const val = event.options.dim as number
				send(cmd, val, true)
			},
		},
		[ConfigActions.TalkbackAssign]: {
			name: 'Talkback Assign',
			description: 'Enable, disable or toggle the assignment of a talkback to a bus, matrix or main.',
			options: [
				GetDropdown('Talkback', 'tb', getTalkbackOptions()),
				GetDropdown('Destination', 'dest', [
					...state.namedChoices.busses,
					...state.namedChoices.matrices,
					...state.namedChoices.mains,
				]),
				GetDropdown('Assign', 'assign', [
					getIdLabelPair('1', 'Assign'),
					getIdLabelPair('0', 'Not Assign'),
					getIdLabelPair('2', 'Toggle'),
				]),
			],
			callback: async (event) => {
				const talkback = event.options.tb as string
				const destination = event.options.dest as string
				const cmd = ActionUtil.getTalkbackAssignCommand(talkback, destination)
				const val = ActionUtil.getSetOrToggleValue(cmd, event.options.assign as number, state)
				send(cmd, val)
			},
		},
		[ConfigActions.TalkbackIndividualLevels]: {
			name: 'Talkback Individual Levels',
			description: 'Enable or disable individual bus and main talkback levels.',
			options: [
				GetDropdown('Talkback', 'tb', getTalkbackOptions()),
				GetDropdown('Mode', 'mode', getTalkbackIndividualOptions()),
			],
			callback: async (event) => {
				const cmd = ConfigurationCommands.TalkbackIndividual(event.options.tb as string)
				const val = event.options.mode as number
				send(cmd, val)
			},
		},
	}
	return actions
}
