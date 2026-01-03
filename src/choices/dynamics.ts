import { DropdownChoice, SomeCompanionActionInputField } from '@companion-module/base'
import { GetNumberFieldWithVariables, GetDropdownWithVariables } from './common.js'
import { getIdLabelPair } from './utils.js'

export function getDynamicsChoices(): DropdownChoice[] {
	return [
		getIdLabelPair('GATE', 'Gate'),
		getIdLabelPair('DUCK', 'Ducker'),
		getIdLabelPair('E88', 'Even 88 Gate'),
		getIdLabelPair('9000G', 'SSL 9000 Gate/Expander'),
		getIdLabelPair('D241G', 'Draw More Expander/Gate 241'),
		getIdLabelPair('DS902', 'DBX 902 De-Esser'),
		getIdLabelPair('DEQ', 'Dynamic EQ'),
		getIdLabelPair('DEQ2', 'Dual Dynamic EQ'),
		getIdLabelPair('WAVE', 'Wave Designer'),
		getIdLabelPair('PSE', 'Source Extractor'),
		getIdLabelPair('CMB', 'PSE/LA Combo'),
		getIdLabelPair('RIDE', 'Auto Rider Dynamics'),
		getIdLabelPair('WARM', 'Soul Warmth Preamp'),
		getIdLabelPair('COMP', 'WING Compressor'),
		getIdLabelPair('EXP', 'WING Expander'),
		getIdLabelPair('B160', 'BDX 160 Compressor/Limiter'),
		getIdLabelPair('B560', 'BDX 560 Easy Compressor'),
		getIdLabelPair('D241C', 'Draw More Compressor'),
		getIdLabelPair('ECL33', 'Even Compressor/Limiter'),
		getIdLabelPair('9000C', 'Soul 9000 Channel Compressor'),
		getIdLabelPair('SBUS', 'Soul G Buss Compressor'),
		getIdLabelPair('RED3', 'Red Compressor'),
		getIdLabelPair('76LA', '76 Limiting Amplifier'),
		getIdLabelPair('LA', 'Leveling Amplifier 2A'),
		getIdLabelPair('F670', 'Fairkid Model 670'),
		getIdLabelPair('BLISS', 'Eternal Bliss'),
		getIdLabelPair('NSTR', 'No Stressor'),
		getIdLabelPair('2250', 'PIA 2250'),
		getIdLabelPair('L100', 'LTA100 Leveler'),
		getIdLabelPair('E88C', 'Even 88 Compressor'),
		getIdLabelPair('LMT', 'LMT Compressor'),
		getIdLabelPair('ONEC', 'One Knob Compressor'),
	]
}

export function getStandardGateFields(isVisibleExpression?: string): SomeCompanionActionInputField[] {
	return [
		...GetNumberFieldWithVariables(
			'Threshold',
			'gate_thr',
			-80,
			0,
			0.1,
			-40,
			'Threshold in dB (range: -80 to 0 dB)',
			isVisibleExpression,
		),
		...GetNumberFieldWithVariables(
			'Range',
			'gate_range',
			3,
			60,
			1,
			30,
			'Range in dB (range: 3 to 60 dB)',
			isVisibleExpression,
		),
		...GetNumberFieldWithVariables(
			'Attack',
			'gate_att',
			0,
			120,
			0.1,
			10,
			'Attack time in ms (range: 0 to 120 ms)',
			isVisibleExpression,
		),
		...GetNumberFieldWithVariables(
			'Hold',
			'gate_hld',
			1,
			1000,
			1,
			100,
			'Hold time in ms (range: 1 to 1000 ms)',
			isVisibleExpression,
		),
		...GetNumberFieldWithVariables(
			'Release',
			'gate_rel',
			4,
			4000,
			1,
			100,
			'Release time in ms (range: 4 to 4000 ms)',
			isVisibleExpression,
		),
		...GetNumberFieldWithVariables(
			'Accent',
			'gate_acc',
			0,
			100,
			1,
			0,
			'Accent in % (range: 0 to 100 %)',
			isVisibleExpression,
		),
		...GetDropdownWithVariables(
			'Ratio',
			'gate_ratio',
			[
				getIdLabelPair('1', '1:1.5'),
				getIdLabelPair('2', '1:2'),
				getIdLabelPair('3', '1:3'),
				getIdLabelPair('4', '1:4'),
			],
			'',
			'Gate ratio',
			isVisibleExpression,
		),
	]
}

export function getStandardDuckerFields(isVisibleExpression?: string): SomeCompanionActionInputField[] {
	return [
		...GetNumberFieldWithVariables(
			'Threshold',
			'duck_thr',
			-80,
			0,
			0.1,
			-40,
			'Threshold in dB (range: -80 to 0 dB)',
			isVisibleExpression,
		),
		...GetNumberFieldWithVariables(
			'Range',
			'duck_range',
			3,
			60,
			1,
			30,
			'Range in dB (range: 3 to 60 dB)',
			isVisibleExpression,
		),
		...GetNumberFieldWithVariables(
			'Attack',
			'duck_att',
			0,
			120,
			0.1,
			10,
			'Attack time in ms (range: 0 to 120 ms)',
			isVisibleExpression,
		),
		...GetNumberFieldWithVariables(
			'Hold',
			'duck_hld',
			1,
			4000,
			1,
			100,
			'Hold time in ms (range: 1 to 4000 ms)',
			isVisibleExpression,
		),
		...GetNumberFieldWithVariables(
			'Release',
			'duck_rel',
			20,
			4000,
			1,
			100,
			'Release time in ms (range: 20 to 4000 ms)',
			isVisibleExpression,
		),
	]
}

export function getEven88GateFields(isVisibleExpression?: string): SomeCompanionActionInputField[] {
	return [
		...GetNumberFieldWithVariables(
			'Threshold',
			'e88_thr',
			-40,
			0,
			0.1,
			-20,
			'Threshold in dB (range: -40 to 0 dB)',
			isVisibleExpression,
		),
		...GetNumberFieldWithVariables(
			'Hysteresis',
			'e88_hyst',
			0,
			25,
			0.1,
			5,
			'Hysteresis in dB (range: 0 to 25 dB)',
			isVisibleExpression,
		),
		...GetNumberFieldWithVariables(
			'Range',
			'e88_range',
			0,
			60,
			1,
			30,
			'Range in dB (range: 0 to 60 dB)',
			isVisibleExpression,
		),
		...GetNumberFieldWithVariables(
			'Release',
			'e88_rel',
			100,
			3000,
			1,
			500,
			'Release time in ms (range: 100 to 3000 ms)',
			isVisibleExpression,
		),
		...GetNumberFieldWithVariables(
			'Fast Attack',
			'e88_fast',
			0,
			1,
			1,
			0,
			'Fast attack (0 = off, 1 = on)',
			isVisibleExpression,
		),
		...GetNumberFieldWithVariables(
			'Model',
			'e88_mdl',
			0,
			1,
			1,
			0,
			'Model (0 = gate, 1 = expander)',
			isVisibleExpression,
		),
	]
}

export function getSSL9000GateExpanderFields(isVisibleExpression?: string): SomeCompanionActionInputField[] {
	return [
		...GetNumberFieldWithVariables(
			'Threshold',
			'9000g_thr',
			-40,
			0,
			0.1,
			-20,
			'Threshold in dB (range: -40 to 0 dB)',
			isVisibleExpression,
		),
		...GetNumberFieldWithVariables(
			'Range',
			'9000g_range',
			-0,
			40,
			0.1,
			20,
			'Range in dB (range: 0 to 40 dB)',
			isVisibleExpression,
		),
		...GetNumberFieldWithVariables(
			'Hold',
			'9000g_hld',
			10,
			4000,
			1,
			100,
			'Hold time in ms (range: 10 to 4000 ms)',
			isVisibleExpression,
		),
		...GetNumberFieldWithVariables(
			'Release',
			'9000g_rel',
			100,
			4000,
			1,
			500,
			'Release time in ms (range: 100 to 4000 ms)',
			isVisibleExpression,
		),
		...GetNumberFieldWithVariables(
			'Fast Attack',
			'9000g_fast',
			0,
			1,
			1,
			0,
			'Fast attack (0 = off, 1 = on)',
			isVisibleExpression,
		),
		...GetDropdownWithVariables(
			'Mode',
			'9000g_mode',
			[getIdLabelPair('GATE', 'Gate'), getIdLabelPair('EXP', 'Expander')],
			'',
			'Gate or Expander mode',
			isVisibleExpression,
		),
	]
}

export function getDrawMoreExpanderGate241Fields(isVisibleExpression?: string): SomeCompanionActionInputField[] {
	return [
		...GetNumberFieldWithVariables(
			'Threshold',
			'd241g_thr',
			-80,
			0,
			0.1,
			-40,
			'Threshold in dB (range: -80 to 0 dB)',
			isVisibleExpression,
		),
		...GetNumberFieldWithVariables(
			'Slow',
			'd241g_slow',
			0,
			1,
			1,
			0,
			'Slow mode (0 = off, 1 = on)',
			isVisibleExpression,
		),
	]
}

export function getDBX902DeEsserFields(isVisibleExpression?: string): SomeCompanionActionInputField[] {
	return [
		...GetNumberFieldWithVariables(
			'Frequency',
			'ds902_f',
			800,
			8000,
			1,
			5000,
			'Frequency in Hz (range: 800 to 8000 Hz)',
			isVisibleExpression,
		),
		...GetNumberFieldWithVariables(
			'Range',
			'ds902_range',
			3,
			12,
			0.1,
			6,
			'Range in dB (range: 3 to 12 dB)',
			isVisibleExpression,
		),
		...GetDropdownWithVariables(
			'Mode',
			'ds902_mode',
			[getIdLabelPair('FULL', 'Full'), getIdLabelPair('HF', 'High Frequency')],
			'',
			'DeEsser mode',
			isVisibleExpression,
		),
	]
}

export function getDynamicEQFields(isVisibleExpression?: string): SomeCompanionActionInputField[] {
	return [
		...GetNumberFieldWithVariables('Threshold', 'deq_thr', -60, 0, 0.1, -30, 'Threshold in dB', isVisibleExpression),
		...GetDropdownWithVariables(
			'Ratio',
			'deq_ratio',
			[
				getIdLabelPair('1.2', '1.2'),
				getIdLabelPair('1.3', '1.3'),
				getIdLabelPair('1.5', '1.5'),
				getIdLabelPair('2.0', '2.0'),
				getIdLabelPair('3.0', '3.0'),
				getIdLabelPair('5.0', '5.0'),
				getIdLabelPair('10.0', '10.0'),
			],
			'',
			'Ratio',
			isVisibleExpression,
		),
		...GetNumberFieldWithVariables('Attack', 'deq_att', 0, 200, 0.1, 10, 'Attack time in ms', isVisibleExpression),
		...GetNumberFieldWithVariables('Release', 'deq_rel', 20, 4000, 1, 100, 'Release time in ms', isVisibleExpression),
		...GetDropdownWithVariables(
			'Filter',
			'deq_filt',
			[
				getIdLabelPair('OFF', 'Off'),
				getIdLabelPair('BP', 'Band Pass'),
				getIdLabelPair('LP6', 'Low Pass 6dB'),
				getIdLabelPair('LP12', 'Low Pass 12dB'),
				getIdLabelPair('HP6', 'High Pass 6dB'),
				getIdLabelPair('HP12', 'High Pass 12dB'),
			],
			'',
			'Filter type',
			isVisibleExpression,
		),
		...GetNumberFieldWithVariables('Gain', 'deq_g', -15, 15, 0.1, 0, 'Gain in dB', isVisibleExpression),
		...GetNumberFieldWithVariables('Frequency', 'deq_f', 20, 20000, 1, 1000, 'Frequency in Hz', isVisibleExpression),
		...GetNumberFieldWithVariables('Q', 'deq_q', 0.442, 10, 0.001, 1, 'Q factor', isVisibleExpression),
		...GetDropdownWithVariables(
			'Mode',
			'deq_mode',
			[getIdLabelPair('LOW', 'Low'), getIdLabelPair('HIGH', 'High')],
			'',
			'Mode',
			isVisibleExpression,
		),
	]
}

export function getDualDynamicEQFields(isVisibleExpression?: string): SomeCompanionActionInputField[] {
	return [
		...GetNumberFieldWithVariables('1-Threshold', 'deq2_1_thr', -60, 0, 0.1, -30, 'Threshold 1', isVisibleExpression),
		...GetNumberFieldWithVariables('1-Ratio', 'deq2_1_ratio', 1.2, 1.3, 0.01, 1.25, 'Ratio 1', isVisibleExpression),
		...GetNumberFieldWithVariables('1-Attack', 'deq2_1_att', 0, 200, 0.1, 10, 'Attack 1 in ms', isVisibleExpression),
		...GetNumberFieldWithVariables('1-Release', 'deq2_1_rel', 20, 4000, 1, 100, 'Release 1 in ms', isVisibleExpression),
		...GetDropdownWithVariables(
			'1-Filter',
			'deq2_1_filt',
			[
				getIdLabelPair('OFF', 'Off'),
				getIdLabelPair('BP', 'Band Pass'),
				getIdLabelPair('LP6', 'Low Pass 6dB'),
				getIdLabelPair('LP12', 'Low Pass 12dB'),
				getIdLabelPair('HP6', 'High Pass 6dB'),
				getIdLabelPair('HP12', 'High Pass 12dB'),
			],
			'',
			'Filter 1',
			isVisibleExpression,
		),
		...GetNumberFieldWithVariables('1-Gain', 'deq2_1_g', -15, 15, 0.1, 0, 'Gain 1 in dB', isVisibleExpression),
		...GetNumberFieldWithVariables('1-Freq', 'deq2_1_f', 20, 20000, 1, 1000, 'Frequency 1 in Hz', isVisibleExpression),
		...GetNumberFieldWithVariables('1-Q', 'deq2_1_q', 0.44, 10, 0.01, 1, 'Q 1', isVisibleExpression),
		...GetDropdownWithVariables(
			'1-Mode',
			'deq2_1_mode',
			[getIdLabelPair('LOW', 'Low'), getIdLabelPair('HIGH', 'High')],
			'',
			'Mode 1',
			isVisibleExpression,
		),
		...GetNumberFieldWithVariables('2-Threshold', 'deq2_2_thr', -60, 0, 0.1, -30, 'Threshold 2', isVisibleExpression),
		...GetNumberFieldWithVariables('2-Ratio', 'deq2_2_ratio', 1.2, 3.0, 0.01, 1.5, 'Ratio 2', isVisibleExpression),
		...GetNumberFieldWithVariables('2-Attack', 'deq2_2_att', 0, 200, 0.1, 10, 'Attack 2 in ms', isVisibleExpression),
		...GetNumberFieldWithVariables('2-Release', 'deq2_2_rel', 20, 4000, 1, 100, 'Release 2 in ms', isVisibleExpression),
		...GetDropdownWithVariables(
			'2-Filter',
			'deq2_2_filt',
			[
				getIdLabelPair('OFF', 'Off'),
				getIdLabelPair('BP', 'Band Pass'),
				getIdLabelPair('LP6', 'Low Pass 6dB'),
				getIdLabelPair('LP12', 'Low Pass 12dB'),
				getIdLabelPair('HP6', 'High Pass 6dB'),
				getIdLabelPair('HP12', 'High Pass 12dB'),
			],
			'',
			'Filter 2',
			isVisibleExpression,
		),
		...GetNumberFieldWithVariables('2-Gain', 'deq2_2_g', -15, 15, 0.1, 0, 'Gain 2 in dB', isVisibleExpression),
		...GetNumberFieldWithVariables('2-Freq', 'deq2_2_f', 20, 20000, 1, 1000, 'Frequency 2 in Hz', isVisibleExpression),
		...GetNumberFieldWithVariables('2-Q', 'deq2_2_q', 0.44, 10, 0.01, 1, 'Q 2', isVisibleExpression),
		...GetDropdownWithVariables(
			'2-Mode',
			'deq2_2_mode',
			[getIdLabelPair('LOW', 'Low'), getIdLabelPair('HIGH', 'High')],
			'',
			'Mode 2',
			isVisibleExpression,
		),
		...GetNumberFieldWithVariables('Page', 'deq2_page', 0, 1, 1, 0, 'Page (0 or 1)', isVisibleExpression),
	]
}

export function getWaveDesignerFields(isVisibleExpression?: string): SomeCompanionActionInputField[] {
	return [
		...GetNumberFieldWithVariables('Attack', 'wave_att', -15, 15, 0.1, 0, 'Attack in dB', isVisibleExpression),
		...GetNumberFieldWithVariables('Sustain', 'wave_sust', -24, 24, 0.1, 0, 'Sustain in dB', isVisibleExpression),
		...GetNumberFieldWithVariables('Gain', 'wave_g', -18, 9, 0.1, 0, 'Gain in dB', isVisibleExpression),
	]
}

export function getPSESourceExtractorFields(isVisibleExpression?: string): SomeCompanionActionInputField[] {
	return [
		...GetNumberFieldWithVariables('Threshold', 'pse_thr', -36, 12, 0.1, -12, 'Threshold in dB', isVisibleExpression),
		...GetNumberFieldWithVariables('Depth', 'pse_depth', 0, 20, 0.1, 10, 'Depth in dB', isVisibleExpression),
		...GetNumberFieldWithVariables('Fast', 'pse_fast', 0, 1, 1, 0, 'Fast (0 = off, 1 = on)', isVisibleExpression),
		...GetNumberFieldWithVariables('Peak', 'pse_peak', 0, 1, 1, 0, 'Peak (0 = off, 1 = on)', isVisibleExpression),
	]
}

export function getPSELAComboFields(isVisibleExpression?: string): SomeCompanionActionInputField[] {
	return [
		...GetNumberFieldWithVariables('Threshold', 'cmb_thr', -36, 12, 0.1, -12, 'Threshold in dB', isVisibleExpression),
		...GetNumberFieldWithVariables('Depth', 'cmb_depth', 0, 20, 0.1, 10, 'Depth in dB', isVisibleExpression),
		...GetNumberFieldWithVariables('Fast', 'cmb_fast', 0, 1, 1, 0, 'Fast (0 = off, 1 = on)', isVisibleExpression),
		...GetNumberFieldWithVariables('Peak', 'cmb_peak', 0, 1, 1, 0, 'Peak (0 = off, 1 = on)', isVisibleExpression),
		...GetNumberFieldWithVariables('Lin Gain', 'cmb_lingain', 0, 100, 1, 50, 'Linear gain', isVisibleExpression),
		...GetNumberFieldWithVariables('Peak Gain', 'cmb_peak', 0, 100, 1, 50, 'Peak gain', isVisibleExpression),
		...GetDropdownWithVariables(
			'Mode',
			'cmb_mode',
			[getIdLabelPair('COMP', 'Compressor'), getIdLabelPair('LIM', 'Limiter')],
			'',
			'Mode',
			isVisibleExpression,
		),
	]
}

export function getAutoRiderFields(isVisibleExpression?: string): SomeCompanionActionInputField[] {
	return [
		...GetNumberFieldWithVariables('Threshold', 'ride_thr', -54, 18, 0.1, -18, 'Threshold in dB', isVisibleExpression),
		...GetNumberFieldWithVariables('Target', 'ride_tgt', -48, 0, 0.1, -24, 'Target in dB', isVisibleExpression),
		...GetNumberFieldWithVariables('Speed', 'ride_spd', 1, 50, 1, 25, 'Speed', isVisibleExpression),
		...GetDropdownWithVariables(
			'Ratio',
			'ride_ratio',
			[
				getIdLabelPair('2.0', '2.0'),
				getIdLabelPair('4.0', '4.0'),
				getIdLabelPair('8.0', '8.0'),
				getIdLabelPair('20.0', '20.0'),
				getIdLabelPair('100.0', '100.0'),
			],
			'',
			'Ratio',
			isVisibleExpression,
		),
		...GetNumberFieldWithVariables('Hold', 'ride_hld', 1, 10, 0.1, 5, 'Hold in seconds', isVisibleExpression),
		...GetNumberFieldWithVariables('Range', 'ride_range', 1, 15, 0.1, 8, 'Range in dB', isVisibleExpression),
	]
}

export function getSoulWarmthFields(isVisibleExpression?: string): SomeCompanionActionInputField[] {
	return [
		...GetNumberFieldWithVariables('Drive', 'warm_drv', 10, 100, 1, 50, 'Drive %', isVisibleExpression),
		...GetNumberFieldWithVariables('Warmth', 'warm_wrm', -100, 100, 1, 0, 'Warmth', isVisibleExpression),
		...GetNumberFieldWithVariables('Color', 'warm_col', -1, 1, 0.1, 0, 'Color', isVisibleExpression),
		...GetNumberFieldWithVariables('Trim', 'warm_trim', -18, 6, 0.1, 0, 'Trim in dB', isVisibleExpression),
		...GetNumberFieldWithVariables('Mix', 'warm_mix', 0, 100, 1, 50, 'Mix %', isVisibleExpression),
	]
}

export function getWingCompressorFields(isVisibleExpression?: string): SomeCompanionActionInputField[] {
	return [
		...GetNumberFieldWithVariables('Mix', 'comp_mix', 0, 100, 1, 100, 'Mix %', isVisibleExpression),
		...GetNumberFieldWithVariables('Gain', 'comp_gain', -6, 12, 0.1, 0, 'Gain in dB', isVisibleExpression),
		...GetNumberFieldWithVariables('Threshold', 'comp_thr', -60, 0, 0.1, -30, 'Threshold in dB', isVisibleExpression),
		...GetDropdownWithVariables(
			'Ratio',
			'comp_ratio',
			[
				getIdLabelPair('1.1', '1.1'),
				getIdLabelPair('1.2', '1.2'),
				getIdLabelPair('1.3', '1.3'),
				getIdLabelPair('1.5', '1.5'),
				getIdLabelPair('1.7', '1.7'),
				getIdLabelPair('2.0', '2.0'),
				getIdLabelPair('2.5', '2.5'),
				getIdLabelPair('3.0', '3.0'),
				getIdLabelPair('3.5', '3.5'),
				getIdLabelPair('4.0', '4.0'),
				getIdLabelPair('5.0', '5.0'),
				getIdLabelPair('6.0', '6.0'),
				getIdLabelPair('8.0', '8.0'),
				getIdLabelPair('10.0', '10.0'),
				getIdLabelPair('20.0', '20.0'),
				getIdLabelPair('50.0', '50.0'),
				getIdLabelPair('100.0', '100.0'),
			],
			'',
			'Ratio',
			isVisibleExpression,
		),
		...GetNumberFieldWithVariables('Knee', 'comp_knee', 0, 5, 1, 0, 'Knee', isVisibleExpression),
		...GetDropdownWithVariables(
			'Detector',
			'comp_det',
			[getIdLabelPair('PEAK', 'Peak'), getIdLabelPair('RMS', 'RMS')],
			'',
			'Detector',
			isVisibleExpression,
		),
		...GetNumberFieldWithVariables('Attack', 'comp_att', 0, 120, 0.1, 10, 'Attack in ms', isVisibleExpression),
		...GetNumberFieldWithVariables('Hold', 'comp_hld', 1, 200, 1, 10, 'Hold in ms', isVisibleExpression),
		...GetNumberFieldWithVariables('Release', 'comp_rel', 4, 4000, 1, 100, 'Release in ms', isVisibleExpression),
		...GetDropdownWithVariables(
			'Envelope',
			'comp_env',
			[getIdLabelPair('LIN', 'Linear'), getIdLabelPair('LOG', 'Logarithmic')],
			'',
			'Envelope',
			isVisibleExpression,
		),
		...GetNumberFieldWithVariables('Auto', 'comp_auto', 0, 1, 1, 0, 'Auto (0 = off, 1 = on)', isVisibleExpression),
	]
}

export function getWingExpanderFields(isVisibleExpression?: string): SomeCompanionActionInputField[] {
	return [
		...GetNumberFieldWithVariables('Mix', 'exp_mix', 0, 100, 1, 100, 'Mix %', isVisibleExpression),
		...GetNumberFieldWithVariables('Gain', 'exp_gain', -6, 12, 0.1, 0, 'Gain in dB', isVisibleExpression),
		...GetNumberFieldWithVariables('Threshold', 'exp_thr', -60, 0, 0.1, -30, 'Threshold in dB', isVisibleExpression),
		...GetDropdownWithVariables(
			'Ratio',
			'exp_ratio',
			[
				getIdLabelPair('1.1', '1.1'),
				getIdLabelPair('1.2', '1.2'),
				getIdLabelPair('1.3', '1.3'),
				getIdLabelPair('1.5', '1.5'),
				getIdLabelPair('1.7', '1.7'),
				getIdLabelPair('2.0', '2.0'),
				getIdLabelPair('2.5', '2.5'),
				getIdLabelPair('3.0', '3.0'),
				getIdLabelPair('3.5', '3.5'),
				getIdLabelPair('4.0', '4.0'),
				getIdLabelPair('5.0', '5.0'),
				getIdLabelPair('6.0', '6.0'),
				getIdLabelPair('8.0', '8.0'),
				getIdLabelPair('10.0', '10.0'),
				getIdLabelPair('20.0', '20.0'),
				getIdLabelPair('50.0', '50.0'),
				getIdLabelPair('100.0', '100.0'),
			],
			'',
			'Ratio',
			isVisibleExpression,
		),
		...GetNumberFieldWithVariables('Knee', 'exp_knee', 0, 5, 1, 0, 'Knee', isVisibleExpression),
		...GetDropdownWithVariables(
			'Detector',
			'exp_det',
			[getIdLabelPair('PEAK', 'Peak'), getIdLabelPair('RMS', 'RMS')],
			'',
			'Detector',
			isVisibleExpression,
		),
		...GetNumberFieldWithVariables('Attack', 'exp_att', 0, 120, 0.1, 10, 'Attack in ms', isVisibleExpression),
		...GetNumberFieldWithVariables('Hold', 'exp_hld', 1, 1000, 1, 10, 'Hold in ms', isVisibleExpression),
		...GetNumberFieldWithVariables('Release', 'exp_rel', 4, 4000, 1, 100, 'Release in ms', isVisibleExpression),
		...GetDropdownWithVariables(
			'Envelope',
			'exp_env',
			[getIdLabelPair('LIN', 'Linear'), getIdLabelPair('LOG', 'Logarithmic')],
			'',
			'Envelope',
			isVisibleExpression,
		),
		...GetNumberFieldWithVariables('Auto', 'exp_auto', 0, 1, 1, 0, 'Auto (0 = off, 1 = on)', isVisibleExpression),
	]
}

export function getBDX160Fields(isVisibleExpression?: string): SomeCompanionActionInputField[] {
	return [
		...GetNumberFieldWithVariables('Mix', 'b160_mix', 0, 100, 1, 100, 'Mix %', isVisibleExpression),
		...GetNumberFieldWithVariables('Gain', 'b160_gain', -6, 12, 0.1, 0, 'Gain in dB', isVisibleExpression),
		...GetNumberFieldWithVariables('Threshold', 'b160_thr', 0.1, 5, 0.1, 2.5, 'Threshold', isVisibleExpression),
		...GetDropdownWithVariables(
			'Ratio',
			'b160_ratio',
			[
				getIdLabelPair('1.1', '1.1'),
				getIdLabelPair('1.2', '1.2'),
				getIdLabelPair('1.3', '1.3'),
				getIdLabelPair('1.5', '1.5'),
				getIdLabelPair('1.7', '1.7'),
				getIdLabelPair('2.0', '2.0'),
				getIdLabelPair('2.5', '2.5'),
				getIdLabelPair('3.0', '3.0'),
				getIdLabelPair('3.5', '3.5'),
				getIdLabelPair('4.0', '4.0'),
				getIdLabelPair('5.0', '5.0'),
				getIdLabelPair('6.0', '6.0'),
				getIdLabelPair('8.0', '8.0'),
				getIdLabelPair('10.0', '10.0'),
				getIdLabelPair('20.0', '20.0'),
				getIdLabelPair('50.0', '50.0'),
			],
			'',
			'Ratio',
			isVisibleExpression,
		),
	]
}

export function getBDX560Fields(isVisibleExpression?: string): SomeCompanionActionInputField[] {
	return [
		...GetNumberFieldWithVariables('Mix', 'b560_mix', 0, 100, 1, 100, 'Mix %', isVisibleExpression),
		...GetNumberFieldWithVariables('Gain', 'b560_gain', -6, 12, 0.1, 0, 'Gain in dB', isVisibleExpression),
		...GetNumberFieldWithVariables('Threshold', 'b560_thr', -40, 20, 0.1, -10, 'Threshold in dB', isVisibleExpression),
		...GetDropdownWithVariables(
			'Ratio',
			'b560_ratio',
			[
				getIdLabelPair('1.1', '1.1'),
				getIdLabelPair('1.2', '1.2'),
				getIdLabelPair('1.5', '1.5'),
				getIdLabelPair('2.0', '2.0'),
				getIdLabelPair('3.0', '3.0'),
				getIdLabelPair('4.0', '4.0'),
				getIdLabelPair('5.0', '5.0'),
				getIdLabelPair('7.0', '7.0'),
				getIdLabelPair('10.0', '10.0'),
				getIdLabelPair('50.0', '50.0'),
				getIdLabelPair('999.0', '∞'),
				getIdLabelPair('-1.0', '-1.0'),
				getIdLabelPair('-2.0', '-2.0'),
				getIdLabelPair('-3.0', '-3.0'),
			],
			'',
			'Ratio',
			isVisibleExpression,
		),
		...GetNumberFieldWithVariables('Auto', 'b560_auto', 0, 1, 1, 0, 'Auto (0 = off, 1 = on)', isVisibleExpression),
	]
}

export function getDrawMoreCompressorFields(isVisibleExpression?: string): SomeCompanionActionInputField[] {
	return [
		...GetNumberFieldWithVariables('Mix', 'd241c_mix', 0, 100, 1, 100, 'Mix %', isVisibleExpression),
		...GetNumberFieldWithVariables('Gain', 'd241c_gain', -6, 12, 0.1, 0, 'Gain in dB', isVisibleExpression),
		...GetNumberFieldWithVariables('Threshold', 'd241c_thr', 0, -60, 0.1, -30, 'Threshold in dB', isVisibleExpression),
		...GetDropdownWithVariables(
			'Ratio',
			'd241c_ratio',
			[
				getIdLabelPair('1.1', '1.1'),
				getIdLabelPair('1.2', '1.2'),
				getIdLabelPair('1.3', '1.3'),
				getIdLabelPair('1.5', '1.5'),
				getIdLabelPair('1.7', '1.7'),
				getIdLabelPair('2.0', '2.0'),
				getIdLabelPair('3.0', '3.0'),
				getIdLabelPair('3.5', '3.5'),
				getIdLabelPair('4.0', '4.0'),
				getIdLabelPair('5.0', '5.0'),
				getIdLabelPair('6.0', '6.0'),
				getIdLabelPair('8.0', '8.0'),
				getIdLabelPair('10.0', '10.0'),
				getIdLabelPair('20.0', '20.0'),
				getIdLabelPair('50.0', '50.0'),
				getIdLabelPair('100.0', '100.0'),
			],
			'',
			'Ratio',
			isVisibleExpression,
		),
		...GetNumberFieldWithVariables('Attack', 'd241c_att', 1.5, 100, 0.1, 10, 'Attack in ms', isVisibleExpression),
		...GetNumberFieldWithVariables('Release', 'd241c_rel', 50, 5000, 1, 500, 'Release in ms', isVisibleExpression),
		...GetNumberFieldWithVariables('Limit', 'd241c_lim', -20, 0, 0.1, -10, 'Limit in dB', isVisibleExpression),
		...GetNumberFieldWithVariables(
			'Limit Rel',
			'd241c_limrel',
			50,
			5000,
			1,
			500,
			'Limit release in ms',
			isVisibleExpression,
		),
		...GetNumberFieldWithVariables('Auto', 'd241c_auto', 0, 1, 1, 0, 'Auto (0 = off, 1 = on)', isVisibleExpression),
	]
}

export function getEvenCompressorLimiterFields(isVisibleExpression?: string): SomeCompanionActionInputField[] {
	return [
		...GetNumberFieldWithVariables('Mix', 'ecl33_mix', 0, 100, 1, 100, 'Mix %', isVisibleExpression),
		...GetNumberFieldWithVariables('Gain', 'ecl33_gain', -6, 12, 0.1, 0, 'Gain in dB', isVisibleExpression),
		...GetNumberFieldWithVariables('Lim On', 'ecl33_limon', 0, 1, 1, 0, 'Limiter on', isVisibleExpression),
		...GetNumberFieldWithVariables(
			'Lim Thr',
			'ecl33_limthr',
			-12,
			0,
			0.1,
			-6,
			'Limiter threshold in dB',
			isVisibleExpression,
		),
		...GetDropdownWithVariables(
			'Lim Rec',
			'ecl33_limrec',
			[
				getIdLabelPair('50', '50ms'),
				getIdLabelPair('100', '100ms'),
				getIdLabelPair('200', '200ms'),
				getIdLabelPair('800', '800ms'),
				getIdLabelPair('A1', 'Auto 1'),
				getIdLabelPair('A2', 'Auto 2'),
			],
			'',
			'Limiter recovery',
			isVisibleExpression,
		),
		...GetNumberFieldWithVariables('Lim Fast', 'ecl33_limfast', 0, 1, 1, 0, 'Limiter fast', isVisibleExpression),
		...GetNumberFieldWithVariables('Comp On', 'ecl33_compon', 0, 1, 1, 1, 'Compressor on', isVisibleExpression),
		...GetNumberFieldWithVariables(
			'Comp Thr',
			'ecl33_compthr',
			-35,
			-5,
			0.1,
			-20,
			'Compressor threshold in dB',
			isVisibleExpression,
		),
		...GetDropdownWithVariables(
			'Ratio',
			'ecl33_ratio',
			[
				getIdLabelPair('1.5', '1.5'),
				getIdLabelPair('2.0', '2.0'),
				getIdLabelPair('3.0', '3.0'),
				getIdLabelPair('4.0', '4.0'),
				getIdLabelPair('6.0', '6.0'),
			],
			'',
			'Ratio',
			isVisibleExpression,
		),
		...GetDropdownWithVariables(
			'Comp Rec',
			'ecl33_comprec',
			[
				getIdLabelPair('100', '100ms'),
				getIdLabelPair('400', '400ms'),
				getIdLabelPair('800', '800ms'),
				getIdLabelPair('1500', '1500ms'),
				getIdLabelPair('A1', 'Auto 1'),
				getIdLabelPair('A2', 'Auto 2'),
			],
			'',
			'Compressor recovery',
			isVisibleExpression,
		),
		...GetNumberFieldWithVariables('Comp Fast', 'ecl33_compfast', 0, 1, 1, 0, 'Compressor fast', isVisibleExpression),
	]
}

export function getSoul9000Fields(isVisibleExpression?: string): SomeCompanionActionInputField[] {
	return [
		...GetNumberFieldWithVariables('Mix', '9000c_mix', 0, 100, 1, 100, 'Mix %', isVisibleExpression),
		...GetNumberFieldWithVariables('Gain', '9000c_gain', -6, 12, 0.1, 0, 'Gain in dB', isVisibleExpression),
		...GetNumberFieldWithVariables('Threshold', '9000c_thr', -48, 0, 0.1, -24, 'Threshold in dB', isVisibleExpression),
		...GetDropdownWithVariables(
			'Ratio',
			'9000c_ratio',
			[
				getIdLabelPair('1.43', '1.43'),
				getIdLabelPair('1.57', '1.57'),
				getIdLabelPair('1.8', '1.8'),
				getIdLabelPair('2.0', '2.0'),
				getIdLabelPair('2.8', '2.8'),
				getIdLabelPair('3.3', '3.3'),
				getIdLabelPair('4.0', '4.0'),
				getIdLabelPair('5.0', '5.0'),
				getIdLabelPair('6.0', '6.0'),
				getIdLabelPair('7.0', '7.0'),
				getIdLabelPair('9.0', '9.0'),
				getIdLabelPair('12.0', '12.0'),
				getIdLabelPair('20.0', '20.0'),
				getIdLabelPair('50.0', '50.0'),
				getIdLabelPair('100.0', '100.0'),
			],
			'',
			'Ratio',
			isVisibleExpression,
		),
		...GetNumberFieldWithVariables('Fast', '9000c_fast', 0, 1, 1, 0, 'Fast attack', isVisibleExpression),
		...GetNumberFieldWithVariables('Release', '9000c_rel', 100, 4000, 1, 500, 'Release in ms', isVisibleExpression),
		...GetNumberFieldWithVariables('Peak', '9000c_peak', 0, 1, 1, 0, 'Peak (0 = off, 1 = on)', isVisibleExpression),
	]
}

export function getSoulGBussFields(isVisibleExpression?: string): SomeCompanionActionInputField[] {
	return [
		...GetNumberFieldWithVariables('Mix', 'sbus_mix', 0, 100, 1, 100, 'Mix %', isVisibleExpression),
		...GetNumberFieldWithVariables('Gain', 'sbus_gain', -6, 12, 0.1, 0, 'Gain in dB', isVisibleExpression),
		...GetNumberFieldWithVariables('Threshold', 'sbus_thr', -48, 0, 0.1, -24, 'Threshold in dB', isVisibleExpression),
		...GetDropdownWithVariables(
			'Ratio',
			'sbus_ratio',
			[
				getIdLabelPair('1.5', '1.5'),
				getIdLabelPair('2.0', '2.0'),
				getIdLabelPair('3.0', '3.0'),
				getIdLabelPair('4.0', '4.0'),
				getIdLabelPair('5.0', '5.0'),
				getIdLabelPair('10.0', '10.0'),
			],
			'',
			'Ratio',
			isVisibleExpression,
		),
		...GetDropdownWithVariables(
			'Attack',
			'sbus_att',
			[
				getIdLabelPair('0.1', '0.1ms'),
				getIdLabelPair('0.3', '0.3ms'),
				getIdLabelPair('1.0', '1.0ms'),
				getIdLabelPair('3.0', '3.0ms'),
				getIdLabelPair('10.0', '10.0ms'),
				getIdLabelPair('30.0', '30.0ms'),
			],
			'',
			'Attack',
			isVisibleExpression,
		),
		...GetDropdownWithVariables(
			'Release',
			'sbus_rel',
			[
				getIdLabelPair('0.1', '0.1s'),
				getIdLabelPair('0.2', '0.2s'),
				getIdLabelPair('0.4', '0.4s'),
				getIdLabelPair('0.8', '0.8s'),
				getIdLabelPair('1.6', '1.6s'),
				getIdLabelPair('AUTO', 'Auto'),
			],
			'',
			'Release',
			isVisibleExpression,
		),
	]
}

export function getRed3Fields(isVisibleExpression?: string): SomeCompanionActionInputField[] {
	return [
		...GetNumberFieldWithVariables('Mix', 'red3_mix', 0, 100, 1, 100, 'Mix %', isVisibleExpression),
		...GetNumberFieldWithVariables('Gain', 'red3_gain', -6, 12, 0.1, 0, 'Gain in dB', isVisibleExpression),
		...GetNumberFieldWithVariables('Threshold', 'red3_thr', -40, 0, 0.1, -20, 'Threshold in dB', isVisibleExpression),
		...GetDropdownWithVariables(
			'Ratio',
			'red3_ratio',
			[
				getIdLabelPair('1.1', '1.1'),
				getIdLabelPair('1.2', '1.2'),
				getIdLabelPair('1.3', '1.3'),
				getIdLabelPair('1.5', '1.5'),
				getIdLabelPair('2.0', '2.0'),
				getIdLabelPair('2.5', '2.5'),
				getIdLabelPair('3.0', '3.0'),
				getIdLabelPair('3.5', '3.5'),
				getIdLabelPair('4.0', '4.0'),
				getIdLabelPair('5.0', '5.0'),
				getIdLabelPair('6.0', '6.0'),
				getIdLabelPair('8.0', '8.0'),
				getIdLabelPair('10.0', '10.0'),
			],
			'',
			'Ratio',
			isVisibleExpression,
		),
		...GetNumberFieldWithVariables('Attack', 'red3_att', 1, 50, 0.1, 10, 'Attack in ms', isVisibleExpression),
		...GetNumberFieldWithVariables('Release', 'red3_rel', 100, 4000, 1, 500, 'Release in ms', isVisibleExpression),
		...GetNumberFieldWithVariables('Auto', 'red3_auto', 0, 1, 1, 0, 'Auto (0 = off, 1 = on)', isVisibleExpression),
	]
}

export function get76LAFields(isVisibleExpression?: string): SomeCompanionActionInputField[] {
	return [
		...GetNumberFieldWithVariables('Mix', '76la_mix', 0, 100, 1, 100, 'Mix %', isVisibleExpression),
		...GetNumberFieldWithVariables('Gain', '76la_gain', -6, 12, 0.1, 0, 'Gain in dB', isVisibleExpression),
		...GetNumberFieldWithVariables('Input', '76la_in', -48, 0, 0.1, -24, 'Input in dB', isVisibleExpression),
		...GetNumberFieldWithVariables('Output', '76la_out', -48, 0, 0.1, -24, 'Output in dB', isVisibleExpression),
		...GetNumberFieldWithVariables('Attack', '76la_att', 1, 7, 0.1, 4, 'Attack', isVisibleExpression),
		...GetNumberFieldWithVariables('Release', '76la_rel', 1, 7, 0.1, 4, 'Release', isVisibleExpression),
		...GetDropdownWithVariables(
			'Ratio',
			'76la_ratio',
			[
				getIdLabelPair('4', '4:1'),
				getIdLabelPair('8', '8:1'),
				getIdLabelPair('12', '12:1'),
				getIdLabelPair('20', '20:1'),
				getIdLabelPair('ALL', 'All'),
			],
			'',
			'Ratio',
			isVisibleExpression,
		),
	]
}

export function getLALevelerFields(isVisibleExpression?: string): SomeCompanionActionInputField[] {
	return [
		...GetNumberFieldWithVariables('Lin Gain', 'la_lingain', 0, 100, 1, 50, 'Linear gain', isVisibleExpression),
		...GetNumberFieldWithVariables('Peak', 'la_peak', 0, 100, 1, 50, 'Peak', isVisibleExpression),
		...GetDropdownWithVariables(
			'Mode',
			'la_mode',
			[getIdLabelPair('COMP', 'Compressor'), getIdLabelPair('LIM', 'Limiter')],
			'',
			'Mode',
			isVisibleExpression,
		),
	]
}

export function getF670Fields(isVisibleExpression?: string): SomeCompanionActionInputField[] {
	return [
		...GetNumberFieldWithVariables('Mix', 'f670_mix', 0, 100, 1, 100, 'Mix %', isVisibleExpression),
		...GetNumberFieldWithVariables('Gain', 'f670_gain', -6, 12, 0.1, 0, 'Gain in dB', isVisibleExpression),
		...GetNumberFieldWithVariables('Input', 'f670_in', -20, 0, 0.1, -10, 'Input in dB', isVisibleExpression),
		...GetNumberFieldWithVariables('Threshold', 'f670_thr', 0, 10, 0.1, 5, 'Threshold', isVisibleExpression),
		...GetNumberFieldWithVariables('Time', 'f670_time', 1, 6, 1, 3, 'Time constant', isVisibleExpression),
		...GetNumberFieldWithVariables('Bias', 'f670_bias', 0, 1, 0.01, 0.5, 'Bias', isVisibleExpression),
	]
}

export function getEternalBlissFields(isVisibleExpression?: string): SomeCompanionActionInputField[] {
	return [
		...GetNumberFieldWithVariables('Mix', 'bliss_mix', 0, 100, 1, 100, 'Mix %', isVisibleExpression),
		...GetNumberFieldWithVariables('Gain', 'bliss_gain', -6, 12, 0.1, 0, 'Gain in dB', isVisibleExpression),
		...GetNumberFieldWithVariables('Threshold', 'bliss_thr', -50, 0, 0.1, -25, 'Threshold in dB', isVisibleExpression),
		...GetDropdownWithVariables(
			'Ratio',
			'bliss_ratio',
			[
				getIdLabelPair('1.2', '1.2'),
				getIdLabelPair('1.3', '1.3'),
				getIdLabelPair('1.6', '1.6'),
				getIdLabelPair('2.0', '2.0'),
				getIdLabelPair('3.0', '3.0'),
				getIdLabelPair('-1.0', '-1.0'),
				getIdLabelPair('-2.0', '-2.0'),
				getIdLabelPair('-3.0', '-3.0'),
				getIdLabelPair('-4.0', '-4.0'),
			],
			'',
			'Ratio',
			isVisibleExpression,
		),
		...GetNumberFieldWithVariables('Attack', 'bliss_att', 4, 150, 0.1, 25, 'Attack in ms', isVisibleExpression),
		...GetNumberFieldWithVariables('Release', 'bliss_rel', 5, 1200, 1, 100, 'Release in ms', isVisibleExpression),
		...GetNumberFieldWithVariables('Auto Fast', 'bliss_autofast', 0, 1, 1, 0, 'Auto fast', isVisibleExpression),
		...GetNumberFieldWithVariables('Anti Log', 'bliss_antilog', 0, 1, 1, 0, 'Anti log', isVisibleExpression),
		...GetNumberFieldWithVariables('GR Limit On', 'bliss_grlimon', 0, 1, 1, 0, 'GR limit on', isVisibleExpression),
		...GetNumberFieldWithVariables('GR Limit', 'bliss_grlim', -21, 0, 0.1, -10, 'GR limit in dB', isVisibleExpression),
	]
}

export function getNoStressorFields(isVisibleExpression?: string): SomeCompanionActionInputField[] {
	return [
		...GetNumberFieldWithVariables('Mix', 'nstr_mix', 0, 100, 1, 100, 'Mix %', isVisibleExpression),
		...GetNumberFieldWithVariables('Gain', 'nstr_gain', -6, 12, 0.1, 0, 'Gain in dB', isVisibleExpression),
		...GetNumberFieldWithVariables('Input', 'nstr_in', 0, 10, 0.1, 5, 'Input', isVisibleExpression),
		...GetNumberFieldWithVariables('Output', 'nstr_out', 0, 10, 0.1, 5, 'Output', isVisibleExpression),
		...GetNumberFieldWithVariables('Attack', 'nstr_att', 0, 10, 0.1, 5, 'Attack', isVisibleExpression),
		...GetNumberFieldWithVariables('Release', 'nstr_rel', 0, 10, 0.1, 5, 'Release', isVisibleExpression),
		...GetDropdownWithVariables(
			'Ratio',
			'nstr_ratio',
			[
				getIdLabelPair('1.5:1', '1.5:1'),
				getIdLabelPair('2:1', '2:1'),
				getIdLabelPair('3:1', '3:1'),
				getIdLabelPair('4:1', '4:1'),
				getIdLabelPair('6:1', '6:1'),
				getIdLabelPair('10:1', '10:1'),
				getIdLabelPair('20:1', '20:1'),
				getIdLabelPair('NUKE', 'Nuke'),
			],
			'',
			'Ratio',
			isVisibleExpression,
		),
	]
}

export function getPIA2250Fields(isVisibleExpression?: string): SomeCompanionActionInputField[] {
	return [
		...GetNumberFieldWithVariables('Mix', '2250_mix', 0, 100, 1, 100, 'Mix %', isVisibleExpression),
		...GetNumberFieldWithVariables('Gain', '2250_gain', -6, 12, 0.1, 0, 'Gain in dB', isVisibleExpression),
		...GetNumberFieldWithVariables('Threshold', '2250_thr', 0, 10, 0.1, 5, 'Threshold', isVisibleExpression),
		...GetNumberFieldWithVariables('Ratio', '2250_ratio', 0, 10, 0.1, 5, 'Ratio', isVisibleExpression),
		...GetDropdownWithVariables(
			'Attack',
			'2250_att',
			[getIdLabelPair('HARD', 'Hard'), getIdLabelPair('MED', 'Medium'), getIdLabelPair('SLOW', 'Slow')],
			'',
			'Attack',
			isVisibleExpression,
		),
		...GetNumberFieldWithVariables('Release', '2250_rel', 50, 3000, 1, 500, 'Release in ms', isVisibleExpression),
		...GetDropdownWithVariables(
			'Knee',
			'2250_knee',
			[getIdLabelPair('HARD', 'Hard'), getIdLabelPair('SOFT', 'Soft')],
			'',
			'Knee',
			isVisibleExpression,
		),
		...GetDropdownWithVariables(
			'Type',
			'2250_type',
			[getIdLabelPair('OLD', 'Old'), getIdLabelPair('NEW', 'New')],
			'',
			'Type',
			isVisibleExpression,
		),
	]
}

export function getLTA100Fields(isVisibleExpression?: string): SomeCompanionActionInputField[] {
	return [
		...GetNumberFieldWithVariables('Mix', 'l100_mix', 0, 100, 1, 100, 'Mix %', isVisibleExpression),
		...GetNumberFieldWithVariables('Gain', 'l100_gain', -6, 12, 0.1, 0, 'Gain in dB', isVisibleExpression),
		...GetNumberFieldWithVariables('Lin Gain', 'l100_lingain', 0, 10, 0.1, 5, 'Linear gain', isVisibleExpression),
		...GetNumberFieldWithVariables('GR', 'l100_gr', 0, 10, 0.1, 5, 'Gain reduction', isVisibleExpression),
		...GetDropdownWithVariables(
			'Attack',
			'l100_att',
			[getIdLabelPair('FAST', 'Fast'), getIdLabelPair('MED', 'Medium'), getIdLabelPair('SLOW', 'Slow')],
			'',
			'Attack',
			isVisibleExpression,
		),
		...GetDropdownWithVariables(
			'Release',
			'l100_rel',
			[getIdLabelPair('FAST', 'Fast'), getIdLabelPair('MED', 'Medium'), getIdLabelPair('SLOW', 'Slow')],
			'',
			'Release',
			isVisibleExpression,
		),
	]
}

export function getEven88CompressorFields(isVisibleExpression?: string): SomeCompanionActionInputField[] {
	return [
		...GetNumberFieldWithVariables('Mix', 'e88c_mix', 0, 100, 1, 100, 'Mix %', isVisibleExpression),
		...GetNumberFieldWithVariables('Gain', 'e88c_gain', -6, 12, 0.1, 0, 'Gain in dB', isVisibleExpression),
		...GetDropdownWithVariables(
			'Knee',
			'e88c_knee',
			[getIdLabelPair('SOFT', 'Soft'), getIdLabelPair('HARD', 'Hard')],
			'',
			'Knee',
			isVisibleExpression,
		),
		...GetNumberFieldWithVariables('Threshold', 'e88c_thr', 20, -10, 0.1, -5, 'Threshold in dB', isVisibleExpression),
		...GetNumberFieldWithVariables(
			'Thru Pull',
			'e88c_thrupull',
			0,
			-1,
			0.01,
			-0.5,
			'Through pull',
			isVisibleExpression,
		),
		...GetNumberFieldWithVariables('Ratio', 'e88c_ratio', 1, 10, 0.1, 2, 'Ratio', isVisibleExpression),
		...GetDropdownWithVariables(
			'Attack',
			'e88c_att',
			[getIdLabelPair('SLOW', 'Slow'), getIdLabelPair('FAST', 'Fast')],
			'',
			'Attack',
			isVisibleExpression,
		),
		...GetNumberFieldWithVariables('Release', 'e88c_rel', 10, 3000, 1, 500, 'Release in ms', isVisibleExpression),
	]
}

export function getLMTCompressorFields(isVisibleExpression?: string): SomeCompanionActionInputField[] {
	return [
		...GetNumberFieldWithVariables('Mix', 'lmt_mix', 0, 100, 1, 100, 'Mix %', isVisibleExpression),
		...GetNumberFieldWithVariables('Gain', 'lmt_gain', -6, 12, 0.1, 0, 'Gain in dB', isVisibleExpression),
		...GetNumberFieldWithVariables('Speed', 'lmt_tspd', 0, 1, 0.1, 0.5, 'Speed', isVisibleExpression),
		...GetNumberFieldWithVariables('Transients', 'lmt_trans', -10, 10, 0.1, 0, 'Transients', isVisibleExpression),
		...GetNumberFieldWithVariables(
			'Trans Gain',
			'lmt_tgain',
			-12,
			12,
			0.1,
			0,
			'Transients gain in dB',
			isVisibleExpression,
		),
		...GetNumberFieldWithVariables('Ton', 'lmt_ton', 0, 1, 1, 0, 'Ton (shaper on)', isVisibleExpression),
		...GetNumberFieldWithVariables('Comp On', 'lmt_compon', 0, 100, 1, 50, 'Compressor on', isVisibleExpression),
		...GetNumberFieldWithVariables(
			'Comp Gain',
			'lmt_compgain',
			-12,
			12,
			0.1,
			0,
			'Compressor gain in dB',
			isVisibleExpression,
		),
		...GetNumberFieldWithVariables('Con', 'lmt_con', 0, 1, 1, 0, 'Con (compressor on)', isVisibleExpression),
	]
}

export function getOneKnobCompressorFields(isVisibleExpression?: string): SomeCompanionActionInputField[] {
	return [
		...GetNumberFieldWithVariables('Mix', 'onec_mix', 0, 100, 1, 100, 'Mix %', isVisibleExpression),
		...GetNumberFieldWithVariables('Gain', 'onec_gain', -6, 12, 0.1, 0, 'Gain in dB', isVisibleExpression),
		...GetNumberFieldWithVariables('GR', 'onec_gr', 0, 10, 0.1, 5, 'Gain reduction', isVisibleExpression),
		...GetNumberFieldWithVariables('Dag', 'onec_dag', 0, 1, 1, 0, 'DAG (auto gain)', isVisibleExpression),
	]
}
