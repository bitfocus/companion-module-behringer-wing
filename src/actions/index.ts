import { CompanionActionDefinitions } from '@companion-module/base'
import { createChannelActions } from '../actions/channel.js'
import { createConfigurationActions } from '../actions/config.js'
import { GetOtherActions as createOtherActions } from './other.js'
import { createBusActions as createBusActions } from './bus.js'
import { InstanceBaseExt } from '../types.js'
import { WingConfig } from '../config.js'
import { createAuxActions } from './auxes.js'
import { createMainActions } from './main.js'
import { createUsbPlayerActions } from './usbplayer.js'
import { createCardsActions } from './cards.js'
import { createCommonActions } from './common.js'

export function createActions(self: InstanceBaseExt<WingConfig>): CompanionActionDefinitions {
	const actions = {
		...createCommonActions(self),
		...createOtherActions(self),
		...createChannelActions(self),
		...createBusActions(self),
		...createAuxActions(self),
		...createMainActions(self),
		...createUsbPlayerActions(self),
		...createCardsActions(self),
		...createConfigurationActions(self),
	}

	return actions
}
