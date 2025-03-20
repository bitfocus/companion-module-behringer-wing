import { OscMessage } from 'osc'
import type { WingInstance } from './index.js'
import { OSCMetaArgument } from '@companion-module/base/dist/index.js' // eslint-disable-line n/no-missing-import

export function UpdateVariableDefinitions(self: WingInstance): void {
	const model = self.model
	// const state = self.state

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
			variableId: `ch${ch}_level`,
			name: `Channel ${ch} Level`,
		})
		variables.push({
			variableId: `ch${ch}_pan`,
			name: `Channel ${ch} Pan`,
		})
		for (let bus = 1; bus <= model.busses; bus++) {
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
			variableId: `aux${aux}_level`,
			name: `Aux ${aux} Level`,
		})
		variables.push({
			variableId: `aux${aux}_pan`,
			name: `Aux ${aux} Pan`,
		})
		for (let bus = 1; bus <= model.busses; bus++) {
			variables.push({
				variableId: `aux${aux}_bus${bus}_level`,
				name: `Aux ${aux} to Bus ${bus} Level`,
			})
			variables.push({
				variableId: `aux${aux}_bus${bus}_pan`,
				name: `Aux ${aux} to Bus ${bus} Pan`,
			})
		}
	}

	for (let bus = 1; bus <= model.busses; bus++) {
		variables.push({
			variableId: `bus${bus}_name`,
			name: `Bus ${bus} Name`,
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
				variableId: `bus${bus}_bus${send}_level`,
				name: `Bus ${bus} to Bus ${send} Level`,
			})
			variables.push({
				variableId: `bus${bus}_bus${send}_pan`,
				name: `Bus ${bus} to Bus ${send} Pan`,
			})
		}
	}

	for (let mtx = 1; mtx <= model.matrices; mtx++) {
		variables.push({
			variableId: `mtx${mtx}_name`,
			name: `Matrix ${mtx} Name`,
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
			variableId: `dca${dca}_level`,
			name: `DCA ${dca} Level`,
		})
	}

	for (let mgrp = 1; mgrp <= model.mutegroups; mgrp++) {
		variables.push({
			variableId: `mgrp${mgrp}_name`,
			name: `Mute ${mgrp} Name`,
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
	variables.push({ variableId: 'active_scene_number', name: 'Active Scene Number' })
	variables.push({ variableId: 'active_scene_name', name: 'Active Scene Name' })

	self.setVariableDefinitions(variables)
}

export function UpdateVariables(self: WingInstance, msgs: OscMessage[]): void {
	for (const msg of msgs) {
		const path = msg.address
		const args = msg.args as OSCMetaArgument[]

		// console.log('Updating variable:', path, args)

		UpdateNameVariables(self, path, args[0]?.value as string)
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
			self.setVariableValues({
				usb_play_pos_ss: seconds,
				usb_play_pos_mm_ss: `${Math.floor(seconds / 60)}:${seconds % 60}`,
				usb_play_pos_hh_mm_ss: `${Math.floor(seconds / 3600)}:${Math.floor((seconds % 3600) / 60)}:${seconds % 60}`,
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
			self.setVariableValues({
				[`wlive_${card}_pos_ss`]: seconds,
				[`wlive_${card}_pos_mm_ss`]: `${Math.floor(seconds / 60)}:${seconds % 60}`,
				[`wlive_${card}_pos_hh_mm_ss`]: `${Math.floor(seconds / 3600)}:${Math.floor((seconds % 3600) / 60)}:${seconds % 60}`,
			})
		} else if (subcommand == 'sdfree') {
			const seconds = Math.floor((args.value as number) / 1000)
			self.setVariableValues({
				[`wlive_${card}_sdfree_ss`]: seconds,
				[`wlive_${card}_sdfree_mm_ss`]: `${Math.floor(seconds / 60)}:${seconds % 60}`,
				[`wlive_${card}_sdfree_hh_mm_ss`]: `${Math.floor(seconds / 3600)}:${Math.floor((seconds % 3600) / 60)}:${seconds % 60}`,
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
	const match = path.match(/^\/\$ctl\/lib\/(\$?\w+)/)
	if (!match) {
		return
	}

	const command = match[1]

	if (command == '$actshow') {
		const showname = args.value as string
		self.setVariableValues({ active_show_name: showname })
	} else if (command == '$actidx') {
		const index = args.value as number
		self.setVariableValues({ active_scene_number: index })
	} else if (command == '$active') {
		const scene = args.value as string
		self.setVariableValues({ active_scene_name: scene })
	} else if (command == '$scenes') {
		// need to request full list of scenes
		self.sendCommand('/$ctl/lib', '?')
	}
}
