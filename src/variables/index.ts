import { ModelSpec } from '../models/types.js'
import { getAuxVariables } from './auxiliary.js'
import { getBusVariables } from './bus.js'
import { getChannelVariables } from './channel.js'
import { getDcaVariables } from './dca.js'
import { getGpioVariables } from './gpio.js'
import { getMainVariables } from './main.js'
import { getMatrixVariables } from './matrix.js'
import { getMuteGroupVariables } from './mutegroup.js'
import { getShowControlVariables } from './showcontrol.js'
import { getStatusVariables } from './status.js'
import { getTalkbackVariables } from './talkback.js'
import { getUsbVariables } from './usb.js'
import { getWliveVariables } from './wlive.js'

export interface VariableDefinition {
	variableId: string
	name: string
	path?: string
}

export function getAllVariables(model: ModelSpec): VariableDefinition[] {
	const variables = []

	variables.push(...getChannelVariables(model))
	variables.push(...getAuxVariables(model))
	variables.push(...getBusVariables(model))
	variables.push(...getMatrixVariables(model))
	variables.push(...getMainVariables(model))
	variables.push(...getDcaVariables(model))
	variables.push(...getMuteGroupVariables(model))
	variables.push(...getUsbVariables())
	variables.push(...getWliveVariables())
	variables.push(...getShowControlVariables())
	variables.push(...getGpioVariables(model))
	variables.push(...getTalkbackVariables(model))
	variables.push(...getStatusVariables(model))

	return variables
}
