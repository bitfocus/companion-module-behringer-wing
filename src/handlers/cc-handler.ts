import { OscMessage } from 'osc'
import osc from 'osc'
import { ModelSpec } from '../models/types.js'
import { SatelliteClient } from './satellite-client.js'
import { ModuleLogger } from './logger.js'

export class CustomControlsHandler {
	private companion: SatelliteClient
	private connectionReady: Promise<void>
	private model: ModelSpec
	private logger?: ModuleLogger

	// Flags to track which surfaces are enabled
	private ccPagesEnabled = false
	private enabledPages: Set<number> = new Set()
	private gpioEnabled = false
	private userEnabled = false
	private dawEnabled = false

	// Pre-compiled regex patterns for OSC message matching
	private readonly userFullRegex = /^\/\$ctl\/user\/U(\d+)\/(\d+)\/(enc|bu|bd)\/val$/
	private readonly gpioRegex = /^\/\$ctl\/user\/gpio\/(\d+)\/bu\/val$/
	private readonly userButtonRegex = /^\/\$ctl\/user\/user\/1\.\.4\/(bu|bd)\/val$/
	private readonly dawRegex = /^\/\$ctl\/user\/daw(\d+)\.\.daw(\d+)\/1\.\.4\/(bu|bd)\/val$/

	// Row name to number mapping (enc=1, bu=2, bd=3)
	private readonly rowMap = new Map<string, number>([
		['bu', 0],
		['bd', 1],
		['enc', 2],
	])

	constructor(model: ModelSpec, logger?: ModuleLogger) {
		this.model = model
		this.logger = logger
		this.companion = new SatelliteClient('localhost', 16623, true)
		this.connectionReady = this.init()
	}

	private async init() {
		await this.companion.connect(2000)
	}

	/**
	 * Removes all Wing Custom Control surfaces.
	 *
	 * This is not strictly necessary. Removing the surfaces results in the server showing the unused surfaces as disconnected, somewhat improving clarity.
	 */
	private removeAllSurfaces(): void {
		// Remove User Pages
		for (let i = 1; i <= this.model.userPages; i++) {
			const pageNumber = i.toString().padStart(2, '0')
			this.companion.removeSurface(`WING_CC_${pageNumber}`)
		}
		this.companion.removeSurface(`WING_GPIO`)
		this.companion.removeSurface(`WING_USER`)
		for (let i = 1; i <= 4; i++) {
			this.companion.removeSurface(`WING_DAW_${i}`)
		}
	}

	/**
	 * Surface creation helper.
	 *
	 * @param idBase Base ID for the surface (e.g., 'WING_CC', 'WING_GPIO')
	 * @param labelBase Base label for the surface (e.g., 'Wing CC', 'Wing GPIO')
	 * @param rows Number of rows on the surface
	 * @param columns Number of columns on the surface
	 * @param suffix Optional suffix for the surface ID and label (e.g., page number, DAW set number)
	 */
	private createSurface(idBase: string, labelBase: string, rows: number, columns: number, suffix?: string): void {
		const suffixPart = suffix ? `_${suffix}` : ''
		const suffixLabel = suffix ? ` ${suffix}` : ''

		const surfaceId = `${idBase}${suffixPart}`
		const surfaceLabel = `${labelBase}${suffixLabel}`

		this.companion.addSurface(surfaceId, surfaceLabel, rows, columns)
	}

	/**
	 * Creates User Pages (U1-U16) Satellite surfaces.
	 *
	 * @param pagesToCreate Array of page numbers (1-16) to create
	 */
	async createCcUserPageSurfaces(pagesToCreate: number[]): Promise<void> {
		await this.connectionReady

		this.enabledPages = new Set(pagesToCreate)
		console.log('Creating CC User Page surfaces for pages:', pagesToCreate)

		for (const pageNum of pagesToCreate) {
			if (pageNum >= 1 && pageNum <= this.model.userPages) {
				const pageNumber = pageNum.toString().padStart(2, '0')
				this.createSurface('WING_CC', 'Wing CC', this.model.userPageRows, this.model.userPageColumns, pageNumber)
			}
		}

		this.ccPagesEnabled = true
	}

	/**
	 * Creates GPIO buttons Satellite surface.
	 */
	async createCcGpioSurface(): Promise<void> {
		await this.connectionReady

		this.createSurface('WING_GPIO', 'Wing GPIO', 1, this.model.gpio)

		this.gpioEnabled = true
	}

	/**
	 * Creates User buttons Satellite surface.
	 */
	async createCcUserSurface(): Promise<void> {
		await this.connectionReady

		this.createSurface('WING_USER', 'Wing User', 2, 4)

		this.userEnabled = true
	}

	/**
	 * Creates DAW buttons Satellite surfaces.
	 */
	async createCcDawSurfaces(): Promise<void> {
		await this.connectionReady

		for (let i = 1; i <= 4; i++) {
			this.createSurface('WING_DAW', 'Wing DAW', 2, 4, i.toString())
		}

		this.dawEnabled = true
	}

	/**
	 * Sets up Custom Control surfaces based on configuration.
	 *
	 * @param config Configuration object with surface type toggles
	 */
	async setupSurfaces(config: {
		useCcUserPages?: boolean
		ccUserPagesToCreate?: number[]
		useCcGpio?: boolean
		useCcUser?: boolean
		useCcDaw?: boolean
	}): Promise<void> {
		await this.connectionReady

		this.removeAllSurfaces()
		this.ccPagesEnabled = config.useCcUserPages ?? false
		this.enabledPages.clear()
		this.gpioEnabled = config.useCcGpio ?? false
		this.userEnabled = config.useCcUser ?? false
		this.dawEnabled = config.useCcDaw ?? false

		if (this.ccPagesEnabled) {
			const pagesToCreate = config.ccUserPagesToCreate ?? []
			await this.createCcUserPageSurfaces(pagesToCreate)
		}

		if (this.gpioEnabled) {
			await this.createCcGpioSurface()
		}

		if (this.userEnabled) {
			await this.createCcUserSurface()
		}

		if (this.dawEnabled) {
			await this.createCcDawSurfaces()
		}
	}

	async processMessage(msg: OscMessage): Promise<void> {
		const address = msg.address
		const args = msg.args as osc.MetaArgument[]
		await this.connectionReady

		const value = args[0]?.value as number
		if (value === undefined) {
			return // No value in message
		}

		if (this.ccPagesEnabled) {
			const userFullMatch = address.match(this.userFullRegex)
			if (userFullMatch) {
				this.logger?.debug('CC User Page message received')
				const page = parseInt(userFullMatch[1], 10)

				// Check if the page that sent the message is enabled in CC surfaces
				if (!this.enabledPages.has(page)) {
					return // Page not enabled, ignore message
				}

				const column = parseInt(userFullMatch[2], 10) - 1
				const rowName = userFullMatch[3]
				const row = this.rowMap.get(rowName)

				if (row === undefined) {
					return // Unknown row type
				}

				const deviceId = `WING_CC_${page.toString().padStart(2, '0')}`

				if (rowName === 'enc') {
					if (value > 0) {
						this.companion.keyRotateRight(deviceId, row, column)
					} else if (value < 0) {
						this.companion.keyRotateLeft(deviceId, row, column)
					}
				} else {
					if (value === 127) {
						this.companion.buttonPress(deviceId, row, column)
					} else if (value === 0) {
						this.companion.buttonRelease(deviceId, row, column)
					}
				}
				return
			}
		}

		if (this.gpioEnabled) {
			const gpioMatch = address.match(this.gpioRegex)
			if (gpioMatch) {
				this.logger?.debug('GPIO button message received')
				// TODO: Implement GPIO button handling
				return
			}
		}

		if (this.userEnabled) {
			const userButtonMatch = address.match(this.userButtonRegex)
			if (userButtonMatch) {
				this.logger?.debug('User button message received')
				// TODO: Implement user button handling
				return
			}
		}

		if (this.dawEnabled) {
			const dawMatch = address.match(this.dawRegex)
			if (dawMatch) {
				this.logger?.debug('DAW button message received')
				// TODO: Implement DAW button handling
				return
			}
		}

		// No pattern matched
		return
	}
}
