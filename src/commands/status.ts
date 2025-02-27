// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace StatusCommands {
	// Status Node
	export const Node = (): string => `/$stat`

	// Module Type
	export const ModType = (): string => `${Node()}/modtype`

	// AES50 Nodes
	export function AesStatus(aes: string): string {
		return `${Node()}/${aes}/stat`
	}
	export function AesDeviceName(aes: string): string {
		return `${Node()}/${aes}/dev`
	}

	export const ClockLock = (): string => `${Node()}/lock`
	export const ClockPPM = (): string => `${Node()}/ppm`

	export const Solo = (): string => `${Node()}/solo`
	export const SoloInPlace = (): string => `${Node()}/sip`

	// Real-Time Clock and Time/Date
	export const RealTimeClockError = (): string => `${Node()}/rtcerr`
	export const ClockTime = (): string => `${Node()}/time`
	export const ClockDate = (): string => `${Node()}/date`

	// USB State and Volume Name
	export const USBState = (): string => `${Node()}/usbstate`
	export const USBVolumeName = (): string => `${Node()}/usbvolname`

	// StageConnect
	export const StageConnectStatus = (): string => `${Node()}/sc_stat`
	export const StageConnectDevices = (): string => `${Node()}/sc_devices`
	export const StageConnectUpstreamCount = (): string => `${Node()}/sc_upcnt`
	export const StageConnectDownstreamCount = (): string => `${Node()}/sc_dncnt`
	export const StageConnectUpstreamRouting = (): string => `${Node()}/sc_uprout`
}
