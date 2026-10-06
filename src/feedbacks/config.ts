import { combineRgb, CompanionFeedbackDefinitions } from '@companion-module/base'
import { InstanceBaseExt } from '../types.js'
import { WingConfig } from '../config.js'
import { GetDropdown } from '../choices/common.js'
import { getIdLabelPair } from '../choices/utils.js'
import { getTalkbackOptions } from '../choices/config.js'
import { ConfigurationCommands } from '../commands/config.js'
import * as ActionUtil from '../actions/utils.js'
import { createFeedback, FeedbackId, getFeedbackContext, stateMatchesNumberOption } from './utils.js'

export function createConfigurationFeedbacks(self: InstanceBaseExt<WingConfig>): CompanionFeedbackDefinitions {
	const ctx = getFeedbackContext(self)
	const { state } = ctx

	return {
		[FeedbackId.SoloDim]: createFeedback(ctx, {
			type: 'boolean',
			name: 'Solo Dim',
			description: 'React to the dim state of the solo output.',
			options: [GetDropdown('Dim', 'dim', [getIdLabelPair('1', 'On'), getIdLabelPair('0', 'Off')])],
			defaultStyle: { bgcolor: combineRgb(255, 255, 0), color: combineRgb(0, 0, 0) },
			paths: () => [ConfigurationCommands.SoloDim()],
			callback: (event, [cmd]) => stateMatchesNumberOption(state, event, cmd, 'dim'),
		}),
		[FeedbackId.SoloMono]: createFeedback(ctx, {
			type: 'boolean',
			name: 'Solo Mono',
			description: 'React to the mono state of the solo output.',
			options: [GetDropdown('Mono', 'mono', [getIdLabelPair('1', 'On'), getIdLabelPair('0', 'Off')])],
			defaultStyle: { bgcolor: combineRgb(255, 255, 0), color: combineRgb(0, 0, 0) },
			paths: () => [ConfigurationCommands.SoloMono()],
			callback: (event, [cmd]) => stateMatchesNumberOption(state, event, cmd, 'mono'),
		}),
		[FeedbackId.SoloLRSwap]: createFeedback(ctx, {
			type: 'boolean',
			name: 'Solo LR Swap',
			description: 'React to the left-right channel swap state of the solo output.',
			options: [GetDropdown('Swap', 'swap', [getIdLabelPair('1', 'On'), getIdLabelPair('0', 'Off')])],
			defaultStyle: { bgcolor: combineRgb(255, 255, 0), color: combineRgb(0, 0, 0) },
			paths: () => [ConfigurationCommands.SoloLRSwap()],
			callback: (event, [cmd]) => stateMatchesNumberOption(state, event, cmd, 'swap'),
		}),
		[FeedbackId.Talkback]: createFeedback(ctx, {
			type: 'boolean',
			name: 'Talkback',
			description: 'React to the status of a talkback channel.',
			options: [
				GetDropdown('Talkback', 'tb', getTalkbackOptions()),
				GetDropdown('On/Off', 'on', [getIdLabelPair('1', 'On'), getIdLabelPair('0', 'Off')]),
			],
			defaultStyle: { bgcolor: combineRgb(255, 0, 0), color: combineRgb(0, 0, 0) },
			paths: (event) => [ConfigurationCommands.TalkbackOn(ActionUtil.getStringWithVariables(event, 'tb'))],
			callback: (event, [cmd]) => stateMatchesNumberOption(state, event, cmd, 'on'),
		}),
		[FeedbackId.TalkbackAssign]: createFeedback(ctx, {
			type: 'boolean',
			name: 'Talkback Assign',
			description: 'React to the assignment of a talkback channel to a bus matrix or main',
			options: [
				GetDropdown('Talkback', 'tb', getTalkbackOptions()),
				GetDropdown('Destination', 'dest', [
					...state.namedChoices.busses,
					...state.namedChoices.matrices,
					...state.namedChoices.mains,
				]),
				GetDropdown('Assign', 'assign', [getIdLabelPair('1', 'Assigned'), getIdLabelPair('0', 'Not Assigned')]),
			],
			defaultStyle: { bgcolor: combineRgb(0, 255, 0), color: combineRgb(0, 0, 0) },
			paths: (event) => {
				const talkback = ActionUtil.getStringWithVariables(event, 'tb')
				const destination = ActionUtil.getStringWithVariables(event, 'dest')
				return [ActionUtil.getTalkbackAssignCommand(talkback, destination)]
			},
			callback: (event, [cmd]) => stateMatchesNumberOption(state, event, cmd, 'assign'),
		}),
	}
}
