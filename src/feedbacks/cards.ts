import { combineRgb, CompanionFeedbackDefinitions } from '@companion-module/base'
import { InstanceBaseExt } from '../types.js'
import { WingConfig } from '../config.js'
import { GetDropdown } from '../choices/common.js'
import { getCardsChoices, getCardsStatusChoices, getCardsActionChoices } from '../choices/cards.js'
import { CardsCommands } from '../commands/cards.js'
import * as ActionUtil from '../actions/utils.js'
import { StateUtil } from '../state/index.js'
import { createFeedback, FeedbackId, getFeedbackContext } from './utils.js'

export function createCardsFeedbacks(self: InstanceBaseExt<WingConfig>): CompanionFeedbackDefinitions {
	const ctx = getFeedbackContext(self)
	const { state } = ctx

	return {
		[FeedbackId.WLiveSDState]: createFeedback(ctx, {
			type: 'boolean',
			name: 'WLive SD State',
			description: 'React to the state of the WLive SD Cards.',
			options: [GetDropdown('Card', 'card', getCardsChoices()), GetDropdown('State', 'state', getCardsStatusChoices())],
			defaultStyle: { bgcolor: combineRgb(0, 255, 0), color: combineRgb(0, 0, 0) },
			paths: (event) => [CardsCommands.WLiveCardSDState(ActionUtil.getNumberWithVariables(event, 'card'))],
			callback: (event, [cmd]) =>
				StateUtil.getStringFromState(cmd, state) == ActionUtil.getStringWithVariables(event, 'state'),
		}),
		[FeedbackId.WLivePlaybackState]: createFeedback(ctx, {
			type: 'boolean',
			name: 'WLive Playback State',
			description: 'React to the playback state of a WLive Card.',
			options: [GetDropdown('Card', 'card', getCardsChoices()), GetDropdown('State', 'state', getCardsActionChoices())],
			defaultStyle: { bgcolor: combineRgb(0, 255, 0), color: combineRgb(0, 0, 0) },
			paths: (event) => [CardsCommands.WLiveCardState(ActionUtil.getNumberWithVariables(event, 'card'))],
			callback: (event, [cmd]) =>
				StateUtil.getStringFromState(cmd, state) == ActionUtil.getStringWithVariables(event, 'state'),
		}),
	}
}
