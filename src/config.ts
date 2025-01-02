import { type SomeCompanionConfigField } from '@companion-module/base'
import { WingDeviceDetectorInstance } from './device-detector.js'
// import { ModelChoices, WingModel } from './models/types.js'

export const fadeUpdateRateDefault = 50

export const DeskTypes = [
	{ id: 'wing', label: 'Wing' },
	{ id: 'compact', label: 'Wing Compact' },
	{ id: 'rack', label: 'Wing Rack' },
]
export interface WingConfig {
	host?: string
	port?: number
	fadeUpdateRate?: number
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
		// {
		// 	type: 'dropdown',
		// 	id: 'model',
		// 	label: 'Desk Type',
		// 	width: 6,
		// 	choices: ModelChoices,
		// 	default: WingModel.Full.toString(),
		// },
		{
			type: 'number',
			id: 'fadeUpdateRate',
			label: 'Fader Update Rate',
			tooltip:
				'Update rate of the faders in milliseconds. A lower values makes the transition smoother but increases system load.',
			width: 5,
			min: 20,
			max: 60000,
			default: fadeUpdateRateDefault,
		},
	]
}
