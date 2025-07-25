import { WingTransitions } from '../transitions.js'
import { StateUtil, WingState } from '../state/index.js'
import { CompanionActionInfo, CompanionFeedbackInfo } from '@companion-module/base'
import { Easing } from '../easings.js'
import * as StateUtils from '../state/utils.js'
import { ChannelCommands } from '../commands/channel.js'
import { AuxCommands } from '../commands/auxes.js'
import { BusCommands } from '../commands/bus.js'
import { MatrixCommands } from '../commands/matrix.js'
import { MainCommands } from '../commands/main.js'
import { DcaCommands } from '../commands/dca.js'
import { MuteGroupCommands } from '../commands/mutegroup.js'
import { ConfigurationCommands } from '../commands/config.js'

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
	mapLinearToDb?: boolean,
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
		mapLinearToDb,
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
	} else if (sel.startsWith('/dca')) {
		cmd = DcaCommands.Color(val)
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
	} else if (sel.startsWith('/dca')) {
		cmd = DcaCommands.Name(val)
	} else if (sel.startsWith('/mute')) {
		cmd = MuteGroupCommands.Name(val)
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
	} else if (sel.startsWith('/dca')) {
		cmd = DcaCommands.Mute(val)
	} else if (sel.startsWith('/mgrp')) {
		cmd = MuteGroupCommands.Mute(val)
	}
	return cmd
}

export function getSoloCommand(sel: string, val: number): string {
	let cmd = ''
	if (sel.startsWith('/ch')) {
		cmd = ChannelCommands.Solo(val)
	} else if (sel.startsWith('/aux')) {
		cmd = AuxCommands.Solo(val)
	} else if (sel.startsWith('/bus')) {
		cmd = BusCommands.Solo(val)
	} else if (sel.startsWith('/mtx')) {
		cmd = MatrixCommands.Solo(val)
	} else if (sel.startsWith('/main')) {
		cmd = MainCommands.Solo(val)
	} else if (sel.startsWith('/dca')) {
		cmd = DcaCommands.Solo(val)
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
	} else if (sel.startsWith('/dca')) {
		cmd = DcaCommands.Fader(val)
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

export function getDelayOnCommand(sel: string, val: number): string {
	let cmd = ''
	if (sel.startsWith('/ch')) {
		cmd = ChannelCommands.DelayOn(val)
	} else if (sel.startsWith('/bus')) {
		cmd = BusCommands.DelayOn(val)
	} else if (sel.startsWith('/mtx')) {
		cmd = MatrixCommands.DelayOn(val)
	} else if (sel.startsWith('/main')) {
		cmd = MainCommands.DelayOn(val)
	}
	return cmd
}

export function getDelayModeCommand(sel: string, val: number): string {
	let cmd = ''
	if (sel.startsWith('/ch')) {
		cmd = ChannelCommands.DelayMode(val)
	} else if (sel.startsWith('/bus')) {
		cmd = BusCommands.DelayMode(val)
	} else if (sel.startsWith('/mtx')) {
		cmd = MatrixCommands.DelayMode(val)
	} else if (sel.startsWith('/main')) {
		cmd = MainCommands.DelayMode(val)
	}
	return cmd
}

export function getDelayAmountCommand(sel: string, val: number): string {
	let cmd = ''
	if (sel.startsWith('/ch')) {
		cmd = ChannelCommands.DelayAmount(val)
	} else if (sel.startsWith('/bus')) {
		cmd = BusCommands.DelayAmount(val)
	} else if (sel.startsWith('/mtx')) {
		cmd = MatrixCommands.DelayAmount(val)
	} else if (sel.startsWith('/main')) {
		cmd = MainCommands.DelayAmount(val)
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

export function getMainSendLevelCommand(sel: string, src: number, dest: number): string {
	let cmd = ''
	if (sel.startsWith('/ch')) {
		cmd = ChannelCommands.MainSendLevel(src, dest)
	} else if (sel.startsWith('/aux')) {
		cmd = AuxCommands.MainSendLevel(src, dest)
	} else if (sel.startsWith('/bus')) {
		cmd = BusCommands.MainSendLevel(src, dest)
	}
	return cmd
}

export function getMainSendMuteCommand(sel: string, src: number, dest: number): string {
	let cmd = ''
	if (sel.startsWith('/ch')) {
		cmd = ChannelCommands.MainSendOn(src, dest)
	} else if (sel.startsWith('/aux')) {
		cmd = AuxCommands.MainSendOn(src, dest)
	} else if (sel.startsWith('/bus')) {
		cmd = BusCommands.MainSendOn(src, dest)
	}
	return cmd
}

export function getScribblelightCommand(sel: string, val: number): string {
	let cmd = ''
	if (sel.startsWith('/ch')) {
		cmd = ChannelCommands.ScribbleLight(val)
	} else if (sel.startsWith('/aux')) {
		cmd = AuxCommands.ScribbleLight(val)
	} else if (sel.startsWith('/bus')) {
		cmd = BusCommands.ScribbleLight(val)
	} else if (sel.startsWith('/mtx')) {
		cmd = MatrixCommands.ScribbleLight(val)
	} else if (sel.startsWith('/main')) {
		cmd = MainCommands.ScribbleLight(val)
	} else if (sel.startsWith('/dca')) {
		cmd = DcaCommands.ScribbleLight(val)
	}
	return cmd
}

export function getTalkbackAssignCommand(talkback: string, destination: string): string {
	let cmd = ''
	const num = destination.split('/')[2] as unknown as number
	if (destination.startsWith('/bus')) {
		cmd = ConfigurationCommands.TalkbackBusAssign(talkback, num)
	} else if (destination.startsWith('/mtx')) {
		cmd = ConfigurationCommands.TalkbackMatrixAssign(talkback, num)
	} else if (destination.startsWith('/main')) {
		cmd = ConfigurationCommands.TalkbackMainAssign(talkback, num)
	}
	return cmd
}

export function getEqEnableCommand(sel: string, val: number): string {
	let cmd = ''
	if (sel.startsWith('/ch')) {
		cmd = ChannelCommands.EqOn(val)
	} else if (sel.startsWith('/aux')) {
		cmd = AuxCommands.EqOn(val)
	} else if (sel.startsWith('/bus')) {
		cmd = BusCommands.EqOn(val)
	} else if (sel.startsWith('/mtx')) {
		cmd = MatrixCommands.EqOn(val)
	} else if (sel.startsWith('/main')) {
		cmd = MainCommands.EqOn(val)
	}
	return cmd
}

export function getSetOrToggleValue(cmd: string, val: number, state: WingState, invert?: boolean): number {
	const inv = invert ?? false
	if (val >= 2) {
		const currentVal = StateUtil.getBooleanFromState(cmd, state)
		return Number(!currentVal)
	}
	if (inv) return Number(!val)
	else return Number(val)
}

export function getMatrixSendLevelCommand(sel: string, src: number, dest: number): string {
	let cmd = ''
	if (sel.startsWith('/ch')) {
		cmd = ChannelCommands.MatrixSendLevel(src, dest)
	} else if (sel.startsWith('/aux')) {
		cmd = AuxCommands.MatrixSendLevel(src, dest)
	} else if (sel.startsWith('/bus')) {
		cmd = BusCommands.MatrixSendLevel(src, dest)
	} else if (sel.startsWith('/main')) {
		cmd = MainCommands.MatrixSendLevel(src, dest)
	}
	return cmd
}

export function getMatrixSendPanoramaCommand(sel: string, src: number, dest: number): string {
	let cmd = ''
	if (sel.startsWith('/ch')) {
		cmd = ChannelCommands.MatrixSendPan(src, dest)
	} else if (sel.startsWith('/aux')) {
		cmd = AuxCommands.MatrixSendPan(src, dest)
	} else if (sel.startsWith('/bus')) {
		cmd = BusCommands.MatrixSendPan(src, dest)
	} else if (sel.startsWith('/main')) {
		cmd = MainCommands.MatrixSendPan(src, dest)
	}
	return cmd
}

export function getPreInsertOnCommand(sel: string, val: number): string {
	let cmd = ''
	if (sel.startsWith('/ch')) {
		cmd = ChannelCommands.PreInsertOn(val)
	} else if (sel.startsWith('/aux')) {
		cmd = AuxCommands.PreInsertOn(val)
	} else if (sel.startsWith('/bus')) {
		cmd = BusCommands.PreInsertOn(val)
	} else if (sel.startsWith('/mtx')) {
		cmd = MatrixCommands.PreInsertOn(val)
	} else if (sel.startsWith('/main')) {
		cmd = MainCommands.PreInsertOn(val)
	}
	return cmd
}

export function getPostInsertCommand(sel: string, val: number): string {
	let cmd = ''
	if (sel.startsWith('/ch')) {
		cmd = ChannelCommands.PostInsertOn(val)
	} else if (sel.startsWith('/bus')) {
		cmd = BusCommands.PostInsertOn(val)
	} else if (sel.startsWith('/mtx')) {
		cmd = MatrixCommands.PostInsertOn(val)
	} else if (sel.startsWith('/main')) {
		cmd = MainCommands.PostInsertOn(val)
	}
	return cmd
}
