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
}
