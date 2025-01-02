import { DropdownChoice, OSCSomeArguments } from '@companion-module/base'

export function intToOsc(i: number): OSCSomeArguments {
	return { type: 'i', value: i }
}

export function floatToOsc(f: number): OSCSomeArguments {
	return { type: 'f', value: f }
}

export function stringToOsc(s: string): OSCSomeArguments {
	return { type: 's', value: s }
}

export function generateDropdownChoices<T extends string | number>(values: readonly T[]): DropdownChoice[] {
	return values.map((value) => ({ id: value.toString().toLowerCase(), label: value.toString() }))
}
