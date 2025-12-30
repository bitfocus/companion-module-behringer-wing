import net from 'net'
import { ModuleLogger } from './logger.js'

const ANNOUNCE_HOST = '127.0.0.1'
const ANNOUNCE_PORT = 6942
const ANNOUNCE_INTERVAL_MS = 1000
const ANNOUNCE_PAYLOAD = 'hello\n\n'

export class SurfaceAnnouncer {
	private logger?: ModuleLogger
	private interval: NodeJS.Timeout | undefined

	constructor(logger?: ModuleLogger) {
		this.logger = logger
	}

	start(): void {
		if (this.interval) return

		this.interval = setInterval(() => {
			this.sendAnnounce()
		}, ANNOUNCE_INTERVAL_MS)
	}

	stop(): void {
		if (!this.interval) return

		clearInterval(this.interval)
		this.interval = undefined
	}

	private sendAnnounce(): void {
		const socket = net.connect(ANNOUNCE_PORT, ANNOUNCE_HOST, () => {
			socket.write(ANNOUNCE_PAYLOAD)
			socket.end()
		})
		this.logger?.info('Sending surface announce')
		// Ignore errors (receiver may not be running yet)
		socket.on('error', () => {
			socket.destroy()
		})
	}
}
