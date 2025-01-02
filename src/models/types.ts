import { DropdownChoice } from '@companion-module/base'

export enum WingModel {
	Full = 'full',
	Compact = 'compact',
	Rack = 'rack',
}

export interface ModelSpec {
	id: WingModel
	label: string

	channels: number
	auxes: number
	busses: number
	matrices: number
	mains: number

	localInputs: number
	localOutputs: number
	localAuxIn?: number
	localAuxOut?: number
	aesIns: number
	aesOut: number

	stageConnect: number
	headphoneOuts?: number
}

export const ModelChoices: DropdownChoice[] = [
	{ id: WingModel.Full.toString(), label: 'Full' },
	{ id: WingModel.Compact.toString(), label: 'Compact' },
	{ id: WingModel.Rack.toString(), label: 'Rack' },
]
