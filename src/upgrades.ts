import type { CompanionStaticUpgradeScript, CompanionStaticUpgradeResult } from '@companion-module/base'
import type { WingConfig } from './config.js'

export const UpgradeScripts: CompanionStaticUpgradeScript<WingConfig>[] = [
	/*
	 * Place your upgrade scripts here
	 * Remember that once it has been added it cannot be removed!
	 */
	// Upgrade RecorderState feedback from advanced to boolean (v2.2.0)
	((_context, props): CompanionStaticUpgradeResult<WingConfig> => {
		const updatedFeedbacks = []

		for (const feedback of props.feedbacks) {
			if (feedback.feedbackId === 'recorder-state') {
				// Convert old advanced feedback with stateText option to new boolean feedback with state option
				updatedFeedbacks.push({
					...feedback,
					// Remove old stateText option and add new state option defaulting to 'REC'
					options: {
						state: 'REC',
					},
				})
			}
		}

		return {
			updatedConfig: null,
			updatedActions: [],
			updatedFeedbacks,
		}
	}) as CompanionStaticUpgradeScript<WingConfig>,
]
