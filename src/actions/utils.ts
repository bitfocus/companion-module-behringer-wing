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

export function getNodeNumberFromID(id: string): number {
	return id.split('/')[2] as unknown as number
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

/**
 * Retrieves a string value from the provided event options, optionally parsing variables if specified.
 *
 * @param self - The instance of the module, providing access to parseVariablesInString.
 * @param event - The action or feedback event containing the options to extract the value from.
 * @param id - The identifier for the option to retrieve.
 * @param defaultValue - An optional default value to return if the result is undefined or empty.
 * @returns A promise that resolves to the resulting string
 */
export async function getStringWithVariables(
	event: CompanionActionInfo | CompanionFeedbackInfo,
	id: string,
	defaultValue?: string,
): Promise<string> {
	const useVariables = event.options[`${id}_use_variables`] as boolean
	let res = ''
	if (useVariables === false || useVariables === undefined) {
		res = event.options[id] as string
	} else if (useVariables === true) {
		res = event.options[`${id}_variables`] as string
	}

	return res ?? defaultValue ?? ''
}

/**
 * Retrieves a numeric value from the provided event options, supporting both direct input and variable substitution.
 *
 * @param self - The instance of the module, providing access to parseVariablesInString
 * @param event - The action or feedback event containing the options to extract the value from.
 * @param id - The identifier for the option to retrieve.
 * @param defaultValue - An optional default value to return if the extracted value is invalid.
 * @returns A promise that resolves to the resulting number
 * @throws If the value is invalid and no default value is provided.
 */
export async function getNumberWithVariables(
	event: CompanionActionInfo | CompanionFeedbackInfo,
	id: string,
	defaultValue?: number,
): Promise<number> {
	const useVariables = event.options[`${id}_use_variables`] as boolean
	let res = 0
	if (useVariables === false || useVariables === undefined) {
		res = Number(event.options[id])
	} else if (useVariables === true) {
		const val = event.options[`${id}_variables`] as string
		res = Number(val)
	}
	if (isNaN(res)) {
		if (defaultValue !== undefined) {
			return defaultValue
		} else {
			throw new Error(`Invalid option '${id}'`)
		}
	}
	return res
}

export async function GetSendSourceDestinationFieldsWithVariables(
	event: CompanionActionInfo | CompanionFeedbackInfo,
): Promise<{ src: string; dest: string }> {
	const useVariables = event.options.send_src_dest_use_variables as boolean
	let src = ''
	let dest = ''
	// print options for debugging
	console.log('Event options:', JSON.stringify(event.options))
	// log useVariables value
	console.log('useVariables:', useVariables, typeof useVariables, useVariables === true)
	if (useVariables === true) {
		src = event.options.send_src_variables as string
		dest = event.options.send_dest_variables as string
	} else {
		src = event.options.src as string
		if (src.startsWith('/main')) {
			dest = event.options.mainDest as string
		} else {
			dest = event.options.dest as string
		}
	}
	// log final src and dest values
	console.log('Final src:', src)
	console.log('Final dest:', dest)
	return { src, dest }
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

export function getInputAutoSourceSwitchCommand(sel: string): string {
	let cmd = ''
	if (sel.startsWith('/ch')) {
		cmd = ChannelCommands.InputAutoSourceSwitch(getNodeNumberFromID(sel))
	} else if (sel.startsWith('/aux')) {
		cmd = AuxCommands.InputAutoSourceSwitch(getNodeNumberFromID(sel))
	}
	return cmd
}

export function getInputAltSourceCommand(sel: string): string {
	let cmd = ''
	if (sel.startsWith('/ch')) {
		cmd = ChannelCommands.InputAltSource(getNodeNumberFromID(sel))
	} else if (sel.startsWith('/aux')) {
		cmd = AuxCommands.InputAltSource(getNodeNumberFromID(sel))
	}
	return cmd
}

export function getMainInputConnectionGroupCommand(sel: string): string {
	let cmd = ''
	if (sel.startsWith('/ch')) {
		cmd = ChannelCommands.MainInputConnectionGroup(getNodeNumberFromID(sel))
	} else if (sel.startsWith('/aux')) {
		cmd = AuxCommands.MainInputConnectionGroup(getNodeNumberFromID(sel))
	}
	return cmd
}

export function getMainInputConnectionIndexCommand(sel: string): string {
	let cmd = ''
	if (sel.startsWith('/ch')) {
		cmd = ChannelCommands.MainInputConnectionIndex(getNodeNumberFromID(sel))
	} else if (sel.startsWith('/aux')) {
		cmd = AuxCommands.MainInputConnectionIndex(getNodeNumberFromID(sel))
	}
	return cmd
}

export function getAltInputConnectionGroupCommand(sel: string): string {
	let cmd = ''
	if (sel.startsWith('/ch')) {
		cmd = ChannelCommands.AltInputConnectionGroup(getNodeNumberFromID(sel))
	} else if (sel.startsWith('/aux')) {
		cmd = AuxCommands.AltInputConnectionGroup(getNodeNumberFromID(sel))
	}
	return cmd
}

export function getAltInputConnectionIndexCommand(sel: string): string {
	let cmd = ''
	if (sel.startsWith('/ch')) {
		cmd = ChannelCommands.AltInputConnectionIndex(getNodeNumberFromID(sel))
	} else if (sel.startsWith('/aux')) {
		cmd = AuxCommands.AltInputConnectionIndex(getNodeNumberFromID(sel))
	}
	return cmd
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

export function getIconCommand(sel: string, val: number): string {
	let cmd = ''
	if (sel.startsWith('/ch')) {
		cmd = ChannelCommands.Icon(val)
	} else if (sel.startsWith('/aux')) {
		cmd = AuxCommands.Icon(val)
	} else if (sel.startsWith('/bus')) {
		cmd = BusCommands.Icon(val)
	} else if (sel.startsWith('/mtx')) {
		cmd = MatrixCommands.Icon(val)
	} else if (sel.startsWith('/main')) {
		cmd = MainCommands.Icon(val)
	} else if (sel.startsWith('/dca')) {
		cmd = DcaCommands.Icon(val)
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

export function getSendMuteCommand(src: string, dest: string): string {
	let cmd = ''
	if (src.startsWith('/ch')) {
		if (dest.startsWith('/bus')) {
			cmd = ChannelCommands.SendOn(getNodeNumberFromID(src), getNodeNumberFromID(dest))
		} else if (dest.startsWith('/mtx')) {
			cmd = ChannelCommands.MatrixSendOn(getNodeNumberFromID(src), getNodeNumberFromID(dest))
		} else if (dest.startsWith('/main')) {
			cmd = ChannelCommands.MainSendOn(getNodeNumberFromID(src), getNodeNumberFromID(dest))
		}
	} else if (src.startsWith('/aux')) {
		if (dest.startsWith('/bus')) {
			cmd = AuxCommands.SendOn(getNodeNumberFromID(src), getNodeNumberFromID(dest))
		} else if (dest.startsWith('/mtx')) {
			cmd = AuxCommands.MatrixSendOn(getNodeNumberFromID(src), getNodeNumberFromID(dest))
		} else if (dest.startsWith('/main')) {
			cmd = AuxCommands.MainSendOn(getNodeNumberFromID(src), getNodeNumberFromID(dest))
		}
	} else if (src.startsWith('/bus')) {
		if (dest.startsWith('/bus')) {
			cmd = BusCommands.SendOn(getNodeNumberFromID(src), getNodeNumberFromID(dest))
		} else if (dest.startsWith('/mtx')) {
			cmd = BusCommands.MatrixSendOn(getNodeNumberFromID(src), getNodeNumberFromID(dest))
		} else if (dest.startsWith('/main')) {
			cmd = BusCommands.MainSendOn(getNodeNumberFromID(src), getNodeNumberFromID(dest))
		}
	} else if (src.startsWith('/main')) {
		if (dest.startsWith('/mtx')) {
			cmd = MainCommands.MatrixSendOn(getNodeNumberFromID(src), getNodeNumberFromID(dest))
		}
	}
	return cmd
}

export function getSendLevelCommand(src: string, dest: string): string {
	let cmd = ''
	if (src.startsWith('/ch')) {
		if (dest.startsWith('/bus')) {
			cmd = ChannelCommands.SendLevel(getNodeNumberFromID(src), getNodeNumberFromID(dest))
		} else if (dest.startsWith('/mtx')) {
			cmd = ChannelCommands.MatrixSendLevel(getNodeNumberFromID(src), getNodeNumberFromID(dest))
		} else if (dest.startsWith('/main')) {
			cmd = ChannelCommands.MainSendLevel(getNodeNumberFromID(src), getNodeNumberFromID(dest))
		}
	} else if (src.startsWith('/aux')) {
		if (dest.startsWith('/bus')) {
			cmd = AuxCommands.SendLevel(getNodeNumberFromID(src), getNodeNumberFromID(dest))
		} else if (dest.startsWith('/mtx')) {
			cmd = AuxCommands.MatrixSendLevel(getNodeNumberFromID(src), getNodeNumberFromID(dest))
		} else if (dest.startsWith('/main')) {
			cmd = AuxCommands.MainSendLevel(getNodeNumberFromID(src), getNodeNumberFromID(dest))
		}
	} else if (src.startsWith('/bus')) {
		if (dest.startsWith('/bus')) {
			cmd = BusCommands.SendLevel(getNodeNumberFromID(src), getNodeNumberFromID(dest))
		} else if (dest.startsWith('/mtx')) {
			cmd = BusCommands.MatrixSendLevel(getNodeNumberFromID(src), getNodeNumberFromID(dest))
		} else if (dest.startsWith('/main')) {
			cmd = BusCommands.MainSendLevel(getNodeNumberFromID(src), getNodeNumberFromID(dest))
		}
	} else if (src.startsWith('/main')) {
		if (dest.startsWith('/mtx')) {
			cmd = MainCommands.MatrixSendLevel(getNodeNumberFromID(src), getNodeNumberFromID(dest))
		}
	}
	return cmd
}

export function getSendPanoramaCommand(src: string, dest: string): string {
	let cmd = ''
	if (src.startsWith('/ch')) {
		if (dest.startsWith('/bus')) {
			cmd = ChannelCommands.SendPan(getNodeNumberFromID(src), getNodeNumberFromID(dest))
		} else if (dest.startsWith('/mtx')) {
			cmd = ChannelCommands.MatrixSendPan(getNodeNumberFromID(src), getNodeNumberFromID(dest))
		}
	} else if (src.startsWith('/aux')) {
		if (dest.startsWith('/bus')) {
			cmd = AuxCommands.SendPan(getNodeNumberFromID(src), getNodeNumberFromID(dest))
		} else if (dest.startsWith('/mtx')) {
			cmd = AuxCommands.MatrixSendPan(getNodeNumberFromID(src), getNodeNumberFromID(dest))
		}
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

export function getGateEnableCommand(sel: string, val: number): string {
	let cmd = ''
	if (sel.startsWith('/ch')) {
		cmd = ChannelCommands.GateOn(val)
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

export function getDynamicsEnableCommand(sel: string, val: number): string {
	let cmd = ''
	if (sel.startsWith('/ch')) {
		cmd = ChannelCommands.DynamicsOn(val)
	} else if (sel.startsWith('/aux')) {
		cmd = AuxCommands.DynamicsOn(val)
	} else if (sel.startsWith('/bus')) {
		cmd = BusCommands.DynamicsOn(val)
	} else if (sel.startsWith('/mtx')) {
		cmd = MatrixCommands.DynamicsOn(val)
	} else if (sel.startsWith('/main')) {
		cmd = MainCommands.DynamicsOn(val)
	}
	return cmd
}

export function getSetOrToggleValue(cmd: string, val: number, state: WingState, invert?: boolean): number {
	const inv = invert ?? false
	if (val <= -1) {
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

export function getStripIndexFromString(sel: string): number {
	const channelIndex = -1
	if (sel === 'current') {
		return channelIndex
	} else if (sel == 'off') {
		return 0
	} else {
		// is a channel path, get channel type and index using regex
		const match = sel.match(/^\/(ch|aux|bus|main|mtx)\/(\d+)$/)
		if (match) {
			const channelType = match[1]
			const channelNumber = match[2] ? parseInt(match[2]) : 0
			switch (channelType) {
				case 'ch':
					return channelNumber
				case 'aux':
					return 40 + channelNumber // Aux channels start at 40
				case 'bus':
					return 48 + channelNumber // Bus channels start at 48
				case 'main':
					return 64 + channelNumber // Main channels start at 64
				case 'mtx':
					return 68 + channelNumber // Matrix channels start at 68
			}
		}
	}
	return 0
}

export function getStringFromStripIndex(index: number): string {
	if (index === -1) {
		return 'current'
	} else if (index === 0) {
		return 'off'
	} else if (index >= 1 && index <= 32) {
		return `/ch/${index}`
	} else if (index >= 40 && index <= 47) {
		return `/aux/${index - 40}`
	} else if (index >= 48 && index <= 63) {
		return `/bus/${index - 48}`
	} else if (index >= 64 && index <= 67) {
		return `/main/${index - 64}`
	} else if (index >= 68 && index <= 71) {
		return `/mtx/${index - 68}`
	}
	return ''
}
