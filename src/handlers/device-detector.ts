import osc from 'osc'
import { WingModel } from '../models/types.js'

export interface DeviceInfo {
	deviceName: string
	address: string
	model: WingModel
	lastSeen: number
}

export interface WingDeviceDetector {
	subscribe(instanceId: string): void
	unsubscribe(instanceId: string): void
	listKnown(): DeviceInfo[]
}

/**
 * Detects Behringer Wing devices on the network via OSC broadcast.
 * Manages subscribers and tracks known devices.
 */
class WingDeviceDetectorImpl implements WingDeviceDetector {
	private readonly subscribers = new Set<string>()
	private osc?: osc.UDPPort
	private knownDevices = new Map<string, DeviceInfo>()
	private queryTimer: NodeJS.Timeout | undefined

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
	 * Start listening for device broadcasts and handle OSC events.
	 */
	private startListening(): void {
		this.knownDevices.clear()

		if (this.subscribers.size === 0) {
			return
		}

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

			/*if (!this.knownDevices.has(info.address)) {
				console.log(`Detected new Device: ${JSON.stringify(msg)}`)
			}*/

			this.knownDevices.set(info.address, info)

			// Prune out any not seen for over a minute
			for (const [id, data] of Array.from(this.knownDevices.entries())) {
				if (data.lastSeen < Date.now() - 60000) {
					this.knownDevices.delete(id)
				}
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

export const WingDeviceDetectorInstance: WingDeviceDetector = new WingDeviceDetectorImpl()
