import { createSocket, Socket } from 'node:dgram'
import { Socket as TcpSocket, createConnection } from 'node:net'
import { EventEmitter } from 'node:events'
import type { ModuleLogger } from '@companion-module/base'

const REPORT_ID = 0x57494e47 // "WING"
const CHANNEL_V2_BYTES = 11 * 2
const METER_RENEW_INTERVAL_MS = 3000

export interface ChannelMeter {
	preFaderLeftDb: number
	preFaderRightDb: number
	preFaderPeakDb: number
	postFaderLeftDb: number
	postFaderRightDb: number
	postFaderPeakDb: number
	/** Backward-compatible aliases for the post-fader values. */
	leftDb: number
	rightDb: number
	peakDb: number
}

/** Receives WING's native Channel V2 meter stream and keeps the request alive. */
export class MeterHandler extends EventEmitter {
	private readonly host: string
	private readonly channelCount: number
	private readonly logger?: ModuleLogger
	private tcp?: TcpSocket
	private udp?: Socket
	private renewTimer?: NodeJS.Timeout
	private readonly meters = new Map<number, ChannelMeter>()
	private stopped = false
	private configured = false

	constructor(host: string, channelCount: number, logger?: ModuleLogger) {
		super()
		this.host = host
		this.channelCount = channelCount
		this.logger = logger
	}

	start(): void {
		if (this.stopped || this.tcp) return

		const udp = createSocket('udp4')
		this.udp = udp
		udp.on('error', (error) => {
			this.logger?.warn(`WING meter UDP error: ${error.message}`)
			this.close()
		})
		udp.on('message', (message) => this.handlePacket(message))
		udp.bind(0, '0.0.0.0', () => {
			if (this.stopped) return
			const port = udp.address().port
			const tcp = createConnection({ host: this.host, port: 2222 })
			this.tcp = tcp
			tcp.on('error', (error) => {
				this.logger?.warn(`WING native meter connection error: ${error.message}`)
				this.close()
			})
			tcp.on('close', () => {
				if (!this.stopped) this.close()
			})
			tcp.on('data', () => {
				// The meter values arrive over UDP; drain any native TCP acknowledgements.
			})
			tcp.on('connect', () => {
				if (this.stopped) return
				// Initialize WING's native control stream before switching to its meter channel.
				tcp.write(Buffer.from([0xdf, 0xd1]))
				// Select the WING meter channel and declare our UDP receive port.
				tcp.write(Buffer.from([0xdf, 0xd3, 0xd3, (port >> 8) & 0xff, port & 0xff, 0xdf, 0xd1]))
				this.configured = true
				this.requestMeters()
				this.renewTimer = setInterval(() => this.requestMeters(true), METER_RENEW_INTERVAL_MS)
				this.logger?.info(`WING channel meters enabled on UDP port ${port}`)
			})
		})
	}

	getChannelMeter(channel: number): ChannelMeter | undefined {
		return this.meters.get(channel)
	}

	private requestMeters(renew = false): void {
		const tcp = this.tcp
		if (!tcp || tcp.destroyed || !this.configured) return

		const chunks: number[] = [0xdf, 0xd3, 0xd4]
		const id = Buffer.alloc(4)
		id.writeUInt32BE(REPORT_ID)
		for (const byte of id) {
			chunks.push(byte)
			if (byte === 0xdf) chunks.push(0xde)
		}

		if (!renew) {
			chunks.push(0xdc)
			for (let channel = 1; channel <= this.channelCount; channel++) {
				chunks.push(0xab, channel - 1)
			}
			chunks.push(0xde)
		}
		// Return the native TCP connection to the normal control channel.
		chunks.push(0xdf, 0xd1)
		tcp.write(Buffer.from(chunks))
	}

	private handlePacket(packet: Buffer): void {
		if (packet.length < 4 || packet.readUInt32BE(0) !== REPORT_ID) return
		const expectedLength = 4 + this.channelCount * CHANNEL_V2_BYTES
		if (packet.length < expectedLength) {
			this.logger?.debug(`Ignoring short WING meter packet (${packet.length}/${expectedLength} bytes)`)
			return
		}

		const updates: Record<string, number> = {}
		for (let channel = 1; channel <= this.channelCount; channel++) {
			const offset = 4 + (channel - 1) * CHANNEL_V2_BYTES
			// Channel V2 word order: input L/R (pre-fader), output L/R (post-fader), then gate/dynamics.
			const preFaderLeftDb = packet.readInt16BE(offset) / 256
			const preFaderRightDb = packet.readInt16BE(offset + 2) / 256
			const postFaderLeftDb = packet.readInt16BE(offset + 4) / 256
			const postFaderRightDb = packet.readInt16BE(offset + 6) / 256
			const meter: ChannelMeter = {
				preFaderLeftDb,
				preFaderRightDb,
				preFaderPeakDb: Math.max(preFaderLeftDb, preFaderRightDb),
				postFaderLeftDb,
				postFaderRightDb,
				postFaderPeakDb: Math.max(postFaderLeftDb, postFaderRightDb),
				leftDb: postFaderLeftDb,
				rightDb: postFaderRightDb,
				peakDb: Math.max(postFaderLeftDb, postFaderRightDb),
			}
			this.meters.set(channel, meter)
			updates[`ch${channel}_meter_pre_left_db`] = Number(preFaderLeftDb.toFixed(2))
			updates[`ch${channel}_meter_pre_right_db`] = Number(preFaderRightDb.toFixed(2))
			updates[`ch${channel}_meter_pre_peak_db`] = Number(meter.preFaderPeakDb.toFixed(2))
			updates[`ch${channel}_meter_post_left_db`] = Number(postFaderLeftDb.toFixed(2))
			updates[`ch${channel}_meter_post_right_db`] = Number(postFaderRightDb.toFixed(2))
			updates[`ch${channel}_meter_post_peak_db`] = Number(meter.postFaderPeakDb.toFixed(2))
			// Keep the original names working as post-fader aliases.
			updates[`ch${channel}_meter_left_db`] = Number(postFaderLeftDb.toFixed(2))
			updates[`ch${channel}_meter_right_db`] = Number(postFaderRightDb.toFixed(2))
			updates[`ch${channel}_meter_peak_db`] = Number(meter.postFaderPeakDb.toFixed(2))
		}
		this.emit('update', updates)
	}

	close(): void {
		if (this.stopped) return
		this.stopped = true
		this.configured = false
		if (this.renewTimer) clearInterval(this.renewTimer)
		this.renewTimer = undefined
		this.tcp?.destroy()
		this.tcp = undefined
		this.udp?.close()
		this.udp = undefined
		if (this.meters.size > 0) {
			const reset: Record<string, number> = {}
			for (const channel of this.meters.keys()) {
				reset[`ch${channel}_meter_pre_left_db`] = -128
				reset[`ch${channel}_meter_pre_right_db`] = -128
				reset[`ch${channel}_meter_pre_peak_db`] = -128
				reset[`ch${channel}_meter_post_left_db`] = -128
				reset[`ch${channel}_meter_post_right_db`] = -128
				reset[`ch${channel}_meter_post_peak_db`] = -128
				reset[`ch${channel}_meter_left_db`] = -128
				reset[`ch${channel}_meter_right_db`] = -128
				reset[`ch${channel}_meter_peak_db`] = -128
			}
			this.emit('update', reset)
		}
		this.meters.clear()
	}
}
