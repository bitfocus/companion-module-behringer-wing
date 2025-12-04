// eslint-disable-next-line n/no-extraneous-import
import WebSocket from 'ws'
export class SatelliteClient {
	host: string
	port: number
	socket: WebSocket | null = null
	heartbeatInterval: NodeJS.Timeout | null = null
	logging: boolean

	constructor(host: string, port: number, logging = false) {
		this.host = host
		this.port = port
		this.logging = logging
	}

	log(...messages: any[]): void {
		if (this.logging) {
			const message = messages.join(' ')
			if (message.includes('PING')) return
			if (message.includes('PONG')) return
			console.log(message)
		}
	}
	/**
	 * Establishes a WebSocket connection to the satellite server.
	 *
	 * Attempts to connect to the server at the specified host and port.
	 * If the connection is not established within the given timeout (default: 1000ms), the promise is rejected.
	 * On successful connection, starts a heartbeat interval to send periodic pings.
	 * If an error occurs during connection, the socket is disconnected and a reconnection attempt is made.
	 *
	 * @param timeoutMs - The maximum time in milliseconds to wait for the connection before timing out. Defaults to 1000ms.
	 * @returns A promise that resolves when the connection is successfully established, or rejects if the connection fails or times out.
	 */
	async connect(timeoutMs = 1000): Promise<void> {
		return new Promise((resolve, reject) => {
			let settled = false
			this.socket = new WebSocket(`ws://${this.host}:${this.port}`)
			const timer = setTimeout(() => {
				if (!settled) {
					settled = true
					reject(new Error('Connection timeout'))
					this.disconnect()
				}
			}, timeoutMs)
			this.socket.onopen = () => {
				if (!settled) {
					settled = true
					clearTimeout(timer)
					this.log('Connected to satellite server')
					// Setup heartbeat to keep the connection alive
					if (!this.heartbeatInterval) {
						this.heartbeatInterval = setInterval(() => {
							this.sendPing()
						}, 2000)
					}
					this.sendPing()
					resolve()
				}
			}
			this.socket.onerror = (error: { message: any }) => {
				if (!settled) {
					settled = true
					clearTimeout(timer)
					reject(new Error(`Connection error: ${error.message}`))
				}
				this.disconnect()
			}
		})
	}

	disconnect(): void {
		if (this.socket) {
			this.sendCommand('QUIT')
			this.socket.close()
			this.socket = null
		}
		if (this.heartbeatInterval) {
			clearInterval(this.heartbeatInterval)
			this.heartbeatInterval = null
		}
	}

	/**
	 * Sends a command to the connected WebSocket server.
	 *
	 * Constructs a message by combining the provided command and optional arguments,
	 * then sends it over the WebSocket connection if it is open. If no arguments are
	 * provided, an empty string is used.
	 *
	 * @param command - The command string to send.
	 * @param args - Optional arguments to append to the command.
	 */
	sendCommand(command: string, args?: string): void {
		if (this.socket && this.socket.readyState === WebSocket.OPEN) {
			if (!args) {
				args = ''
			}
			const message = `${command} ${args}\n`
			// this.log('Sending:', message)
			this.socket.send(message)
		}
	}
	sendPing(): void {
		this.sendCommand('PING')
	}
	/**
	 * Add a new Satellite surface to the Server.
	 *
	 * @param deviceId - The unique identifier for the device.
	 * @param surfaceName - The name of the surface to add.
	 * @param rows - (Optional) The number of rows on the surface. Used to calculate total keys.
	 * @param columns - (Optional) The number of columns on the surface. Used to calculate total keys.
	 *
	 * Sends an 'ADD-DEVICE' command with the constructed arguments to the device.
	 */
	addSurface(deviceId: string, surfaceName: string, rows?: number, columns?: number): void {
		const keys_total = rows && columns ? rows * columns : 0
		// eslint-disable-next-line no-useless-escape
		let args = `DEVICEID=${deviceId} PRODUCT_NAME=\"${surfaceName}\"`
		if (keys_total > 0) {
			args += ` KEYS_TOTAL=${keys_total}`
			args += ` KEYS_PER_ROW=${columns}`
		}
		args += ` BRIGHTNESS=false`
		this.sendCommand('ADD-DEVICE', args)
	}
	/**
	 * Removes a surface device from the system by its device ID.
	 *
	 * ATTENTION: This will only remove the Satellite registration of the surface. The surface itself
	 * will still exist on the Server.
	 *
	 * Sends a 'REMOVE-DEVICE' command with the specified device ID as an argument.
	 *
	 * @param deviceId - The unique identifier of the device to be removed.
	 */
	removeSurface(deviceId: string): void {
		const args = `DEVICEID=${deviceId}`
		this.sendCommand('REMOVE-DEVICE', args)
	}
	/**
	 * Presses a button on a specified device surface.
	 *
	 * The button is indexed by its row and column on the surface from top left (0/0) to bottom right.
	 */
	buttonPressRelease(deviceId: string, row: number, column: number): void {
		this.buttonPress(deviceId, row, column)
		this.buttonRelease(deviceId, row, column)
	}

	/**
	 * Sends a button press event for a specified button.
	 *
	 * @param page - The page number.
	 * @param row - The row number.
	 * @param column - The column number.
	 */
	buttonPress(deviceId: string, row: number, column: number): void {
		const COMMAND = 'KEY-PRESS'
		const args = `DEVICEID=${deviceId} KEY=${row}/${column}`
		this.sendCommand(COMMAND, args + ' PRESSED=1')
	}

	/**
	 * Sends a button release event for a specified button.
	 *
	 * @param deviceId - The device identifier.
	 * @param row - The row number.
	 * @param column - The column number.
	 */
	buttonRelease(deviceId: string, row: number, column: number): void {
		const COMMAND = 'KEY-PRESS'
		const args = `DEVICEID=${deviceId} KEY=${row}/${column}`
		this.sendCommand(COMMAND, args + ' PRESSED=0')
	}

	/**
	 * Sends a key rotate left event for a specified encoder.
	 *
	 * @param deviceId - The device identifier.
	 * @param row - The row number.
	 * @param column - The column number.
	 */
	keyRotateLeft(deviceId: string, row: number, column: number): void {
		const COMMAND = 'KEY-ROTATE'
		const args = `DEVICEID=${deviceId} KEY=${row}/${column} DIRECTION=-1`
		this.sendCommand(COMMAND, args)
	}

	/**
	 * Sends a key rotate right event for a specified encoder.
	 *
	 * @param deviceId - The device identifier.
	 * @param row - The row number.
	 * @param column - The column number.
	 */
	keyRotateRight(deviceId: string, row: number, column: number): void {
		const COMMAND = 'KEY-ROTATE'
		const args = `DEVICEID=${deviceId} KEY=${row}/${column} DIRECTION=1`
		this.sendCommand(COMMAND, args)
	}
}
//# sourceMappingURL=satellite-client.js.map
