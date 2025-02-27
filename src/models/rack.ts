import { WingModel, ModelSpec } from './types.js'

export const WingRack: ModelSpec = {
	id: WingModel.Rack,
	label: 'Rack',

	channels: 40,
	auxes: 8,
	busses: 16,
	matrices: 8,
	mains: 4,

	localInputs: 8,
	localOutputs: 8,
	localAuxIn: 8,
	localAuxOut: 8,
	aesIns: 2,
	aesOut: 2,
	stageConnect: 1,
}
