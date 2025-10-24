import { type SomeCompanionConfigField } from '@companion-module/base'
import { WingDeviceDetectorInstance } from './device-detector.js'
import { ModelChoices, WingModel } from './models/types.js'
// import { ModelChoices, WingModel } from './models/types.js'

export const fadeUpdateRateDefault = 50
export const pollUpdateRateDefault = 3000
export const variableUpdateRateDefault = 100

export const DeskTypes = [
	{ id: 'wing', label: 'Wing' },
	{ id: 'compact', label: 'Wing Compact' },
	{ id: 'rack', label: 'Wing Rack' },
]
export interface WingConfig {
	host?: string
	port?: number
	model?: WingModel
	fadeUpdateRate?: number
	statusPollUpdateRate?: number
	variableUpdateRate?: number
	/** When enabled, the module will request values for all variables on startup */
	prefetchVariablesOnStartup?: boolean
}

export function GetConfigFields(): SomeCompanionConfigField[] {
	return [
		{
			type: 'dropdown',
			id: 'host',
			label: 'Desk IP',
			width: 6,
			choices: WingDeviceDetectorInstance.listKnown().map((d) => ({
				id: d.address,
				label: `${d.address} (${d.deviceName})`,
			})),
			default: '',
			allowCustom: true,
		},
		{
			type: 'dropdown',
			id: 'model',
			label: 'Desk Type',
			tooltip: 'Select the variant of the desk that is connected. Placed for potential future use.',
			width: 6,
			choices: ModelChoices,
			default: WingModel.Full.toString(),
		},
		{
			type: 'checkbox',
			id: 'prefetchVariablesOnStartup',
			label: 'Fetch variables on startup',
			tooltip: 'Request current values for all variables right after connecting to the desk.',
			width: 6,
			default: true,
		},
		{
			type: 'number',
			id: 'fadeUpdateRate',
			label: 'Fader Update Rate',
			tooltip:
				'Update rate of the faders in milliseconds. A lower values makes the transitions smoother but increases system load.',
			width: 5,
			min: 20,
			max: 60000,
			default: fadeUpdateRateDefault,
		},
		{
			type: 'number',
			id: 'statusPollUpdateRate',
			label: 'Status Poll Rate',
			tooltip:
				'Some values need to be actively requested from the desk, this number sets the interval in milliseconds at which those requests occur.',
			width: 5,
			min: 20,
			max: 60000,
			default: pollUpdateRateDefault,
		},
		{
			type: 'number',
			id: 'variableUpdateRate',
			label: 'Variable Update Rate',
			tooltip:
				'Defines how many milliseconds elapse between variable updates. A lower number makes variables more responsive but may decrease system performance.',
			width: 5,
			min: 20,
			max: 60000,
			default: variableUpdateRateDefault,
		},
	]
}
