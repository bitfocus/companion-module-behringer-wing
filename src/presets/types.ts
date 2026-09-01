import type { CompanionPresetDefinitions, CompanionPresetSection } from '@companion-module/base'

export interface WingPresetsContext {
	sections: CompanionPresetSection[]
	definitions: CompanionPresetDefinitions
}
