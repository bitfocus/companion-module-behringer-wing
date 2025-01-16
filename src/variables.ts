import type { WingInstance } from './index.js'

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
			variableId: `ch${ch}_level`,
			name: `Channel ${ch} Level`,
		})
		variables.push({
			variableId: `ch${ch}_mute`,
			name: `Channel ${ch} Mute`,
		})
		for (let bus = 1; bus <= model.busses; bus++) {
			variables.push({
				variableId: `ch${ch}_bus${bus}_level`,
				name: `Channel ${ch} to Bus ${bus} Level`,
			})
			variables.push({
				variableId: `ch${ch}_bus${bus}_mute`,
				name: `Channel ${ch} to Bus ${bus} Mute`,
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
			variableId: `aux${aux}_level`,
			name: `Aux ${aux} Level`,
		})
		variables.push({
			variableId: `aux${aux}_mute`,
			name: `Aux ${aux} Mute`,
		})
		for (let bus = 1; bus <= model.busses; bus++) {
			variables.push({
				variableId: `aux${aux}_bus${bus}_level`,
				name: `Aux ${aux} to Bus ${bus} Level`,
			})
			variables.push({
				variableId: `aux${aux}_bus${bus}_mute`,
				name: `Aux ${aux} to Bus ${bus} Mute`,
			})
		}
	}

	for (let bus = 1; bus <= model.busses; bus++) {
		variables.push({
			variableId: `bus${bus}_level`,
			name: `Bus ${bus} Level`,
		})
		variables.push({
			variableId: `bus${bus}_mute`,
			name: `Bus ${bus} Mute`,
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
				variableId: `bus${bus}_bus${send}_mute`,
				name: `Bus ${bus} to Bus ${send} Mute`,
			})
		}
	}

	for (let mtx = 1; mtx <= model.matrices; mtx++) {
		variables.push({
			variableId: `mtx${mtx}_level`,
			name: `Matrix ${mtx} Level`,
		})
		variables.push({
			variableId: `mtx${mtx}_mute`,
			name: `Matrix ${mtx} Mute`,
		})
	}

	for (let main = 1; main <= model.mains; main++) {
		variables.push({
			variableId: `main${main}_level`,
			name: `Main ${main} Level`,
		})
		variables.push({
			variableId: `main${main}_mute`,
			name: `Main ${main} Mute`,
		})
	}

	self.setVariableDefinitions(variables)
}
