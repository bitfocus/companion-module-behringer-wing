import type {
	CompanionStaticUpgradeProps,
	CompanionStaticUpgradeResult,
	CompanionStaticUpgradeScript,
	CompanionUpgradeContext,
} from '@companion-module/base'
import type { WingConfig } from './config.js'

export const UpgradeScripts: CompanionStaticUpgradeScript<WingConfig>[] = [
	function v2(
		_context: CompanionUpgradeContext<WingConfig>,
		props: CompanionStaticUpgradeProps<WingConfig>,
	): CompanionStaticUpgradeResult<WingConfig> {
		const result: CompanionStaticUpgradeResult<WingConfig> = {
			updatedConfig: null,
			updatedActions: [],
			updatedFeedbacks: [],
		}

		console.log('Upgrading actions:', props.actions)
		for (const action of props.actions) {
			console.log('Upgrading action:', action)
			switch (action.actionId) {
				case 'send_bmm_lvl_a':
					action.actionId = 'delta-send-fader'
					action.options.src = action.options.source
					action.options.dest = action.options.bus
					action.options.delta = action.options.tick
					action.options.fadeDuration = action.options.duration
					result.updatedActions.push(action)
					break

				default:
					break
			}
		}

		return result
	},
	/*
	 * Place your upgrade scripts here
	 * Remember that once it has been added it cannot be removed!
	 */
	// function (context, props) {
	// 	return {
	// 		updatedConfig: null,
	// 		updatedActions: [],
	// 		updatedFeedbacks: [],
	// 	}
	// },
]
