import { type SomeCompanionConfigField } from '@companion-module/base'
import { WingDeviceDetectorInstance } from './handlers/device-detector.js'
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
	model?: WingModel
	fadeUpdateRate?: number
	statusPollUpdateRate?: number
	variableUpdateRate?: number
	/** When enabled, the module will request values for all variables on startup */
	prefetchVariablesOnStartup?: boolean

	// Advanced Option
	requestTimeout?: number
	panicOnLostRequest?: boolean
	subscriptionInterval?: number

	enableOscForwarding?: boolean
	oscForwardingHost?: string
	oscForwardingPort?: number
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
		spacer,
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
			label: `Fader Update Rate (${calcUpdateRate(_self.config?.fadeUpdateRate ?? fadeUpdateRateDefault)} updates/sec)`,
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
			label: `Status Poll Rate (${calcUpdateRate(_self.config?.statusPollUpdateRate ?? pollUpdateRateDefault)} updates/sec)`,
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
			label: `Variable Update Rate (${calcUpdateRate(_self.config?.variableUpdateRate ?? variableUpdateRateDefault)} updates/sec)`,
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
		spacer,
		{
			type: 'checkbox',
			id: 'show-advanced-options',
			label: 'Show advanced options',
			tooltip:
				'Show advanced configuration options. There is no guarantee that these options will work in any combination.',
			width: 12,
			default: false,
		},
		{
			type: 'number',
			id: 'requestTimeout',
			label: 'Request Timeout (ms)',
			tooltip: 'Time in milliseconds to wait for a response to a sent command before considering it lost.',
			width: 6,
			min: 50,
			max: 10000,
			default: 200,
			isVisible: (configValues) => configValues['show-advanced-options'] === true,
		},
		{
			type: 'checkbox',
			id: 'panicOnLostRequest',
			label: 'Panic on lost request',
			tooltip:
				'If enabled, the module will log an error when a sent command does not receive a response within the specified timeframe.',
			width: 6,
			default: false,
			isVisible: (configValues) => configValues['show-advanced-options'] === true,
		},
		{
			type: 'number',
			id: 'subscriptionInterval',
			label: 'Subscription Interval (ms)',
			tooltip: 'Time in milliseconds to wait between subscription requests.',
			width: 6,
			min: 100,
			max: 9999,
			default: 200,
			isVisible: (configValues) => configValues['show-advanced-options'] === true,
		},
		spacer,
		{
			type: 'static-text',
			id: 'osc-forwarding-info',
			width: 12,
			label: 'OSC Forwarding',
			value:
				'Allows forwarding all received OSC messages to another OSC endpoint. </br>' +
				'This can be useful if you want to use multiple OSC clients that rely on subscription data.',
			isVisible: (config) => config['show-advanced-options'] === true,
		},
		{
			type: 'checkbox',
			id: 'enableOscForwarding',
			label: 'Enable OSC Forwarding',
			tooltip: 'Forward all received OSC messages to another OSC endpoint',
			width: 12,
			default: false,
			isVisible: (config) => config['show-advanced-options'] === true,
		},
		{
			type: 'textinput',
			id: 'oscForwardingHost',
			label: 'OSC Forwarding Host',
			tooltip: 'IP address or hostname to forward OSC messages to',
			width: 6,
			default: '',
			isVisible: (config) => config.enableOscForwarding === true && config['show-advanced-options'] === true,
		},
		{
			type: 'number',
			id: 'oscForwardingPort',
			label: 'OSC Forwarding Port',
			tooltip: 'Port number to forward OSC messages to',
			width: 6,
			min: 1,
			max: 65535,
			default: 2223,
			isVisible: (config) => config.enableOscForwarding === true && config['show-advanced-options'] === true,
		},
	]
}
