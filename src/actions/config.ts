import { CompanionActionDefinition } from '@companion-module/base'
import { SetRequired } from 'type-fest' // eslint-disable-line n/no-missing-import

export type CompanionActionWithCallback = SetRequired<CompanionActionDefinition, 'callback'>

import { CompanionActionDefinitions } from '@companion-module/base'
import { GetDropdown, GetMuteDropdown } from '../choices/common.js'
import { InstanceBaseExt } from '../types.js'
import { WingConfig } from '../config.js'
import * as ActionUtil from './utils.js'
import { ConfigurationCommands } from '../commands/config.js'
import { StateUtil } from '../state/index.js'
import { getIdLabelPair } from '../choices/utils.js'

export enum CommonActions {
	// Solo
	SetSoloMute = 'set-solo-mute',
	SetSoloDim = 'set-solo-dim',
	SetSoloMono = 'set-solo-mono',
	SetSoloLRSwap = 'set-solo-swap',
}

export function createConfigurationActions(self: InstanceBaseExt<WingConfig>): CompanionActionDefinitions {
	const send = self.sendCommand
	const ensureLoaded = self.ensureLoaded
	const state = self.state

	const actions: { [id in CommonActions]: CompanionActionWithCallback | undefined } = {
		////////////////////////////////////////////////////////////////
		// Solo
		////////////////////////////////////////////////////////////////
		[CommonActions.SetSoloMute]: {
			name: 'Set Solo Mute',
			description: 'Set or toggle the mute state of the solo output.',
			options: [GetMuteDropdown('mute')],
			callback: async (event) => {
				const cmd = ConfigurationCommands.SoloMute()
				const val = ActionUtil.getNumber(event, 'mute')
				const currentVal = StateUtil.getBooleanFromState(cmd, state)
				if (val >= 2) {
					send(cmd, Number(!currentVal))
				} else {
					send(cmd, val)
				}
			},
			subscribe: (_) => {
				const cmd = ConfigurationCommands.SoloMute()
				ensureLoaded(cmd)
			},
		},
		[CommonActions.SetSoloDim]: {
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
				const val = ActionUtil.getNumber(event, 'dim')
				const currentVal = StateUtil.getBooleanFromState(cmd, state)
				if (val >= 2) {
					send(cmd, Number(!currentVal))
				} else {
					send(cmd, val)
				}
			},
			subscribe: (_) => {
				const cmd = ConfigurationCommands.SoloDim()
				ensureLoaded(cmd)
			},
		},
		[CommonActions.SetSoloMono]: {
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
				const val = ActionUtil.getNumber(event, 'mono')
				const currentVal = StateUtil.getBooleanFromState(cmd, state)
				if (val >= 2) {
					send(cmd, Number(!currentVal))
				} else {
					send(cmd, val)
				}
			},
			subscribe: (_) => {
				const cmd = ConfigurationCommands.SoloMono()
				ensureLoaded(cmd)
			},
		},
		[CommonActions.SetSoloLRSwap]: {
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
				const val = ActionUtil.getNumber(event, 'swap')
				const currentVal = StateUtil.getBooleanFromState(cmd, state)
				if (val >= 2) {
					send(cmd, Number(!currentVal))
				} else {
					send(cmd, val)
				}
			},
			subscribe: (_) => {
				const cmd = ConfigurationCommands.SoloLRSwap()
				ensureLoaded(cmd)
			},
		},
	}
	return actions
}
