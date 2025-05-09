import { DropdownChoice } from '@companion-module/base'
import { getIdLabelPair } from '../choices/utils.js'

export function getFilterModelOptions(): DropdownChoice[] {
	return [
		getIdLabelPair('TILT', 'Tilt Filter'),
		getIdLabelPair('MAX', 'Maxer Filter'),
		getIdLabelPair('AP1', 'All-Pass 90'),
		getIdLabelPair('AP2', 'All-Pass 180'),
	]
}

export function getSendModeChoices(): DropdownChoice[] {
	return [getIdLabelPair('PRE', 'Pre-Fade'), getIdLabelPair('POST', 'Post-Fade'), getIdLabelPair('GRP', 'Group')]
}

export function getProcessOrderChoices(): DropdownChoice[] {
	return [
		getIdLabelPair('G', 'Gate'),
		getIdLabelPair('E', 'EQ'),
		getIdLabelPair('D', 'Dynamics'),
		getIdLabelPair('I', 'Insert'),
	]
}

export function getChannelProcessOrderChoices(): DropdownChoice[] {
	return [
		getIdLabelPair('GEDI', 'Gate / EQ / Dynamics / Insert'),
		getIdLabelPair('GEID', 'Gate / EQ / Insert / Dynamics'),
		getIdLabelPair('GIED', 'Gate / Insert / EQ / Dynamics'),
		getIdLabelPair('GIDE', 'Gate / Insert / Dynamics / EQ'),
		getIdLabelPair('GDEI', 'Gate / Dynamics / EQ / Insert'),
		getIdLabelPair('GDIE', 'Gate / Dynamics / Insert / EQ'),

		getIdLabelPair('EGDI', 'EQ / Gate / Dynamics / Insert'),
		getIdLabelPair('EGID', 'EQ / Gate / Insert / Dynamics'),
		getIdLabelPair('EIGD', 'EQ / Insert / Gate / Dynamics'),
		getIdLabelPair('EIDG', 'EQ / Insert / Dynamics / Gate'),
		getIdLabelPair('EDGI', 'EQ / Dynamics / Gate / Insert'),
		getIdLabelPair('EDIG', 'EQ / Dynamics / Insert / Gate'),

		getIdLabelPair('IGED', 'Insert / Gate / EQ / Dynamics'),
		getIdLabelPair('IGDE', 'Insert / Gate / Dynamics / EQ'),
		getIdLabelPair('IEGD', 'Insert / EQ / Gate / Dynamics'),
		getIdLabelPair('IEDG', 'Insert / EQ / Dynamics / Gate'),
		getIdLabelPair('IDGE', 'Insert / Dynamics / Gate / EQ'),
		getIdLabelPair('IDEG', 'Insert / Dynamics / EQ / Gate'),

		getIdLabelPair('DGEI', 'Dynamics / Gate / EQ / Insert'),
		getIdLabelPair('DGIE', 'Dynamics / Gate / Insert / EQ'),
		getIdLabelPair('DEGI', 'Dynamics / EQ / Gate / Insert'),
		getIdLabelPair('DEIG', 'Dynamics / EQ / Insert / Gate'),
		getIdLabelPair('DIGE', 'Dynamics / Insert / Gate / EQ'),
		getIdLabelPair('DIEG', 'Dynamics / Insert / EQ / Gate'),
	]
}
