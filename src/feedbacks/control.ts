import { combineRgb, CompanionFeedbackDefinitions } from '@companion-module/base'
import { InstanceBaseExt } from '../types.js'
import { WingConfig } from '../config.js'
import { GetDropdown } from '../choices/common.js'
import { getIdLabelPair } from '../choices/utils.js'
import { getGpios } from '../choices/control.js'
import { ControlCommands } from '../commands/control.js'
import * as ActionUtil from '../actions/utils.js'
import { StateUtil } from '../state/index.js'
import { createFeedback, FeedbackId, getFeedbackContext, stateMatchesNumberOption } from './utils.js'

export function createControlFeedbacks(self: InstanceBaseExt<WingConfig>): CompanionFeedbackDefinitions {
	const ctx = getFeedbackContext(self)
	const { state } = ctx

	return {
		[FeedbackId.GpioState]: createFeedback(ctx, {
			type: 'boolean',
			name: 'GPIO State',
			description: "React to a change in a gpio's state",
			options: [
				GetDropdown('Selection', 'sel', getGpios(4)),
				GetDropdown('State', 'state', [getIdLabelPair('1', 'On'), getIdLabelPair('0', 'Off')]),
			],
			defaultStyle: { bgcolor: combineRgb(0, 255, 0), color: combineRgb(0, 0, 0) },
			paths: (event) => [ControlCommands.GpioReadState(ActionUtil.getNumberWithVariables(event, 'sel'))],
			callback: (event, [cmd]) => stateMatchesNumberOption(state, event, cmd, 'state'),
		}),
		[FeedbackId.ActiveScene]: createFeedback(ctx, {
			type: 'boolean',
			name: 'Active Scene',
			description: 'React to the currently active scene',
			options: [GetDropdown('Scene', 'scene', state.namedChoices.scenes)],
			defaultStyle: { bgcolor: combineRgb(0, 255, 0), color: combineRgb(0, 0, 0) },
			paths: () => [ControlCommands.LibraryActiveSceneIndex()],
			callback: (event, [cmd]) => {
				const sceneName = ActionUtil.getStringWithVariables(event, 'scene')
				const sceneNumber = state.sceneNameToIdMap.get(sceneName) ?? 0
				const currentSceneNumber = StateUtil.getNumberFromState(cmd, state)
				return typeof currentSceneNumber === 'number' && currentSceneNumber === sceneNumber
			},
		}),
		[FeedbackId.SofActive]: createFeedback(ctx, {
			type: 'boolean',
			name: 'SOF Active',
			description: 'React to the Sends on Fade mode',
			options: [
				GetDropdown(
					'Channel',
					'channel',
					[
						{ id: 'off', label: 'Off' },
						...state.namedChoices.channels,
						...state.namedChoices.auxes,
						...state.namedChoices.busses,
						...state.namedChoices.mains,
						...state.namedChoices.matrices,
					],
					'off',
				),
			],
			defaultStyle: { bgcolor: combineRgb(0, 255, 0), color: combineRgb(0, 0, 0) },
			paths: () => [ControlCommands.SetSof()],
			callback: (event, [cmd]) => {
				const channel = ActionUtil.getStringWithVariables(event, 'channel')
				const channelIndex = ActionUtil.getStripIndexFromString(channel)
				const currentSelectedIndex = StateUtil.getNumberFromState(cmd, state)
				return currentSelectedIndex === channelIndex
			},
		}),
	}
}
