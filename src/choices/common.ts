import {
	CompanionInputFieldDropdown,
	DropdownChoice,
	InputValue,
	SomeCompanionActionInputField,
	SomeCompanionFeedbackInputField,
} from '@companion-module/base'
import { FadeDurationChoice } from './fades.js'
import { getIdLabelPair } from '../utils.js'

export function GetNumberField(
	label: string,
	id: string,
	min: number,
	max: number,
	step?: number,
	defaultValue?: number,
	range?: boolean,
	tooltip?: string,
): SomeCompanionActionInputField {
	return {
		type: 'number',
		label: label,
		id: id,
		default: defaultValue ?? 0,
		min: min,
		step: step,
		max: max,
		range: range,
		tooltip: tooltip,
	}
}

export function GetNumberFieldFeedback(
	label: string,
	id: string,
	min: number,
	max: number,
	step?: number,
	defaultValue?: number,
	range?: boolean,
	tooltip?: string,
): SomeCompanionFeedbackInputField {
	return {
		type: 'number',
		label: label,
		id: id,
		default: defaultValue ?? 0,
		min: min,
		step: step,
		max: max,
		range: range,
		tooltip: tooltip,
	}
}

export function GetTextField(
	label: string,
	id: string,
	defaultValue?: string,
	tooltip?: string,
): SomeCompanionActionInputField {
	return {
		type: 'textinput',
		label: label,
		id: id,
		default: defaultValue,
		tooltip: tooltip,
	}
}

export function GetSlider(
	label: string,
	id: string,
	min: number,
	max: number,
	step?: number,
	defaultValue?: number,
	tooltip?: string,
): SomeCompanionActionInputField {
	return GetNumberField(label, id, min, max, step, defaultValue, true, tooltip)
}

export function GetSliderFeedback(
	label: string,
	id: string,
	min: number,
	max: number,
	step?: number,
	defaultValue?: number,
	tooltip?: string,
): SomeCompanionFeedbackInputField {
	return GetNumberFieldFeedback(label, id, min, max, step, defaultValue, true, tooltip)
}

export function GetDropdown(
	label: string,
	id: string,
	choices: DropdownChoice[],
	defaultChoice?: string,
	tooltip?: string,
): SomeCompanionActionInputField {
	return {
		type: 'dropdown',
		label: label,
		id: id,
		default: defaultChoice ?? choices[0].id,
		choices: choices,
		tooltip: tooltip,
	}
}

export function GetDropdownFeedback(
	label: string,
	id: string,
	choices: DropdownChoice[],
	defaultChoice?: string,
	tooltip?: string,
): SomeCompanionFeedbackInputField {
	return {
		type: 'dropdown',
		label: label,
		id: id,
		default: defaultChoice ?? choices[0].id,
		choices: choices,
		tooltip: tooltip,
	}
}

export function GetMuteDropdown(id: string, label?: string): SomeCompanionActionInputField {
	return GetDropdown(
		label ?? 'Mute',
		id,
		[getIdLabelPair('0', 'Mute'), getIdLabelPair('1', 'Unmute')],
		'1',
		'Select whether to Mute or Unmute your selected target',
	)
}

export function GetPanoramaSlider(id: string, name?: string): SomeCompanionActionInputField[] {
	return [
		GetSlider(
			name ?? 'Panorama',
			id,
			-100,
			100,
			1,
			0,
			'Set the panorama of the selected target between -100 (Left) and +100 (Right)',
		),
		...FadeDurationChoice,
	]
}

export function GetPanoramaSliderFeedback(id: string, name?: string): SomeCompanionFeedbackInputField[] {
	return [
		GetSliderFeedback(
			name ?? 'Panorama',
			id,
			-100,
			100,
			1,
			0,
			'Set the panorama of the selected target between -100 (Left) and +100 (Right)',
		),
	]
}

export function GetGainSlider(id: string, name?: string): SomeCompanionActionInputField {
	return GetSlider(name ?? 'Gain (dB)', id, -3, 45.5, 0.5, 10, 'Set the input gain of the selected target')
}

export function GetFaderInputField(id: string, name?: string): SomeCompanionActionInputField[] {
	return [
		GetNumberField(name ?? 'Level (dB)', id, -144, 10, 1, 0, undefined, 'Set the fader level of the selected target'),
		...FadeDurationChoice,
	]
}

export function GetColorDropdown(id: string, label?: string): SomeCompanionActionInputField {
	return GetDropdown(
		label ?? 'Color',
		id,
		[
			getIdLabelPair('1', 'Gray Blue'),
			getIdLabelPair('2', 'Medium Blue'),
			getIdLabelPair('3', 'Dark Blue'),
			getIdLabelPair('4', 'Turquoise'),
			getIdLabelPair('5', 'Green'),
			getIdLabelPair('6', 'Olive Green'),
			getIdLabelPair('7', 'Yellow'),
			getIdLabelPair('8', 'Orange'),
			getIdLabelPair('9', 'Red'),
			getIdLabelPair('10', 'Coral'),
			getIdLabelPair('11', 'Pink'),
			getIdLabelPair('12', 'Mauve'),
		],
		'1',
		'Set the color of the selected target',
	)
}

export enum NumberComparator {
	Equal = 'eq',
	NotEqual = 'ne',
	LessThan = 'lt',
	LessThanEqual = 'lte',
	GreaterThan = 'gt',
	GreaterThanEqual = 'gte',
}

export function GetNumberComparator(id: string, label?: string): CompanionInputFieldDropdown {
	const options = [
		{ id: NumberComparator.Equal, label: '=' },
		{ id: NumberComparator.NotEqual, label: '!=' },
		{ id: NumberComparator.GreaterThan, label: '>' },
		{ id: NumberComparator.GreaterThanEqual, label: '>=' },
		{ id: NumberComparator.LessThan, label: '<' },
		{ id: NumberComparator.LessThanEqual, label: '<=' },
	]
	return {
		type: 'dropdown',
		label: label ?? 'Function',
		id: id,
		default: NumberComparator.Equal,
		choices: options,
	}
}

export function compareNumber(
	target: InputValue | undefined,
	comparitor: InputValue | undefined,
	currentValue: number,
): boolean {
	const targetValue = Number(target)
	if (isNaN(targetValue)) {
		return false
	}

	switch (comparitor) {
		case NumberComparator.GreaterThan:
			return currentValue > targetValue
		case NumberComparator.GreaterThanEqual:
			return currentValue >= targetValue
		case NumberComparator.LessThan:
			return currentValue < targetValue
		case NumberComparator.LessThanEqual:
			return currentValue <= targetValue
		case NumberComparator.NotEqual:
			return currentValue != targetValue
		default:
			return currentValue === targetValue
	}
}

export function getSourceGroupChoices(): DropdownChoice[] {
	return [
		getIdLabelPair('OFF', 'Off'),
		getIdLabelPair('LCL', 'Local'),
		getIdLabelPair('AUX', 'Aux'),
		getIdLabelPair('A', 'AES A'),
		getIdLabelPair('B', 'AES B'),
		getIdLabelPair('C', 'AES C'),
		getIdLabelPair('SC', 'StageConnect'),
		getIdLabelPair('USB', 'USB Player'),
		getIdLabelPair('CRD', 'Expansion Card'),
		getIdLabelPair('MOD', 'Module'),
		getIdLabelPair('PLAY', 'Player'),
		getIdLabelPair('AES', 'AES/EBU'),
		getIdLabelPair('USR', 'User'),
		getIdLabelPair('OSC', 'Oscillator'),
		getIdLabelPair('BUS', 'Bus'),
		getIdLabelPair('MAIN', 'Main'),
		getIdLabelPair('MTX', 'Matrix'),
	]
}
