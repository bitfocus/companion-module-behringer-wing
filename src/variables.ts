import { OscMessage } from 'osc'
import type { WingInstance } from './index.js'
import { OSCMetaArgument } from '@companion-module/base/dist/index.js' // eslint-disable-line n/no-missing-import

export function UpdateVariableDefinitions(self: WingInstance): void {
	const model = self.model
	// const state = self.state

	const variables = []

	variables.push({ variableId: 'desk_ip', name: 'Desk IP Address' })
	variables.push({ variableId: 'desk_name', name: 'Desk Name' })

	variables.push({ variableId: 'player_time', name: 'USB Player Time' })
	variables.push({ variableId: 'recorder_time', name: 'USB Recorder Time' })

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
