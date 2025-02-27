import { DropdownChoice, SomeCompanionActionInputField } from '@companion-module/base'
import { getIdLabelPair } from '../choices/utils.js'

export const EqTypes = {
	Standard: { id: 'STD', label: 'Standard EQ' },
	SoulAnalog: { id: 'SOUL', label: 'Soul Analog EQ' },
	Even88: { id: 'E88', label: 'Even 88-Formant EQ' },
	Even84: { id: 'E84', label: 'Even 84 EQ' },
	FocusriteISA: { id: 'F110', label: 'Focusrite ISA 110 EQ' },
	PulsarP1: { id: 'PULSAR', label: 'Pulsar P1a/M5 EQ' },
	Mach: { id: 'MACH', label: 'Mach EQ4' },
}

export const EqModelChoice: DropdownChoice[] = [
	getIdLabelPair(EqTypes.Standard.id, EqTypes.Standard.label),
	getIdLabelPair(EqTypes.SoulAnalog.id, EqTypes.SoulAnalog.label),
	getIdLabelPair(EqTypes.Even88.id, EqTypes.Even88.label),
	getIdLabelPair(EqTypes.Even84.id, EqTypes.Even84.label),
	getIdLabelPair(EqTypes.FocusriteISA.id, EqTypes.FocusriteISA.label),
	getIdLabelPair(EqTypes.PulsarP1.id, EqTypes.PulsarP1.label),
	getIdLabelPair(EqTypes.Mach.id, EqTypes.Mach.label),
]

export function EqModelDropdown(id: string): SomeCompanionActionInputField[] {
	return [
		{
			type: 'dropdown',
			label: 'Model',
			id: id,
			choices: EqModelChoice,
			default: EqTypes.Standard.id,
		},
	]
}

export function EqParameterDropdown(id: string, modelId: string, bus?: boolean): SomeCompanionActionInputField[] {
	// let _bands = []
	// if (EqTypes.Standard.id) {
	// 	_bands = StdEqBandChoices(bus)
	// } else if (EqTypes.Even88.id) {
	// 	_bands = Even88EqBandChoices()
	// } else if (EqTypes.Even84.id) {
	// 	_bands = Even84EqBandChoices()
	// }
	// if (_bands.length == 0) {}

	return [
		{
			type: 'dropdown',
			label: 'Band',
			id: id,
			choices: StdEqBandChoices(bus),
			default: 'l',
			isVisible: (opt) => {
				// console.log(opt[modelId]?.toString())
				return opt[modelId]?.toString() != 'STD'
			},
		},
	]
}

function StdEqBandChoices(bus?: boolean): DropdownChoice[] {
	const isBus = bus ?? false
	if (isBus) {
		return [
			getIdLabelPair('l', 'Low'),
			getIdLabelPair('1', '1'),
			getIdLabelPair('2', '2'),
			getIdLabelPair('3', '3'),
			getIdLabelPair('4', '4'),
			getIdLabelPair('5', '5'),
			getIdLabelPair('6', '6'),
			getIdLabelPair('h', 'High'),
		]
	} else {
		return [
			getIdLabelPair('l', 'Low'),
			getIdLabelPair('1', '1'),
			getIdLabelPair('2', '2'),
			getIdLabelPair('3', '3'),
			getIdLabelPair('4', '4'),
			getIdLabelPair('h', 'High'),
		]
	}
}

// function Even88EqBandChoices(): DropdownChoice[] {
// 	return [
// 		getIdLabelPair('l', 'Low'),
// 		getIdLabelPair('lm', 'Low-Mid'),
// 		getIdLabelPair('hm', 'High-Mid'),
// 		getIdLabelPair('h', 'High'),
// 	]
// }

// function Even84EqBandChoices(): DropdownChoice[] {
// 	return [getIdLabelPair('l', 'Low'), getIdLabelPair('m', 'Mid'), getIdLabelPair('h', 'High')]
// }
