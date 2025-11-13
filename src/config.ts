import { type SomeCompanionConfigField } from '@companion-module/base'
import { WingDeviceDetectorInstance } from './device-detector.js'
import { ModelChoices, WingModel } from './models/types.js'
import { InstanceBaseExt } from './types.js'
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
	useCcSurfaces?: boolean
	useCcUserPages?: boolean
	ccUserPagesToCreate?: number[]
	useCcGpio?: boolean
	useCcUser?: boolean
	useCcDaw?: boolean
}

export function GetConfigFields(_self: InstanceBaseExt<WingConfig>): SomeCompanionConfigField[] {
	const spacer = {
		type: 'static-text',
		id: 'spacer',
		width: 12,
		label: '',
		value: '',
	} as SomeCompanionConfigField

	function calcUpdateRate(ms: number): number {
		if (ms > 0) {
			const updatesPerSec = 1000 / ms
			return Number.isInteger(updatesPerSec) ? Math.round(updatesPerSec) : Math.round(updatesPerSec * 100) / 100
		}
		return 0
	}

	return [
		{
			type: 'static-text',
			id: 'info',
			width: 12,
			label: 'Information',
			value:
				'This module works with all Berhinger Wing desks. Make sure to have the latest firmware installed. </br>' +
				'You can find the firmware and more information on the <a href="https://www.behringer.com/product.html?modelCode=0603-AEN" target="_blank">official Behringer website</a>',
		},
		spacer,
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
			type: 'static-text',
			id: 'update-rate-info',
			width: 12,
			label: 'Update Rates',
			value:
				'Configure update rates for communication with the console. Update rates are specified in milliseconds (ms).</br>' +
				'Lower values make the module more responsive but may increase system and network load.',
		},
		{
			type: 'number',
			id: 'fadeUpdateRate',
			label: `Fader Update Rate (${calcUpdateRate(_self.config.fadeUpdateRate ?? fadeUpdateRateDefault)} updates/sec)`,
			tooltip:
				'Update rate of the faders in milliseconds. A lower values makes the transitions smoother but increases system load.',
			width: 6,
			min: 20,
			max: 60000,
			default: fadeUpdateRateDefault,
		},
		{
			type: 'number',
			id: 'statusPollUpdateRate',
			label: `Status Poll Rate (${calcUpdateRate(_self.config.statusPollUpdateRate ?? pollUpdateRateDefault)} updates/sec)`,
			tooltip:
				'Some values need to be actively requested from the desk, this number sets the interval in milliseconds at which those requests occur.',
			width: 6,
			min: 20,
			max: 60000,
			default: pollUpdateRateDefault,
		},
		{
			type: 'number',
			id: 'variableUpdateRate',
			label: `Variable Update Rate (${calcUpdateRate(_self.config.variableUpdateRate ?? variableUpdateRateDefault)} updates/sec)`,
			tooltip:
				'Defines how many milliseconds elapse between variable updates. A lower number makes variables more responsive but may decrease system performance.',
			width: 6,
			min: 20,
			max: 60000,
			default: variableUpdateRateDefault,
		},
		{
			type: 'checkbox',
			id: 'prefetchVariablesOnStartup',
			label: 'Fetch variables on startup',
			tooltip: 'Request values for all variables when establishing a connection to a desk.',
			width: 6,
			default: true,
		},
		{
			type: 'checkbox',
			id: 'useCcSurfaces',
			label: 'Enable Custom Control Surfaces (Advanced)',
			tooltip:
				'Master toggle for Custom Control surface support. This is an advanced feature - see documentation for setup details.',
			width: 12,
			default: false,
		},
		{
			type: 'static-text',
			id: 'cc-surfaces-info',
			width: 12,
			label: 'Custom Control Surfaces',
			value:
				'<strong>Advanced Feature:</strong> Creates virtual Satellite surfaces that respond to Custom Control button presses on your Wing console. ' +
				"This allows you to trigger Companion actions directly from the console's CC buttons. " +
				'Requires proper network configuration and Satellite service running. ' +
				'<a href="https://github.com/bitfocus/companion-module-behringer-wing#custom-control-surfaces" target="_blank">View setup documentation</a>',
			isVisible: (config) => config.useCcSurfaces === true,
		},
		{
			type: 'checkbox',
			id: 'useCcUserPages',
			label: 'Enable User Pages (CC)',
			tooltip: 'Create surfaces for User Pages (U1-U16) with encoders and buttons.',
			width: 6,
			default: false,
			isVisible: (config) => config.useCcSurfaces === true,
		},
		{
			type: 'multidropdown',
			id: 'ccUserPagesToCreate',
			label: 'User Pages to Create',
			tooltip: 'Select which User Pages (1-16) to create as CC surfaces.',
			width: 12,
			choices: Array.from({ length: 16 }, (_, i) => ({
				id: i + 1,
				label: `Page ${i + 1}`,
			})),
			default: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
			minSelection: 0,
			isVisible: (config) => config.useCcSurfaces === true && config.useCcUserPages === true,
		},
		{
			type: 'checkbox',
			id: 'useCcGpio',
			label: 'Enable GPIO Buttons',
			tooltip: 'Create surface for GPIO buttons.',
			width: 6,
			default: false,
			isVisible: (config) => config.useCcSurfaces === true,
		},
		{
			type: 'checkbox',
			id: 'useCcUser',
			label: 'Enable User Buttons',
			tooltip: 'Create surface for User buttons (8 buttons).',
			width: 6,
			default: false,
			isVisible: (config) => config.useCcSurfaces === true,
		},
		{
			type: 'checkbox',
			id: 'useCcDaw',
			label: 'Enable DAW Buttons',
			tooltip: 'Create surfaces for DAW buttons (4 sets of 8 buttons).',
			width: 6,
			default: false,
			isVisible: (config) => config.useCcSurfaces === true,
		},
	]
}
