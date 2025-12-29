import { CompanionActionDefinitions } from '@companion-module/base'
import { CompanionActionWithCallback } from './common.js'
import { InstanceBaseExt } from '../types.js'
import { WingConfig } from '../config.js'
import { IoCommands } from '../commands/io.js'
import { GetDropdownWithVariables } from '../choices/common.js'
import { getIdLabelPair } from '../choices/utils.js'
import * as ActionUtil from './utils.js'

export enum IoActionId {
	MainAltSwitch = 'main-alt-swtich',
}

export function createIoActions(self: InstanceBaseExt<WingConfig>): CompanionActionDefinitions {
	const send = self.connection!.sendCommand.bind(self.connection)

	const actions: { [id in IoActionId]: CompanionActionWithCallback | undefined } = {
		[IoActionId.MainAltSwitch]: {
			name: 'Set Main/Alt Switch',
			description: 'Sets the desk to use the configured main/alt input sources.',
			options: [
				...GetDropdownWithVariables('Selection', 'sel', [
					getIdLabelPair('1', 'Alt'),
					getIdLabelPair('0', 'Main'),
					getIdLabelPair('-1', 'Toggle'),
				]),
			],
			callback: async (event) => {
				const cmd = IoCommands.MainAltSwitch()
				const val = ActionUtil.getNumberWithVariables(event, 'sel')
				await send(cmd, val)
			},
		},
	}
	return actions
}
