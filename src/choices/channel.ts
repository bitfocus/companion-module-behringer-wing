import { DropdownChoice } from '@companion-module/base'
import { getIdLabelPair } from '../utils.js'

export function getFilterModelOptions(): DropdownChoice[] {
	return [
		getIdLabelPair('TILT', 'Tilt Filter'),
		getIdLabelPair('MAX', 'Maxer Filter'),
		getIdLabelPair('AP1', 'All-Pass 90'),
		getIdLabelPair('AP2', 'All-Pass 180'),
	]
}

export function getInputConnectionGroupChoices(): DropdownChoice[] {
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
		getIdLabelPair('AES'),
		getIdLabelPair('USR', 'User'),
		getIdLabelPair('OSC', 'Oscillator'),
		getIdLabelPair('BUS', 'Bus'),
		getIdLabelPair('MAIN', 'Main'),
		getIdLabelPair('MTX', 'Matrix'),
	]
}

export function getSendModeChoices(): DropdownChoice[] {
	return [getIdLabelPair('PRE', 'Pre-Fade'), getIdLabelPair('POST', 'Post-Fade'), getIdLabelPair('GRP', 'Group')]
}

export function getProcessOrderChoices(): DropdownChoice[] {
	return [
		getIdLabelPair('G', 'Gate'),
		getIdLabelPair('E', 'EQ'),
		getIdLabelPair('D', 'Dynamics'),
		getIdLabelPair('I', 'Insert'),
	]
}
