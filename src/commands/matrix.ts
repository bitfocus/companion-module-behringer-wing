// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace MatrixCommands {
	export function Node(matrix: number): string {
		return `/mtx/${matrix}`
	}

	export function InputNode(matrix: number): string {
		return `${Node(matrix)}/in`
	}

	export function InputSetNode(matrix: number): string {
		return `${InputNode(matrix)}/set`
	}

	export function InputInvert(matrix: number): string {
		return `${InputSetNode(matrix)}/inv`
	}

	export function InputTrim(matrix: number): string {
		return `${InputSetNode(matrix)}/trim`
	}

	export function InputBalance(matrix: number): string {
		return `${InputSetNode(matrix)}/bal`
	}

	export function DirectInputNode(matrix: number): string {
		return `${Node(matrix)}/dir`
	}

	export function DirectInputSwitch(matrix: number): string {
		return `${DirectInputNode(matrix)}/on`
	}

	export function DirectInputLevel(matrix: number): string {
		return `${DirectInputNode(matrix)}/lvl`
	}

	export function DirectInputInvert(matrix: number): string {
		return `${DirectInputNode(matrix)}/inv`
	}

	export function DirectInputTap(matrix: number): string {
		return `${DirectInputNode(matrix)}/tap`
	}

	export function DirectInputIn(matrix: number): string {
		return `${DirectInputNode(matrix)}/in`
	}

	export function Color(matrix: number): string {
		return `${Node(matrix)}/col`
	}

	export function Name(matrix: number): string {
		return `${Node(matrix)}/name`
	}

	export function RealName(matrix: number): string {
		return `${Node(matrix)}/$name`
	}

	export function Icon(matrix: number): string {
		return `${Node(matrix)}/icon`
	}

	export function ScribbleLight(matrix: number): string {
		return `${Node(matrix)}/led`
	}

	export function MonoSwitch(matrix: number): string {
		return `${Node(matrix)}/busmono`
	}

	export function Mute(matrix: number): string {
		return `${Node(matrix)}/mute`
	}

	export function Fader(matrix: number): string {
		return `${Node(matrix)}/fdr`
	}

	export function Pan(matrix: number): string {
		return `${Node(matrix)}/pan`
	}

	export function Width(matrix: number): string {
		return `${Node(matrix)}/wid`
	}

	export function Solo(matrix: number): string {
		return `${Node(matrix)}/$solo`
	}

	export function SoloLed(matrix: number): string {
		return `${Node(matrix)}/$sololed`
	}

	export function MonitorMode(matrix: number): string {
		return `${Node(matrix)}/mon`
	}

	export function DelayNode(matrix: number): string {
		return `${Node(matrix)}/dly`
	}

	export function DelayOn(matrix: number): string {
		return `${DelayNode(matrix)}/on`
	}

	export function DelayMode(matrix: number): string {
		return `${DelayNode(matrix)}/mode`
	}

	export function DelayAmount(matrix: number): string {
		return `${DelayNode(matrix)}/dly`
	}

	export function EqNode(matrix: number): string {
		return `${Node(matrix)}/eq`
	}

	export function EqOn(matrix: number): string {
		return `${EqNode(matrix)}/on`
	}

	export function PreInsertNode(matrix: number): string {
		return `${Node(matrix)}/preins`
	}

	export function PreInsertOn(matrix: number): string {
		return `${PreInsertNode(matrix)}/on`
	}

	export function PostInsertNode(matrix: number): string {
		return `${Node(matrix)}/postins`
	}

	export function PostInsertOn(matrix: number): string {
		return `${PostInsertNode(matrix)}/on`
	}
}
