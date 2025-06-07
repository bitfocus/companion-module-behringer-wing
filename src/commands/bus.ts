// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace BusCommands {
	export function Node(bus: number): string {
		return `/bus/${bus}`
	}

	export function InputNode(bus: number): string {
		return `${Node(bus)}/in`
	}

	export function InputSetNode(bus: number): string {
		return `${InputNode(bus)}/set`
	}

	export function InputInvert(bus: number): string {
		return `${InputSetNode(bus)}/inv`
	}

	export function InputTrim(bus: number): string {
		return `${InputSetNode(bus)}/trim`
	}

	export function InputBalance(bus: number): string {
		return `${InputSetNode(bus)}/bal`
	}

	export function Color(bus: number): string {
		return `${Node(bus)}/col`
	}

	export function Name(bus: number): string {
		return `${Node(bus)}/name`
	}

	export function Icon(bus: number): string {
		return `${Node(bus)}/icon`
	}

	export function ScribbleLight(bus: number): string {
		return `${Node(bus)}/led`
	}

	export function MonoSwitch(bus: number): string {
		return `${Node(bus)}/busmono`
	}

	export function Mute(bus: number): string {
		return `${Node(bus)}/mute`
	}

	export function Fader(bus: number): string {
		return `${Node(bus)}/fdr`
	}

	export function Pan(bus: number): string {
		return `${Node(bus)}/pan`
	}

	export function Width(bus: number): string {
		return `${Node(bus)}/wid`
	}

	export function Solo(bus: number): string {
		return `${Node(bus)}/$solo`
	}

	export function SoloLed(bus: number): string {
		return `${Node(bus)}/$sololed`
	}

	export function MonitorMode(bus: number): string {
		return `${Node(bus)}/mon`
	}

	export function Mode(bus: number): string {
		return `${Node(bus)}/busmode`
	}

	export function MainNode(bus: number, main: number): string {
		return `${Node(bus)}/main/${main}`
	}

	export function MainSendOn(bus: number, main: number): string {
		return `${MainNode(bus, main)}/on`
	}

	export function MainSendLevel(bus: number, main: number): string {
		return `${MainNode(bus, main)}/lvl`
	}

	export function SendNode(bus: number, send: number): string {
		return `${Node(bus)}/send/${send}`
	}

	export function SendOn(bus: number, send: number): string {
		return `${SendNode(bus, send)}/on`
	}

	export function SendLevel(bus: number, send: number): string {
		return `${SendNode(bus, send)}/lvl`
	}

	export function MatrixSendNode(bus: number, matrix: number): string {
		return `${Node(bus)}/send/MX${matrix}`
	}

	export function MatrixSendOn(bus: number, matrix: number): string {
		return `${MatrixSendNode(bus, matrix)}/on`
	}

	export function MatrixSendLevel(bus: number, matrix: number): string {
		return `${MatrixSendNode(bus, matrix)}/lvl`
	}

	export function MatrixSendPan(bus: number, matrix: number): string {
		return `${MatrixSendNode(bus, matrix)}/pan`
	}

	export function DelayNode(bus: number): string {
		return `${Node(bus)}/dly`
	}

	export function DelayOn(bus: number): string {
		return `${DelayNode(bus)}/on`
	}

	export function DelayMode(bus: number): string {
		return `${DelayNode(bus)}/mode`
	}

	export function DelayAmount(bus: number): string {
		return `${DelayNode(bus)}/dly`
	}

	export function EqNode(bus: number): string {
		return `${Node(bus)}/eq`
	}

	export function EqOn(bus: number): string {
		return `${EqNode(bus)}/on`
	}

	export function PreInsertNode(bus: number): string {
		return `${Node(bus)}/preins`
	}

	export function PreInsertOn(bus: number): string {
		return `${PreInsertNode(bus)}/on`
	}

	export function PostInsertNode(bus: number): string {
		return `${Node(bus)}/postins`
	}

	export function PostInsertOn(bus: number): string {
		return `${PostInsertNode(bus)}/on`
	}
}
