import { CompanionActionDefinitions, CompanionOptionValues } from '@companion-module/base'
import { CompanionActionWithCallback } from './common.js'
import { InstanceBaseExt } from '../types.js'
import { WingConfig } from '../config.js'
import { ControlCommands } from '../commands/control.js'
import { StateUtil } from '../state/index.js'
import { GetDropdown, GetOnOffToggleDropdown } from '../choices/common.js'
import { getIdLabelPair } from '../choices/utils.js'
import { getGpioModes } from '../choices/control.js'
import { getGpios } from '../choices/control.js'
import * as ActionUtil from './utils.js'

export enum OtherActionId {
	RecallScene = 'recall-scene',
	SendLibraryAction = 'send-library-action',
	SetGpioMode = 'set-gpio-mode',
	SetGpioState = 'set-gpio-state',
}

export function createControlActions(self: InstanceBaseExt<WingConfig>): CompanionActionDefinitions {
	const send = self.sendCommand
	const state = self.state
	const ensureLoaded = self.ensureLoaded
	const subscriptions = self.subscriptions

	const actions: { [id in OtherActionId]: CompanionActionWithCallback | undefined } = {
		[OtherActionId.RecallScene]: {
			name: 'Recall Scene',
			description:
				'ATTENTION: if you have the same scene name twice in your show, you will not be able to recall it by name! In this case, use the scene ID instead.',
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
			subscribe: (event) => {
				if (event.options.useSceneId == false) {
					subscriptions.subscribePoll(ControlCommands.LibraryScenes())
				}
				ensureLoaded(ControlCommands.LibraryActiveSceneIndex())
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
		[OtherActionId.SetGpioMode]: {
			name: 'Set GPIO Mode',
			description: 'Configure the mode of a GPIO',
			options: [GetDropdown('Mode', 'mode', getGpioModes(), 'TGLNO'), GetDropdown('GPIO', 'gpio', getGpios(4), '1')],
			callback: async (event) => {
				const gpio = event.options.gpio as number
				const val = event.options.mode as string
				const cmd = ControlCommands.GpioMode(gpio)
				send(cmd, val)
			},
		},
		[OtherActionId.SetGpioState]: {
			name: 'Set GPIO State',
			description: 'Set the state of a GPIO',
			options: [GetDropdown('Selection', 'sel', getGpios(4), '1'), GetOnOffToggleDropdown('state', 'State')],
			callback: async (event) => {
				const sel = event.options.sel as number
				const cmd = ControlCommands.GpioState(sel)
				const val = ActionUtil.getSetOrToggleValue(cmd, ActionUtil.getNumber(event, 'state'), state)

				send(cmd, val)
			},
		},
	}

	return actions
}
