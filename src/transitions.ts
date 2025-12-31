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

	/**
	 * Run a single tick of all pending transitions.
	 */
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

	/**
	 * Schedule a transition between to values using an OSC command to be executed.
	 * @param path The command to execute the transition with
	 * @param from Value to start the transition from
	 * @param to Value to end the transition with
	 * @param duration Duration of the transition
	 * @param algorithm The fade-curve to use for the transition
	 * @param curve The easing to use for the transition start and end
	 */
	public run(
		path: string,
		from: number | undefined,
		to: number,
		duration: number,
		algorithm?: Easing.algorithm,
		curve?: Easing.curve,
		mapLinearToDb?: boolean,
	): void {
		const interval = this.fadeUpdateRate
		const stepCount = Math.ceil(duration / interval)

		if (stepCount <= 1 || typeof from !== 'number') {
			this.transitions.delete(path)
			this.sendOsc(path, to)
		} else {
			// Map the transition in dB to a linear scale (=linear fader movement)
			if (mapLinearToDb != false) {
				from = dbToFloat(from)
				to = dbToFloat(to)
			}
			const diff = to - from
			const steps: number[] = []

			const easing = Easing.getEasing(algorithm, curve)
			for (let i = 1; i <= stepCount; i++) {
				const fraction = easing(i / stepCount)
				if (mapLinearToDb == false) {
					steps.push(from + diff * fraction)
				} else {
					steps.push(floatToDb(from + diff * fraction)) // map back to dB
				}
			}

			this.transitions.set(path, { steps })

			// Start the tick if not already running
			if (!this.tickInterval) {
				this.tickInterval = setInterval(() => this.runTick(), this.fadeUpdateRate)
			}
		}
	}
}

/**
 * Converts a fader position to the value of that fader in dB
 * @param f Fader position between 0.0 and 1.0
 * @returns Value of the fader position in dB
 */
function floatToDb(f: number): number {
	if (f > 1.0 || f < 0.0) {
		console.error(`Illegal value for fader float ([0.0, 1.0]) = ${f}`)
	}
	if (f >= 0.5) {
		return f * 40 - 30
	} else if (f >= 0.25) {
		return f * 80 - 50
	} else if (f >= 0.0625) {
		return f * 160 - 70
	} else if (f >= 0.0) {
		return f * 480 - 90
	} else {
		return Number.NEGATIVE_INFINITY
	}
}

/**
 * Converts a fader value in dB to a fader position
 * @param d A value of a fader in dB
 * @returns The fader position between 0.0 and 1.0
 */
function dbToFloat(d: number): number {
	if (d > 1.0 || d < 0.0) {
		console.error(`Illegal value for fader ([-144 10]) = ${d}`)
	}

	let f: number
	if (d < -60) {
		f = (d + 90) / 480
	} else if (d < -30) {
		f = (d + 70) / 160
	} else if (d < -10) {
		f = (d + 50) / 80
	} else if (d <= 10) {
		f = (d + 30) / 40
	} else {
		f = 1
	}
	return f
}
