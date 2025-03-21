// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace MainCommands {
	export function Node(main: number): string {
		return `/main/${main}`
	}

	export function InputNode(main: number): string {
		return `${Node(main)}/in`
	}

	export function InputSetNode(main: number): string {
		return `${InputNode(main)}/set`
	}

	export function InputInvert(main: number): string {
		return `${InputSetNode(main)}/inv`
	}

	export function InputTrim(main: number): string {
		return `${InputSetNode(main)}/trim`
	}

	export function InputBalance(main: number): string {
		return `${InputSetNode(main)}/bal`
	}

	export function Color(main: number): string {
		return `${Node(main)}/col`
	}

	export function Name(main: number): string {
		return `${Node(main)}/name`
	}

	export function RealName(main: number): string {
		return `${Node(main)}/$name`
	}

	export function Icon(main: number): string {
		return `${Node(main)}/icon`
	}

	export function ScribbleLight(main: number): string {
		return `${Node(main)}/led`
	}

	export function MonoSwitch(main: number): string {
		return `${Node(main)}/busmono`
	}

	export function Mute(main: number): string {
		return `${Node(main)}/mute`
	}

	export function Fader(main: number): string {
		return `${Node(main)}/fdr`
	}

	export function Pan(main: number): string {
		return `${Node(main)}/pan`
	}

	export function Width(main: number): string {
		return `${Node(main)}/wid`
	}

	export function Solo(main: number): string {
		return `${Node(main)}/$solo`
	}

	export function SoloLed(main: number): string {
		return `${Node(main)}/$sololed`
	}

	export function MonitorMode(main: number): string {
		return `${Node(main)}/mon`
	}

	export function MatrixSendNode(main: number, matrix: number): string {
		return `${Node(main)}/MX${matrix}`
	}

	export function MatrixSendMute(main: number, matrix: number): string {
		return `${MatrixSendNode(main, matrix)}/on`
	}

	export function MatrixSendLevel(main: number, matrix: number): string {
		return `${MatrixSendNode(main, matrix)}/lvl`
	}

	export function DelayNode(main: number): string {
		return `${Node(main)}/dly`
	}

	export function DelayOn(main: number): string {
		return `${DelayNode(main)}/on`
	}

	export function DelayMode(main: number): string {
		return `${DelayNode(main)}/mode`
	}

	export function DelayAmount(main: number): string {
		return `${DelayNode(main)}/dly`
	}
}
