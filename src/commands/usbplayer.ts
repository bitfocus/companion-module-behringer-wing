// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace UsbPlayerCommands {
	export function PlayerNode(): string {
		return `/play`
	}

	export function PlayerAction(): string {
		return `${PlayerNode()}/$action`
	}

	export function PlayerActiveState(): string {
		return `${PlayerNode()}/$actstate`
	}

	export function PlayerActiveFile(): string {
		return `${PlayerNode()}/$actfile`
	}

	export function PlayerSong(): string {
		return `${PlayerNode()}/$song`
	}

	export function PlayerAlbum(): string {
		return `${PlayerNode()}/$album`
	}

	export function PlayerArtist(): string {
		return `${PlayerNode()}/$artist`
	}

	export function PlayerPosition(): string {
		return `${PlayerNode()}/$pos`
	}

	export function PlayerTotalTime(): string {
		return `${PlayerNode()}/$total`
	}

	export function PlayerResolution(): string {
		return `${PlayerNode()}/$resolution`
	}

	export function PlayerChannels(): string {
		return `${PlayerNode()}/$channels`
	}

	export function PlayerRate(): string {
		return `${PlayerNode()}/$rate`
	}

	export function PlayerFormat(): string {
		return `${PlayerNode()}/$format`
	}

	export function PlayerRepeat(): string {
		return `${PlayerNode()}/repeat`
	}

	export function RecorderNode(): string {
		return `/rec`
	}

	export function RecorderActiveState(): string {
		return `${RecorderNode()}/$actstate`
	}

	export function RecorderActiveFile(): string {
		return `${RecorderNode()}/$actfile`
	}

	export function RecorderAction(): string {
		return `${RecorderNode()}/$action`
	}

	export function RecorderPath(): string {
		return `${RecorderNode()}/path`
	}

	export function RecorderResolution(): string {
		return `${RecorderNode()}/resolution`
	}

	export function RecorderChannels(): string {
		return `${RecorderNode()}/channels`
	}

	export function RecorderTime(): string {
		return `${RecorderNode()}/$time`
	}
}
