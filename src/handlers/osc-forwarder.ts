import { OscMessage } from 'osc'
import osc from 'osc'
import { ModuleLogger } from './logger.js'

export class OscForwarder {
	private port: osc.UDPPort | undefined
	private logger: ModuleLogger | undefined

	constructor(logger?: ModuleLogger) {
		this.logger = logger
	}

	setup(enabled: boolean | undefined, host?: string, port?: number, logger?: ModuleLogger): void {
		this.close()

		this.logger = logger

		if (!enabled || !host || !port) {
			return
		}

		this.logger?.info(`Setting up OSC forwarder to ${host}:${port}`)
		try {
			this.port = new osc.UDPPort({
				localAddress: '0.0.0.0',
				localPort: 0,
				metadata: true,
				remoteAddress: host,
				remotePort: port,
			})

			this.port.on('error', (err: Error): void => {
				this.logger?.warn(`OSC Forwarder Error: ${err.message}`)
			})

			this.port.open()
			this.logger?.info(`OSC forwarding enabled to ${host}:${port}`)
		} catch (err: any) {
			this.logger?.error(`Failed to setup OSC forwarder: ${err?.message ?? err}`)
		}
	}

	send(message: OscMessage): void {
		try {
			this.port?.send(message)
		} catch (err: any) {
			this.logger?.warn(`OSC forward send failed: ${err?.message ?? err}`)
		}
	}

	close(): void {
		if (this.port) {
			try {
				this.port.close()
			} catch (_e) {
				// ignore
			}
			this.port = undefined
		}
	}
}
