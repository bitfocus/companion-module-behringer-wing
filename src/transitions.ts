import { WingConfig } from './config.js'
import { Easing } from './easings.js'
import { InstanceBaseExt } from './types.js'

export interface TransitionInfo {
	steps: number[]
}

export class WingTransitions {
	private readonly transitions: Map<string, TransitionInfo>
	private readonly instance: InstanceBaseExt<WingConfig>
	private fadeUpdateRate: number

	private tickInterval: NodeJS.Timeout | undefined

	constructor(instance: InstanceBaseExt<WingConfig>) {
		this.transitions = new Map()
		this.instance = instance
		this.fadeUpdateRate = 50
	}

	public setUpdateRate(rate: number): void {
		this.fadeUpdateRate = rate
	}

	private sendOsc(cmd: string, arg?: string | number): void {
		if (this.instance.config.host) {
			this.instance.sendCommand(cmd, arg, true)
		}
	}

	public stopAll(): void {
		this.transitions.clear()

		if (this.tickInterval) {
			clearInterval(this.tickInterval)
			delete this.tickInterval
		}
	}

	private runTick(): void {
		const completedPaths: string[] = []
		for (const [path, info] of this.transitions.entries()) {
			const newValue = info.steps.shift()
			if (newValue !== undefined) {
				this.sendOsc(path, newValue)
			}
			if (info.steps.length === 0) {
				completedPaths.push(path)
			}
		}

		// Remove any completed transitions
		for (const path of completedPaths) {
			this.transitions.delete(path)
		}

		// If nothing is left, stop the timer
		if (this.transitions.size === 0) {
			this.stopAll()
		}
	}

	public run(
		path: string,
		from: number | undefined,
		to: number,
		duration: number,
		algorithm?: Easing.algorithm,
		curve?: Easing.curve,
	): void {
		const interval = this.fadeUpdateRate
		const stepCount = Math.ceil(duration / interval)

		if (stepCount <= 1 || typeof from !== 'number') {
			this.transitions.delete(path)
			this.sendOsc(path, to)
		} else {
			const diff = to - from
			const steps: number[] = []

			const easing = Easing.getEasing(algorithm, curve)
			for (let i = 1; i <= stepCount; i++) {
				const fraction = easing(i / stepCount)
				steps.push(from + diff * fraction)
			}

			this.transitions.set(path, { steps })

			// Start the tick if not already running
			if (!this.tickInterval) {
				this.tickInterval = setInterval(() => this.runTick(), this.fadeUpdateRate)
			}
		}
	}
}
