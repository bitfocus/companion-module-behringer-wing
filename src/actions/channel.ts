import { CompanionActionDefinitions } from '@companion-module/base'
import { GetDropdown, GetNumberField, getIconChoices } from '../choices/common.js'
import { getSourceGroupChoices } from '../choices/common.js'
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
	SetChannelMainConnection = 'set-channel-main-connection',
	SetChannelFilterModel = 'set-channel-filter-model',
	SetChannelEqType = 'set-channel-eq-type',
	SetChannelEqParameter = 'set-channel-eq-parameter',
	SetChannelProcessOrder = 'set-channel-process-order',
	SetChannelIcon = 'set-channel-icon',
}

export function createChannelActions(self: InstanceBaseExt<WingConfig>): CompanionActionDefinitions {
	const send = self.sendCommand
	const ensureLoaded = self.ensureLoaded
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
	}

	return actions
}
