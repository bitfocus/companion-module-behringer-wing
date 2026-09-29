import { ModelSpec } from '../models/types.js'
import { VariableDefinition } from './index.js'
import * as Commands from '../commands/index.js'

export function getDcaVariables(model: ModelSpec): VariableDefinition[] {
	const variables: VariableDefinition[] = []

	for (let dca = 1; dca <= model.dcas; dca++) {
		variables.push({
			variableId: `dca${dca}_name`,
			name: `DCA ${dca} Name`,
			path: Commands.Dca.Name(dca),
		})
		variables.push({
			variableId: `dca${dca}_mute`,
			name: `DCA ${dca} Mute`,
			path: Commands.Dca.Mute(dca),
		})
		variables.push({
			variableId: `dca${dca}_level`,
			name: `DCA ${dca} Level`,
			path: Commands.Dca.Fader(dca),
		})

		variables.push({
			variableId: `dca${dca}_color`,
			name: `DCA ${dca} Color`,
			path: `${Commands.Dca.Node(dca)}/$col`,
		})
		variables.push({
			variableId: `dca${dca}_color_index`,
			name: `DCA ${dca} Color Index`,
			path: `${Commands.Dca.Node(dca)}/$col`,
		})
		variables.push({
			variableId: `dca${dca}_icon_id`,
			name: `DCA ${dca} Icon ID`,
			path: Commands.Dca.Icon(dca),
		})
		variables.push({
			variableId: `dca${dca}_icon_image`,
			name: `DCA ${dca} Icon Image Data URI`,
			path: Commands.Dca.Icon(dca),
		})
	}

	return variables
}
