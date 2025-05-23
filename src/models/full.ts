import { WingModel, ModelSpec } from './types.js'

export const WingFull: ModelSpec = {
	id: WingModel.Full,
	label: 'Full',

	channels: 40,
	auxes: 8,
	busses: 16,
	matrices: 8,
	mains: 4,
	dcas: 16,
	mutegroups: 8,

	localInputs: 8,
	localOutputs: 8,
	localAuxIn: 8,
	localAuxOut: 8,
	aesIns: 2,
	aesOut: 2,
	stageConnect: 1,
	gpio: 4,
}
