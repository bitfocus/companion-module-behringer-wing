// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace ChannelCommands {
	export function Node(channel: number): string {
		return `/ch/${channel}`
	}

	export function InputNode(channel: number): string {
		return `${Node(channel)}/in`
	}

	export function InputSetNode(channel: number): string {
		return `${InputNode(channel)}/set`
	}

	export function InputAutoSourceSwitch(channel: number): string {
		return `${InputSetNode(channel)}/srcauto`
	}

	export function InputAltSource(channel: number): string {
		return `${InputSetNode(channel)}/altsrc`
	}

	export function InputInvert(channel: number): string {
		return `${InputSetNode(channel)}/inv`
	}

	export function InputTrim(channel: number): string {
		return `${InputSetNode(channel)}/trim`
	}

	export function InputBalance(channel: number): string {
		return `${InputSetNode(channel)}/bal`
	}

	export function InputDelayMode(channel: number): string {
		return `${InputSetNode(channel)}/dlymode`
	}

	export function InputGain(channel: number): string {
		return `${InputSetNode(channel)}/$g`
	}

	export function InputPhantomPower(channel: number): string {
		return `${InputSetNode(channel)}/$vph`
	}

	export function DelayOn(channel: number): string {
		return `${InputSetNode(channel)}/dlyon`
	}

	export function DelayMode(channel: number): string {
		return `${InputSetNode(channel)}/dlymode`
	}

	export function DelayAmount(channel: number): string {
		return `${InputSetNode(channel)}/dly`
	}

	export function InputConnectionNode(channel: number): string {
		return `${InputNode(channel)}/conn`
	}

	export function MainInputConnectionGroup(channel: number): string {
		return `${InputConnectionNode(channel)}/grp`
	}

	export function MainInputConnectionIndex(channel: number): string {
		return `${InputConnectionNode(channel)}/in`
	}

	export function AltInputConnectionGroup(channel: number): string {
		return `${InputConnectionNode(channel)}/altgrp`
	}

	export function AltInputConnectionIndex(channel: number): string {
		return `${InputConnectionNode(channel)}/altin`
	}

	export function FilterNode(channel: number): string {
		return `${Node(channel)}/flt`
	}

	export function LowCutSwitch(channel: number): string {
		return `${FilterNode(channel)}/lc`
	}

	export function LowCutFrequency(channel: number): string {
		return `${FilterNode(channel)}/lcf`
	}

	export function HighCutSwitch(channel: number): string {
		return `${FilterNode(channel)}/hc`
	}

	export function HighCutFrequency(channel: number): string {
		return `${FilterNode(channel)}/hcf`
	}

	export function FilterSwitch(channel: number): string {
		return `${FilterNode(channel)}/tf`
	}

	export function FilterModel(channel: number): string {
		return `${FilterNode(channel)}/mdl`
	}

	export function FilterTilt(channel: number): string {
		return `${FilterNode(channel)}/tilt`
	}

	export function CustomLink(channel: number): string {
		return `${Node(channel)}/clink`
	}

	export function Color(channel: number): string {
		return `${Node(channel)}/col`
	}

	export function Name(channel: number): string {
		return `${Node(channel)}/name`
	}

	export function RealName(channel: number): string {
		return `${Node(channel)}/$name`
	}

	export function Icon(channel: number): string {
		return `${Node(channel)}/icon`
	}

	export function ScribbleLight(channel: number): string {
		return `${Node(channel)}/led`
	}

	export function Mute(channel: number): string {
		return `${Node(channel)}/mute`
	}

	export function Fader(channel: number): string {
		return `${Node(channel)}/fdr`
	}

	export function Pan(channel: number): string {
		return `${Node(channel)}/pan`
	}

	export function Width(channel: number): string {
		return `${Node(channel)}/wid`
	}

	export function Solo(channel: number): string {
		return `${Node(channel)}/$solo`
	}

	export function SoloLed(channel: number): string {
		return `${Node(channel)}/$sololed`
	}

	export function SoloSafe(channel: number): string {
		return `${Node(channel)}/solosafe`
	}

	export function MonitorMode(channel: number): string {
		return `${Node(channel)}/mon`
	}

	export function ProcessOrder(channel: number): string {
		return `${Node(channel)}/proc`
	}

	export function PreTap(channel: number): string {
		return `${Node(channel)}/ptap`
	}

	export function PreSolo(channel: number): string {
		return `${Node(channel)}/$presolo`
	}

	export function PreInsertNode(channel: number): string {
		return `${Node(channel)}/preins`
	}

	export function PreInsertOn(channel: number): string {
		return `${PreInsertNode(channel)}/on`
	}

	export function MainNode(channel: number, main: number): string {
		return `${Node(channel)}/main/${main}`
	}

	export function MainSendOn(channel: number, main: number): string {
		return `${MainNode(channel, main)}/on`
	}

	export function MainSendLevel(channel: number, main: number): string {
		return `${MainNode(channel, main)}/lvl`
	}

	export function SendNode(channel: number, send: number): string {
		return `${Node(channel)}/send/${send}`
	}

	export function SendOn(channel: number, send: number): string {
		return `${SendNode(channel, send)}/on`
	}

	export function SendLevel(channel: number, send: number): string {
		return `${SendNode(channel, send)}/lvl`
	}

	export function SendPreAlwaysOn(channel: number, send: number): string {
		return `${SendNode(channel, send)}/pon`
	}

	export function SendIndividualTap(channel: number, send: number): string {
		return `${SendNode(channel, send)}/ind`
	}

	export function SendMode(channel: number, send: number): string {
		return `${SendNode(channel, send)}/mode`
	}

	export function SendPanLink(channel: number, send: number): string {
		return `${SendNode(channel, send)}/plink`
	}

	export function SendPan(channel: number, send: number): string {
		return `${SendNode(channel, send)}/pan`
	}

	export function SendWidth(channel: number, send: number): string {
		return `${SendNode(channel, send)}/wid`
	}

	export function MatrixSendNode(channel: number, mtx: number): string {
		return `${Node(channel)}/send/MX${mtx}`
	}

	export function MatrixSendOn(channel: number, mtx: number): string {
		return `${MatrixSendNode(channel, mtx)}/on`
	}

	export function MatrixSendLevel(channel: number, mtx: number): string {
		return `${MatrixSendNode(channel, mtx)}/lvl`
	}
	export function MatrixSendPan(channel: number, mtx: number): string {
		return `${MatrixSendNode(channel, mtx)}/pan`
	}

	export function PostInsertNode(channel: number): string {
		return `${Node(channel)}/postins`
	}

	export function PostInsertOn(channel: number): string {
		return `${PostInsertNode(channel)}/on`
	}

	export function EqNode(channel: number): string {
		return `${Node(channel)}/eq`
	}

	export function EqOn(channel: number): string {
		return `${EqNode(channel)}/on`
	}

	export function EqModel(channel: number): string {
		return `${EqNode(channel)}/mdl`
	}
}
