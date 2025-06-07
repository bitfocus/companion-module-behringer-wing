import { CompanionActionDefinitions } from '@companion-module/base'
import { createChannelActions } from '../actions/channel.js'
import { createConfigurationActions } from '../actions/config.js'
import { GetOtherActions as createOtherActions } from './other.js'
import { createBusActions as createBusActions } from './bus.js'
import { InstanceBaseExt } from '../types.js'
import { WingConfig } from '../config.js'
import { createAuxActions } from './auxes.js'
import { createMainActions } from './main.js'
import { createMatrixActions } from './matrix.js'
import { createUsbPlayerActions } from './usbplayer.js'
import { createCardsActions } from './cards.js'
import { createCommonActions } from './common.js'
import { createControlActions } from './control.js'
import { createIoActions } from './io.js'

export function createActions(self: InstanceBaseExt<WingConfig>): CompanionActionDefinitions {
	const actions = {
		...createCommonActions(self),
		...createOtherActions(self),
		...createChannelActions(self),
		...createBusActions(self),
		...createAuxActions(self),
		...createMainActions(self),
		...createMatrixActions(self),
		...createUsbPlayerActions(self),
		...createCardsActions(self),
		...createConfigurationActions(self),
		...createControlActions(self),
		...createIoActions(self),
	}

	return actions
}
