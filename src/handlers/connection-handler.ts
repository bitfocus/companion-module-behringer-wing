import osc, { OscMessage } from 'osc'
import { ModuleLogger } from './logger.js'
import { EventEmitter } from 'events'
import { OSCSomeArguments } from '@companion-module/base'

export class ConnectionHandler extends EventEmitter {
	private osc: osc.UDPPort
	private logger?: ModuleLogger
	private ready?: Promise<void>
	private subscribeInterval?: NodeJS.Timeout

	constructor(logger?: ModuleLogger) {
		super()
		this.osc = new osc.UDPPort({})

		if (logger) {
			this.logger = logger
		}
	}

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
			this.subscribeForUpdates().catch((err) => {
				this.logger?.error(`Failed to subscribe for updates: ${err}`)
				this.emit('ready')
			})
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

	private async subscribeForUpdates(): Promise<void> {
		await this.ready
		this.logger?.info('Subscribing for updates')
		this.sendSubscriptionCommand()
		this.subscribeInterval = setInterval(() => {
			this.sendSubscriptionCommand()
		}, 9000)
	}

	private sendSubscriptionCommand(): void {
		this.sendCommand('/*S').catch(() => {})
	}

	close(): void {
		this.osc.close()
		this.logger?.info('OSC Handler destroyed')
	}

	async sendCommand(cmd: string, argument?: number | string, preferFloat?: boolean): Promise<void> {
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
		this.logger?.debug(`Sending OSC command: ${JSON.stringify(command)}`)
		this.osc.send(command)
		this.osc.send({ address: cmd, args: [] }) // a bit ugly, but needed to keep the desk state up to date in companion
	}
}
