import { CompanionActionDefinitions } from '@companion-module/base'
import { CompanionActionWithCallback } from './common.js'
import { UsbPlayerCommands as Commands } from '../commands/usbplayer.js'
import { InstanceBaseExt } from '../types.js'
import { WingConfig } from '../config.js'
import { getUsbPlayerActionChoices, getUsbRecorderActionChoices } from '../choices/usbplayer.js'
import { GetDropdown } from '../choices/common.js'

export enum UsbPlayerActionId {
	PlaybackAction = 'playback-action',
	SetRepeat = 'set-repeat',
	RecordAction = 'record-action',
}

export function createUsbPlayerActions(self: InstanceBaseExt<WingConfig>): CompanionActionDefinitions {
	const send = self.sendCommand

	const actions: { [id in UsbPlayerActionId]: CompanionActionWithCallback | undefined } = {
		[UsbPlayerActionId.PlaybackAction]: {
			name: 'USB: Playback Action',
			options: [GetDropdown('Action', 'action', getUsbPlayerActionChoices())],
			callback: async (event) => {
				const cmd = Commands.PlayerAction()
				send(cmd, event.options.action as string)
			},
		},
		[UsbPlayerActionId.SetRepeat]: {
			name: 'USB: Set Repeat',
			options: [
				{
					type: 'checkbox',
					id: 'repeat',
					label: 'Repeat',
					default: false,
				},
			],
			callback: async (event) => {
				const cmd = Commands.PlayerRepeat()
				const repeat = event.options.repeat ? 1 : 0
				send(cmd, repeat)
			},
		},
		[UsbPlayerActionId.RecordAction]: {
			name: 'USB: Record Action',
			options: [GetDropdown('Action', 'action', getUsbRecorderActionChoices())],
			callback: async (event) => {
				const cmd = Commands.RecorderAction()
				send(cmd, event.options.action as string)
			},
		},
	}

	return actions
}
