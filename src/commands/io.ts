// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace IoCommands {
	export function Node(): string {
		return `/io`
	}

	export function MainAltSwitch(): string {
		return `${Node()}/altsw`
	}
}
