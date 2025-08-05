import { CompanionActionDefinitions, Regex } from '@companion-module/base'
import { CompanionActionWithCallback } from './common.js'
import { InstanceBaseExt } from '../types.js'
import { WingConfig } from '../config.js'

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
			options: [
				{
					type: 'textinput',
					id: 'cmd',
					label: 'Command',
					useVariables: true,
				},
			],
			callback: async (event) => {
				const cmd = await self.parseVariablesInString(event.options.cmd as string)
				send(cmd)
			},
		},
		[OtherActionId.SendCommandWithNumber]: {
			name: 'Send Command with Number',
			description: 'Send an OSC command with a number as an argument to the console.',
			options: [
				{
					type: 'textinput',
					id: 'cmd',
					label: 'Command',
					useVariables: true,
				},
				{
					type: 'textinput',
					label: 'Value',
					id: 'num',
					default: '1',
					regex: Regex.SIGNED_NUMBER,
					useVariables: true,
				},
			],
			callback: async (event) => {
				const cmd = await self.parseVariablesInString(event.options.cmd as string)
				const num = await self.parseVariablesInString(event.options.num as string)
				send(cmd, parseInt(num))
			},
		},
		[OtherActionId.SendCommandWithString]: {
			name: 'Send Command with String',
			description: 'Send an OSC command with a string as an argument to the console.',
			options: [
				{
					type: 'textinput',
					id: 'cmd',
					label: 'Command',
					useVariables: true,
				},
				{
					type: 'textinput',
					id: 'val',
					label: 'Value',
					useVariables: true,
				},
			],
			callback: async (event) => {
				const cmd = await self.parseVariablesInString(event.options.cmd as string)
				const val = await self.parseVariablesInString(event.options.val as string)
				send(cmd, val)
			},
		},
	}

	return actions
}
