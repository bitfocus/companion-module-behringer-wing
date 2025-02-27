import { CompanionActionDefinitions } from '@companion-module/base'
import { CompanionActionWithCallback } from './common.js'
import { InstanceBaseExt } from '../types.js'
import { WingConfig } from '../config.js'

export enum OtherActionId {
	SendCommand = 'send-command',
	SendCommandWithNumber = 'send-command-with-number',
}

export function GetOtherActions(self: InstanceBaseExt<WingConfig>): CompanionActionDefinitions {
	const send = self.sendCommand

	const actions: { [id in OtherActionId]: CompanionActionWithCallback | undefined } = {
		[OtherActionId.SendCommand]: {
			name: 'Send Command',
			options: [
				{
					type: 'textinput',
					id: 'cmd',
					label: 'Command',
				},
			],
			callback: async (event) => {
				send(event.options.cmd as string)
			},
		},
		[OtherActionId.SendCommandWithNumber]: {
			name: 'Send Command with Number',
			options: [
				{
					type: 'textinput',
					id: 'cmd',
					label: 'Command',
				},
				{
					type: 'number',
					id: 'num',
					label: 'Argument',
					min: -1000000,
					max: 1000000,
					default: 0,
				},
			],
			callback: async (event) => {
				send(event.options.cmd as string, event.options.num as number)
			},
		},
	}

	return actions
}
