// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace MuteGroupCommands {
	export function Node(group: number): string {
		return `/mgrp/${group}`
	}

	export function Name(group: number): string {
		return `${Node(group)}/name`
	}

	export function Mute(group: number): string {
		return `${Node(group)}/mute`
	}
}
