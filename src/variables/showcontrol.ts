import { VariableDefinition } from './index.js'

export function getShowControlVariables(): VariableDefinition[] {
	const variables: VariableDefinition[] = []

	variables.push({ variableId: 'active_show_name', name: 'Active Show Name' })
	variables.push({ variableId: 'previous_scene_number', name: 'Previous Scene Number' })
	variables.push({ variableId: 'active_scene_number', name: 'Active Scene Number' })
	variables.push({ variableId: 'next_scene_number', name: 'Next Scene Number' })
	variables.push({ variableId: 'previous_scene_name', name: 'Previous Scene Name' })
	variables.push({ variableId: 'active_scene_name', name: 'Active Scene Name' })
	variables.push({ variableId: 'next_scene_name', name: 'Next Scene Name' })
	variables.push({ variableId: 'active_scene_folder', name: 'Active Scene Folder' })

	variables.push({ variableId: 'sof_mode_index', name: 'Sends on Fader Mode Index' })
	variables.push({ variableId: 'sof_mode_string', name: 'Sends on Fader Channel String' })
	variables.push({ variableId: 'sel_index', name: 'Selected Channel Strip Index' })
	variables.push({ variableId: 'sel_string', name: 'Selected Channel Strip String' })

	return variables
}
