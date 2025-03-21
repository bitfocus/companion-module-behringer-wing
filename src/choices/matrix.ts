import { DropdownChoice } from '@companion-module/base'
import { getIdLabelPair } from '../choices/utils.js'

export function getMatrixDirectInInputs(): DropdownChoice[] {
	return [
		getIdLabelPair('OFF', 'Off'),
		getIdLabelPair('AES', 'AES'),
		getIdLabelPair('MON.PH', 'Monitor Phones'),
		getIdLabelPair('MON.SPK', 'Monitor Speakers'),
		getIdLabelPair('MON.BUS', 'Solo Bus'),
	]
}
