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
		getIdLabelPair('PPause', 'Pause'),
		getIdLabelPair('Play', 'Play'),
		getIdLabelPair('REC', 'Record'),
	]
}

export function getCardsChoices(): DropdownChoice[] {
	return [getIdLabelPair('1', 'Card 1'), getIdLabelPair('2', 'Card 2')]
}
