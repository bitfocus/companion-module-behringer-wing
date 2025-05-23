import { DropdownChoice } from '@companion-module/base'
import { generateDropdownChoices } from './utils.js'

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace ConfigurationCommands {
	////////////////////////////////////////////////
	// Types
	////////////////////////////////////////////////
	export const CLOCK_RATES = [44100, 48000] as const
	export type ClockRates = (typeof CLOCK_RATES)[number]

	export const CLOCK_SOURCES = ['INT', 'A', 'B', 'C', 'AES', 'CARD', 'MOD'] as const
	export type ClockSource = (typeof CLOCK_SOURCES)[number]

	export const MAIN_LINKS = ['OFF', '2', '2-3', '2-4'] as const
	export type MainLink = (typeof MAIN_LINKS)[number]

	export const USB_CONFIGS = ['2/2', '8/8', '16/16', '32/32', '48/48'] as const
	export type UsbConfig = (typeof USB_CONFIGS)[number]

	export const SC_CONFIGS = [
		'AUTO',
		'0/32',
		'1/31',
		'2/30',
		'3/29',
		'4/28',
		'5/27',
		'6/26',
		'7/25',
		'8/24',
		'9/23',
		'10/22',
		'11/21',
		'12/20',
		'13/19',
		'14/18',
		'15/17',
		'16/16',
		'17/15',
		'18/14',
		'19/13',
		'20/12',
		'21/11',
		'22/10',
		'23/9',
		'24/8',
		'25/7',
		'26/6',
		'27/5',
		'28/4',
		'29/3',
		'30/2',
		'31/1',
		'32/0',
	] as const
	export type ScConfig = (typeof SC_CONFIGS)[number]

	export const MONITOR_NODES = [1, 2] as const
	export type MonitorNode = (typeof MONITOR_NODES)[number]

	export const MONITOR_EQ_BANDS = [1, 2, 3, 4, 5, 6] as const
	export type MonitorEqBand = (typeof MONITOR_EQ_BANDS)[number]

	export const MONITOR_SOURCE_OPTIONS = [
		'OFF',
		...Array.from({ length: 4 }, (_, i) => `MAIN.${i + 1}`),
		...Array.from({ length: 8 }, (_, i) => `MTX.${i + 1}`),
		...Array.from({ length: 16 }, (_, i) => `BUS.${i + 1}`),
		...Array.from({ length: 8 }, (_, i) => `AUX.${i + 1}`),
	] as const
	export type MonitorSource = (typeof MONITOR_SOURCE_OPTIONS)[number]

	////////////////////////////////////////////////
	// Dropdown
	////////////////////////////////////////////////
	export function getClockRateOptions(): DropdownChoice[] {
		return generateDropdownChoices(CLOCK_RATES)
	}

	export function getClockSourceOptions(): DropdownChoice[] {
		return generateDropdownChoices(CLOCK_SOURCES)
	}

	export function getMainLinkOptions(): DropdownChoice[] {
		return generateDropdownChoices(MAIN_LINKS)
	}

	export function getUsbConfigOptions(): DropdownChoice[] {
		return generateDropdownChoices(USB_CONFIGS)
	}

	export function getScConfigOptions(): DropdownChoice[] {
		return generateDropdownChoices(SC_CONFIGS)
	}

	export function getMonitorConfigOptions(): DropdownChoice[] {
		return generateDropdownChoices(MONITOR_NODES)
	}

	////////////////////////////////////////////////
	// Commands
	////////////////////////////////////////////////

	export function ConfigNode(): string {
		return `/cfg`
	}

	export function ClockRate(): string {
		return `${ConfigNode()}/clkrate`
	}

	export function ClockSource(): string {
		return `${ConfigNode()}/clksrc`
	}

	export function MainLink(): string {
		return `${ConfigNode()}/mainlink`
	}

	export function DcaGroup(): string {
		return `${ConfigNode()}/dcamgrp`
	}

	export function MuteOverride(): string {
		return `${ConfigNode()}/muteovr`
	}

	export function StartMute(): string {
		return `${ConfigNode()}/startmute`
	}

	export function UsbConfig(): string {
		return `${ConfigNode()}/usbacfg`
	}

	export function ScConfig(): string {
		return `${ConfigNode()}/sccfg`
	}

	export function MonitorNode(node: number): string {
		return `${ConfigNode()}/mon/${node}`
	}

	export function MonitorLevel(node: number): string {
		return `${MonitorNode(node)}/lvl`
	}

	export function MonitorEqGain(node: number, band: MonitorEqBand): string {
		return `${MonitorNode(node)}/eq/${band}g`
	}

	export function MonitorEqFrequency(node: number, band: MonitorEqBand): string {
		return `${MonitorNode(node)}/eq/${band}f`
	}

	export function MonitorEqQ(node: number, band: MonitorEqBand): string {
		return `${MonitorNode(node)}/eq/${band}q`
	}

	export function MonitorEqHighShelfGain(node: number): string {
		return `${MonitorNode(node)}/eq/hsg`
	}

	export function MonitorEqHighShelfFrequency(node: number): string {
		return `${MonitorNode(node)}/eq/hsf`
	}

	export function MonitorLimiterLevel(node: number): string {
		return `${MonitorNode(node)}/lim`
	}

	export function MonitorDelayOn(node: number): string {
		return `${MonitorNode(node)}/dly/on`
	}

	export function MonitorDelayMeters(node: number): string {
		return `${MonitorNode(node)}/dly/m`
	}

	export function MonitorDelayDimLevel(node: number): string {
		return `${MonitorNode(node)}/dim`
	}

	export function MonitorPflDim(node: number): string {
		return `${MonitorNode(node)}/pfldim`
	}

	export function MonitorEqBandSoloTrim(node: number): string {
		return `${MonitorNode(node)}/eqbdtrim`
	}

	export function MonitorSourceLevel(node: number): string {
		return `${MonitorNode(node)}/srclvl`
	}

	export function MonitorSourceMix(node: number): string {
		return `${MonitorNode(node)}/srcmix`
	}

	export function MonitorSource(node: number): string {
		return `${MonitorNode(node)}/src`
	}

	export function SoloNode(): string {
		return `${ConfigNode()}/solo`
	}

	export function SoloMute(): string {
		return `${SoloNode()}/mute`
	}

	export function SoloDim(): string {
		return `${SoloNode()}/$dim`
	}

	export function SoloMono(): string {
		return `${SoloNode()}/$mono`
	}

	export function SoloLRSwap(): string {
		return `${SoloNode()}/$flip`
	}

	export function TalkbackNode(talkback: string): string {
		return `${ConfigNode()}/talk/${talkback}`
	}

	export function TalkbackOn(talkback: string): string {
		return `${TalkbackNode(talkback)}/$on`
	}

	export function TalkbackMode(talkback: string): string {
		return `${TalkbackNode(talkback)}/mode`
	}

	export function TalkbackMonitorDim(talkback: string): string {
		return `${TalkbackNode(talkback)}/mondim`
	}

	export function TalkbackBusDim(talkback: string): string {
		return `${TalkbackNode(talkback)}/busdim`
	}

	export function TalkbackIndividual(talkback: string): string {
		return `${TalkbackNode(talkback)}/indiv`
	}

	export function TalkbackBusAssign(talkback: string, bus: number): string {
		return `${TalkbackNode(talkback)}/B${bus}`
	}

	export function TalkbackMatrixAssign(talkback: string, matrix: number): string {
		return `${TalkbackNode(talkback)}/MX${matrix}`
	}

	export function TalkbackMainAssign(talkback: string, main: number): string {
		return `${TalkbackNode(talkback)}/M${main}`
	}
}
