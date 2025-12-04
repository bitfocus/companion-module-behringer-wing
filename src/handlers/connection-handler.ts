import osc, { OscMessage } from 'osc'
import { ModuleLogger } from './logger.js'
import { EventEmitter } from 'events'
import { OSCSomeArguments } from '@companion-module/base'

/**
 * Handles OSC UDP connection management, message sending, and event emission for the Behringer Wing module.
 * Emits 'message', 'error', and 'close' events.
 */
export class ConnectionHandler extends EventEmitter {
	private osc: osc.UDPPort
	private logger?: ModuleLogger
	private ready?: Promise<void>
	private subscribeInterval?: NodeJS.Timeout

	/**
	 * Create a new ConnectionHandler.
	 * @param logger Optional logger for debug/info/error output.
	 */
	constructor(logger?: ModuleLogger) {
		super()
		this.osc = new osc.UDPPort({})

		if (logger) {
			this.logger = logger
		}
	}

	/**
	 * Open and configure the OSC UDP connection.
	 * @param localAddress Local IP address to bind.
	 * @param localPort Local port to bind.
	 * @param remoteAddress Remote IP address to connect.
	 * @param remotePort Remote port to connect.
	 */
	async open(localAddress: string, localPort: number, remoteAddress: string, remotePort: number): Promise<void> {
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
			this.logger?.info('OSC connection is ready')
			this.emit('ready')
		})

		this.osc.on('error', (err) => {
			this.logger?.error(`OSC error: ${err.message}`)
			this.emit('error')
		})

		this.osc.on('close' as any, () => {
			this.logger?.info('OSC connection closed')
			if (this.subscribeInterval) {
				clearInterval(this.subscribeInterval)
				this.subscribeInterval = undefined
			}
			this.emit('close')
		})

		this.osc.on('message', (msg: OscMessage) => {
			this.logger?.debug(`Received ${JSON.stringify(msg)}`)
			this.emit('message', msg)
		})

		this.osc.open()
	}

	/**
	 * Set or update the interval for sending OSC subscription commands.
	 * @param interval Interval in milliseconds
	 */
	setSubscriptionInterval(interval: number): void {
		if (this.subscribeInterval) {
			clearInterval(this.subscribeInterval)
		}
		this.subscribeForUpdates(interval).catch(() => {})
	}

	/**
	 * Start periodic OSC subscription updates at the given interval.
	 * @param interval Interval in milliseconds.
	 */
	private async subscribeForUpdates(interval: number): Promise<void> {
		await this.ready
		this.sendSubscriptionCommand()
		if (this.subscribeInterval) {
			clearInterval(this.subscribeInterval)
		}
		this.subscribeInterval = setInterval(() => {
			this.sendSubscriptionCommand()
		}, interval)
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
			} else {
				if (Number.isInteger(argument)) {
					args = {
						type: 'i',
						value: argument,
					}
				} else {
					args = {
						type: 'f',
						value: argument,
					}
				}
			}
		} else if (typeof argument === 'string') {
			args = {
				type: 's',
				value: argument,
			}
		} else if (argument == undefined) {
			args = []
		} else {
			this.logger?.error('Unsupported argument type. Command aborted.')
		}
		const command = {
			address: cmd,
			args: args,
		}
		this.osc.send(command)
		this.osc.send({ address: cmd, args: [] }) // a bit ugly, but needed to keep the desk state up to date in companion
		if (preventLog) return
		this.logger?.debug(`Sending OSC command: ${JSON.stringify(command)}`)
	}
}
