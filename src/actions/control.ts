import { CompanionActionDefinitions, CompanionOptionValues } from '@companion-module/base'
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
			description:
				'If you change the order of the scenes on your desk, restart the WING integration!. ATTENTION: if you have the same scene name twice in your show, you will not be able to recall it by name! In this case, use the scene ID instead.',
			options: [
				{
					type: 'checkbox',
					id: 'useSceneId',
					label: 'Use Scene Id',
					default: false,
				},
				{
					type: 'number',
					id: 'sceneId',
					label: 'Scene Number',
					min: 1,
					max: 16384,
					default: 1,
					isVisible: (options: CompanionOptionValues): boolean => {
						return options.useSceneId != null && options.useSceneId == true
					},
				},
				{
					...GetDropdown('Scene Name', 'sceneName', state.namedChoices.scenes),
					isVisible: (options: CompanionOptionValues): boolean => {
						return options.useSceneId != null && options.useSceneId == false
					},
				},
			],
			callback: async (event) => {
				const useSceneId = event.options.useSceneId
				let sceneId = 0
				if (useSceneId == true) {
					sceneId = event.options.sceneId as number
				} else {
					sceneId = state.sceneNameToIdMap.get(event.options.sceneName as string) ?? 0
				}
				send(ControlCommands.LibrarySceneSelectionIndex(), sceneId)
				send(ControlCommands.LibraryAction(), 'GO')
			},
			subscribe: () => {
				const cmd = ControlCommands.LibraryActiveSceneIndex()
				ensureLoaded(cmd)
				ensureLoaded(ControlCommands.LibraryNode(), '?')
			},
			learn: (event) => {
				const sceneIdMap = state.sceneNameToIdMap
				const cmd = ControlCommands.LibraryActiveSceneIndex()
				const sceneId = StateUtil.getNumberFromState(cmd, state)
				let sceneName = ''
				for (const [key, value] of sceneIdMap.entries()) {
					if (value === sceneId) sceneName = key
				}
				return { sceneName: sceneName, sceneId: sceneId, useSceneId: event.options.useSceneId }
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
