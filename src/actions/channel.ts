import { CompanionActionDefinitions } from '@companion-module/base'
import { GetDropdown, GetDropdownWithVariables } from '../choices/common.js'
import { getChannelProcessOrderChoices, getFilterModelOptions } from '../choices/channel.js'
import { ChannelCommands as Commands } from '../commands/channel.js'
import * as ActionUtil from './utils.js'
import { CompanionActionWithCallback } from './common.js'
import { EqModelDropdown, EqParameterDropdown } from '../choices/eq.js'
import { EqModelChoice } from '../choices/eq.js'
import { InstanceBaseExt } from '../types.js'
import { WingConfig } from '../config.js'
import { getStringFromState } from '../state/utils.js'

export enum ChannelActions {
	SetChannelFilterModel = 'set-channel-filter-model',
	SetChannelEqType = 'set-channel-eq-type',
	SetChannelEqParameter = 'set-channel-eq-parameter',
	SetChannelProcessOrder = 'set-channel-process-order',
}

export function createChannelActions(self: InstanceBaseExt<WingConfig>): CompanionActionDefinitions {
	const send = self.sendCommand
	const ensureLoaded = self.ensureLoaded
	const state = self.state

	const actions: { [id in ChannelActions]: CompanionActionWithCallback | undefined } = {
		[ChannelActions.SetChannelFilterModel]: {
			name: 'Set Channel Filter Model',
			description: 'Set the filter model for a channel.',
			options: [
				...GetDropdownWithVariables('Channel', 'channel', state.namedChoices.channels),
				...GetDropdownWithVariables('Filter', 'filter', getFilterModelOptions()),
			],
			callback: async (event) => {
				const channel = await ActionUtil.getStringWithVariables(self, event, 'channel')
				const filter = await ActionUtil.getStringWithVariables(self, event, 'filter')
				const cmd = Commands.FilterModel(ActionUtil.getNodeNumberFromID(channel))
				send(cmd, filter)
			},
		},
		[ChannelActions.SetChannelEqType]: {
			name: 'Set Channel EQ Model',
			description: 'Set the EQ model for a channel.',
			options: [
				...GetDropdownWithVariables('Channel', 'channel', state.namedChoices.channels),
				...GetDropdownWithVariables('EQ Model', 'model', EqModelChoice),
			],
			callback: async (event) => {
				const channel = await ActionUtil.getStringWithVariables(self, event, 'channel')
				const model = await ActionUtil.getStringWithVariables(self, event, 'model')
				const cmd = Commands.EqModel(ActionUtil.getNodeNumberFromID(channel))
				send(cmd, model)
			},
		},
		[ChannelActions.SetChannelEqParameter]: {
			name: 'Set Channel EQ Parameter',
			description: 'Set the parameter of an equalizer in a channel',
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
			description: 'Set the process order of EQ, gate, dynamics and insert of a channel.',
			options: [
				...GetDropdownWithVariables('Channel', 'channel', state.namedChoices.channels),
				...GetDropdownWithVariables('Order', 'order', getChannelProcessOrderChoices()),
			],
			callback: async (event) => {
				const channel = await ActionUtil.getStringWithVariables(self, event, 'channel')
				const order = await ActionUtil.getStringWithVariables(self, event, 'order')
				const cmd = Commands.ProcessOrder(ActionUtil.getNodeNumberFromID(channel))
				send(cmd, order)
			},
		},
	}

	return actions
}
