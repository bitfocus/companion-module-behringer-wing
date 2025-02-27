import { WingTransitions } from '../transitions.js'
import { WingState } from '../state/index.js'
import { CompanionActionInfo, CompanionFeedbackInfo } from '@companion-module/base'
import { Easing } from '../easings.js'
import * as StateUtils from '../state/utils.js'
import { ChannelCommands } from '../commands/channel.js'
import { AuxCommands } from '../commands/aux.js'
import { BusCommands } from '../commands/bus.js'
import { MatrixCommands } from '../commands/matrix.js'
import { MainCommands } from '../commands/main.js'

export function getNodeNumber(action: CompanionActionInfo | CompanionFeedbackInfo, id: string): number {
	return action.options[id]?.toString().split('/')[2] as unknown as number
}

export function getNumber(action: CompanionActionInfo, key: string, defaultValue?: number): number {
	const rawVal = action.options[key]
	if (defaultValue !== undefined && rawVal === undefined) {
		return defaultValue
	}
	const val = Number(rawVal)
	if (isNaN(val)) {
		throw new Error(`Invalid option '${key}'`)
	}
	return val
}

const getAlgorithm = (action: CompanionActionInfo, key: string): Easing.algorithm | undefined => {
	const rawVal = action.options[key]
	if (rawVal === undefined) {
		return rawVal
	}
	return rawVal as Easing.algorithm
}

const getCurve = (action: CompanionActionInfo, key: string): Easing.curve | undefined => {
	const rawVal = action.options[key]
	if (rawVal === undefined) {
		return rawVal
	}
	return rawVal as Easing.curve
}

export function getString(action: CompanionActionInfo, key: string, defaultValue?: string): string {
	const rawVal = action.options[key]
	if (defaultValue !== undefined && rawVal === undefined) {
		return defaultValue
	}
	const val = rawVal as string
	return val
}

export function runTransition(
	cmd: string,
	valueId: string,
	action: CompanionActionInfo,
	state: WingState,
	transitions: WingTransitions,
	targetValue?: number,
): void {
	const current = StateUtils.getNumberFromState(cmd, state)
	const target = targetValue ?? getNumber(action, valueId)
	transitions.run(
		cmd,
		current as number,
		target,
		getNumber(action, 'fadeDuration'),
		getAlgorithm(action, 'fadeAlgorithm'),
		getCurve(action, 'fadeType'),
	)
	state.set(cmd, [{ type: 'f', value: target }])
}

export function getColorCommand(sel: string, val: number): string {
	let cmd = ''
	if (sel.startsWith('/ch')) {
		cmd = ChannelCommands.Color(val)
	} else if (sel.startsWith('/aux')) {
		cmd = AuxCommands.Color(val)
	} else if (sel.startsWith('/bus')) {
		cmd = BusCommands.Color(val)
	} else if (sel.startsWith('/mtx')) {
		cmd = MatrixCommands.Color(val)
	} else if (sel.startsWith('/main')) {
		cmd = MainCommands.Color(val)
	}
	return cmd
}

export function getNameCommand(sel: string, val: number): string {
	let cmd = ''
	if (sel.startsWith('/ch')) {
		cmd = ChannelCommands.Name(val)
	} else if (sel.startsWith('/aux')) {
		cmd = AuxCommands.Name(val)
	} else if (sel.startsWith('/bus')) {
		cmd = BusCommands.Name(val)
	} else if (sel.startsWith('/mtx')) {
		cmd = MatrixCommands.Name(val)
	} else if (sel.startsWith('/main')) {
		cmd = MainCommands.Name(val)
	}
	return cmd
}

export function getGainCommand(sel: string, val: number): string {
	let cmd = ''
	if (sel.startsWith('/ch')) {
		cmd = ChannelCommands.InputGain(val)
	} else if (sel.startsWith('/aux')) {
		cmd = AuxCommands.InputGain(val)
	}
	return cmd
}

export function getMuteCommand(sel: string, val: number): string {
	let cmd = ''
	if (sel.startsWith('/ch')) {
		cmd = ChannelCommands.Mute(val)
	} else if (sel.startsWith('/aux')) {
		cmd = AuxCommands.Mute(val)
	} else if (sel.startsWith('/bus')) {
		cmd = BusCommands.Mute(val)
	} else if (sel.startsWith('/mtx')) {
		cmd = MatrixCommands.Mute(val)
	} else if (sel.startsWith('/main')) {
		cmd = MainCommands.Mute(val)
	}
	return cmd
}

export function getFaderCommand(sel: string, val: number): string {
	let cmd = ''
	if (sel.startsWith('/ch')) {
		cmd = ChannelCommands.Fader(val)
	} else if (sel.startsWith('/aux')) {
		cmd = AuxCommands.Fader(val)
	} else if (sel.startsWith('/bus')) {
		cmd = BusCommands.Fader(val)
	} else if (sel.startsWith('/mtx')) {
		cmd = MatrixCommands.Fader(val)
	} else if (sel.startsWith('/main')) {
		cmd = MainCommands.Fader(val)
	}
	return cmd
}

export function getPanoramaCommand(sel: string, val: number): string {
	let cmd = ''
	if (sel.startsWith('/ch')) {
		cmd = ChannelCommands.Pan(val)
	} else if (sel.startsWith('/aux')) {
		cmd = AuxCommands.Pan(val)
	} else if (sel.startsWith('/bus')) {
		cmd = BusCommands.Pan(val)
	} else if (sel.startsWith('/mtx')) {
		cmd = MatrixCommands.Pan(val)
	} else if (sel.startsWith('/main')) {
		cmd = MainCommands.Pan(val)
	}
	return cmd
}

export function getSendMuteCommand(sel: string, src: number, dest: number): string {
	let cmd = ''
	if (sel.startsWith('/ch')) {
		cmd = ChannelCommands.SendOn(src, dest)
	} else if (sel.startsWith('/aux')) {
		cmd = AuxCommands.SendOn(src, dest)
	} else if (sel.startsWith('/bus')) {
		cmd = BusCommands.SendOn(src, dest)
	}
	return cmd
}

export function getSendLevelCommand(sel: string, src: number, dest: number): string {
	let cmd = ''
	if (sel.startsWith('/ch')) {
		cmd = ChannelCommands.SendLevel(src, dest)
	} else if (sel.startsWith('/aux')) {
		cmd = AuxCommands.SendLevel(src, dest)
	} else if (sel.startsWith('/bus')) {
		cmd = BusCommands.SendLevel(src, dest)
	}
	return cmd
}

export function getSendPanoramaCommand(sel: string, src: number, dest: number): string {
	let cmd = ''
	if (sel.startsWith('/ch')) {
		cmd = ChannelCommands.SendPan(src, dest)
	} else if (sel.startsWith('/aux')) {
		cmd = AuxCommands.SendPan(src, dest)
	}
	return cmd
}
