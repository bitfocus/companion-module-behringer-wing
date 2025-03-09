import { CompanionActionDefinitions } from '@companion-module/base'
import { CompanionActionWithCallback } from './common.js'
import { InstanceBaseExt } from '../types.js'
import { WingConfig } from '../config.js'
import { ControlCommands } from '../commands/control.js'
import { StateUtil } from '../state/index.js'
import { GetDropdown } from '../choices/common.js'
import { getIdLabelPair } from '../choices/utils.js'

export enum OtherActionId {
	RecallScene = 'recall-scene',
	SendLibraryAction = 'send-library-action',
}

export function createControlActions(self: InstanceBaseExt<WingConfig>): CompanionActionDefinitions {
	const send = self.sendCommand
	const state = self.state
	const ensureLoaded = self.ensureLoaded

	const actions: { [id in OtherActionId]: CompanionActionWithCallback | undefined } = {
		[OtherActionId.RecallScene]: {
			name: 'Recall Scene',
			options: [
				{
					type: 'number',
					id: 'num',
					label: 'Argument',
					min: 1,
					max: 16384,
					default: 1,
				},
			],
			callback: async (event) => {
				send(ControlCommands.LibrarySceneSelectionIndex(), event.options.num as number)
				send(ControlCommands.LibraryAction(), 'GO')
			},
			subscribe: () => {
				const cmd = ControlCommands.LibraryActiveSceneIndex()
				ensureLoaded(cmd)
			},
			learn: () => {
				const cmd = ControlCommands.LibraryActiveSceneIndex()
				return { num: StateUtil.getNumberFromState(cmd, state) }
			},
		},
		[OtherActionId.SendLibraryAction]: {
			name: 'Send Library Action',
			description: 'Set the scribble light color of a channel, aux, bus, matrix or main.',
			options: [
				GetDropdown(
					'Action',
					'act',
					[
						getIdLabelPair('GOPREV', 'Select Previous and Go'),
						getIdLabelPair('GONEXT', 'Select Next and Go'),
						getIdLabelPair('GO', 'Go'),
						getIdLabelPair('PREV', 'Select Previous'),
						getIdLabelPair('NEXT', 'Select Next'),
						// getIdLabelPair('GOTAG', 'G'),
					],
					'GO',
				),
			],
			callback: async (event) => {
				const act = event.options.act as string
				const cmd = ControlCommands.LibraryAction()
				send(cmd, act)
			},
		},
	}

	return actions
}
