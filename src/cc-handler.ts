import { ModelSpec } from './models/types.js'
import { SatelliteClient } from './satellite-client.js'
export class CustomControlsHandler {
	private api: SatelliteClient

	private connectionReady: Promise<void>

	constructor() {
		this.api = new SatelliteClient('localhost', 16623, true)
		this.connectionReady = this.init()
	}

	private async init() {
		await this.api.connect(2000)
	}

	/**
	 * Creates custom control Satellite surfaces for a given Wing model.
	 *
	 * @param model A Wing Model
	 */
	async createCcSurfacesForModel(model: ModelSpec): Promise<void> {
		await this.connectionReady
		for (let i = 1; i <= model.userPages; i++) {
			const pageNumber = i.toString().padStart(2, '0')
			const surfaceId = `WING_${model.id.toUpperCase()}_CC_${pageNumber}`
			const surfaceLabel = `Wing ${model.label} CC ${pageNumber}`
			this.api.addSurface(surfaceId, surfaceLabel, model.userPageRows, model.userPageColumns)
		}
	}
}
