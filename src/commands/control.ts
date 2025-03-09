// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace ControlCommands {
	export function Node(): string {
		return `/$ctl`
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
}
