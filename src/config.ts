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

	useCcSurfaces?: boolean
	showCcTutorial?: boolean
	useCcUserPages?: boolean
	ccUserPagesToCreate?: number[]
	useCcGpio?: boolean
	useCcUser?: boolean
	useCcDaw?: boolean

	// Advanced Option
	requestTimeout?: number
	panicOnLostRequest?: boolean
	subscriptionInterval?: number

	enableOscForwarding?: boolean
	oscForwardingHost?: string
	oscForwardingPort?: number

	debugMode?: boolean
}

export function GetConfigFields(_self: InstanceBaseExt<WingConfig>): SomeCompanionConfigField[] {
	const spacer = { type: 'static-text', id: 'spacer', width: 12, label: '', value: '' } as SomeCompanionConfigField

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
				'This module works with all Behringer Wing desks. Make sure to have the latest firmware installed. </br>' +
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
			id: 'useCcSurfaces',
			label: 'Enable Virtual Control Surfaces',
			tooltip:
				'Master toggle for Virtual Control surface support. This is an advanced feature - see tutorial below for setup details.',
			width: 12,
			default: false,
		},
		{
			type: 'static-text',
			id: 'cc-surfaces-info',
			width: 12,
			label: 'Advanced Feature',
			value:
				'Creates virtual Satellite surfaces that respond to Custom Control button presses on your Wing console. ' +
				"This allows you to trigger Companion actions directly from the console's CC buttons. ",
			isVisibleExpression: `$(options:useCcSurfaces) == true`,
		},
		{
			type: 'checkbox',
			id: 'showCcTutorial',
			label: 'Show Tutorial',
			tooltip: 'Display detailed setup instructions for Custom Control Surfaces.',
			width: 12,
			default: false,
			isVisibleExpression: `$(options:useCcSurfaces) == true`,
		},
		{
			type: 'static-text',
			id: 'cc-tutorial',
			width: 12,
			label: 'Setup Tutorial',
			value:
				'<h3>How It Works</h3>' +
				'<p>When you press a Custom Control button on your Wing console, the corresponding button press is sent to Companion, where you can program any action you want.</p>' +
				'<h3>Configuration Steps</h3>' +
				'<ol>' +
				'<li><strong>Enable Custom Control Surfaces</strong> - Check the master toggle above</li>' +
				'<li><strong>Select Surface Types</strong> - Choose which surface types you want to create:' +
				'<ul>' +
				'<li><strong>User Pages (CC)</strong> - Creates surfaces for User Pages (U1-U16) with encoders and buttons. You can select specific pages to create (1-16).</li>' +
				'<li><strong>GPIO Buttons</strong> - Creates a surface for GPIO buttons</li>' +
				'<li><strong>User Buttons</strong> - Creates a surface for User buttons (8 buttons)</li>' +
				'<li><strong>DAW Buttons</strong> - Creates surfaces for DAW buttons (4 sets of 8 buttons)</li>' +
				'</ul>' +
				'</li>' +
				"<li><strong>Configure in Companion</strong> - After enabling, the surfaces will appear in Companion's <strong>Surfaces</strong> tab where you can assign them to pages</li>" +
				'</ol>' +
				'<h3>Recommended Page Mapping</h3>' +
				'<p>It is advisable to dedicate one Companion page per Wing User Page surface. This provides a clear one-to-one relationship between your console and Companion.</p>' +
				'<p><strong>In the Surfaces section:</strong></p>' +
				'<ul>' +
				'<li>Assign each surface to a page number with a matching last digit. Deactivate "Use last page at startup" and select the desired page number for "Startup Page" and "Current Page"</li>' +
				'<li>For example:' +
				'<ul>' +
				'<li><code>WING_CC_01</code> → Page 71</li>' +
				'<li><code>WING_CC_02</code> → Page 72</li>' +
				'<li><code>WING_CC_03</code> → Page 73</li>' +
				'<li>And so on...</li>' +
				'</ul>' +
				'</li>' +
				'</ul>' +
				'<p>This numbering scheme makes it easy to identify which Companion page corresponds to which User Page on your Wing console.</p>' +
				'<p><strong>In the Buttons section:</strong></p>' +
				'<ul>' +
				'<li>Configure the actual button actions for each page (e.g. 71) in the "Buttons" section of Companion</li>' +
				'</ul>' +
				'<h3>Requirements</h3>' +
				'<ul>' +
				'<li><strong>Important:</strong> On the Wing console, each Custom Control button must have a MIDI command assigned for it to send OSC event updates to Companion. The same MIDI command can be used for all buttons.</li>' +
				'</ul>',
			isVisibleExpression: `$(options:useCcSurfaces) == true && $(options:showCcTutorial) == true`,
		},
		{
			type: 'checkbox',
			id: 'useCcUserPages',
			label: 'Enable User Pages (CC)',
			tooltip: 'Create surfaces for User Pages (U1-U16) with encoders and buttons.',
			width: 6,
			default: false,
			isVisibleExpression: `$(options:useCcSurfaces) == true`,
		},
		{
			type: 'multidropdown',
			id: 'ccUserPagesToCreate',
			label: 'User Pages to Create',
			tooltip: 'Select which User Pages (1-16) to create as virtual surfaces.',
			width: 12,
			choices: Array.from({ length: 16 }, (_, i) => ({
				id: i + 1,
				label: `CC Page ${i + 1}`,
			})),
			default: [16],
			minSelection: 0,
			isVisibleExpression: `$(options:useCcSurfaces) == true && $(options:useCcUserPages) == true`,
		},
		{
			type: 'checkbox',
			id: 'useCcGpio',
			label: 'Enable GPIO Buttons',
			tooltip: 'Create a virtual surface for GPIO buttons.',
			width: 6,
			default: false,
			isVisibleExpression: `$(options:useCcSurfaces) == true`,
		},
		{
			type: 'checkbox',
			id: 'useCcUser',
			label: 'Enable User Buttons',
			tooltip: 'Create a virtual surface for User buttons (8 buttons).',
			width: 6,
			default: false,
			isVisibleExpression: `$(options:useCcSurfaces) == true`,
		},
		{
			type: 'checkbox',
			id: 'useCcDaw',
			label: 'Enable DAW Buttons',
			tooltip: 'Create virtual surfaces for DAW buttons (4 sets of 8 buttons).',
			width: 6,
			default: false,
			isVisibleExpression: `$(options:useCcSurfaces) == true`,
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
			isVisibleExpression: `$(options:show-advanced-options) == true`,
		},
		{
			type: 'checkbox',
			id: 'panicOnLostRequest',
			label: 'Panic on lost request',
			tooltip:
				'If enabled, the module will log an error when a sent command does not receive a response within the specified timeframe.',
			width: 6,
			default: false,
			isVisibleExpression: `$(options:show-advanced-options) == true`,
		},
		{
			type: 'number',
			id: 'subscriptionInterval',
			label: 'Subscription Interval (ms)',
			tooltip: 'Time in milliseconds to wait between subscription requests.',
			width: 6,
			min: 100,
			max: 9999,
			default: 9000,
			isVisibleExpression: `$(options:show-advanced-options) == true`,
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
			isVisibleExpression: `$(options:show-advanced-options) == true`,
		},
		{
			type: 'checkbox',
			id: 'enableOscForwarding',
			label: 'Enable OSC Forwarding',
			tooltip: 'Forward all received OSC messages to another OSC endpoint',
			width: 12,
			default: false,
			isVisibleExpression: `$(options:show-advanced-options) == true`,
		},
		{
			type: 'textinput',
			id: 'oscForwardingHost',
			label: 'OSC Forwarding Host',
			tooltip: 'IP address or hostname to forward OSC messages to',
			width: 6,
			default: '',
			isVisibleExpression: `$(options:enableOscForwarding) == true && $(options:show-advanced-options) == true`,
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
			isVisibleExpression: `$(options:enableOscForwarding) == true && $(options:show-advanced-options) == true`,
		},
		spacer,
		{
			type: 'static-text',
			id: 'debug-mode-info',
			width: 12,
			label: 'Debug Mode',
			value:
				'Enables detailed logging including timestamps and source location information. </br>' +
				'Useful for troubleshooting and development purposes.',
			isVisibleExpression: `$(options:show-advanced-options) == true`,
		},
		{
			type: 'checkbox',
			id: 'debugMode',
			label: 'Enable Debug Mode',
			tooltip: 'Enable detailed logging including timestamps and source location information',
			width: 12,
			default: false,
			isVisibleExpression: `$(options:show-advanced-options) == true`,
		},
	]
}
