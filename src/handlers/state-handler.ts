import EventEmitter from 'events'
import { ModuleLogger } from './logger.js'
import { ModelSpec } from '../models/types.js'
import { WingState } from '../state/index.js'
import PQueue from 'p-queue'
import osc, { OscMessage } from 'osc'
import debounceFn from 'debounce-fn'

export class StateHandler extends EventEmitter {
	private model: ModelSpec
	state?: WingState
	private logger?: ModuleLogger

	private inFlightRequests: { [path: string]: () => void } = {}
	private readonly requestQueue: PQueue = new PQueue({
		concurrency: 100,
		timeout: 200,
		throwOnTimeout: true,
	})

	private readonly debounceUpdateCompanion: () => void

	private readonly reCtlLib = /\/\$ctl\/lib/
	private readonly reScenes = /\$scenes\s+list\s+\[([^\]]+)\]/

	constructor(model: ModelSpec, logger?: ModuleLogger) {
		super()
		this.model = model
		this.state = new WingState(model)
		this.logger = logger

		this.debounceUpdateCompanion = debounceFn(this.updateCompanionWithState.bind(this), {
			wait: 200,
			maxWait: 2000,
			before: false,
			after: true,
		})
	}

	private updateCompanionWithState(): void {
		this.logger?.debug('Triggering Companion update from changed state')
		this.state?.updateNames(this.model)
		this.emit('update')
	}

	setTimeout(timeout: number): void {
		this.requestQueue.timeout = timeout
	}

	private updateLists(msg: osc.OscMessage): void {
		const args = msg.args as osc.MetaArgument[]

		if (this.reCtlLib.test(msg.address)) {
			const content = String(args[0]?.value ?? '')
			const scenes = content.match(this.reScenes)
			if (scenes) {
				const sceneList = scenes[1].split(',').map((s) => s.trim())
				const newScenes = sceneList.map((s) => ({ id: s, label: s }))
				const newSceneNameToIdMap = new Map(sceneList.map((s, i) => [s, i + 1]))

				const mapsEqual = (a: Map<string, number>, b: Map<string, number>): boolean => {
					if (a.size !== b.size) return false
					for (const [k, v] of a.entries()) {
						if (b.get(k) !== v) return false
					}
					return true
				}

				if (!mapsEqual(this.state!.sceneNameToIdMap, newSceneNameToIdMap)) {
					this.logger?.info('Updating scene map')
					this.state!.namedChoices.scenes = newScenes
					this.state!.sceneNameToIdMap = newSceneNameToIdMap
					this.requestUpdate()
				}
			}
		}
	}

	processMessage(msg: OscMessage): void {
		const { address, args } = msg

		if (this.inFlightRequests[msg.address]) {
			this.logger?.debug(`Received answer for request ${msg.address}`)
			this.inFlightRequests[msg.address]()
			delete this.inFlightRequests[msg.address]
		}

		this.state?.set(address, args as osc.MetaArgument[])
		this.logger?.debug(`State updated for ${address} with args: ${JSON.stringify(args)}`)
		this.updateLists(msg)
		this.requestUpdate()
	}

	async ensureLoaded(path: string, arg?: string | number): Promise<void> {
		this.requestQueue
			.add(async () => {
				if (this.inFlightRequests[path]) {
					return
				}

				this.logger?.debug(`Requesting ${path}`)

				const p = new Promise<void>((resolve) => {
					this.inFlightRequests[path] = resolve
				})

				this.emit('request', path, arg)
				await p
			})
			.catch((_e: unknown) => {
				delete this.inFlightRequests[path]
				this.emit('request-failed', path)
				this.logger?.warn(`Request failed for ${path} after timeout (${_e})`)
			})
	}

	clearState(): void {
		this.state = new WingState(this.model)
		this.logger?.debug('State cleared')
	}

	requestUpdate(): void {
		this.debounceUpdateCompanion()
	}
}
