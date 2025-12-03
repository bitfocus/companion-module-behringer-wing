// Utilities to generate OSC command tuples for dynamics models
// Each function returns a list of [cmd, arg] (and optionally a third boolean)

import { CompanionOptionValues } from '@companion-module/base'

export type SendTuple = [string, number | string] | [string, number | string, boolean]

function dyn(sel: string, param: string): string {
	return `${sel}/dyn/${param}`
}

function addIfDefined(
	list: SendTuple[],
	sel: string,
	options: CompanionOptionValues,
	optKey: string,
	param: string,
): void {
	const v = options?.[optKey]
	if (v !== undefined && v !== '') list.push([dyn(sel, param), v as any])
}

// Gate / Ducker
export function buildGateCommands(sel: string, options: CompanionOptionValues): SendTuple[] {
	const out: SendTuple[] = []
	addIfDefined(out, sel, options, 'gate_thr', 'thr')
	addIfDefined(out, sel, options, 'gate_range', 'range')
	addIfDefined(out, sel, options, 'gate_att', 'att')
	addIfDefined(out, sel, options, 'gate_hld', 'hld')
	addIfDefined(out, sel, options, 'gate_rel', 'rel')
	addIfDefined(out, sel, options, 'gate_acc', 'acc')
	addIfDefined(out, sel, options, 'gate_ratio', 'ratio')
	return out
}

export function buildDuckerCommands(sel: string, options: CompanionOptionValues): SendTuple[] {
	const out: SendTuple[] = []
	addIfDefined(out, sel, options, 'duck_thr', 'thr')
	addIfDefined(out, sel, options, 'duck_range', 'range')
	addIfDefined(out, sel, options, 'duck_att', 'att')
	addIfDefined(out, sel, options, 'duck_hld', 'hld')
	addIfDefined(out, sel, options, 'duck_rel', 'rel')
	return out
}

// Even 88 Gate
export function buildE88GateCommands(sel: string, options: CompanionOptionValues): SendTuple[] {
	const out: SendTuple[] = []
	addIfDefined(out, sel, options, 'e88_thr', 'thr')
	addIfDefined(out, sel, options, 'e88_hyst', 'hyst')
	addIfDefined(out, sel, options, 'e88_range', 'range')
	addIfDefined(out, sel, options, 'e88_rel', 'rel')
	addIfDefined(out, sel, options, 'e88_fast', 'fast')
	// Use 'mode' (not 'mdl') to avoid overriding the plugin selection
	addIfDefined(out, sel, options, 'e88_mdl', 'mode')
	return out
}

// SSL 9000 Gate/Expander
export function build9000GCommands(sel: string, options: CompanionOptionValues): SendTuple[] {
	const out: SendTuple[] = []
	addIfDefined(out, sel, options, '9000g_thr', 'thr')
	addIfDefined(out, sel, options, '9000g_range', 'range')
	addIfDefined(out, sel, options, '9000g_hld', 'hld')
	addIfDefined(out, sel, options, '9000g_rel', 'rel')
	addIfDefined(out, sel, options, '9000g_fast', 'fast')
	addIfDefined(out, sel, options, '9000g_mode', 'mode')
	return out
}

// Draw More Expander/Gate 241
export function buildD241GCommands(sel: string, options: CompanionOptionValues): SendTuple[] {
	const out: SendTuple[] = []
	addIfDefined(out, sel, options, 'd241g_thr', 'thr')
	addIfDefined(out, sel, options, 'd241g_slow', 'slow')
	return out
}

// DBX 902 De-Esser
export function buildDS902Commands(sel: string, options: CompanionOptionValues): SendTuple[] {
	const out: SendTuple[] = []
	addIfDefined(out, sel, options, 'ds902_f', 'f')
	addIfDefined(out, sel, options, 'ds902_range', 'range')
	addIfDefined(out, sel, options, 'ds902_mode', 'mode')
	return out
}

// Dynamic EQ
export function buildDEQCommands(sel: string, options: CompanionOptionValues): SendTuple[] {
	const out: SendTuple[] = []
	addIfDefined(out, sel, options, 'deq_thr', 'thr')
	addIfDefined(out, sel, options, 'deq_ratio', 'ratio')
	addIfDefined(out, sel, options, 'deq_att', 'att')
	addIfDefined(out, sel, options, 'deq_rel', 'rel')
	addIfDefined(out, sel, options, 'deq_filt', 'filt')
	addIfDefined(out, sel, options, 'deq_g', 'g')
	addIfDefined(out, sel, options, 'deq_f', 'f')
	addIfDefined(out, sel, options, 'deq_q', 'q')
	addIfDefined(out, sel, options, 'deq_mode', 'mode')
	return out
}

// Dual Dynamic EQ
export function buildDEQ2Commands(sel: string, options: CompanionOptionValues): SendTuple[] {
	const out: SendTuple[] = []
	addIfDefined(out, sel, options, 'deq2_1_thr', '1-thr')
	addIfDefined(out, sel, options, 'deq2_1_ratio', '1-ratio')
	addIfDefined(out, sel, options, 'deq2_1_att', '1-att')
	addIfDefined(out, sel, options, 'deq2_1_rel', '1-rel')
	addIfDefined(out, sel, options, 'deq2_1_filt', '1-filt')
	addIfDefined(out, sel, options, 'deq2_1_g', '1-g')
	addIfDefined(out, sel, options, 'deq2_1_f', '1-f')
	addIfDefined(out, sel, options, 'deq2_1_q', '1-q')
	addIfDefined(out, sel, options, 'deq2_1_mode', '1-mode')

	addIfDefined(out, sel, options, 'deq2_2_thr', '2-thr')
	addIfDefined(out, sel, options, 'deq2_2_ratio', '2-ratio')
	addIfDefined(out, sel, options, 'deq2_2_att', '2-att')
	addIfDefined(out, sel, options, 'deq2_2_rel', '2-rel')
	addIfDefined(out, sel, options, 'deq2_2_filt', '2-filt')
	addIfDefined(out, sel, options, 'deq2_2_g', '2-g')
	addIfDefined(out, sel, options, 'deq2_2_f', '2-f')
	addIfDefined(out, sel, options, 'deq2_2_q', '2-q')
	addIfDefined(out, sel, options, 'deq2_2_mode', '2-mode')

	addIfDefined(out, sel, options, 'deq2_page', 'page')
	return out
}

// Wave Designer
export function buildWAVECommands(sel: string, options: CompanionOptionValues): SendTuple[] {
	const out: SendTuple[] = []
	addIfDefined(out, sel, options, 'wave_att', 'att')
	addIfDefined(out, sel, options, 'wave_sust', 'sust')
	addIfDefined(out, sel, options, 'wave_g', 'g')
	return out
}

// PSE Source Extractor
export function buildPSECommands(sel: string, options: CompanionOptionValues): SendTuple[] {
	const out: SendTuple[] = []
	addIfDefined(out, sel, options, 'pse_thr', 'thr')
	addIfDefined(out, sel, options, 'pse_depth', 'depth')
	addIfDefined(out, sel, options, 'pse_fast', 'fast')
	addIfDefined(out, sel, options, 'pse_peak', 'peak')
	return out
}

// PSE/LA Combo
export function buildCMBCommands(sel: string, options: CompanionOptionValues): SendTuple[] {
	const out: SendTuple[] = []
	addIfDefined(out, sel, options, 'cmb_thr', 'thr')
	addIfDefined(out, sel, options, 'cmb_depth', 'depth')
	addIfDefined(out, sel, options, 'cmb_fast', 'fast')
	addIfDefined(out, sel, options, 'cmb_peak', 'peak')
	addIfDefined(out, sel, options, 'cmb_lingain', 'lingain')
	// 'cmb_peak' already mapped above as peak gain if provided
	addIfDefined(out, sel, options, 'cmb_mode', 'mode')
	return out
}

// Auto Rider Dynamics
export function buildRIDECommands(sel: string, options: CompanionOptionValues): SendTuple[] {
	const out: SendTuple[] = []
	addIfDefined(out, sel, options, 'ride_thr', 'thr')
	addIfDefined(out, sel, options, 'ride_tgt', 'tgt')
	addIfDefined(out, sel, options, 'ride_spd', 'spd')
	addIfDefined(out, sel, options, 'ride_ratio', 'ratio')
	addIfDefined(out, sel, options, 'ride_hld', 'hld')
	addIfDefined(out, sel, options, 'ride_range', 'range')
	return out
}

// Soul Warmth Preamp
export function buildWARMCommands(sel: string, options: CompanionOptionValues): SendTuple[] {
	const out: SendTuple[] = []
	addIfDefined(out, sel, options, 'warm_drv', 'drv')
	addIfDefined(out, sel, options, 'warm_wrm', 'hrm')
	addIfDefined(out, sel, options, 'warm_col', 'col')
	addIfDefined(out, sel, options, 'warm_trim', 'trim')
	addIfDefined(out, sel, options, 'warm_mix', 'mix')
	return out
}

// WING Compressor
export function buildCOMPCommands(sel: string, options: CompanionOptionValues): SendTuple[] {
	const out: SendTuple[] = []
	addIfDefined(out, sel, options, 'comp_mix', 'mix')
	addIfDefined(out, sel, options, 'comp_gain', 'gain')
	addIfDefined(out, sel, options, 'comp_thr', 'thr')
	addIfDefined(out, sel, options, 'comp_ratio', 'ratio')
	addIfDefined(out, sel, options, 'comp_knee', 'knee')
	addIfDefined(out, sel, options, 'comp_det', 'det')
	addIfDefined(out, sel, options, 'comp_att', 'att')
	addIfDefined(out, sel, options, 'comp_hld', 'hld')
	addIfDefined(out, sel, options, 'comp_rel', 'rel')
	addIfDefined(out, sel, options, 'comp_env', 'env')
	addIfDefined(out, sel, options, 'comp_auto', 'auto')
	return out
}

// WING Expander
export function buildEXPCommands(sel: string, options: CompanionOptionValues): SendTuple[] {
	const out: SendTuple[] = []
	addIfDefined(out, sel, options, 'exp_mix', 'mix')
	addIfDefined(out, sel, options, 'exp_gain', 'gain')
	addIfDefined(out, sel, options, 'exp_thr', 'thr')
	addIfDefined(out, sel, options, 'exp_ratio', 'ratio')
	addIfDefined(out, sel, options, 'exp_knee', 'knee')
	addIfDefined(out, sel, options, 'exp_det', 'det')
	addIfDefined(out, sel, options, 'exp_att', 'att')
	addIfDefined(out, sel, options, 'exp_hld', 'hld')
	addIfDefined(out, sel, options, 'exp_rel', 'rel')
	addIfDefined(out, sel, options, 'exp_env', 'env')
	addIfDefined(out, sel, options, 'exp_auto', 'auto')
	return out
}

// BDX 160 Compressor/Limiter
export function buildB160Commands(sel: string, options: CompanionOptionValues): SendTuple[] {
	const out: SendTuple[] = []
	addIfDefined(out, sel, options, 'b160_mix', 'mix')
	addIfDefined(out, sel, options, 'b160_gain', 'gain')
	addIfDefined(out, sel, options, 'b160_thr', 'thr')
	addIfDefined(out, sel, options, 'b160_ratio', 'ratio')
	return out
}

// BDX 560 Easy Compressor
export function buildB560Commands(sel: string, options: CompanionOptionValues): SendTuple[] {
	const out: SendTuple[] = []
	addIfDefined(out, sel, options, 'b560_mix', 'mix')
	addIfDefined(out, sel, options, 'b560_gain', 'gain')
	addIfDefined(out, sel, options, 'b560_thr', 'thr')
	addIfDefined(out, sel, options, 'b560_ratio', 'ratio')
	addIfDefined(out, sel, options, 'b560_auto', 'auto')
	return out
}

// Draw More Compressor
export function buildD241CCommands(sel: string, options: CompanionOptionValues): SendTuple[] {
	const out: SendTuple[] = []
	addIfDefined(out, sel, options, 'd241c_mix', 'mix')
	addIfDefined(out, sel, options, 'd241c_gain', 'gain')
	addIfDefined(out, sel, options, 'd241c_thr', 'thr')
	addIfDefined(out, sel, options, 'd241c_ratio', 'ratio')
	addIfDefined(out, sel, options, 'd241c_att', 'att')
	addIfDefined(out, sel, options, 'd241c_rel', 'rel')
	addIfDefined(out, sel, options, 'd241c_lim', 'lim')
	addIfDefined(out, sel, options, 'd241c_limrel', 'lrel')
	addIfDefined(out, sel, options, 'd241c_auto', 'auto')
	return out
}

// Even Compressor/Limiter
export function buildECL33Commands(sel: string, options: CompanionOptionValues): SendTuple[] {
	const out: SendTuple[] = []
	addIfDefined(out, sel, options, 'ecl33_mix', 'mix')
	addIfDefined(out, sel, options, 'ecl33_gain', 'gain')
	addIfDefined(out, sel, options, 'ecl33_limon', 'lon')
	addIfDefined(out, sel, options, 'ecl33_limthr', 'lthr')
	addIfDefined(out, sel, options, 'ecl33_limrec', 'lrec')
	addIfDefined(out, sel, options, 'ecl33_limfast', 'lfast')
	addIfDefined(out, sel, options, 'ecl33_compon', 'con')
	addIfDefined(out, sel, options, 'ecl33_compthr', 'cthr')
	addIfDefined(out, sel, options, 'ecl33_ratio', 'ratio')
	addIfDefined(out, sel, options, 'ecl33_comprec', 'crec')
	addIfDefined(out, sel, options, 'ecl33_compfast', 'cfast')
	return out
}

// Soul 9000 Channel Compressor
export function build9000CCommands(sel: string, options: CompanionOptionValues): SendTuple[] {
	const out: SendTuple[] = []
	addIfDefined(out, sel, options, '9000c_mix', 'mix')
	addIfDefined(out, sel, options, '9000c_gain', 'gain')
	addIfDefined(out, sel, options, '9000c_thr', 'thr')
	addIfDefined(out, sel, options, '9000c_ratio', 'ratio')
	addIfDefined(out, sel, options, '9000c_fast', 'fast')
	addIfDefined(out, sel, options, '9000c_rel', 'rel')
	addIfDefined(out, sel, options, '9000c_peak', 'peak')
	return out
}

// Soul G Buss Compressor
export function buildSBUSCommands(sel: string, options: CompanionOptionValues): SendTuple[] {
	const out: SendTuple[] = []
	addIfDefined(out, sel, options, 'sbus_mix', 'mix')
	addIfDefined(out, sel, options, 'sbus_gain', 'gain')
	addIfDefined(out, sel, options, 'sbus_thr', 'thr')
	addIfDefined(out, sel, options, 'sbus_ratio', 'ratio')
	addIfDefined(out, sel, options, 'sbus_att', 'att')
	addIfDefined(out, sel, options, 'sbus_rel', 'rel')
	return out
}

// Red Compressor
export function buildRED3Commands(sel: string, options: CompanionOptionValues): SendTuple[] {
	const out: SendTuple[] = []
	addIfDefined(out, sel, options, 'red3_mix', 'mix')
	addIfDefined(out, sel, options, 'red3_gain', 'gain')
	addIfDefined(out, sel, options, 'red3_thr', 'thr')
	addIfDefined(out, sel, options, 'red3_ratio', 'ratio')
	addIfDefined(out, sel, options, 'red3_att', 'att')
	addIfDefined(out, sel, options, 'red3_rel', 'rel')
	addIfDefined(out, sel, options, 'red3_auto', 'auto')
	return out
}

// 76 Limiting Amplifier
export function build76LACommands(sel: string, options: CompanionOptionValues): SendTuple[] {
	const out: SendTuple[] = []
	addIfDefined(out, sel, options, '76la_mix', 'mix')
	addIfDefined(out, sel, options, '76la_gain', 'gain')
	addIfDefined(out, sel, options, '76la_in', 'in')
	addIfDefined(out, sel, options, '76la_out', 'out')
	addIfDefined(out, sel, options, '76la_att', 'att')
	addIfDefined(out, sel, options, '76la_rel', 'rel')
	addIfDefined(out, sel, options, '76la_ratio', 'ratio')
	return out
}

// LA Leveler
export function buildLACommands(sel: string, options: CompanionOptionValues): SendTuple[] {
	const out: SendTuple[] = []
	addIfDefined(out, sel, options, 'la_lingain', 'lingain')
	addIfDefined(out, sel, options, 'la_peak', 'peak')
	addIfDefined(out, sel, options, 'la_mode', 'mode')
	return out
}

// Fairkid 670
export function buildF670Commands(sel: string, options: CompanionOptionValues): SendTuple[] {
	const out: SendTuple[] = []
	addIfDefined(out, sel, options, 'f670_mix', 'mix')
	addIfDefined(out, sel, options, 'f670_gain', 'gain')
	addIfDefined(out, sel, options, 'f670_in', 'in')
	addIfDefined(out, sel, options, 'f670_thr', 'thr')
	addIfDefined(out, sel, options, 'f670_time', 'time')
	addIfDefined(out, sel, options, 'f670_bias', 'bias')
	return out
}

// Eternal Bliss
export function buildBLISSCommands(sel: string, options: CompanionOptionValues): SendTuple[] {
	const out: SendTuple[] = []
	addIfDefined(out, sel, options, 'bliss_mix', 'mix')
	addIfDefined(out, sel, options, 'bliss_gain', 'gain')
	addIfDefined(out, sel, options, 'bliss_thr', 'thr')
	addIfDefined(out, sel, options, 'bliss_ratio', 'ratio')
	addIfDefined(out, sel, options, 'bliss_att', 'att')
	addIfDefined(out, sel, options, 'bliss_rel', 'rel')
	addIfDefined(out, sel, options, 'bliss_autofast', 'afast')
	addIfDefined(out, sel, options, 'bliss_antilog', 'alog')
	addIfDefined(out, sel, options, 'bliss_grlimon', 'glon')
	addIfDefined(out, sel, options, 'bliss_grlim', 'glim')
	return out
}

// No Stressor
export function buildNSTRCommands(sel: string, options: CompanionOptionValues): SendTuple[] {
	const out: SendTuple[] = []
	addIfDefined(out, sel, options, 'nstr_mix', 'mix')
	addIfDefined(out, sel, options, 'nstr_gain', 'gain')
	addIfDefined(out, sel, options, 'nstr_in', 'in')
	addIfDefined(out, sel, options, 'nstr_out', 'out')
	addIfDefined(out, sel, options, 'nstr_att', 'att')
	addIfDefined(out, sel, options, 'nstr_rel', 'rel')
	addIfDefined(out, sel, options, 'nstr_ratio', 'ratio')
	return out
}

// PIA 2250
export function build2250Commands(sel: string, options: CompanionOptionValues): SendTuple[] {
	const out: SendTuple[] = []
	addIfDefined(out, sel, options, '2250_mix', 'mix')
	addIfDefined(out, sel, options, '2250_gain', 'gain')
	addIfDefined(out, sel, options, '2250_thr', 'thr')
	addIfDefined(out, sel, options, '2250_ratio', 'ratio')
	addIfDefined(out, sel, options, '2250_att', 'att')
	addIfDefined(out, sel, options, '2250_rel', 'rel')
	addIfDefined(out, sel, options, '2250_knee', 'knee')
	addIfDefined(out, sel, options, '2250_type', 'type')
	return out
}

// LTA100 Leveler
export function buildL100Commands(sel: string, options: CompanionOptionValues): SendTuple[] {
	const out: SendTuple[] = []
	addIfDefined(out, sel, options, 'l100_mix', 'mix')
	addIfDefined(out, sel, options, 'l100_gain', 'gain')
	addIfDefined(out, sel, options, 'l100_lingain', 'lingain')
	addIfDefined(out, sel, options, 'l100_gr', 'gr')
	addIfDefined(out, sel, options, 'l100_att', 'att')
	addIfDefined(out, sel, options, 'l100_rel', 'rel')
	return out
}

// Even 88 Compressor
export function buildE88CCommands(sel: string, options: CompanionOptionValues): SendTuple[] {
	const out: SendTuple[] = []
	addIfDefined(out, sel, options, 'e88c_mix', 'mix')
	addIfDefined(out, sel, options, 'e88c_gain', 'gain')
	addIfDefined(out, sel, options, 'e88c_knee', 'knee')
	addIfDefined(out, sel, options, 'e88c_thr', 'thr')
	addIfDefined(out, sel, options, 'e88c_thrupull', 'thrpull')
	addIfDefined(out, sel, options, 'e88c_ratio', 'ratio')
	addIfDefined(out, sel, options, 'e88c_att', 'att')
	addIfDefined(out, sel, options, 'e88c_rel', 'rel')
	return out
}

// LMT Compressor
export function buildLMTCommands(sel: string, options: CompanionOptionValues): SendTuple[] {
	const out: SendTuple[] = []
	addIfDefined(out, sel, options, 'lmt_mix', 'mix')
	addIfDefined(out, sel, options, 'lmt_gain', 'gain')
	addIfDefined(out, sel, options, 'lmt_tspd', 'tspd')
	addIfDefined(out, sel, options, 'lmt_trans', 'trans')
	addIfDefined(out, sel, options, 'lmt_tgain', 'tgain')
	addIfDefined(out, sel, options, 'lmt_ton', 'ton')
	addIfDefined(out, sel, options, 'lmt_compon', 'comp')
	addIfDefined(out, sel, options, 'lmt_compgain', 'cgain')
	addIfDefined(out, sel, options, 'lmt_con', 'con')
	return out
}

// One Knob Compressor
export function buildONECCommands(sel: string, options: CompanionOptionValues): SendTuple[] {
	const out: SendTuple[] = []
	addIfDefined(out, sel, options, 'onec_mix', 'mix')
	addIfDefined(out, sel, options, 'onec_gain', 'gain')
	addIfDefined(out, sel, options, 'onec_gr', 'gn')
	addIfDefined(out, sel, options, 'onec_dag', 'dag')
	return out
}

// Dispatcher: builds the full list including the model selection
export function buildDynamicsModelCommands(sel: string, model: string, options: CompanionOptionValues): SendTuple[] {
	const cmds: SendTuple[] = []
	// Select model first
	cmds.push([dyn(sel, 'mdl'), model])

	switch (model) {
		case 'GATE':
			cmds.push(...buildGateCommands(sel, options))
			break
		case 'DUCK':
			cmds.push(...buildDuckerCommands(sel, options))
			break
		case 'E88':
			cmds.push(...buildE88GateCommands(sel, options))
			break
		case '9000G':
			cmds.push(...build9000GCommands(sel, options))
			break
		case 'D241G':
			cmds.push(...buildD241GCommands(sel, options))
			break
		case 'DS902':
			cmds.push(...buildDS902Commands(sel, options))
			break
		case 'DEQ':
			cmds.push(...buildDEQCommands(sel, options))
			break
		case 'DEQ2':
			cmds.push(...buildDEQ2Commands(sel, options))
			break
		case 'WAVE':
			cmds.push(...buildWAVECommands(sel, options))
			break
		case 'PSE':
			cmds.push(...buildPSECommands(sel, options))
			break
		case 'CMB':
			cmds.push(...buildCMBCommands(sel, options))
			break
		case 'RIDE':
			cmds.push(...buildRIDECommands(sel, options))
			break
		case 'WARM':
			cmds.push(...buildWARMCommands(sel, options))
			break
		case 'COMP':
			cmds.push(...buildCOMPCommands(sel, options))
			break
		case 'EXP':
			cmds.push(...buildEXPCommands(sel, options))
			break
		case 'B160':
			cmds.push(...buildB160Commands(sel, options))
			break
		case 'B560':
			cmds.push(...buildB560Commands(sel, options))
			break
		case 'D241C':
			cmds.push(...buildD241CCommands(sel, options))
			break
		case 'ECL33':
			cmds.push(...buildECL33Commands(sel, options))
			break
		case '9000C':
			cmds.push(...build9000CCommands(sel, options))
			break
		case 'SBUS':
			cmds.push(...buildSBUSCommands(sel, options))
			break
		case 'RED3':
			cmds.push(...buildRED3Commands(sel, options))
			break
		case '76LA':
			cmds.push(...build76LACommands(sel, options))
			break
		case 'LA':
			cmds.push(...buildLACommands(sel, options))
			break
		case 'F670':
			cmds.push(...buildF670Commands(sel, options))
			break
		case 'BLISS':
			cmds.push(...buildBLISSCommands(sel, options))
			break
		case 'NSTR':
			cmds.push(...buildNSTRCommands(sel, options))
			break
		case '2250':
			cmds.push(...build2250Commands(sel, options))
			break
		case 'L100':
			cmds.push(...buildL100Commands(sel, options))
			break
		case 'E88C':
			cmds.push(...buildE88CCommands(sel, options))
			break
		case 'LMT':
			cmds.push(...buildLMTCommands(sel, options))
			break
		case 'ONEC':
			cmds.push(...buildONECCommands(sel, options))
			break
	}

	return cmds
}
