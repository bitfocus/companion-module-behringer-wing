import { DropdownChoice } from '@companion-module/base'
import { getIdLabelPair } from '../choices/utils.js'

export function getCardsLinkChoices(): DropdownChoice[] {
	return [getIdLabelPair('IND', 'Unlinked'), getIdLabelPair('PAR', 'Linked')]
}

export function getCardsAutoInChoices(): DropdownChoice[] {
	return [getIdLabelPair('OFF', 'Off'), getIdLabelPair('1', 'Card 1'), getIdLabelPair('2', 'Card 2')]
}

export function getCardsAutoRoutingChoices(): DropdownChoice[] {
	return [getIdLabelPair('KEEP', 'Keep'), getIdLabelPair('MAIN', 'Main'), getIdLabelPair('ALT', 'Alt')]
}

export function getCardsActionChoices(): DropdownChoice[] {
	return [
		getIdLabelPair('STOP', 'Stop'),
		getIdLabelPair('PPAUSE', 'Pause'),
		getIdLabelPair('PLAY', 'Play'),
		getIdLabelPair('REC', 'Record'),
	]
}

export function getCardsStatusChoices(): DropdownChoice[] {
	return [
		getIdLabelPair('NONE', 'None'),
		getIdLabelPair('READY', 'Ready'),
		getIdLabelPair('PROTECT', 'Protected'),
		getIdLabelPair('ERASE', 'Formatting'),
		getIdLabelPair('ERROR', 'Error'),
	]
}

export function getCardsChoices(): DropdownChoice[] {
	return [getIdLabelPair('1', 'Card 1'), getIdLabelPair('2', 'Card 2')]
}
