import { VariableDefinition } from './index.js'

export function getUsbVariables(): VariableDefinition[] {
	const variables: VariableDefinition[] = []

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

	return variables
}
