import { CompanionActionDefinitions } from '@companion-module/base'
import { CompanionActionWithCallback } from './common.js'
import { InstanceBaseExt } from '../types.js'
import { WingConfig } from '../config.js'
import { ControlCommands } from '../commands/control.js'
import { StateUtil } from '../state/index.js'
import {
	GetDropdownWithVariables,
	GetNumberFieldWithVariables,
	GetOnOffToggleDropdownWithVariables,
} from '../choices/common.js'
import { getIdLabelPair } from '../choices/utils.js'
import { getGpioModes } from '../choices/control.js'
import { getGpios } from '../choices/control.js'
import * as ActionUtil from './utils.js'

export enum OtherActionId {
	RecallSceneByName = 'recall-scene-by-name',
	RecallSceneByNumber = 'recall-scene-by-number',
	SendLibraryAction = 'send-library-action',
	SetGpioMode = 'set-gpio-mode',
	SetGpioState = 'set-gpio-state',
	SaveNow = 'save-now',
	SetSOF = 'set-sof',
	SetSelected = 'set-selected',
}

export function createControlActions(self: InstanceBaseExt<WingConfig>): CompanionActionDefinitions {
	const send = self.connection!.sendCommand.bind(self.connection)
	const state = self.stateHandler?.state
	if (!state) throw new Error('State handler or state is not available')
	const ensureLoaded = self.stateHandler!.ensureLoaded.bind(self.stateHandler)
	const subscriptions = self.feedbackHandler?.subscriptions
	if (!subscriptions) throw new Error('Feedback handler or subscriptions are not available')
	const model = self.model

	const actions: { [id in OtherActionId]: CompanionActionWithCallback | undefined } = {
		[OtherActionId.RecallSceneByName]: {
			name: 'Recall Scene by Name',
			description:
				'ATTENTION: if you have the same scene name twice in your show, you will not be able to recall it by name! In this case, use the "Recall Scene by Number" action instead.',
			options: [...GetDropdownWithVariables('Scene Name', 'sceneName', state.namedChoices.scenes)],
			callback: async (event) => {
				const sceneName = await ActionUtil.getStringWithVariables(event, 'sceneName')
				const sceneId = state.sceneNameToIdMap.get(sceneName) ?? 0
				await send(ControlCommands.LibrarySceneSelectionIndex(), sceneId)
				await send(ControlCommands.LibraryAction(), 'GO')
			},
			subscribe: async () => {
				subscriptions.subscribePoll(ControlCommands.LibraryScenes())
				await ensureLoaded(ControlCommands.LibraryActiveSceneIndex())
				await ensureLoaded(ControlCommands.LibraryNode(), '?')
			},
		},
		[OtherActionId.RecallSceneByNumber]: {
			name: 'Recall Scene by Number',
			description: 'Recall scene in a show by its number',
			options: [...GetNumberFieldWithVariables('Scene Number', 'sceneId', 1, 16384)],
			callback: async (event) => {
				const sceneId = await ActionUtil.getNumberWithVariables(event, 'sceneId')
				await send(ControlCommands.LibrarySceneSelectionIndex(), sceneId)
				await send(ControlCommands.LibraryAction(), 'GO')
			},
			subscribe: async () => {
				await ensureLoaded(ControlCommands.LibraryActiveSceneIndex())
				await ensureLoaded(ControlCommands.LibraryNode(), '?')
			},
			learn: () => {
				const cmd = ControlCommands.LibraryActiveSceneIndex()
				const sceneId = StateUtil.getNumberFromState(cmd, state)
				return { sceneId: sceneId, sceneId_use_variables: false }
			},
		},
		[OtherActionId.SendLibraryAction]: {
			name: 'Send Library Action',
			description: 'Trigger a library action (Select and navigate scenes in a show)',
			options: [
				...GetDropdownWithVariables(
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
				const act = await ActionUtil.getStringWithVariables(event, 'act')
				if (act === 'GO') {
					await send(ControlCommands.LibrarySceneSelectionIndex(), 0) // required for 'GO' with PREV/NEXT
				}
				const cmd = ControlCommands.LibraryAction()
				await send(cmd, act)
			},
		},
		[OtherActionId.SetGpioMode]: {
			name: 'Set GPIO Mode',
			description: 'Configure the mode of a GPIO',
			options: [
				...GetDropdownWithVariables('Mode', 'mode', getGpioModes(), 'TGLNO'),
				...GetDropdownWithVariables('GPIO', 'gpio', getGpios(model.gpio), '1'),
			],
			callback: async (event) => {
				const gpio = await ActionUtil.getNumberWithVariables(event, 'gpio')
				const val = await ActionUtil.getStringWithVariables(event, 'mode')
				const cmd = ControlCommands.GpioMode(gpio)
				await send(cmd, val)
			},
		},
		[OtherActionId.SetGpioState]: {
			name: 'Set GPIO State',
			description: 'Set the state of a GPIO',
			options: [
				...GetDropdownWithVariables('Selection', 'sel', getGpios(model.gpio), '1'),
				...GetOnOffToggleDropdownWithVariables('state', 'State', true),
			],
			callback: async (event) => {
				const sel = await ActionUtil.getNumberWithVariables(event, 'sel')
				const gpioState = await ActionUtil.getNumberWithVariables(event, 'state')
				const cmd = ControlCommands.GpioState(sel)

				await send(cmd, gpioState)
			},
		},
		[OtherActionId.SaveNow]: {
			name: 'Save',
			description:
				'Save console data to internal flash. CAUTION: excessive writes to the internal flash memory can cause it to wear out.',
			options: [],
			callback: async () => {
				await send(ControlCommands.SaveNow(), 1)
			},
		},
		[OtherActionId.SetSOF]: {
			name: 'Set SOF',
			description: 'Set Sends on Fader',
			options: [
				...GetDropdownWithVariables(
					'Channel',
					'channel',
					[
						{ id: 'current', label: 'Currently Selected Channel' },
						{ id: 'off', label: 'Off' },
						...state.namedChoices.channels,
						...state.namedChoices.auxes,
						...state.namedChoices.busses,
						...state.namedChoices.mains,
						...state.namedChoices.matrices,
					],
					'current',
				),
			],
			callback: async (event) => {
				const channel = await ActionUtil.getStringWithVariables(event, 'channel')
				// convert channel to index
				const channelIndex = ActionUtil.getStripIndexFromString(channel)
				// send the SOF command with the channel index
				await send(ControlCommands.SetSof(), channelIndex + 1) // +1 because of int offset in Wing
			},
		},
		[OtherActionId.SetSelected]: {
			name: 'Set Selected',
			description: 'Set Selected Channel Strip',
			options: [
				...GetDropdownWithVariables('Channel', 'channel', [
					...state.namedChoices.channels,
					...state.namedChoices.auxes,
					...state.namedChoices.busses,
					...state.namedChoices.mains,
					...state.namedChoices.matrices,
				]),
			],
			callback: async (event) => {
				const channel = await ActionUtil.getStringWithVariables(event, 'channel')
				// convert channel to index
				const channelIndex = ActionUtil.getStripIndexFromString(channel)
				// send the SOF command with the channel index
				await send(ControlCommands.SetSelect(), channelIndex)
			},
		},
	}

	return actions
}
