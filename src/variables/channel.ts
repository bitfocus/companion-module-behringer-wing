import { ModelSpec } from '../models/types.js'
import { VariableDefinition } from './index.js'
import * as Commands from '../commands/index.js'

export function getChannelVariables(model: ModelSpec): VariableDefinition[] {
	const variables: VariableDefinition[] = []

	for (let ch = 1; ch <= model.channels; ch++) {
		variables.push({
			variableId: `ch${ch}_name`,
			name: `Channel ${ch} Name`,
			path: Commands.Channel.Name(ch),
		})
		variables.push({
			variableId: `ch${ch}_gain`,
			name: `Channel ${ch} Gain`,
			path: Commands.Channel.InputGain(ch),
		})
		variables.push({
			variableId: `ch${ch}_mute`,
			name: `Channel ${ch} Mute`,
			path: Commands.Channel.Mute(ch),
		})
		variables.push({
			variableId: `ch${ch}_level`,
			name: `Channel ${ch} Level`,
			path: Commands.Channel.Fader(ch),
		})
		variables.push({
			variableId: `ch${ch}_pan`,
			name: `Channel ${ch} Pan`,
			path: Commands.Channel.Pan(ch),
		})
		variables.push(
			{ variableId: `ch${ch}_meter_pre_left_db`, name: `Channel ${ch} Pre-fader Meter Left (dB)` },
			{ variableId: `ch${ch}_meter_pre_right_db`, name: `Channel ${ch} Pre-fader Meter Right (dB)` },
			{ variableId: `ch${ch}_meter_pre_peak_db`, name: `Channel ${ch} Pre-fader Meter Peak (dB)` },
			{ variableId: `ch${ch}_meter_post_left_db`, name: `Channel ${ch} Post-fader Meter Left (dB)` },
			{ variableId: `ch${ch}_meter_post_right_db`, name: `Channel ${ch} Post-fader Meter Right (dB)` },
			{ variableId: `ch${ch}_meter_post_peak_db`, name: `Channel ${ch} Post-fader Meter Peak (dB)` },
			// Retain the initial meter variable names as post-fader aliases.
			{ variableId: `ch${ch}_meter_left_db`, name: `Channel ${ch} Meter Left (dB)` },
			{ variableId: `ch${ch}_meter_right_db`, name: `Channel ${ch} Meter Right (dB)` },
			{ variableId: `ch${ch}_meter_peak_db`, name: `Channel ${ch} Meter Peak (dB)` },
		)
		for (let bus = 1; bus <= model.busses; bus++) {
			variables.push({
				variableId: `ch${ch}_bus${bus}_mute`,
				name: `Channel ${ch} to Bus ${bus} Mute`,
				path: Commands.Channel.SendOn(ch, bus),
			})
			variables.push({
				variableId: `ch${ch}_bus${bus}_level`,
				name: `Channel ${ch} to Bus ${bus} Level`,
				path: Commands.Channel.SendLevel(ch, bus),
			})
			variables.push({
				variableId: `ch${ch}_bus${bus}_pan`,
				name: `Channel ${ch} to Bus ${bus} Pan`,
				path: Commands.Channel.SendPan(ch, bus),
			})
		}
		for (let main = 1; main <= model.mains; main++) {
			variables.push({
				variableId: `ch${ch}_main${main}_mute`,
				name: `Channel ${ch} to Main ${main} Mute`,
				path: Commands.Channel.MainSendOn(ch, main),
			})
			variables.push({
				variableId: `ch${ch}_main${main}_level`,
				name: `Channel ${ch} to Main ${main} Level`,
				path: Commands.Channel.MainSendLevel(ch, main),
			})
		}
		for (let mtx = 1; mtx <= model.matrices; mtx++) {
			variables.push({
				variableId: `ch${ch}_mtx${mtx}_mute`,
				name: `Channel ${ch} to Matrix ${mtx} Mute`,
				path: Commands.Channel.MatrixSendOn(ch, mtx),
			})
			variables.push({
				variableId: `ch${ch}_mtx${mtx}_level`,
				name: `Channel ${ch} to Matrix ${mtx} Level`,
				path: Commands.Channel.MatrixSendLevel(ch, mtx),
			})
			variables.push({
				variableId: `ch${ch}_mtx${mtx}_pan`,
				name: `Channel ${ch} to Matrix ${mtx} Pan`,
				path: Commands.Channel.MatrixSendPan(ch, mtx),
			})
		}

		variables.push({
			variableId: `ch${ch}_color`,
			name: `Channel ${ch} Color`,
			path: `${Commands.Channel.Node(ch)}/$col`,
		})
		variables.push({
			variableId: `ch${ch}_color_index`,
			name: `Channel ${ch} Color Index`,
			path: `${Commands.Channel.Node(ch)}/$col`,
		})
		variables.push({
			variableId: `ch${ch}_icon_id`,
			name: `Channel ${ch} Icon ID`,
			path: Commands.Channel.Icon(ch),
		})
		variables.push({
			variableId: `ch${ch}_icon_image`,
			name: `Channel ${ch} Icon Image Data URI`,
			path: Commands.Channel.Icon(ch),
		})
	}

	return variables
}
