import { WingFull } from './full.js'
import { WingCompact } from './compact.js'
import { WingRack } from './rack.js'
import { ModelSpec, WingModel } from './types.js'

// eslint-disable-file @typescript-eslint/no-unsafe-enum-comparison
export function getDeskModel(id?: WingModel): ModelSpec {
	switch (id) {
		case WingModel.Full:
			return WingFull
		case WingModel.Compact:
			return WingCompact
		case WingModel.Rack:
			return WingRack
		default:
			return WingFull
	}
}
