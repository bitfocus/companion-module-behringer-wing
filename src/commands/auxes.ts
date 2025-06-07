// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace AuxCommands {
	export function Node(aux: number): string {
		return `/aux/${aux}`
	}

	export function InputNode(aux: number): string {
		return `${Node(aux)}/in`
	}

	export function InputSetNode(aux: number): string {
		return `${InputNode(aux)}/set`
	}

	export function InputAutoSourceSwitch(aux: number): string {
		return `${InputSetNode(aux)}/srcauto`
	}

	export function InputAltSource(aux: number): string {
		return `${InputSetNode(aux)}/altsrc`
	}

	export function InputInvert(aux: number): string {
		return `${InputSetNode(aux)}/inv`
	}

	export function InputTrim(aux: number): string {
		return `${InputSetNode(aux)}/trim`
	}

	export function InputBalance(aux: number): string {
		return `${InputSetNode(aux)}/bal`
	}

	export function InputGain(aux: number): string {
		return `${InputSetNode(aux)}/$g`
	}

	export function InputPhantomPower(aux: number): string {
		return `${InputSetNode(aux)}/$vph`
	}

	export function InputConnectionNode(aux: number): string {
		return `${InputNode(aux)}/conn`
	}

	export function MainInputConnectionGroup(aux: number): string {
		return `${InputConnectionNode(aux)}/grp`
	}

	export function MainInputConnectionIndex(aux: number): string {
		return `${InputConnectionNode(aux)}/in`
	}

	export function AltInputConnectionGroup(aux: number): string {
		return `${InputConnectionNode(aux)}/altgrp`
	}

	export function AltInputConnectionIndex(aux: number): string {
		return `${InputConnectionNode(aux)}/altin`
	}

	export function CustomLink(aux: number): string {
		return `${Node(aux)}/clink`
	}

	export function Color(aux: number): string {
		return `${Node(aux)}/col`
	}

	export function Name(aux: number): string {
		return `${Node(aux)}/name`
	}

	export function RealName(aux: number): string {
		return `${Node(aux)}/$name`
	}

	export function Icon(aux: number): string {
		return `${Node(aux)}/icon`
	}

	export function ScribbleLight(aux: number): string {
		return `${Node(aux)}/led`
	}

	export function Mute(aux: number): string {
		return `${Node(aux)}/mute`
	}

	export function Fader(aux: number): string {
		return `${Node(aux)}/fdr`
	}

	export function Pan(aux: number): string {
		return `${Node(aux)}/pan`
	}

	export function Width(aux: number): string {
		return `${Node(aux)}/wid`
	}

	export function Solo(aux: number): string {
		return `${Node(aux)}/$solo`
	}

	export function SoloLed(aux: number): string {
		return `${Node(aux)}/$sololed`
	}

	export function SoloSafe(aux: number): string {
		return `${Node(aux)}/solosafe`
	}

	export function MonitorMode(aux: number): string {
		return `${Node(aux)}/mon`
	}

	export function PreInsertNode(aux: number): string {
		return `${Node(aux)}/preins`
	}

	export function PreInsertOn(aux: number): string {
		return `${PreInsertNode(aux)}/on`
	}

	export function MainNode(aux: number, main: number): string {
		return `${Node(aux)}/main/${main}`
	}

	export function MainSendOn(aux: number, main: number): string {
		return `${MainNode(aux, main)}/on`
	}

	export function MainSendLevel(aux: number, main: number): string {
		return `${MainNode(aux, main)}/lvl`
	}

	export function SendNode(aux: number, send: number): string {
		return `${Node(aux)}/send/${send}`
	}

	export function SendOn(aux: number, send: number): string {
		return `${SendNode(aux, send)}/on`
	}

	export function SendLevel(aux: number, send: number): string {
		return `${SendNode(aux, send)}/lvl`
	}

	export function SendPan(aux: number, send: number): string {
		return `${SendNode(aux, send)}/pan`
	}

	export function MatrixSendNode(aux: number, mtx: number): string {
		return `${Node(aux)}/send/MX${mtx}`
	}

	export function MatrixSendLevel(aux: number, mtx: number): string {
		return `${MatrixSendNode(aux, mtx)}/lvl`
	}

	export function MatrixSendPan(aux: number, mtx: number): string {
		return `${MatrixSendNode(aux, mtx)}/pan`
	}

	export function EqNode(aux: number): string {
		return `${Node(aux)}/eq`
	}

	export function EqOn(aux: number): string {
		return `${EqNode(aux)}/on`
	}
}
