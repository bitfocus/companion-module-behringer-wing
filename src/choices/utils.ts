import { DropdownChoice } from '@companion-module/base'

export function getIdLabelPair(id: string, label?: string): DropdownChoice {
	return { id: id, label: label ?? id }
}
