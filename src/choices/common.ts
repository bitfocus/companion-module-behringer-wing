import {
	combineRgb,
	CompanionInputFieldDropdown,
	CompanionInputFieldNumber,
	CompanionInputFieldTextInput,
	DropdownChoice,
	InputValue,
} from '@companion-module/base'
import { FadeDurationChoice } from './fades.js'
import { getIdLabelPair } from '../choices/utils.js'

export function GetNumberField(
	label: string,
	id: string,
	min: number,
	max: number,
	step?: number,
	defaultValue?: number,
	range?: boolean,
	tooltip?: string,
): CompanionInputFieldNumber {
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
): CompanionInputFieldTextInput {
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
): CompanionInputFieldNumber {
	return GetNumberField(label, id, min, max, step, defaultValue, true, tooltip)
}

export function GetDropdown(
	label: string,
	id: string,
	choices: DropdownChoice[],
	defaultChoice?: string,
	tooltip?: string,
): CompanionInputFieldDropdown {
	return {
		type: 'dropdown',
		label: label,
		id: id,
		default: defaultChoice ?? choices[0].id,
		choices: choices,
		tooltip: tooltip,
	}
}

export function GetMuteDropdown(id: string, label?: string, includeToggle?: boolean): CompanionInputFieldDropdown {
	const dropdown = GetDropdown(
		label ?? 'Mute',
		id,
		[getIdLabelPair('1', 'Mute'), getIdLabelPair('0', 'Unmute')],
		'1',
		'Select whether to Mute, Unmute or Toggle your selected target',
	)
	if (includeToggle == false) return dropdown

	return { ...dropdown, choices: [...dropdown.choices, getIdLabelPair('2', 'Toggle')] }
}

export function GetSoloDropdown(id: string, label?: string, includeToggle?: boolean): CompanionInputFieldDropdown {
	const dropdown = GetDropdown(
		label ?? 'Solo',
		id,
		[getIdLabelPair('1', 'On'), getIdLabelPair('0', 'Off')],
		'1',
		'Select whether to Mute, Unmute or Toggle your selected target',
	)
	if (includeToggle == false) return dropdown

	return { ...dropdown, choices: [...dropdown.choices, getIdLabelPair('2', 'Toggle')] }
}

export function GetPanoramaSlider(
	id: string,
	name?: string,
): [CompanionInputFieldNumber, CompanionInputFieldNumber, CompanionInputFieldDropdown, CompanionInputFieldDropdown] {
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

export function GetPanoramaDeltaSlider(
	id: string,
	name?: string,
): [CompanionInputFieldNumber, CompanionInputFieldNumber, CompanionInputFieldDropdown, CompanionInputFieldDropdown] {
	return [GetSlider(name ?? 'Panorama', id, -200, 200, 1, 0), ...FadeDurationChoice]
}

export function GetGainSlider(id: string, name?: string): CompanionInputFieldNumber {
	return GetSlider(name ?? 'Gain (dB)', id, -3, 45.5, 0.5, 10, 'Set the input gain of the selected target')
}

export function GetFaderInputField(
	id: string,
	name?: string,
): [CompanionInputFieldNumber, CompanionInputFieldNumber, CompanionInputFieldDropdown, CompanionInputFieldDropdown] {
	return [
		GetNumberField(name ?? 'Level (dB)', id, -144, 10, 0.1, 0, true, 'Set the fader level of the selected target'),
		...FadeDurationChoice,
	]
}

export function GetFaderDeltaInputField(
	id: string,
	name?: string,
): [CompanionInputFieldNumber, CompanionInputFieldNumber, CompanionInputFieldDropdown, CompanionInputFieldDropdown] {
	return [GetNumberField(name ?? 'Level (dB)', id, -154, 154, 1, 0, true), ...FadeDurationChoice]
}

export function GetColorDropdown(id: string, label?: string): CompanionInputFieldDropdown {
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

export function getIconChoices(): DropdownChoice[] {
	return [
		// General
		getIdLabelPair('0', 'Empty'),
		getIdLabelPair('1', 'XLR Connector'),
		getIdLabelPair('2', 'Jack Connector'),
		getIdLabelPair('3', 'Mini Jack Connector'),
		getIdLabelPair('4', 'RCA Connector'),
		getIdLabelPair('5', 'Fader'),
		getIdLabelPair('6', 'FX'),
		getIdLabelPair('7', 'Matrix'),
		getIdLabelPair('8', 'Bass Clef'),
		getIdLabelPair('9', 'Treble Clef'),
		getIdLabelPair('10', 'Routing'),
		getIdLabelPair('11', 'Bus'),
		getIdLabelPair('12', 'Sum'),
		getIdLabelPair('13', 'Smile'),
		getIdLabelPair('14', 'Wing Logo'),

		// Vocals and Mics
		getIdLabelPair('100', 'Microphone'),
		getIdLabelPair('101', 'Wireless Microphone'),
		getIdLabelPair('102', 'Handheld Microphone'),
		getIdLabelPair('103', 'Condenser Microphone'),
		getIdLabelPair('104', 'Boundary Microphone'),
		getIdLabelPair('105', 'Lapel Microphone'),
		getIdLabelPair('106', 'Boundary Microphone (Alternative)'),
		getIdLabelPair('107', 'Headset Microphone'),
		getIdLabelPair('108', 'Overhead Microphone'),
		getIdLabelPair('109', 'Speaker Icon'),
		getIdLabelPair('110', 'Studio Microphone'),
		getIdLabelPair('111', 'Podcast Microphone'),
		getIdLabelPair('112', 'Choir'),
		getIdLabelPair('113', 'Female Vocal'),
		getIdLabelPair('114', 'Male Vocal'),

		// Drums and Percussions
		getIdLabelPair('200', 'Kick In'),
		getIdLabelPair('201', 'Kick Out'),
		getIdLabelPair('202', 'Snare Top'),
		getIdLabelPair('203', 'Snare Bottom'),
		getIdLabelPair('204', 'Snare Drum'),
		getIdLabelPair('205', 'Hi-Hat'),
		getIdLabelPair('206', 'High Tom'),
		getIdLabelPair('207', 'Mid Tom'),
		getIdLabelPair('208', 'Low Tom'),
		getIdLabelPair('209', 'Floor Tom'),
		getIdLabelPair('210', 'Drum'),
		getIdLabelPair('211', 'Crash Cymbal'),
		getIdLabelPair('212', 'Ride Cymbal'),
		getIdLabelPair('213', 'Cowbell'),
		getIdLabelPair('214', 'Tambourine'),
		getIdLabelPair('215', 'Bongos'),
		getIdLabelPair('216', 'Conga'),
		getIdLabelPair('217', 'Timpani'),
		getIdLabelPair('218', 'Cajon'),
		getIdLabelPair('219', 'Shaker'),
		getIdLabelPair('220', 'Marimba'),
		getIdLabelPair('221', 'Hang Drum'),
		getIdLabelPair('222', 'Triangle'),
		getIdLabelPair('223', 'Drum Machine'),
		getIdLabelPair('224', 'Claps'),

		// Strings and Winds
		getIdLabelPair('300', 'Electric Guitar 1'),
		getIdLabelPair('301', 'Electric Guitar 2'),
		getIdLabelPair('302', 'Violin'),
		getIdLabelPair('303', 'Oud'),
		getIdLabelPair('304', 'Acoustic Guitar'),
		getIdLabelPair('305', 'Electric Guitar 3'),
		getIdLabelPair('306', 'Electric Guitar 4'),
		getIdLabelPair('307', 'Electric Guitar 5'),
		getIdLabelPair('308', 'Double Bass'),
		getIdLabelPair('309', 'Viola'),
		getIdLabelPair('310', 'Cello'),
		getIdLabelPair('311', 'Baritone'),
		getIdLabelPair('312', 'Saxophone'),
		getIdLabelPair('313', 'Trombone'),
		getIdLabelPair('314', 'Trumpet'),
		getIdLabelPair('315', 'Harp'),
		getIdLabelPair('316', 'Organ'),
		getIdLabelPair('317', 'Harmonica'),
		getIdLabelPair('318', 'Transverse Flute'),
		getIdLabelPair('319', 'Clarinet'),

		// Keys
		getIdLabelPair('400', 'Grand Piano'),
		getIdLabelPair('401', 'Upright Piano'),
		getIdLabelPair('402', 'Synthesizer 1'),
		getIdLabelPair('403', 'Synthesizer 2'),
		getIdLabelPair('404', 'Synthesizer 3'),
		getIdLabelPair('405', 'Synthesizer 4'),
		getIdLabelPair('406', 'Keytar'),
		getIdLabelPair('407', 'Piano Stand'),
		getIdLabelPair('408', 'Piano Cross Stand'),
		getIdLabelPair('409', 'Hammond Organ'),

		// Speakers
		getIdLabelPair('500', 'Full Amplifier'),
		getIdLabelPair('501', '2x2 Cabinet'),
		getIdLabelPair('502', 'Cabinet'),
		getIdLabelPair('503', 'Speaker'),
		getIdLabelPair('504', 'Speaker Pair'),
		getIdLabelPair('505', 'Speaker with Microphone Set'),
		getIdLabelPair('506', 'Subwoofer'),
		getIdLabelPair('507', 'Studio Monitor'),
		getIdLabelPair('508', 'Studio Monitor 2'),
		getIdLabelPair('509', 'Column Speaker'),
		getIdLabelPair('510', 'Wall Speaker'),
		getIdLabelPair('511', 'Hanging Speaker'),
		getIdLabelPair('512', 'Speaker Stand'),
		getIdLabelPair('513', 'Speaker Stand Pair'),
		getIdLabelPair('514', 'Delay Speakers'),
		getIdLabelPair('515', 'Left Monitor'),
		getIdLabelPair('516', 'Right Monitor'),
		getIdLabelPair('517', 'Monitor'),
		getIdLabelPair('518', 'Large Monitor'),
		getIdLabelPair('519', 'Large Monitor Pair'),
		getIdLabelPair('520', 'Left Wedge Monitor'),
		getIdLabelPair('521', 'Right Wedge Monitor'),
		getIdLabelPair('522', 'Center Wedge Monitor'),
		getIdLabelPair('523', 'Line Array'),
		getIdLabelPair('524', 'Ceiling Speaker'),

		// Specials
		getIdLabelPair('600', 'Hand'),
		getIdLabelPair('601', 'Ear'),
		getIdLabelPair('602', 'Headphones'),
		getIdLabelPair('603', 'Speaker A'),
		getIdLabelPair('604', 'Speaker B'),
		getIdLabelPair('605', 'Laptop'),
		getIdLabelPair('606', 'MP3 Player'),
		getIdLabelPair('607', 'Smartphone'),
		getIdLabelPair('608', 'USB Drive'),
		getIdLabelPair('609', 'SD Card'),
		getIdLabelPair('610', 'CD'),
		getIdLabelPair('611', 'Turntable'),
		getIdLabelPair('612', 'Reel-to-Reel Player'),
		getIdLabelPair('613', 'Cassette Player'),
		getIdLabelPair('614', 'Patchbay'),
	]
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

export function getTimeFormatChoices(): DropdownChoice[] {
	return [
		getIdLabelPair('hhmmss', 'Hours - Minutes - Seconds'),
		getIdLabelPair('hhmm', 'Hours - Minutes'),
		getIdLabelPair('mmss', 'Minutes - Seconds'),
		getIdLabelPair('ss', 'Seconds'),
	]
}

export function getTriStateColor(
	text: string | undefined,
	okText?: string,
	errorText?: string,
	okColor?: number,
	errorColor?: number,
	thirdColor?: number,
): number {
	if (text == (okText ?? 'OK')) {
		return okColor ?? combineRgb(0, 255, 0)
	} else if (text == (errorText ?? 'ERR')) {
		return errorColor ?? combineRgb(255, 0, 0)
	} else {
		return thirdColor ?? combineRgb(255, 255, 0)
	}
}

export function getTriStateTextColor(
	text: string | undefined,
	okText?: string,
	errorText?: string,
	okColor?: number,
	errorColor?: number,
	thirdColor?: number,
): number {
	if (text == (okText ?? 'OK')) {
		return okColor ?? combineRgb(255, 255, 255)
	} else if (text == (errorText ?? 'ERR')) {
		return errorColor ?? combineRgb(255, 255, 255)
	} else {
		return thirdColor ?? combineRgb(0, 0, 0)
	}
}

export function getDelayModes(): DropdownChoice[] {
	return [
		getIdLabelPair('M', 'Meters'),
		getIdLabelPair('FT', 'Feet'),
		getIdLabelPair('MS', 'Milliseconds'),
		getIdLabelPair('SMP', 'Samples'),
	]
}
