import { CompanionActionDefinitions } from '@companion-module/base'
import { CompanionActionWithCallback } from './common.js'
import { UsbPlayerCommands as Commands } from '../commands/usbplayer.js'
import { InstanceBaseExt } from '../types.js'
import { WingConfig } from '../config.js'
import { getUsbPlayerActionChoices, getUsbRecorderActionChoices } from '../choices/usbplayer.js'
import { GetCheckboxWithVariables, GetDropdownWithVariables } from '../choices/common.js'
import { getStringWithVariables, getNumberWithVariables } from './utils.js'

export enum UsbPlayerActionId {
	PlaybackAction = 'playback-action',
	SetRepeat = 'set-repeat',
	RecordAction = 'record-action',
}

export function createUsbPlayerActions(self: InstanceBaseExt<WingConfig>): CompanionActionDefinitions {
	const send = self.connection!.sendCommand.bind(self.connection)

	const actions: { [id in UsbPlayerActionId]: CompanionActionWithCallback | undefined } = {
		[UsbPlayerActionId.PlaybackAction]: {
			name: 'USB: Playback Action',
			description: 'Start, stop, pause, jump to previous or next in the USB player.',
			options: [...GetDropdownWithVariables('Action', 'action', getUsbPlayerActionChoices())],
			callback: async (event) => {
				const action = getStringWithVariables(event, 'action')
				const cmd = Commands.PlayerAction()
				await send(cmd, action)
			},
		},
		[UsbPlayerActionId.SetRepeat]: {
			name: 'USB: Set Repeat',
			description: 'Enable the repeat functionality of the USB player',
			options: [...GetCheckboxWithVariables('Repeat', 'repeat', false, 'Enable or disable repeat functionality')],
			callback: async (event) => {
				const repeat = getNumberWithVariables(event, 'repeat')
				const cmd = Commands.PlayerRepeat()
				await send(cmd, repeat == 1 ? 1 : 0)
			},
		},
		[UsbPlayerActionId.RecordAction]: {
			name: 'USB: Record Action',
			description: 'Start, stop, pause or create a new file in the USB recorder.',
			options: [...GetDropdownWithVariables('Action', 'action', getUsbRecorderActionChoices())],
			callback: async (event) => {
				const action = getStringWithVariables(event, 'action')
				const cmd = Commands.RecorderAction()
				await send(cmd, action)
			},
		},
	}

	return actions
}
