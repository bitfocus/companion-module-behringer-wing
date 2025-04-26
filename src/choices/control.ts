import { DropdownChoice } from '@companion-module/base'
import { getIdLabelPair } from '../choices/utils.js'

export function getGpioModes(): DropdownChoice[] {
	return [
		getIdLabelPair('TGLNO', 'Toggle Normally Open'),
		getIdLabelPair('TGLNC', 'Toggle Normally Closed'),
		getIdLabelPair('INNO', 'Input Normally Open'),
		getIdLabelPair('INNC', 'Input Normally Closed'),
		getIdLabelPair('OUTNO', 'Output Normally Open'),
		getIdLabelPair('OUTNC', 'Output Normally Closed'),
	]
}

export function getGpios(n_gpios: number): DropdownChoice[] {
	const gpios: DropdownChoice[] = []
	for (let i = 1; i <= n_gpios; i++) {
		gpios[i - 1] = getIdLabelPair(`${i}`, `GPIO ${i}`)
	}
	return gpios
}
