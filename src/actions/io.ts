import { CompanionActionDefinitions } from '@companion-module/base'
import { CompanionActionWithCallback } from './common.js'
import { InstanceBaseExt } from '../types.js'
import { WingConfig } from '../config.js'
import { IoCommands } from '../commands/io.js'
import { GetDropdown } from '../choices/common.js'
import { getIdLabelPair } from '../choices/utils.js'
import * as ActionUtil from './utils.js'

export enum IoActionId {
	MainAltSwitch = 'main-alt-swtich',
}

export function createIoActions(self: InstanceBaseExt<WingConfig>): CompanionActionDefinitions {
	const send = self.sendCommand
	const state = self.state

	const actions: { [id in IoActionId]: CompanionActionWithCallback | undefined } = {
		[IoActionId.MainAltSwitch]: {
			name: 'Set Main/Alt Switch',
			description: 'Sets the desk to use the configured main/alt input sources.',
			options: [
				GetDropdown('Selection', 'sel', [
					getIdLabelPair('0', 'Alt'),
					getIdLabelPair('1', 'Main'),
					getIdLabelPair('2', 'Toggle'),
				]),
			],
			callback: async (event) => {
				const cmd = IoCommands.MainAltSwitch()
				let val = ActionUtil.getNumber(event, 'sel')
				val = Number(ActionUtil.getSetOrToggleValue(cmd, val, state, true))
				send(cmd, val)
			},
		},
	}
	return actions
}
