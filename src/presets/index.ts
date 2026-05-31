import type { CompanionPresetDefinitions, CompanionPresetSection } from '@companion-module/base'
import type { InstanceBaseExt } from '../types.js'
import type { WingConfig } from '../config.js'
import type { WingPresetsContext } from './types.js'
import { createChannelPresets } from './channels.js'
import { createControlPresets } from './control.js'

export function GetPresets(
	instance: InstanceBaseExt<WingConfig>,
): [CompanionPresetSection[], CompanionPresetDefinitions] {
	const context: WingPresetsContext = {
		sections: [],
		definitions: {},
	}

	createChannelPresets(context, instance.model)
	createControlPresets(context)

	return [context.sections, context.definitions]
}
