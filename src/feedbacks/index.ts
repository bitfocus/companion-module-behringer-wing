import { CompanionFeedbackDefinitions } from '@companion-module/base'
import { InstanceBaseExt } from '../types.js'
import { WingConfig } from '../config.js'
import { createCommonFeedbacks } from './common.js'
import { createConfigurationFeedbacks } from './config.js'
import { createControlFeedbacks } from './control.js'
import { createIoFeedbacks } from './io.js'
import { createUsbPlayerFeedbacks } from './usbplayer.js'
import { createCardsFeedbacks } from './cards.js'
import { FeedbackId } from './utils.js'

export { FeedbackId }

export function GetFeedbacksList(self: InstanceBaseExt<WingConfig>): CompanionFeedbackDefinitions {
	const feedbacks = {
		...createIoFeedbacks(self),
		...createCommonFeedbacks(self),
		...createUsbPlayerFeedbacks(self),
		...createCardsFeedbacks(self),
		...createControlFeedbacks(self),
		...createConfigurationFeedbacks(self),
	}

	return feedbacks
}
