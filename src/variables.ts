import { OscMessage } from 'osc'
import type { WingInstance } from './index.js'
import { OSCMetaArgument } from '@companion-module/base/dist/index.js' // eslint-disable-line n/no-missing-import
import { ControlCommands } from './commands/control.js'

export function UpdateVariableDefinitions(self: WingInstance): void {
	const model = self.model

	const variables = []

	variables.push({ variableId: 'desk_ip', name: 'Desk IP Address' })
	variables.push({ variableId: 'desk_name', name: 'Desk Name' })

	for (let ch = 1; ch <= model.channels; ch++) {
		variables.push({
			variableId: `ch${ch}_name`,
			name: `Channel ${ch} Name`,
		})
		variables.push({
			variableId: `ch${ch}_gain`,
			name: `Channel ${ch} Gain`,
		})
		variables.push({
			variableId: `ch${ch}_mute`,
			name: `Channel ${ch} Mute`,
		})
		variables.push({
			variableId: `ch${ch}_level`,
			name: `Channel ${ch} Level`,
		})
		variables.push({
			variableId: `ch${ch}_pan`,
			name: `Channel ${ch} Pan`,
		})
		for (let bus = 1; bus <= model.busses; bus++) {
			variables.push({
				variableId: `ch${ch}_bus${bus}_mute`,
				name: `Channel ${ch} to Bus ${bus} Mute`,
			})
			variables.push({
				variableId: `ch${ch}_bus${bus}_level`,
				name: `Channel ${ch} to Bus ${bus} Level`,
			})
			variables.push({
				variableId: `ch${ch}_bus${bus}_pan`,
				name: `Channel ${ch} to Bus ${bus} Pan`,
			})
		}
		for (let mtx = 1; mtx <= model.matrices; mtx++) {
			variables.push({
				variableId: `ch${ch}_mtx${mtx}_mute`,
				name: `Channel ${ch} to Matrix ${mtx} Mute`,
			})
			variables.push({
				variableId: `ch${ch}_mtx${mtx}_level`,
				name: `Channel ${ch} to Matrix ${mtx} Level`,
			})
		}
	}

	for (let aux = 1; aux <= model.auxes; aux++) {
		variables.push({
			variableId: `aux${aux}_name`,
			name: `Aux ${aux} Name`,
		})
		variables.push({
			variableId: `aux${aux}_gain`,
			name: `Aux ${aux} Gain`,
		})
		variables.push({
			variableId: `aux${aux}_mute`,
			name: `Aux ${aux} Mute`,
		})
		variables.push({
			variableId: `aux${aux}_level`,
			name: `Aux ${aux} Level`,
		})
		variables.push({
			variableId: `aux${aux}_pan`,
			name: `Aux ${aux} Pan`,
		})
		for (let bus = 1; bus <= model.busses; bus++) {
			variables.push({
				variableId: `aux${aux}_bus${bus}_mute`,
				name: `Aux ${aux} to Bus ${bus} Mutes`,
			})
			variables.push({
				variableId: `aux${aux}_bus${bus}_level`,
				name: `Aux ${aux} to Bus ${bus} Level`,
			})
			variables.push({
				variableId: `aux${aux}_bus${bus}_pan`,
				name: `Aux ${aux} to Bus ${bus} Pan`,
			})
		}
		for (let mtx = 1; mtx <= model.matrices; mtx++) {
			variables.push({
				variableId: `aux${aux}_mtx${mtx}_mute`,
				name: `Aux ${aux} to Matrix ${mtx} Mute`,
			})
		}
	}

	for (let bus = 1; bus <= model.busses; bus++) {
		variables.push({
			variableId: `bus${bus}_name`,
			name: `Bus ${bus} Name`,
		})
		variables.push({
			variableId: `bus${bus}_mute`,
			name: `Bus ${bus} Mute`,
		})
		variables.push({
			variableId: `bus${bus}_level`,
			name: `Bus ${bus} Level`,
		})
		variables.push({
			variableId: `bus${bus}_pan`,
			name: `Bus ${bus} Pan`,
		})
		for (let send = 1; send <= model.busses; send++) {
			if (bus == send) {
				continue
			}
			variables.push({
				variableId: `bus${bus}_bus${send}_mute`,
				name: `Bus ${bus} to Bus ${send} Mute`,
			})
			variables.push({
				variableId: `bus${bus}_bus${send}_level`,
				name: `Bus ${bus} to Bus ${send} Level`,
			})
			variables.push({
				variableId: `bus${bus}_bus${send}_pan`,
				name: `Bus ${bus} to Bus ${send} Pan`,
			})
		}
		for (let mtx = 1; mtx <= model.matrices; mtx++) {
			variables.push({
				variableId: `bus${bus}_mtx${mtx}_mute`,
				name: `Bus ${bus} to Matrix ${mtx} Mute`,
			})
		}
	}

	for (let mtx = 1; mtx <= model.matrices; mtx++) {
		variables.push({
			variableId: `mtx${mtx}_name`,
			name: `Matrix ${mtx} Name`,
		})
		variables.push({
			variableId: `mtx${mtx}_mute`,
			name: `Matrix ${mtx} Mute`,
		})
		variables.push({
			variableId: `mtx${mtx}_level`,
			name: `Matrix ${mtx} Level`,
		})
		variables.push({
			variableId: `mtx${mtx}_pan`,
			name: `Matrix ${mtx} Pan`,
		})
	}

	for (let main = 1; main <= model.mains; main++) {
		variables.push({
			variableId: `main${main}_name`,
			name: `Main ${main} Name`,
		})
		variables.push({
			variableId: `main${main}_mute`,
			name: `Main ${main} Mute`,
		})
		variables.push({
			variableId: `main${main}_level`,
			name: `Main ${main} Level`,
		})
		variables.push({
			variableId: `main${main}_pan`,
			name: `Main ${main} Pan`,
		})
	}

	for (let dca = 1; dca <= model.dcas; dca++) {
		variables.push({
			variableId: `dca${dca}_name`,
			name: `DCA ${dca} Name`,
		})
		variables.push({
			variableId: `dca${dca}_mute`,
			name: `DCA ${dca} Mute`,
		})
		variables.push({
			variableId: `dca${dca}_level`,
			name: `DCA ${dca} Level`,
		})
	}

	for (let mgrp = 1; mgrp <= model.mutegroups; mgrp++) {
		variables.push({
			variableId: `mgrp${mgrp}_name`,
			name: `Mutegroup ${mgrp} Name`,
		})
		variables.push({
			variableId: `mgrp${mgrp}_mute`,
			name: `Mutegroup ${mgrp} Mute`,
		})
	}

	variables.push({ variableId: 'usb_record_time_ss', name: 'USB Record Time (ss)' })
	variables.push({ variableId: 'usb_record_time_mm_ss', name: 'USB Record Time (mm:ss)' })
	variables.push({ variableId: 'usb_record_time_hh_mm_ss', name: 'USB Record Time (hh:mm:ss)' })
	variables.push({ variableId: 'usb_record_path', name: 'USB Record File Path' })
	variables.push({ variableId: 'usb_record_state', name: 'USB Record State' })

	variables.push({ variableId: 'usb_play_pos_ss', name: 'USB Player Position (ss)' })
	variables.push({ variableId: 'usb_play_pos_mm_ss', name: 'USB Player Position (mm:ss)' })
	variables.push({ variableId: 'usb_play_pos_hh_mm_ss', name: 'USB Player Position (hh:mm:ss)' })
	variables.push({ variableId: 'usb_play_total_ss', name: 'USB Player File Length (ss)' })
	variables.push({ variableId: 'usb_play_total_mm_ss', name: 'USB Player File Length (mm:ss)' })
	variables.push({ variableId: 'usb_play_total_hh_mm_ss', name: 'USB Player File Length (hh:mm:ss)' })
	variables.push({ variableId: 'usb_play_path', name: 'USB Player File Path' })
	variables.push({ variableId: 'usb_play_state', name: 'USB Player State' })
	variables.push({ variableId: 'usb_play_name', name: 'USB Player File Name' })
	variables.push({ variableId: 'usb_play_directory', name: 'USB Player File Directory' })
	variables.push({ variableId: 'usb_play_playlist', name: 'USB Player Active Playlist' })
	variables.push({ variableId: 'usb_play_playlist_index', name: 'USB Player Playlist Index' })
	variables.push({ variableId: 'usb_play_repeat', name: 'USB Player Repeat Playlist' })

	for (let card = 1; card <= 2; card++) {
		variables.push({ variableId: `wlive_${card}_state`, name: `Wing Live Card ${card} State` })
		variables.push({ variableId: `wlive_${card}_pos_ss`, name: `Wing Live Card ${card} Position (ss)` })
		variables.push({ variableId: `wlive_${card}_pos_mm_ss`, name: `Wing Live Card ${card} Position (mm:ss)` })
		variables.push({ variableId: `wlive_${card}_pos_hh_mm_ss`, name: `Wing Live Card ${card} Position (hh:mm:ss)` })
		variables.push({ variableId: `wlive_${card}_sdfree_ss`, name: `Wing Live Card ${card} Free Space (ss)` })
		variables.push({ variableId: `wlive_${card}_sdfree_mm_ss`, name: `Wing Live Card ${card} Free Space (mm:ss)` })
		variables.push({
			variableId: `wlive_${card}_sdfree_hh_mm_ss`,
			name: `Wing Live Card ${card} Free Space (hh:mm:ss)`,
		})
	}

	for (let bus = 1; bus <= model.busses; bus++) {
		variables.push({ variableId: `talkback_a_bus${bus}_assign`, name: `Talkback A to Bus ${bus} assign` })
		variables.push({ variableId: `talkback_b_bus${bus}_assign`, name: `Talkback B to Bus ${bus} assign` })
	}
	for (let mtx = 1; mtx <= model.matrices; mtx++) {
		variables.push({ variableId: `talkback_a_mtx${mtx}_assign`, name: `Talkback A to Matrix ${mtx} assign` })
		variables.push({ variableId: `talkback_b_mtx${mtx}_assign`, name: `Talkback B to Matrix ${mtx} assign` })
	}
	for (let main = 1; main <= model.mains; main++) {
		variables.push({ variableId: `talkback_a_main${main}_assign`, name: `Talkback A to Main ${main} assign` })
		variables.push({ variableId: `talkback_b_main${main}_assign`, name: `Talkback B to Main ${main} assign` })
	}

	for (let gpio = 1; gpio <= model.gpio; gpio++) {
		variables.push({ variableId: `gpio${gpio}`, name: `GPIO ${gpio} state (true = pressed/connected)` })
	}

	variables.push({ variableId: 'active_show_name', name: 'Active Show Name' })
	variables.push({ variableId: 'previous_scene_number', name: 'Previous Scene Number' })
	variables.push({ variableId: 'active_scene_number', name: 'Active Scene Number' })
	variables.push({ variableId: 'next_scene_number', name: 'Next Scene Number' })
	variables.push({ variableId: 'previous_scene_name', name: 'Previous Scene Name' })
	variables.push({ variableId: 'active_scene_name', name: 'Active Scene Name' })
	variables.push({ variableId: 'next_scene_name', name: 'Next Scene Name' })
	variables.push({ variableId: 'active_scene_folder', name: 'Active Scene Folder' })

	self.setVariableDefinitions(variables)
}

export function UpdateVariables(self: WingInstance, msgs: OscMessage[]): void {
	for (const msg of msgs) {
		const path = msg.address
		const args = msg.args as OSCMetaArgument[]

		self.log('debug', `'Updating variable:', ${path}, ${JSON.stringify(args)}`)
		UpdateNameVariables(self, path, args[0]?.value as string)
		UpdateMuteVariables(self, path, args[0]?.value as number)
		UpdateFaderVariables(self, path, args[0]?.value as number)
		UpdatePanoramaVariables(self, path, args[0]?.value as number)
		UpdateUsbVariables(self, path, args[0])
		UpdateSdVariables(self, path, args[0])
		UpdateTalkbackVariables(self, path, args[0])
		UpdateGpioVariables(self, path, args[0]?.value as number)
		UpdateControlVariables(self, path, args[0])
	}
}

function UpdateNameVariables(self: WingInstance, path: string, value: string): void {
	const match = path.match(/\/(\w+)\/(\d+)\/\$?name/)
	if (!match) {
		return
	}

	const base = match[1]
	const num = match[2]
	self.setVariableValues({ [`${base}${num}_name`]: value })
}

function UpdateMuteVariables(self: WingInstance, path: string, value: number): void {
	const match = path.match(
		/^\/(ch|aux|bus|mtx|main|dca|mgrp)\/(\d+)(?:\/(send|main)\/(?:(MX)(\d+)|(\d+))\/(mute|on)|\/(mute))$/,
	)

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
	if (action === 'on') value = Number(!value)

	if (dest == null) {
		const varName = `${source}${srcnum}_mute`
		self.setVariableValues({ [varName]: value })
	} else {
		if (dest === 'send') {
			dest = 'bus'
		} else if (dest === 'MX') {
			dest = 'mtx'
		}
		const varName = `${source}${srcnum}_${dest}${destnum}_mute`
		self.setVariableValues({ [varName]: value })
	}
}

function UpdateFaderVariables(self: WingInstance, path: string, value: number): void {
	// const match = path.match(/^\/(\w+)\/(\w+)(?:\/(\w+)\/(\w+))?/);
	const match = path.match(/^\/(\w+)\/(\w+)(?:\/(\w+)\/(\w+))?\/(fdr|lvl|\$fdr|\$lvl)$/)

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
		varName = `${source}_${destination}_level`
	} else {
		varName = `${source}_level`
	}
	const val = Math.round(value * 10) / 10
	if (val > -140) {
		self.setVariableValues({ [varName]: val })
	} else {
		self.setVariableValues({ [varName]: '-oo' })
	}
}

function UpdatePanoramaVariables(self: WingInstance, path: string, value: number): void {
	const match = path.match(/^\/(\w+)\/(\w+)(?:\/(\w+)\/(\w+))?\/(pan|\$pan)$/)

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
	self.setVariableValues({ [varName]: Math.round(value) })
}

function UpdateUsbVariables(self: WingInstance, path: string, args: OSCMetaArgument): void {
	const match = path.match(/^\/(rec|play)\/(\$?\w+)$/)
	if (!match) {
		return
	}
	const direction = match[1]
	const command = match[2]
	if (direction == 'rec') {
		if (command == '$time') {
			const seconds = args.value as number
			self.setVariableValues({
				usb_record_time_ss: seconds,
				usb_record_time_mm_ss: `${Math.floor(seconds / 60)}:${seconds % 60}`,
				usb_record_time_hh_mm_ss: `${Math.floor(seconds / 3600)}:${Math.floor((seconds % 3600) / 60)}:${seconds % 60}`,
			})
		} else if (command == '$actfile') {
			const filename = args.value as string
			self.setVariableValues({ usb_record_path: filename })
		} else if (command == '$actstate') {
			const state = args.value as string
			self.setVariableValues({ usb_record_state: state })
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
			self.setVariableValues({
				usb_play_pos_ss: totalSeconds,
				usb_play_pos_mm_ss: `${totalMinutes}:${remainderSeconds}`,
				usb_play_pos_hh_mm_ss: `${hours}:${minutesWithinHour}:${secondsWithinMinute}`,
			})
		} else if (command == '$total') {
			const seconds = args.value as number
			self.setVariableValues({
				usb_play_total_ss: seconds,
				usb_play_total_mm_ss: `${Math.floor(seconds / 60)}:${seconds % 60}`,
				usb_play_total_hh_mm_ss: `${Math.floor(seconds / 3600)}:${Math.floor((seconds % 3600) / 60)}:${seconds % 60}`,
			})
		} else if (command == '$actfile') {
			const filename = args.value as string
			self.setVariableValues({ usb_play_path: filename })
		} else if (command == '$actstate') {
			const state = args.value as string
			self.setVariableValues({ usb_play_state: state })
		} else if (command == '$song') {
			const song = args.value as string
			self.setVariableValues({ usb_play_name: song })
		} else if (command == '$album') {
			const album = args.value as string
			self.setVariableValues({ usb_play_directory: album })
		} else if (command == '$actlist') {
			const playlist = args.value as string
			self.setVariableValues({ usb_play_playlist: playlist })
		} else if (command == '$actidx') {
			const index = args.value as number
			self.setVariableValues({ usb_play_playlist_index: index })
		} else if (command == 'repeat') {
			const repeat = args.value as number
			self.setVariableValues({ usb_play_repeat: repeat })
		}
	}
}

function UpdateSdVariables(self: WingInstance, path: string, args: OSCMetaArgument): void {
	const match = path.match(/^\/cards\/wlive\/(\d)\/(\$?\w+)\/(\$?\w+)$/)
	if (!match) {
		return
	}
	const card = match[1]
	const command = match[2]
	const subcommand = match[3]

	if (command == '$stat') {
		if (subcommand == 'state') {
			const state = args.value as string
			self.setVariableValues({ [`wlive_${card}_state`]: state })
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
			self.setVariableValues({
				[`wlive_${card}_pos_ss`]: totalSeconds,
				[`wlive_${card}_pos_mm_ss`]: `${totalMinutes}:${remainderSeconds}`,
				[`wlive_${card}_pos_hh_mm_ss`]: `${hours}:${minutesWithinHour}:${secondsWithinMinute}`,
			})
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
			self.setVariableValues({
				[`wlive_${card}_sdfree_ss`]: totalSeconds,
				[`wlive_${card}_sdfree_mm_ss`]: `${totalMinutes}:${remainderSeconds}`,
				[`wlive_${card}_sdfree_hh_mm_ss`]: `${hours}:${minutesWithinHour}:${secondsWithinMinute}`,
			})
		}
	}
}

function UpdateTalkbackVariables(self: WingInstance, path: string, args: OSCMetaArgument): void {
	const match = path.match(/^\/cfg\/talk\/(A|B)\/(B|MX|M)(\d+)$/)
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

	self.setVariableValues({
		[`talkback_${talkback}_${destination}${num}_assign`]: args.value as number,
	})
}

function UpdateGpioVariables(self: WingInstance, path: string, value: number): void {
	const match = path.match(/^\/\$ctl\/gpio\/(\d+)\/\$state$/)
	if (!match) {
		return
	}

	const gpio = match[1]
	self.setVariableValues({ [`gpio${gpio}`]: !value })
}

function UpdateControlVariables(self: WingInstance, path: string, args: OSCMetaArgument): void {
	const pathMatch = path.match(/^\/\$ctl\/lib\/(\$?\w+)/)
	if (!pathMatch) return

	const command = pathMatch[1]

	if (command === '$actshow') {
		const fullShowPath = String(args.value)
		const showMatch = fullShowPath.match(/([^/\\]+)(?=\.show$)/)
		const showname = showMatch?.[1] ?? 'N/A'
		self.setVariableValues({ active_show_name: showname })
	} else if (command === '$actidx') {
		const index = Number(args.value)
		self.setVariableValues({
			active_scene_number: index,
		})
		UpdateShowControlVariables(self)
	} else if (command === '$active') {
		const fullScenePath = String(args.value)
		const sceneMatch = fullScenePath.match(/([^/\\]+)[/\\]([^/\\]+)\..*$/)
		const scene = sceneMatch?.[2] ?? 'N/A'
		const parent = sceneMatch?.[1] ?? 'N/A'

		self.setVariableValues({
			active_scene_name: scene,
			active_scene_folder: parent,
		})
	} else if (command === '$scenes') {
		self.sendCommand(ControlCommands.LibraryNode(), '?')
	}
}

export function UpdateShowControlVariables(self: WingInstance): void {
	const index = Number(self.getVariableValue('active_scene_number'))
	const nameMap = self.state.sceneNameToIdMap

	const previous_number = index > 0 ? index - 1 : index
	const next_number = index < nameMap.size - 1 ? index + 1 : index
	self.setVariableValues({
		previous_scene_number: previous_number,
		active_scene_number: index,
		next_scene_number: next_number,
	})

	function getKeyByValue(map: Map<string, number>, value: number): string | undefined {
		for (const [key, val] of map.entries()) {
			if (val === value) return key
		}
		return undefined
	}

	const nextName = getKeyByValue(nameMap, index + 1)
	const currentName = getKeyByValue(nameMap, index)
	const prevName = getKeyByValue(nameMap, index - 1)
	self.setVariableValues({
		previous_scene_name: prevName as string,
		active_scene_name: currentName as string,
		next_scene_name: nextName as string,
	})
}
