import { VariableDefinition } from './index.js'
import * as Commands from '../commands/index.js'

export function getWliveVariables(): VariableDefinition[] {
	const variables: VariableDefinition[] = []

	variables.push({ variableId: 'wlive_link_status', name: 'Wing Live SD Cards Link Status' })

	for (let card = 1; card <= 2; card++) {
		variables.push({
			variableId: `wlive_${card}_state`,
			name: `Wing Live Card ${card} State`,
			path: Commands.Cards.WLiveCardState(card),
		})
		variables.push({
			variableId: `wlive_${card}_sdstate`,
			name: `Wing Live Card ${card} SD State`,
			path: Commands.Cards.WLiveCardSDState(card),
		})
		variables.push({
			variableId: `wlive_${card}_sdsize`,
			name: `Wing Live Card ${card} SD Size (GB)`,
			path: Commands.Cards.WLiveCardSDSize(card),
		})
		variables.push({ variableId: `wlive_${card}_marker_total`, name: `Wing Live Card ${card} Total Markers` })
		variables.push({ variableId: `wlive_${card}_marker_current`, name: `Wing Live Card ${card} Current Marker` })
		variables.push({ variableId: `wlive_${card}_session_total`, name: `Wing Live Card ${card} Total Sessions` })
		variables.push({ variableId: `wlive_${card}_session_current`, name: `Wing Live Card ${card} Current Session` })
		variables.push({
			variableId: `wlive_${card}_marker_time`,
			name: `Wing Live Card ${card} Marker Time (hh:mm:ss.ss)`,
		})
		variables.push({
			variableId: `wlive_${card}_session_len_ss`,
			name: `Wing Live Card ${card} Session Length (ss)`,
		})
		variables.push({
			variableId: `wlive_${card}_session_len_mm_ss`,
			name: `Wing Live Card ${card} Session Length (mm:ss)`,
		})
		variables.push({
			variableId: `wlive_${card}_session_len_hh_mm_ss`,
			name: `Wing Live Card ${card} Session Length (hh:mm:ss)`,
		})
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

	return variables
}
