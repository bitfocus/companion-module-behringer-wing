// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace ControlCommands {
	export function Node(): string {
		return `/$ctl`
	}

	export function StatusNode(): string {
		return `${Node()}/$stat`
	}

	export function SetSof(): string {
		return `${StatusNode()}/sof`
	}

	export function SetSelect(): string {
		return `${StatusNode()}/selidx`
	}

	export function LibraryNode(): string {
		return `${Node()}/lib`
	}

	export function LibraryScenes(): string {
		return `${LibraryNode()}/$scenes`
	}

	export function LibraryActiveSceneIndex(): string {
		return `${LibraryNode()}/$actidx`
	}

	export function LibraryActiveSceneName(): string {
		return `${LibraryNode()}/$active`
	}

	export function LibraryActiveShowName(): string {
		return `${LibraryNode()}/$actshow`
	}

	export function LibraryAction(): string {
		return `${LibraryNode()}/$action`
	}

	export function LibrarySceneSelectionIndex(): string {
		return `${LibraryNode()}/$actionidx`
	}

	export function GpioNode(gpio: number): string {
		return `${Node()}/gpio/${gpio}`
	}

	export function GpioMode(gpio: number): string {
		return `${GpioNode(gpio)}/mode`
	}

	export function GpioState(gpio: number): string {
		return `${GpioNode(gpio)}/gpstate`
	}

	export function GpioReadState(gpio: number): string {
		return `${GpioNode(gpio)}/$state`
	}

	export function ConfigNode(): string {
		return `${Node()}/cfg`
	}

	export function SaveNow(): string {
		return `${ConfigNode()}/$savenow`
	}

	export function LightsNode(): string {
		return `${ConfigNode()}/lights`
	}

	export function ButtonsBacklightIntensity(): string {
		return `${LightsNode()}/btns`
	}

	export function ButtonsLEDIntensity(): string {
		return `${LightsNode()}/leds`
	}

	export function MetersIntensity(): string {
		return `${LightsNode()}/meters`
	}

	export function ColorLEDIntensity(): string {
		return `${LightsNode()}/rgbleds`
	}

	export function ChannelLCDIntensity(): string {
		return `${LightsNode()}/chlcds`
	}

	export function ChannelLCDContrast(): string {
		return `${LightsNode()}/chlcdctr`
	}

	export function ChannelStripIntensity(): string {
		return `${LightsNode()}/chedit`
	}

	export function TouchscreenIntensity(): string {
		return `${LightsNode()}/main`
	}

	export function UnderConsoleLightIntensity(): string {
		return `${LightsNode()}/glow`
	}

	export function PatchPanelLightIntensity(): string {
		return `${LightsNode()}/patch`
	}

	export function LampLightIntensity(): string {
		return `${LightsNode()}/lamp`
	}
}
