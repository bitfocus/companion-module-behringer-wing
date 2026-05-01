import type { CompanionStaticUpgradeScript, CompanionStaticUpgradeResult } from '@companion-module/base'

export const UpgradeScripts: CompanionStaticUpgradeScript<any>[] = [
	/*
	 * Place your upgrade scripts here
	 * Remember that once it has been added it cannot be removed!
	 */
	// Upgrade RecorderState feedback from advanced to boolean (v2.2.0)
	((_context, props): CompanionStaticUpgradeResult<any, undefined> => {
		const updatedFeedbacks = []

		for (const feedback of props.feedbacks) {
			if (feedback.feedbackId === 'recorder-state') {
				// Convert old advanced feedback with stateText option to new boolean feedback with state option
				updatedFeedbacks.push({
					...feedback,
					// Remove old stateText option and add new state option defaulting to 'REC'
					options: {
						state: { value: 'REC', isExpression: false as const },
					},
				})
			}
		}

		return {
			updatedConfig: {
				...props.config,
				fadeUpdateRate: props.config?.fadeUpdateRate ?? 50,
				statusPollUpdateRate: props.config?.statusPollUpdateRate ?? 3000,
				variableUpdateRate: props.config?.variableUpdateRate ?? 100,
				prefetchVariablesOnStartup: props.config?.prefetchVariablesOnStartup ?? true,
				startupVariableRequestChunkSize: props.config?.startupVariableRequestChunkSize ?? 10,
				startupVariableRequestChunkWait: props.config?.startupVariableRequestChunkWait ?? 100,
				requestTimeout: props.config?.requestTimeout ?? 20,
				panicOnLostRequest: props.config?.panicOnLostRequest ?? false,
				subscriptionInterval: props.config?.subscriptionInterval ?? 9000,
				enableOscForwarding: props.config?.enableOscForwarding ?? false,
				oscForwardingHost: props.config?.oscForwardingHost ?? '',
				oscForwardingPort: props.config?.oscForwardingPort ?? 0,
				debugMode: props.config?.debugMode ?? false,
			},
			updatedActions: [],
			updatedFeedbacks,
		}
	}) as CompanionStaticUpgradeScript<any>,
]
