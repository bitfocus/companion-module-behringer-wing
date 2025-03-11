// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace DcaCommands {
	export function Node(dca: number): string {
		return `/dca/${dca}`
	}

	export function Name(dca: number): string {
		return `${Node(dca)}/name`
	}

	export function Color(dca: number): string {
		return `${Node(dca)}/col`
	}

	export function Icon(dca: number): string {
		return `${Node(dca)}/icon`
	}

	export function ScribbleLight(dca: number): string {
		return `${Node(dca)}/led`
	}

	export function Mute(dca: number): string {
		return `${Node(dca)}/mute`
	}

	export function Fader(dca: number): string {
		return `${Node(dca)}/fdr`
	}

	export function Solo(dca: number): string {
		return `${Node(dca)}/$solo`
	}

	export function SoloLed(dca: number): string {
		return `${Node(dca)}/$sololed`
	}

	export function MonitorMode(dca: number): string {
		return `${Node(dca)}/mon`
	}
}
