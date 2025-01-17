import { CompanionActionDefinitions } from '@companion-module/base'
import { createChannelActions } from '../actions/channel.js'
import { GetOtherActions as createOtherActions } from './other.js'
import { createBusActions as createBusActions } from './bus.js'
import { InstanceBaseExt } from '../types.js'
import { WingConfig } from '../config.js'
import { createAuxActions } from './aux.js'
import { createMainActions } from './main.js'

export function createActions(self: InstanceBaseExt<WingConfig>): CompanionActionDefinitions {
	const actions = {
		...createOtherActions(self),
		...createChannelActions(self),
		...createBusActions(self),
		...createAuxActions(self),
		...createMainActions(self),
	}

	return actions
}
