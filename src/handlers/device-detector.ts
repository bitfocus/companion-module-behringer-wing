import osc from 'osc'
import { WingModel } from '../models/types.js'
import { EventEmitter } from 'events'
import { ModuleLogger } from './logger.js'

export interface DeviceInfo {
	deviceName: string
	address: string
	model: WingModel
	lastSeen: number
}

export interface WingDeviceDetectorInterface {
	subscribe(instanceId: string): void
	unsubscribe(instanceId: string): void
	listKnown(): DeviceInfo[]
}

/**
 * Detects Behringer Wing devices on the network via OSC broadcast.
 * Manages subscribers and tracks known devices.
 */
export class WingDeviceDetector extends EventEmitter implements WingDeviceDetectorInterface {
	private readonly subscribers = new Set<string>()
	private osc?: osc.UDPPort
	private knownDevices = new Map<string, DeviceInfo>()
	private queryTimer: NodeJS.Timeout | undefined
	private noDeviceTimeout: NodeJS.Timeout | undefined
	private logger?: ModuleLogger

	constructor(logger?: ModuleLogger) {
		super()
		this.logger = logger
	}

	/**
	 * Register a subscriber to start device detection.
	 * @param instanceId Unique identifier for the subscriber.
	 */
	public subscribe(instanceId: string): void {
		const startListening = this.subscribers.size === 0

		this.subscribers.add(instanceId)

		if (startListening) {
			this.startListening()
		}
	}

	/**
	 * Remove a subscriber and stop detection if none remain.
	 * @param instanceId Unique identifier for the subscriber.
	 */
	public unsubscribe(instanceId: string): void {
		if (this.subscribers.delete(instanceId) && this.subscribers.size === 0) {
			this.stopListening()
		}
	}

	/**
	 * List all currently known devices, sorted by name.
	 * @returns Array of DeviceInfo objects.
	 */
	public listKnown(): DeviceInfo[] {
		return Array.from(this.knownDevices.values()).sort((a, b) => a.deviceName.localeCompare(b.deviceName))
	}

	/**
	 * Start listening for device broadcasts upon request.
	 * Emits 'no-device-detected' event if no devices are found within 30 seconds.
	 */
	private startListening(): void {
		this.knownDevices.clear()

		if (this.subscribers.size === 0) {
			return
		}

		if (this.noDeviceTimeout) {
			clearTimeout(this.noDeviceTimeout)
		}
		this.noDeviceTimeout = setTimeout(() => {
			if (this.knownDevices.size === 0) {
				this.emit('no-device-detected')
			}
			this.noDeviceTimeout = undefined
		}, 30000)

		this.osc = new osc.UDPPort({
			localAddress: '0.0.0.0',
			localPort: 0,
			broadcast: true,
			metadata: true,
			remoteAddress: '255.255.255.255', // broadcast it
			remotePort: 2223,
		})

		this.osc.on('error', (_err: Error): void => {
			this.stopListening()
			this.startListening()
		})
		this.osc.on('ready', () => {
			if (!this.queryTimer) {
				this.queryTimer = setInterval(() => this.sendQuery(), 10000)
			}

			this.sendQuery()
		})

		this.osc.on('close' as any, () => {
			this.stopListening()
		})

		this.osc.on('message', (message): void => {
			const args = message.args as osc.MetaArgument[]
			if (!args || args.length === 0 || args[0].type !== 's') {
				return
			}

			const data = args[0].value.split(',')

			const msg = {
				ip: data[1],
				name: data[2],
				model: data[3],
				serial: data[4],
				version: data[5],
			}

			const info: DeviceInfo = {
				address: msg.ip,
				deviceName: msg.name,
				model: WingModel.Full,
				lastSeen: Date.now(),
			}

			if (!this.knownDevices.has(info.address)) {
				this.logger?.info(`Detected console ${info.deviceName} at ${info.address}`)
			}

			// If a device has not been seen for over a minute, remove it
			this.knownDevices.set(info.address, info)
			for (const [id, data] of Array.from(this.knownDevices.entries())) {
				if (data.lastSeen < Date.now() - 60000) {
					this.logger?.info(`Removing console ${data.deviceName} at ${data.address} from known devices due to timeout`)
					this.knownDevices.delete(id)
				}
			}

			if (this.noDeviceTimeout && this.knownDevices.size > 0) {
				clearTimeout(this.noDeviceTimeout)
				this.noDeviceTimeout = undefined
			}
		})

		this.osc.open()
	}

	/**
	 * Stop listening for device broadcasts and clean up resources.
	 */
	private stopListening(): void {
		if (this.osc) {
			try {
				this.osc.close()
			} catch (_e) {
				// Ignore
			}
			delete this.osc
		}

		this.knownDevices.clear()

		if (this.queryTimer) {
			clearInterval(this.queryTimer)
			delete this.queryTimer
		}
	}

	/**
	 * Send a device discovery query via OSC broadcast.
	 */
	private sendQuery(): void {
		if (this.osc) {
			this.osc.send({ address: '/?', args: [] })
		}
	}
}

export const WingDeviceDetectorInstance: WingDeviceDetectorInterface = new WingDeviceDetector()
