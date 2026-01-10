import EventEmitter from 'events'
import { ModelSpec } from '../models/types.js'
import osc, { OscMessage } from 'osc'
import { CompanionVariableDefinition, CompanionVariableValues, OSCMetaArgument } from '@companion-module/base'
import * as ActionUtil from '../actions/utils.js'
import { IoCommands } from '../commands/io.js'
import debounceFn from 'debounce-fn'
import { ModuleLogger } from '../handlers/logger.js'
import { getAllVariables } from '../variables/index.js'

const RE_NAME = /\/(\w+)\/(\d+)\/\$?name/
const RE_GAIN = /\/(\w+)\/(\d+)\/in\/set\/\$g/
const RE_MUTE = /^\/(ch|aux|bus|mtx|main|dca|mgrp)\/(\d+)(?:\/(send|main)\/(?:(MX)(\d+)|(\d+))\/(mute|on)|\/(mute))$/
const RE_FADER = /^\/(\w+)\/(\w+)(?:\/(\w+)\/(\w+))?\/(fdr|lvl|\$fdr|\$lvl)$/
const RE_PAN = /^\/(\w+)\/(\w+)(?:\/(\w+)\/(\w+))?\/(pan|\$pan)$/
const RE_USB = /^\/(rec|play)\/(\$?\w+)$/
const RE_SD = /^\/cards\/wlive\/(\d)\/(\$?\w+)\/(\$?\w+)$/
const RE_TALKBACK = /^\/cfg\/talk\/(A|B)\/(B|MX|M)(\d+)$/
const RE_GPIO = /^\/\$ctl\/gpio\/(\d+)\/\$state$/
const RE_CONTROL = /^\/\$ctl\/(lib|\$stat)\/(\$?\w+)/
const RE_COLOR = /\/(\w+)\/(\d+)\/\$?col/

export type VariableUpdate = { name: string; value: string | number }
export class VariableHandler extends EventEmitter {
	private model: ModelSpec
	private readonly messages = new Set<OscMessage>()
	private readonly debounceUpdateVariables: () => void
	private logger: ModuleLogger | undefined

	private variables: CompanionVariableDefinition[] = []

	constructor(model: ModelSpec, updateRate?: number, logger?: ModuleLogger) {
		super()
		this.model = model
		this.logger = logger

		this.debounceUpdateVariables = debounceFn(
			() => {
				this.updateVariables()
				this.messages.clear()
			},
			{
				wait: updateRate ?? 1000,
				before: false,
				after: true,
			},
		)
	}

	setupVariables(): void {
		this.logger?.info('Setting up variables')
		const vars = getAllVariables(this.model)

		this.variables.push({ variableId: 'desk_ip', name: 'Desk IP Address' })
		this.variables.push({ variableId: 'desk_name', name: 'Desk Name' })
		this.variables.push({ variableId: 'main_alt_status', name: 'Main/Alt Input Source' })

		this.variables.push(...vars.map((v) => ({ variableId: v.variableId, name: v.name })))

		this.logger?.info(`Defined ${this.variables.length} variables`)
		this.emit('create-variables', this.variables)
	}

	updateVariables(): void {
		const messages = [...this.messages]
		if (messages.length === 0) {
			return
		}

		const updates: VariableUpdate[] = []
		for (const message of messages) {
			const path = message.address
			const args = message.args as osc.MetaArgument[]

			const result =
				this.updateNameVariables(path, args[0]?.value as string) ??
				this.updateGainVariables(path, args[0]?.value as number) ??
				this.updateMuteVariables(path, args[0]?.value as number) ??
				this.updateFaderVariables(path, args[0]?.value as number) ??
				this.updatePanoramaVariables(path, args[0]?.value as number) ??
				this.updateUsbVariables(path, args[0]) ??
				this.updateSdVariables(path, args[0]) ??
				this.updateTalkbackVariables(path, args[0]) ??
				this.updateGpioVariables(path, args[0]?.value as number) ??
				this.updateControlVariables(path, args[0]) ??
				this.updateIoVariables(path, args[0]) ??
				this.updateColorVariables(path, args[0]?.value as string)

			if (result) {
				updates.push(...result)
			}
		}
		const variables: CompanionVariableValues = {}
		for (const { name, value } of updates) {
			if (name === undefined || value === undefined) continue
			variables[name] = value
		}
		this.emit('update-variables', variables)
	}

	private updateNameVariables(path: string, value: string): VariableUpdate[] | undefined {
		const match = path.match(RE_NAME)
		if (!match) {
			return
		}

		const base = match[1]
		const num = match[2]
		return [{ name: `${base}${num}_name`, value }]
	}

	private updateGainVariables(path: string, value: number): VariableUpdate[] | undefined {
		const match = path.match(RE_GAIN)
		if (!match) {
			return
		}

		const base = match[1]
		const num = match[2]
		value = this.round(value, 1)
		return [{ name: `${base}${num}_gain`, value }]
	}

	private updateMuteVariables(path: string, value: number): VariableUpdate[] | undefined {
		const match = path.match(RE_MUTE)

		if (!match) return

		const source = match[1]
		const srcnum = parseInt(match[2])
		const section = match[3] ?? null
		let dest: string | null = null
		let destnum: number | null = null
		if (match[4] === 'MX') {
			dest = 'MX'
			destnum = parseInt(match[5])
		} else if (match[6]) {
			dest = section
			destnum = parseInt(match[6])
		}
		const action = match[7] ?? match[8]

		// Invert to get mute
		if (action === 'on') value = Number(!(value == 1))

		if (dest == null) {
			const varName = `${source}${srcnum}_mute`
			return [{ name: varName, value }]
		} else {
			if (dest === 'send') {
				dest = 'bus'
			} else if (dest === 'MX') {
				dest = 'mtx'
			}
			const varName = `${source}${srcnum}_${dest}${destnum}_mute`
			return [{ name: varName, value }]
		}
	}

	private updateFaderVariables(path: string, value: number): VariableUpdate[] | undefined {
		const match = path.match(RE_FADER)

		if (!match) {
			return
		}
		const source = `${match[1]}${match[2]}`
		let destination = null
		if (match[3] && match[4]) {
			destination = `${match[3]}${match[4]}`
		}

		if (destination) {
			if (/^send(\d+)$/.test(destination)) {
				destination = destination.replace(/^send(\d+)$/, 'bus$1')
			} else if (/^sendMX(\d+)$/.test(destination)) {
				destination = destination.replace(/^sendMX(\d+)$/, 'mtx$1')
			}
		}
		let varName: string | null = null
		if (destination) {
			varName = `${source}_${destination}_level`
		} else {
			varName = `${source}_level`
		}

		value = this.round(value, 1)
		if (value > -140) {
			return [{ name: varName, value }]
		} else {
			return [{ name: varName, value: '-oo' }]
		}
	}

	private updatePanoramaVariables(path: string, value: number): VariableUpdate[] | undefined {
		const match = path.match(RE_PAN)

		if (!match) {
			return
		}
		const source = `${match[1]}${match[2]}`
		let destination = null
		if (match[3] && match[4]) {
			destination = `${match[3]}${match[4]}`
		}

		if (destination) {
			if (/^send(\d+)$/.test(destination)) {
				destination = destination.replace(/^send(\d+)$/, 'bus$1')
			} else if (/^sendMX(\d+)$/.test(destination)) {
				destination = destination.replace(/^sendMX(\d+)$/, 'mtx$1')
			}
		}

		let varName = null
		if (destination) {
			varName = `${source}_${destination}_pan`
		} else {
			varName = `${source}_pan`
		}
		value = this.round(value, 0)
		return [{ name: varName, value: Math.round(value) }]
	}

	private updateUsbVariables(path: string, args: OSCMetaArgument): VariableUpdate[] | undefined {
		const match = path.match(RE_USB)
		if (!match) {
			return
		}
		const direction = match[1]
		const command = match[2]
		if (direction == 'rec') {
			if (command == '$time') {
				const seconds = args.value as number
				const totalSeconds = seconds.toString()
				const totalMinutes = Math.floor(seconds / 60)
					.toString()
					.padStart(3, '0')
				const remainderSeconds = (seconds % 60).toString().padStart(2, '0')
				const hours = Math.floor(seconds / 3600)
					.toString()
					.padStart(2, '0')
				const minutesWithinHour = Math.floor((seconds % 3600) / 60)
					.toString()
					.padStart(2, '0')
				const secondsWithinMinute = (seconds % 60).toString().padStart(2, '0')
				return [
					{ name: 'usb_record_time_ss', value: totalSeconds },
					{ name: 'usb_record_time_mm_ss', value: `${totalMinutes}:${remainderSeconds}` },
					{ name: 'usb_record_time_hh_mm_ss', value: `${hours}:${minutesWithinHour}:${secondsWithinMinute}` },
				]
			} else if (command == '$actfile') {
				const filename = args.value as string
				return [{ name: 'usb_record_path', value: filename }]
			} else if (command == '$actstate') {
				const state = args.value as string
				return [{ name: 'usb_record_state', value: state }]
			}
		} else if (direction == 'play') {
			if (command == '$pos') {
				const seconds = args.value as number
				const totalSeconds = seconds.toString()
				const totalMinutes = Math.floor(seconds / 60)
					.toString()
					.padStart(3, '0')
				const remainderSeconds = (seconds % 60).toString().padStart(2, '0')
				const hours = Math.floor(seconds / 3600)
					.toString()
					.padStart(2, '0')
				const minutesWithinHour = Math.floor((seconds % 3600) / 60)
					.toString()
					.padStart(2, '0')
				const secondsWithinMinute = (seconds % 60).toString().padStart(2, '0')
				return [
					{ name: 'usb_play_pos_ss', value: totalSeconds },
					{ name: 'usb_play_pos_mm_ss', value: `${totalMinutes}:${remainderSeconds}` },
					{ name: 'usb_play_pos_hh_mm_ss', value: `${hours}:${minutesWithinHour}:${secondsWithinMinute}` },
				]
			} else if (command == '$total') {
				const seconds = args.value as number
				const totalSeconds = seconds.toString()
				const totalMinutes = Math.floor(seconds / 60)
					.toString()
					.padStart(3, '0')
				const remainderSeconds = (seconds % 60).toString().padStart(2, '0')
				const hours = Math.floor(seconds / 3600)
					.toString()
					.padStart(2, '0')
				const minutesWithinHour = Math.floor((seconds % 3600) / 60)
					.toString()
					.padStart(2, '0')
				const secondsWithinMinute = (seconds % 60).toString().padStart(2, '0')
				return [
					{ name: 'usb_play_total_ss', value: totalSeconds },
					{ name: 'usb_play_total_mm_ss', value: `${totalMinutes}:${remainderSeconds}` },
					{ name: 'usb_play_total_hh_mm_ss', value: `${hours}:${minutesWithinHour}:${secondsWithinMinute}` },
				]
			} else if (command == '$actfile') {
				const filename = args.value as string
				return [{ name: 'usb_play_path', value: filename }]
			} else if (command == '$actstate') {
				const state = args.value as string
				return [{ name: 'usb_play_state', value: state }]
			} else if (command == '$song') {
				const song = args.value as string
				return [{ name: 'usb_play_name', value: song }]
			} else if (command == '$album') {
				const album = args.value as string
				return [{ name: 'usb_play_directory', value: album }]
			} else if (command == '$actlist') {
				const playlist = args.value as string
				return [{ name: 'usb_play_playlist', value: playlist }]
			} else if (command == '$actidx') {
				const index = args.value as number
				return [{ name: 'usb_play_playlist_index', value: index }]
			} else if (command == 'repeat') {
				const repeat = args.value as number
				return [{ name: 'usb_play_repeat', value: repeat }]
			}
		}
		return
	}

	private updateSdVariables(path: string, args: OSCMetaArgument): VariableUpdate[] | undefined {
		// Check for SD link status first
		if (path === '/cards/wlive/$actlink' || path === '/cards/wlive/sdlink') {
			const linkStatus = args.value as string
			return [{ name: 'wlive_link_status', value: linkStatus }]
		}

		const match = path.match(RE_SD)

		if (!match) {
			return
		}
		const card = match[1]
		const command = match[2]
		const subcommand = match[3]

		if (command == '$stat') {
			if (subcommand == 'state') {
				let state = args.value as string
				if (state == 'PPAUSE') {
					state = 'PAUSE'
				}
				return [{ name: `wlive_${card}_state`, value: state }]
			} else if (subcommand == 'sdstate') {
				const state = args.value as string
				return [{ name: `wlive_${card}_sdstate`, value: state }]
			} else if (subcommand == 'sdsize') {
				const state = args.value as number
				return [{ name: `wlive_${card}_sdsize`, value: state }]
			} else if (subcommand == 'markers') {
				const state = args.value as number
				return [{ name: `wlive_${card}_marker_total`, value: state }]
			} else if (subcommand == 'markerpos') {
				const state = args.value as number
				return [{ name: `wlive_${card}_marker_current`, value: state }]
			} else if (subcommand == 'sessions') {
				const state = args.value as number
				return [{ name: `wlive_${card}_session_total`, value: state }]
			} else if (subcommand == 'sessionpos') {
				const state = args.value as number
				return [{ name: `wlive_${card}_session_current`, value: state }]
			} else if (subcommand == 'markerlist') {
				const state = args.value as string
				return [{ name: `wlive_${card}_marker_time`, value: state }]
			} else if (subcommand == 'etime') {
				const seconds = Math.floor((args.value as number) / 1000)
				const totalSeconds = seconds.toString()
				const totalMinutes = Math.floor(seconds / 60)
					.toString()
					.padStart(3, '0')
				const remainderSeconds = (seconds % 60).toString().padStart(2, '0')
				const hours = Math.floor(seconds / 3600)
					.toString()
					.padStart(2, '0')
				const minutesWithinHour = Math.floor((seconds % 3600) / 60)
					.toString()
					.padStart(2, '0')
				const secondsWithinMinute = (seconds % 60).toString().padStart(2, '0')
				return [
					{ name: `wlive_${card}_elapsed_time_ss`, value: totalSeconds },
					{ name: `wlive_${card}_elapsed_time_mm_ss`, value: `${totalMinutes}:${remainderSeconds}` },
					{
						name: `wlive_${card}_elapsed_time_hh_mm_ss`,
						value: `${hours}:${minutesWithinHour}:${secondsWithinMinute}`,
					},
				]
			} else if (subcommand == 'sessionlen') {
				const seconds = Math.floor((args.value as number) / 1000)
				const totalSeconds = seconds.toString()
				const totalMinutes = Math.floor(seconds / 60)
					.toString()
					.padStart(3, '0')
				const remainderSeconds = (seconds % 60).toString().padStart(2, '0')
				const hours = Math.floor(seconds / 3600)
					.toString()
					.padStart(2, '0')
				const minutesWithinHour = Math.floor((seconds % 3600) / 60)
					.toString()
					.padStart(2, '0')
				const secondsWithinMinute = (seconds % 60).toString().padStart(2, '0')
				return [
					{ name: `wlive_${card}_session_len_ss`, value: totalSeconds },
					{ name: `wlive_${card}_session_len_mm_ss`, value: `${totalMinutes}:${remainderSeconds}` },
					{
						name: `wlive_${card}_session_len_hh_mm_ss`,
						value: `${hours}:${minutesWithinHour}:${secondsWithinMinute}`,
					},
				]
			} else if (subcommand == 'sdfree') {
				const seconds = Math.floor((args.value as number) / 1000)
				const totalSeconds = seconds.toString()
				const totalMinutes = Math.floor(seconds / 60)
					.toString()
					.padStart(3, '0')
				const remainderSeconds = (seconds % 60).toString().padStart(2, '0')
				const hours = Math.floor(seconds / 3600)
					.toString()
					.padStart(2, '0')
				const minutesWithinHour = Math.floor((seconds % 3600) / 60)
					.toString()
					.padStart(2, '0')
				const secondsWithinMinute = (seconds % 60).toString().padStart(2, '0')
				return [
					{ name: `wlive_${card}_sdfree_ss`, value: totalSeconds },
					{ name: `wlive_${card}_sdfree_mm_ss`, value: `${totalMinutes}:${remainderSeconds}` },
					{
						name: `wlive_${card}_sdfree_hh_mm_ss`,
						value: `${hours}:${minutesWithinHour}:${secondsWithinMinute}`,
					},
				]
			}
			return
		}
		return
	}

	private updateTalkbackVariables(path: string, args: OSCMetaArgument): VariableUpdate[] | undefined {
		const match = path.match(RE_TALKBACK)
		if (!match) {
			return
		}

		const talkback = match[1].toLowerCase()
		let destination = ''
		if (match[2] == 'B') {
			destination = 'bus'
		} else if (match[2] == 'MX') {
			destination = 'mtx'
		} else if (match[2] == 'M') {
			destination = 'main'
		} else {
			return
		}
		const num = match[3]

		return [{ name: `talkback_${talkback}_${destination}${num}_assign`, value: args.value as number }]
	}

	private updateGpioVariables(path: string, value: number): VariableUpdate[] | undefined {
		const match = path.match(RE_GPIO)
		if (!match) {
			return
		}

		const gpio = match[1]
		return [{ name: `gpio${gpio}`, value }]
	}

	private updateControlVariables(path: string, args: OSCMetaArgument): VariableUpdate[] | undefined {
		const pathMatch = path.match(RE_CONTROL)
		if (!pathMatch) return

		const command = pathMatch[1]
		const subcommand = pathMatch[2]
		if (command == 'lib') {
			if (subcommand === '$actshow') {
				const fullShowPath = String(args.value)
				const showMatch = fullShowPath.match(/([^/\\]+)(?=\.show$)/)
				const showname = showMatch?.[1] ?? 'N/A'
				return [
					{ name: 'active_show_path', value: fullShowPath },
					{ name: 'active_show_name', value: showname },
				]
			} else if (subcommand === '$actidx') {
				const index = Number(args.value)
				return [{ name: 'active_show_index', value: index }, ...this.updateShowControlVariables(index)]
			} else if (subcommand === '$active') {
				const fullScenePath = String(args.value)
				const sceneMatch = fullScenePath.match(/([^/\\]+)[/\\]([^/\\]+)\..*$/)
				const scene = sceneMatch?.[2] ?? 'N/A'
				const parent = sceneMatch?.[1] ?? 'N/A'
				return [
					{ name: 'active_scene_name', value: scene },
					{ name: 'active_scene_folder', value: parent },
				]
			}
			return
		} else if (command === '$stat') {
			if (subcommand === 'sof') {
				let index = Number(args.value)
				if (args.type === 'i') {
					// recieved an int, which start at 0 instead of -1
					index = index - 1
				}
				return [
					{ name: 'sof_mode_index', value: index },
					{ name: 'sof_mode_string', value: ActionUtil.getStringFromStripIndex(index) },
				]
			} else if (subcommand === 'selidx') {
				let index = Number(args.value)
				// is arg a string or number?
				if (args.type === 'i') {
					// recieved an int, which start at 0 instead of 1
					index = index + 1
				}
				return [
					{ name: 'sel_index', value: index },
					{ name: 'sel_string', value: ActionUtil.getStringFromStripIndex(index) },
				]
			}
			return
		}
		return
	}

	private updateShowControlVariables(index: number): VariableUpdate[] {
		// const nameMap = self.state.sceneNameToIdMap

		const previous_number = index > 0 ? index - 1 : index
		const next_number = index + 1
		return [
			{ name: 'previous_scene_number', value: previous_number },
			{ name: 'active_scene_number', value: index },
			{ name: 'next_scene_number', value: next_number },
		]
		// const next_number = index < nameMap.size - 1 ? index + 1 : index

		// TODO: find a way to re-implement this nicely
		// function getKeyByValue(map: Map<string, number>, value: number): string | undefined {
		//     for (const [key, val] of map.entries()) {
		//         if (val === value) return key
		//     }
		//     return undefined
		// }

		// const nextName = getKeyByValue(nameMap, index + 1)
		// const currentName = getKeyByValue(nameMap, index)
		// const prevName = getKeyByValue(nameMap, index - 1)
		// this.emit('update-variable', 'previous_scene_name', prevName as string)
		// this.emit('update-variable', 'active_scene_name', currentName as string)
		// this.emit('update-variable', 'next_scene_name', nextName as string)
	}

	private updateIoVariables(path: string, arg: OSCMetaArgument): VariableUpdate[] | undefined {
		const altsw = IoCommands.MainAltSwitch()
		if (path !== altsw) return

		let isMain = false
		const raw = arg?.value as unknown
		if (typeof raw === 'number') {
			// Wing: 0=Main, 1=Alt
			isMain = raw === 0
		} else if (typeof raw === 'string') {
			const s = raw.trim().toLowerCase()
			if (s === 'main') isMain = true
			else if (s === 'alt') isMain = false
			else if (s === '0') isMain = true
			else if (s === '1') isMain = false
			else {
				const n = Number.parseFloat(s)
				if (!Number.isNaN(n)) isMain = n === 0
			}
		}

		return [{ name: 'main_alt_status', value: isMain ? 'Main' : 'Alt' }]
	}

	private updateColorVariables(path: string, value: string): VariableUpdate[] | undefined {
		const match = path.match(RE_COLOR)
		if (!match) {
			return
		}

		const base = match[1]
		const num = match[2]
		return [{ name: `${base}${num}_color`, value }]
	}

	processMessage(msgs: Set<OscMessage>): void {
		msgs.forEach((msg) => this.messages.add(msg))
		this.debounceUpdateVariables()
	}

	destroy(): void {}

	round(num: number, precision: number): number {
		return Math.round(num * Math.pow(10, precision)) / Math.pow(10, precision)
	}
}
