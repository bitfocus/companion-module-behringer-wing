import { DropdownChoice } from '@companion-module/base'
import { getIdLabelPair } from './utils.js'

export function getTalkbackOptions(): DropdownChoice[] {
	return [getIdLabelPair('A', 'Talkback A'), getIdLabelPair('B', 'Talkback B')]
}

export function getTalkbackModeOptions(): DropdownChoice[] {
	return [getIdLabelPair('AUTO', 'Automatic'), getIdLabelPair('PUSH', 'Push'), getIdLabelPair('LATCH', 'Latch')]
}
