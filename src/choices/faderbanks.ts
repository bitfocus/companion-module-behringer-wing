import {
	// CompanionInputFieldNumber,
	CompanionOptionValues,
	DropdownChoice,
	SomeCompanionActionInputField,
	// CompanionInputFieldNumber,
} from '@companion-module/base'

interface LayerConfig {
	id: number
	label: string
}

interface BankConfig {
	name: string
	maxOffset?: number
	offsetLayers?: number
	layers: LayerConfig[]
}

export const LayerBankOptions: Record<string, BankConfig> = {
	left: {
		name: 'Left',
		layers: [
			{ id: 1, label: 'Channel 1-12' },
			{ id: 2, label: 'Channel 13-24' },
			{ id: 3, label: 'Channel 25-36' },
			{ id: 4, label: 'Channel 36-40 / Aux 1-8' },
			{ id: 5, label: 'Bus 1-12' },
			{ id: 6, label: 'User 1' },
			{ id: 7, label: 'User 2' },
			{ id: 10, label: 'Channel 1-8' },
			{ id: 11, label: 'Channel 9-16' },
			{ id: 12, label: 'Channel 17-24' },
			{ id: 13, label: 'Channel 25-32' },
			{ id: 14, label: 'Channel 33-40' },
			{ id: 15, label: 'Aux 1-8' },
			{ id: 16, label: 'Bus 1-8' },
			{ id: 17, label: 'Bus 9-16' },
			{ id: 18, label: 'Main 1-4' },
			{ id: 19, label: 'Matrix 1-8' },
			{ id: 20, label: 'DCA 1-8' },
			{ id: 21, label: 'DCA 9-16' },
			{ id: 22, label: 'Spill' },
		],
		offsetLayers: 7,
		maxOffset: 12,
	},
	center: {
		name: 'Center',
		layers: [
			{ id: 1, label: 'DCA' },
			{ id: 2, label: 'Main / Matrix' },
			{ id: 3, label: 'Aux / FX' },
			{ id: 4, label: 'Bus / Master' },
			{ id: 5, label: 'User 1' },
			{ id: 6, label: 'User 2' },
			{ id: 10, label: 'Channel 1-8' },
			{ id: 11, label: 'Channel 9-16' },
			{ id: 12, label: 'Channel 17-24' },
			{ id: 13, label: 'Channel 25-32' },
			{ id: 14, label: 'Channel 33-40' },
			{ id: 15, label: 'Aux 1-8' },
			{ id: 16, label: 'Bus 1-8' },
			{ id: 17, label: 'Bus 9-16' },
			{ id: 18, label: 'Main 1-4' },
			{ id: 19, label: 'Matrix 1-8' },
			{ id: 20, label: 'DCA 1-8' },
			{ id: 21, label: 'DCA 9-16' },
			{ id: 22, label: 'Spill' },
		],
		offsetLayers: 6,
		maxOffset: 8,
	},
	right: {
		name: 'Right',
		layers: [
			{ id: 1, label: 'Main' },
			{ id: 2, label: 'DCA' },
			{ id: 3, label: 'Channels' },
			{ id: 4, label: 'Aux / FX' },
			{ id: 5, label: 'Bus / Master' },
			{ id: 6, label: 'User 1' },
			{ id: 7, label: 'User 2' },
			{ id: 10, label: 'Channel 1-4' },
			{ id: 11, label: 'Channel 9-12' },
			{ id: 12, label: 'Channel 17-20' },
			{ id: 13, label: 'Channel 25-38' },
			{ id: 14, label: 'Channel 33-36' },
			{ id: 15, label: 'Aux 1-4' },
			{ id: 16, label: 'Bus 1-4' },
			{ id: 17, label: 'Bus 9-12' },
			{ id: 18, label: 'Main 1-4' },
			{ id: 19, label: 'Matrix 1-8' },
			{ id: 20, label: 'DCA 1-4' },
			{ id: 21, label: 'DCA 9-12' },
			{ id: 22, label: 'Spill' },
		],
		offsetLayers: 7,
		maxOffset: 15,
	},
}

const FaderSpillGroups: DropdownChoice[] = [
	{ id: 0, label: 'Off' },
	{ id: 1, label: 'DCA 1' },
	{ id: 2, label: 'DCA 2' },
	{ id: 3, label: 'DCA 3' },
	{ id: 4, label: 'DCA 4' },
	{ id: 5, label: 'DCA 5' },
	{ id: 6, label: 'DCA 6' },
	{ id: 7, label: 'DCA 7' },
	{ id: 8, label: 'DCA 8' },
	{ id: 9, label: 'DCA 9' },
	{ id: 10, label: 'DCA 10' },
	{ id: 11, label: 'DCA 11' },
	{ id: 12, label: 'DCA 12' },
	{ id: 13, label: 'DCA 13' },
	{ id: 14, label: 'DCA 14' },
	{ id: 15, label: 'DCA 15' },
	{ id: 16, label: 'DCA 16' },
	{ id: 17, label: 'FX 1' },
	{ id: 18, label: 'FX 2' },
	{ id: 19, label: 'FX 3' },
	{ id: 20, label: 'FX 4' },
	{ id: 21, label: 'FX 5' },
	{ id: 22, label: 'FX 6' },
	{ id: 23, label: 'FX 7' },
	{ id: 24, label: 'FX 8' },
	{ id: 25, label: 'FX 9' },
	{ id: 26, label: 'FX 10' },
	{ id: 27, label: 'FX 11' },
	{ id: 28, label: 'FX 12' },
	{ id: 29, label: 'FX 13' },
	{ id: 30, label: 'FX 14' },
	{ id: 31, label: 'FX 15' },
	{ id: 32, label: 'FX 16' },
	{ id: 33, label: 'Bus 1' },
	{ id: 34, label: 'Bus 2' },
	{ id: 35, label: 'Bus 3' },
	{ id: 36, label: 'Bus 4' },
	{ id: 37, label: 'Bus 5' },
	{ id: 38, label: 'Bus 6' },
	{ id: 39, label: 'Bus 7' },
	{ id: 40, label: 'Bus 8' },
	{ id: 41, label: 'Bus 9' },
	{ id: 42, label: 'Bus 10' },
	{ id: 43, label: 'Bus 11' },
	{ id: 44, label: 'Bus 12' },
	{ id: 45, label: 'Bus 13' },
	{ id: 46, label: 'Bus 14' },
	{ id: 47, label: 'Bus 15' },
	{ id: 48, label: 'Bus 16' },
	{ id: 49, label: 'Matrix 1' },
	{ id: 50, label: 'Matrix 2' },
	{ id: 51, label: 'Matrix 3' },
	{ id: 52, label: 'Matrix 4' },
	{ id: 53, label: 'Matrix 5' },
	{ id: 54, label: 'Matrix 6' },
	{ id: 55, label: 'Matrix 7' },
	{ id: 56, label: 'Matrix 8' },
	{ id: 57, label: 'Main 1' },
	{ id: 58, label: 'Main 2' },
	{ id: 59, label: 'Main 3' },
	{ id: 60, label: 'Main 4' },
	{ id: 61, label: 'Auto X' },
	{ id: 62, label: 'Auto Y' },
]

// Function to get dropdown choices for fader bank layers
function GetLayerSelectionChoices(bank: string): DropdownChoice[] {
	const bankConfig = LayerBankOptions[bank]
	if (!bankConfig) {
		throw new Error(`Invalid bank: ${bank}`)
	}
	return bankConfig.layers.map(({ id, label }) => ({ id, label }))
}

// Function to get offset input field configuration for a specific layer
function GetMaxLayerOffsetForBank(bank: string): number {
	const bankConfig = LayerBankOptions[bank]
	if (!bankConfig) {
		return 0
	}

	return bankConfig.maxOffset ?? 0
}

function GetFaderBankSelectionChoices(): DropdownChoice[] {
	return Object.keys(LayerBankOptions).map((key) => ({
		id: key,
		label: LayerBankOptions[key].name,
	}))
}

export const FaderBankChoice: SomeCompanionActionInputField[] = [
	{
		type: 'dropdown',
		label: 'Fader Bank',
		id: 'bank',
		default: 'left',
		choices: GetFaderBankSelectionChoices(),
	},
	{
		type: 'dropdown',
		label: 'Bank Layer',
		id: 'left',
		default: 1,
		choices: GetLayerSelectionChoices('left'),
		isVisible: (options: CompanionOptionValues): boolean => {
			return options.bank != null && (options.bank as string) == 'left'
		},
	},
	{
		type: 'dropdown',
		label: 'Bank Layer',
		id: 'center',
		default: 1,
		choices: GetLayerSelectionChoices('center'),
		isVisible: (options: CompanionOptionValues): boolean => {
			return options.bank != null && (options.bank as string) == 'center'
		},
	},
	{
		type: 'dropdown',
		label: 'Bank Layer',
		id: 'right',
		default: 1,
		choices: GetLayerSelectionChoices('right'),
		isVisible: (options: CompanionOptionValues): boolean => {
			return options.bank != null && (options.bank as string) == 'right'
		},
	},
	{
		type: 'dropdown',
		label: 'Spill Group',
		id: 'spillgroup',
		default: 0,
		choices: FaderSpillGroups,
		isVisible: (options: CompanionOptionValues): boolean => {
			return options.bank != null && options[options.bank as string] == 22
		},
	},
	{
		type: 'number',
		label: 'Layer Offset',
		id: 'offset',
		default: 0,
		min: 0,
		step: 1,
		max: GetMaxLayerOffsetForBank('left'),
		isVisible: (options: CompanionOptionValues): boolean => {
			return options.bank != null && (options.bank as string) == 'left' && (options.layer as number) <= 7
		},
	},
]
