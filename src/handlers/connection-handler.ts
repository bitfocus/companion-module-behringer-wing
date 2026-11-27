import type { OscMessage } from 'osc'
import osc from 'osc'

import { EventEmitter } from 'events'
import type { ModuleLogger, OSCSomeArguments } from '@companion-module/base'

/** Interval in milliseconds at which the liveness probe (`/?`) is sent. */
const LIVENESS_PROBE_INTERVAL = 2000
/** Time in milliseconds without any OSC message after which the console counts as unreachable. */
const LIVENESS_TIMEOUT = 5000

type Liveness = 'waiting' | 'alive' | 'timed-out'

/**
 * Handles OSC UDP connection management, message sending, and event emission for the Behringer Wing module.
 * Emits 'ready', 'message', 'error' and 'close' events, plus the liveness events:
 * - 'alive' (recovered: boolean) when the console answers for the first time, again after an 'error'
 *   (recovered = false), or again after a timeout (recovered = true).
 * - 'timeout' when no OSC message arrived for {@link LIVENESS_TIMEOUT} ms.
 */
export class ConnectionHandler extends EventEmitter {
	private osc: osc.UDPPort
	private subscriptionTimer?: NodeJS.Timeout
	private subscriptionInterval: number = 9000
	private probeTimer?: NodeJS.Timeout
	private livenessTimer?: NodeJS.Timeout
	private liveness: Liveness = 'waiting'
	private logger?: ModuleLogger

	/**
	 * Create a new ConnectionHandler.
	 * @param logger Optional logger for debug/info/error output.
	 */
	constructor(logger?: ModuleLogger) {
		super()
		this.osc = new osc.UDPPort({})
		this.logger = logger
	}

	/**
	 * Open and configure the OSC UDP connection.
	 * @param localAddress Local IP address to bind.
	 * @param localPort Local port to bind.
	 * @param remoteAddress Remote IP address to connect.
	 * @param remotePort Remote port to connect.
	 */
	open(localAddress: string, localPort: number, remoteAddress: string, remotePort: number): void {
		this.logger?.info(`Opening OSC connection from ${localAddress}:${localPort} to ${remoteAddress}:${remotePort}`)
		this.osc = new osc.UDPPort({
			localAddress,
			localPort,
			remoteAddress,
			remotePort,
			broadcast: true,
			metadata: true,
		})

		this.osc.on('ready', () => {
			this.emit('ready')
			this.startLivenessCheck()
		})

		this.osc.on('error', (err: Error) => {
			this.logger?.error(`OSC error: ${err.message}`)
			// The status now shows the error, so the next message has to report the console alive again.
			// A timed-out console stays timed out, so its next answer still counts as a recovery.
			if (this.liveness === 'alive') this.liveness = 'waiting'
			this.emit('error', err)
		})

		this.osc.on('close' as any, () => {
			this.logger?.info('OSC connection closed')
			if (this.subscriptionTimer) {
				clearInterval(this.subscriptionTimer)
				this.subscriptionTimer = undefined
			}
			this.stopLivenessCheck()
			this.emit('close')
		})

		this.osc.on('message', (msg: OscMessage) => {
			this.markAlive()
			const args = msg.args as osc.MetaArgument[]
			const stringValue = args[0]?.value
			this.logger?.debug(`Received ${msg.address}: ${stringValue} (string)`)
			this.emit('message', msg)
		})

		this.osc.open()
	}

	/**
	 * Set or update the interval for sending OSC subscription commands.
	 * @param interval Interval in milliseconds
	 */
	setSubscriptionInterval(interval: number): void {
		this.logger?.info(`Setting subscription interval to ${interval} ms`)
		this.subscriptionInterval = interval
	}

	startSubscription(): void {
		this.sendSubscriptionCommand()
		this.logger?.info('Started subscription for OSC updates')
		this.subscribeForUpdates()
	}

	stopSubscription(): void {
		if (this.subscriptionTimer) {
			clearInterval(this.subscriptionTimer)
			this.subscriptionTimer = undefined
			this.logger?.info('Stopped OSC subscription updates')
		}
	}
	/**
	 * Start periodic OSC subscription updates at the given interval.
	 * @param interval Interval in milliseconds.
	 */
	private subscribeForUpdates(): void {
		this.subscriptionTimer = setInterval(() => {
			void this.sendSubscriptionCommand()
		}, this.subscriptionInterval)
	}

	/**
	 * Start the liveness check: probe the console with `/?` every {@link LIVENESS_PROBE_INTERVAL} ms
	 * and emit 'timeout' when no OSC message arrives for {@link LIVENESS_TIMEOUT} ms.
	 */
	private startLivenessCheck(): void {
		this.stopLivenessCheck()
		this.liveness = 'waiting'
		this.sendProbe()
		this.probeTimer = setInterval(() => this.sendProbe(), LIVENESS_PROBE_INTERVAL)
		this.armLivenessTimeout()
	}

	private stopLivenessCheck(): void {
		if (this.probeTimer) {
			clearInterval(this.probeTimer)
			this.probeTimer = undefined
		}
		if (this.livenessTimer) {
			clearTimeout(this.livenessTimer)
			this.livenessTimer = undefined
		}
	}

	/**
	 * Send the liveness probe. Sent directly (not via sendCommand) so it goes out once per interval.
	 */
	private sendProbe(): void {
		try {
			this.osc.send({ address: '/?', args: [] })
		} catch {
			// A send failure surfaces as a liveness timeout.
		}
	}

	private armLivenessTimeout(): void {
		if (this.livenessTimer) clearTimeout(this.livenessTimer)
		this.livenessTimer = setTimeout(() => {
			this.livenessTimer = undefined
			if (this.liveness === 'timed-out') return
			this.liveness = 'timed-out'
			this.emit('timeout')
		}, LIVENESS_TIMEOUT)
	}

	/**
	 * Record that an OSC message arrived from the console.
	 */
	private markAlive(): void {
		if (this.probeTimer === undefined) return
		this.armLivenessTimeout()
		if (this.liveness === 'alive') return
		const recovered = this.liveness === 'timed-out'
		this.liveness = 'alive'
		this.emit('alive', recovered)
	}

	/**
	 * Send the OSC subscription command to the remote device now, e.g. after the console came back.
	 */
	resubscribe(): void {
		this.sendSubscriptionCommand()
	}

	/**
	 * Send the OSC subscription command to the remote device.
	 */
	private sendSubscriptionCommand(): void {
		this.logger?.debug('Sending subscription command')
		this.sendCommand('/*S', undefined, undefined, true).catch(() => {})
	}

	/**
	 * Close the OSC connection and clean up resources.
	 */
	close(): void {
		this.stopLivenessCheck()
		this.osc.close()
		this.logger?.info('OSC Handler destroyed')
	}

	/**
	 * Send an OSC command with an optional argument.
	 * @param cmd OSC address string.
	 * @param argument Optional argument (number or string).
	 * @param preferFloat If true, send numbers as float (default: false).
	 */
	async sendCommand(cmd: string, argument?: number | string, preferFloat?: boolean, preventLog = false): Promise<void> {
		let args: OSCSomeArguments = []
		if (typeof argument === 'number') {
			if (preferFloat) {
				args = {
					type: 'f',
					value: argument,
				}
				if (!preventLog) this.logger?.debug(`Sending OSC command: ${cmd} ${argument} (preferred float)`)
			} else {
				if (Number.isInteger(argument)) {
					args = {
						type: 'i',
						value: argument,
					}
					if (!preventLog) this.logger?.debug(`Sending OSC command: ${cmd} ${argument} (integer)`)
				} else {
					args = {
						type: 'f',
						value: argument,
					}
					if (!preventLog) this.logger?.debug(`Sending OSC command: ${cmd} ${argument} (float)`)
				}
			}
		} else if (typeof argument === 'string') {
			args = {
				type: 's',
				value: argument,
			}
			if (!preventLog) this.logger?.debug(`Sending OSC command: ${cmd} ${argument} (string)`)
		} else if (argument == undefined) {
			args = []
			if (!preventLog) this.logger?.debug(`Sending OSC command: ${cmd} (no argument)`)
		} else {
			this.logger?.error('Unsupported argument type. Command aborted.')
		}
		const command = {
			address: cmd,
			args: args,
		}
		this.osc.send(command)
		this.osc.send({ address: cmd, args: [] }) // a bit ugly, but needed to keep the desk state up to date in companion
	}
}
