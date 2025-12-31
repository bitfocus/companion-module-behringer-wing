import { CompanionActionDefinitions, Regex } from '@companion-module/base'
import { CompanionActionWithCallback } from './common.js'
import { InstanceBaseExt } from '../types.js'
import { WingConfig } from '../config.js'
import { GetTextFieldWithVariables } from '../choices/common.js'
import { getStringWithVariables } from './utils.js'

export enum OtherActionId {
	SendCommand = 'send-command',
	SendCommandWithNumber = 'send-command-with-number',
	SendCommandWithString = 'send-command-with-string',
}

export function GetOtherActions(self: InstanceBaseExt<WingConfig>): CompanionActionDefinitions {
	const send = self.sendCommand

	const actions: { [id in OtherActionId]: CompanionActionWithCallback | undefined } = {
		[OtherActionId.SendCommand]: {
			name: 'Send Command',
			description: 'Send an OSC command with no argument to the console.',
			options: [...GetTextFieldWithVariables('Command', 'cmd', '')],
			callback: async (event) => {
				const cmd = await getStringWithVariables(event, 'cmd')
				send(cmd)
			},
		},
		[OtherActionId.SendCommandWithNumber]: {
			name: 'Send Command with Number',
			description: 'Send an OSC command with a number as an argument to the console.',
			options: [
				...GetTextFieldWithVariables('Command', 'cmd', ''),
				{ type: 'textinput', label: 'Value', id: 'num', default: '1', regex: Regex.SIGNED_NUMBER, useVariables: true },
			],
			callback: async (event) => {
				const cmd = await getStringWithVariables(event, 'cmd')
				const num = await self.parseVariablesInString(event.options.num as string)
				send(cmd, parseInt(num))
			},
		},
		[OtherActionId.SendCommandWithString]: {
			name: 'Send Command with String',
			description: 'Send an OSC command with a string as an argument to the console.',
			options: [
				...GetTextFieldWithVariables('Command', 'cmd', ''),
				...GetTextFieldWithVariables('Value', 'val', '', 'The value to send as a string. This can include variables.'),
			],
			callback: async (event) => {
				const cmd = await getStringWithVariables(event, 'cmd')
				const val = await getStringWithVariables(event, 'val')
				send(cmd, val)
			},
		},
	}

	return actions
}
