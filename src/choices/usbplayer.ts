import { DropdownChoice } from '@companion-module/base'
import { getIdLabelPair } from '../choices/utils.js'

export function getUsbPlayerActionChoices(): DropdownChoice[] {
	return [
		getIdLabelPair('STOP', 'Stop'),
		getIdLabelPair('PLAY', 'Play'),
		getIdLabelPair('PAUSE', 'Pause'),
		getIdLabelPair('NEXT', 'Next'),
		getIdLabelPair('PREV', 'Previous'),
	]
}

export function getUsbRecorderActionChoices(): DropdownChoice[] {
	return [
		getIdLabelPair('STOP', 'Stop'),
		getIdLabelPair('REC', 'Record'),
		getIdLabelPair('PAUSE', 'Pause'),
		getIdLabelPair('NEWFILE', 'New File'),
	]
}
