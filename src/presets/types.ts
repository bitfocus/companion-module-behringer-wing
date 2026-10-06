import type { CompanionPresetDefinitions, CompanionPresetSection } from '@companion-module/base'
import type { WingTypes } from '../types.js'

export interface WingPresetsContext {
	sections: CompanionPresetSection<WingTypes>[]
	definitions: CompanionPresetDefinitions<WingTypes>
}
