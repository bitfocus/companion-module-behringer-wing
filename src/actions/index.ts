import { CompanionActionDefinitions } from '@companion-module/base'
import { WingState } from '../state.js'
import { WingTransitions } from '../transitions.js'
import { createChannelActions } from '../actions/channel.js'
import { GetOtherActions as createOtherActions } from './other.js'
import { GetBusActions as createBusActions } from './bus.js'

export function createActions(
	state: WingState,
	transitions: WingTransitions,
	send: (cmd: string, argument?: number | string) => void,
	ensureLoaded: (path: string) => void,
): CompanionActionDefinitions {
	const actions = {
		...createOtherActions(send),
		...createChannelActions(state, transitions, send, ensureLoaded),
		...createBusActions(state, transitions, send, ensureLoaded),
	}

	return actions
}
