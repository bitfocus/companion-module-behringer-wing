import { DropdownChoice, SomeCompanionActionInputField } from '@companion-module/base'
import { getIdLabelPair } from '../choices/utils.js'

const EqTypes = {
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

export function GetEqParameterChoice(model: string, id: string, bus?: boolean): SomeCompanionActionInputField[] {
	let bands: DropdownChoice[] = []

	if (model == EqTypes.Standard.id) {
		bands = getStdEqBands(bus)
	} else if (model == EqTypes.Even88.id) {
		bands = getEven88EqBands()
	} else if (model == EqTypes.Even84.id) {
		bands = getEven84EqBands()
	}

	if (bands == undefined) {
		return []
	}

	return [
		{
			type: 'dropdown',
			label: 'Band',
			id: id,
			choices: bands,
			default: 'l',
		},
	]
}

function getStdEqBands(bus?: boolean): DropdownChoice[] {
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

function getEven88EqBands(): DropdownChoice[] {
	return [
		getIdLabelPair('l', 'Low'),
		getIdLabelPair('lm', 'Low-Mid'),
		getIdLabelPair('hm', 'High-Mid'),
		getIdLabelPair('h', 'High'),
	]
}

function getEven84EqBands(): DropdownChoice[] {
	return [getIdLabelPair('l', 'Low'), getIdLabelPair('m', 'Mid'), getIdLabelPair('h', 'High')]
}
