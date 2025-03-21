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
	RecallSceneFromList = 'recall-scene-from-list',
	SendLibraryAction = 'send-library-action',
}

export function createControlActions(self: InstanceBaseExt<WingConfig>): CompanionActionDefinitions {
	const send = self.sendCommand
	const state = self.state
	const ensureLoaded = self.ensureLoaded

	const actions: { [id in OtherActionId]: CompanionActionWithCallback | undefined } = {
		[OtherActionId.RecallScene]: {
			name: 'Recall Scene',
			description: 'Recall a scene and optionally go to it',
			options: [
				{
					type: 'number',
					id: 'num',
					label: 'Scene Number',
					min: 1,
					max: 16384,
					default: 1,
				},
				{
					type: 'checkbox',
					id: 'go',
					label: 'Go to Scene?',
					default: true,
				},
			],
			callback: async (event) => {
				send(ControlCommands.LibrarySceneSelectionIndex(), event.options.num as number)
				if (event.options.go) {
					send(ControlCommands.LibraryAction(), 'GO')
				}
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
		[OtherActionId.RecallSceneFromList]: {
			name: 'Recall Scene from List',
			description:
				'Recall a scene from a list and optionally go to it (NOTE: When you add/remove/move scenes in your show, you must update this command.)',
			options: [
				GetDropdown(
					'Scene',
					'num',
					state.namedChoices.scenes,
					undefined,
					'This uses the index of the scene, and changes when scenes are added or removed.',
				),
				{
					type: 'checkbox',
					id: 'go',
					label: 'Go to Scene?',
					default: true,
				},
			],
			callback: async (event) => {
				const go = event.options.go as boolean
				send(ControlCommands.LibrarySceneSelectionIndex(), event.options.num as number)
				if (go) {
					send(ControlCommands.LibraryAction(), 'GO')
				}
			},
			subscribe: () => {
				const cmd = ControlCommands.LibraryActiveSceneIndex()
				ensureLoaded(cmd)
				ensureLoaded(ControlCommands.LibraryNode(), '?')
			},
			learn: () => {
				const cmd = ControlCommands.LibraryActiveSceneIndex()
				return { num: StateUtil.getNumberFromState(cmd, state) }
			},
		},
		[OtherActionId.SendLibraryAction]: {
			name: 'Send Library Action',
			description: 'Trigger a library action (Select and navigate scenes in a show)',
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
						//getIdLabelPair('GOTAG', 'G'),
					],
					'GO',
				),
			],
			callback: async (event) => {
				const act = event.options.act as string
				if (act === 'GO') {
					send(ControlCommands.LibrarySceneSelectionIndex(), 0) // required for 'GO' with PREV/NEXT
				}
				const cmd = ControlCommands.LibraryAction()
				send(cmd, act)
			},
		},
	}

	return actions
}
