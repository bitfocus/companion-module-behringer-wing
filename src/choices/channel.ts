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
