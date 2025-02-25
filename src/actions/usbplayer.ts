import { CompanionActionDefinitions } from '@companion-module/base'
import { CompanionActionWithCallback } from './common.js'
import { UsbPlayerCommands as Commands } from '../commands/usbplayer.js'
import { InstanceBaseExt } from '../types.js'
import { WingConfig } from '../config.js'
import { getUsbPlayerActionChoices, getUsbRecorderActionChoices } from '../choices/usbplayer.js'
import { GetDropdown } from '../choices/common.js'

export enum UsbPlayerActionId {
	// SetPosition = 'set-position',
	// SetDirectory = 'set-directory',
	// SetDirectoryMode = 'set-directory-mode',
	PlaybackAction = 'playback-action',
	// SetPlayAll = 'set-play-all',
	// SetRepeat = 'set-repeat',
	// SetPlaylistPosition = 'set-playlist-position',
	// SetPlaylistSong = 'set-playlist-song',
	// SetRecordFilename = 'set-record-filename',
	RecordAction = 'record-action',
	// SetRecordFilePath = 'set-record-file-path',
	// SetRecordResolution = 'set-record-resolution',
	// SetRecordChannels = 'set-record-channels',
}

export function createUsbPlayerActions(self: InstanceBaseExt<WingConfig>): CompanionActionDefinitions {
	const send = self.sendCommand

	const actions: { [id in UsbPlayerActionId]: CompanionActionWithCallback | undefined } = {
		[UsbPlayerActionId.PlaybackAction]: {
			name: 'Playback Action',
			options: [GetDropdown('Action', 'action', getUsbPlayerActionChoices())],
			callback: async (event) => {
				const cmd = Commands.PlayerAction()
				send(cmd, event.options.action as string)
			},
		},
		[UsbPlayerActionId.RecordAction]: {
			name: 'Record Action',
			options: [GetDropdown('Action', 'action', getUsbRecorderActionChoices())],
			callback: async (event) => {
				const cmd = Commands.RecorderAction()
				send(cmd, event.options.action as string)
			},
		},
	}

	return actions
}
