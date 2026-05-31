import { combineRgb } from '@companion-module/base'
import type { WingPresetsContext } from './types.js'
import { CommonActions } from '../actions/common.js'
import { OtherActionId } from '../actions/control.js'
import { FeedbackId } from '../feedbacks.js'
import type { ModelSpec } from '../models/types.js'

/**
 * Expression that resolves to the OSC path for the current template instance,
 * e.g. "/ch/1", "/aux/3". Requires local variables `base` and `index`.
 */
const SEL_EXPR = { isExpression: true as const, value: "$(local:base) + '/' + $(local:index)" }

interface ChannelTypeSpec {
	id: string
	name: string
	base: string
	label: string
	count: number
	hasSof: boolean
	hasBoostAndCenter: boolean
}

/**
 * Builds template preset definitions for all channel strip types
 * (channels, aux buses, buses, matrices, mains, DCAs) and adds the
 * corresponding sections/groups to the context.
 *
 * Template presets are defined once and instantiated per channel via
 * the `template` group type, overriding the `index` local variable.
 * The `name` field on each templateValue entry provides the descriptive
 * label shown in the Companion preset picker.
 */
export function createChannelPresets(context: WingPresetsContext, model: ModelSpec): void {
	context.definitions['tpl-mute'] = {
		type: 'simple',
		name: 'Mute',
		style: {
			text: 'Mute $(local:index)',
			size: 'auto',
			color: combineRgb(255, 255, 255),
			bgcolor: combineRgb(0, 0, 0),
		},
		options: { stepAutoProgress: true },
		steps: [
			{
				down: [{ actionId: CommonActions.SetMute, options: { sel: SEL_EXPR, mute: -1 } }],
				up: [],
			},
		],
		feedbacks: [
			{
				feedbackId: FeedbackId.Mute,
				options: { sel: SEL_EXPR, mute: 1 },
				style: {
					color: combineRgb(255, 255, 255),
					bgcolor: combineRgb(255, 0, 0),
				},
			},
		],
		localVariables: [
			{ variableType: 'simple', variableName: 'base', startupValue: '/ch' },
			{ variableType: 'simple', variableName: 'index', startupValue: 1 },
		],
	}

	context.definitions['tpl-solo'] = {
		type: 'simple',
		name: 'Solo',
		style: {
			text: 'Solo $(local:index)',
			size: 'auto',
			color: combineRgb(255, 255, 255),
			bgcolor: combineRgb(0, 0, 0),
		},
		options: { stepAutoProgress: true },
		steps: [
			{
				down: [{ actionId: CommonActions.SetSolo, options: { sel: SEL_EXPR, solo: -1 } }],
				up: [],
			},
		],
		feedbacks: [
			{
				feedbackId: FeedbackId.Solo,
				options: { sel: SEL_EXPR, solo: '1' },
				style: {
					color: combineRgb(0, 0, 0),
					bgcolor: combineRgb(255, 255, 0),
				},
			},
		],
		localVariables: [
			{ variableType: 'simple', variableName: 'base', startupValue: '/ch' },
			{ variableType: 'simple', variableName: 'index', startupValue: 1 },
		],
	}

	context.definitions['tpl-sof'] = {
		type: 'simple',
		name: 'Sends on Fader',
		style: {
			text: 'SOF $(local:index)',
			size: 'auto',
			color: combineRgb(255, 255, 255),
			bgcolor: combineRgb(0, 0, 0),
		},
		steps: [
			{
				down: [{ actionId: OtherActionId.SetSOF, options: { toggle: true, channel: SEL_EXPR } }],
				up: [],
			},
		],
		feedbacks: [
			{
				feedbackId: FeedbackId.SofActive,
				options: { channel: SEL_EXPR },
				style: { bgcolor: combineRgb(255, 165, 0) },
			},
		],
		localVariables: [
			{ variableType: 'simple', variableName: 'base', startupValue: '/ch' },
			{ variableType: 'simple', variableName: 'index', startupValue: 1 },
		],
	}

	context.definitions['tpl-boost-center'] = {
		type: 'simple',
		name: 'Boost & Center',
		style: {
			text: 'Boost & Center $(local:index)',
			size: 'auto',
			color: combineRgb(255, 255, 255),
			bgcolor: combineRgb(0, 0, 0),
		},
		options: { stepAutoProgress: true },
		steps: [
			{
				// Step 1: boost fader by +3 dB and center panorama
				down: [
					{ actionId: CommonActions.StoreFader, options: { sel: SEL_EXPR } },
					{
						actionId: CommonActions.DeltaFader,
						options: {
							sel: SEL_EXPR,
							delta: 3,
							fadeDuration: 1000,
							fadeAlgorithm: 'quadratic',
							fadeType: 'ease-in-out',
						},
					},
					{ actionId: CommonActions.StorePanorama, options: { sel: SEL_EXPR } },
					{
						actionId: CommonActions.SetPanorama,
						options: {
							sel: SEL_EXPR,
							pan: 0,
							fadeDuration: 1000,
							fadeAlgorithm: 'quadratic',
							fadeType: 'ease-in-out',
						},
					},
				],
				up: [],
			},
			{
				// Step 2: restore fader and panorama to stored values
				down: [
					{
						actionId: CommonActions.RestoreFader,
						options: { sel: SEL_EXPR, fadeDuration: 1000, fadeAlgorithm: 'quadratic', fadeType: 'ease-in-out' },
					},
					{
						actionId: CommonActions.RestorePanorama,
						options: { sel: SEL_EXPR, fadeDuration: 1000, fadeAlgorithm: 'quadratic', fadeType: 'ease-in-out' },
					},
				],
				up: [],
			},
		],
		feedbacks: [],
		localVariables: [
			{ variableType: 'simple', variableName: 'base', startupValue: '/ch' },
			{ variableType: 'simple', variableName: 'index', startupValue: 1 },
		],
	}

	const channelTypes: ChannelTypeSpec[] = [
		{
			id: 'ch',
			name: 'Channels',
			base: '/ch',
			label: 'CH',
			count: model.channels,
			hasSof: true,
			hasBoostAndCenter: true,
		},
		{
			id: 'aux',
			name: 'Auxes',
			base: '/aux',
			label: 'AUX',
			count: model.auxes,
			hasSof: true,
			hasBoostAndCenter: true,
		},
		{
			id: 'bus',
			name: 'Buses',
			base: '/bus',
			label: 'BUS',
			count: model.busses,
			hasSof: true,
			hasBoostAndCenter: false,
		},
		{
			id: 'mtx',
			name: 'Matrices',
			base: '/mtx',
			label: 'MTX',
			count: model.matrices,
			hasSof: true,
			hasBoostAndCenter: false,
		},
		{
			id: 'main',
			name: 'Mains',
			base: '/main',
			label: 'MAIN',
			count: model.mains,
			hasSof: true,
			hasBoostAndCenter: false,
		},
		{ id: 'dca', name: 'DCAs', base: '/dca', label: 'DCA', count: model.dcas, hasSof: false, hasBoostAndCenter: false },
	]

	const active = channelTypes.filter((ct) => ct.count > 0)

	const makeGroup = (presetId: string, chType: ChannelTypeSpec, prefix: string) => ({
		id: `${chType.id}-${presetId}`,
		type: 'template' as const,
		name: chType.name,
		presetId: `tpl-${presetId}`,
		templateVariableName: 'index',
		templateValues: Array.from({ length: chType.count }, (_, i) => ({
			name: `${prefix} ${chType.label} ${i + 1}`,
			value: i + 1,
		})),
		commonVariableValues: { base: chType.base },
	})

	context.sections.push(
		{
			id: 'mute',
			name: 'Mute',
			definitions: active.map((ct) => makeGroup('mute', ct, 'Mute')),
		},
		{
			id: 'solo',
			name: 'Solo',
			definitions: active.map((ct) => makeGroup('solo', ct, 'Solo')),
		},
		{
			id: 'sof',
			name: 'Sends on Fader',
			definitions: active.filter((ct) => ct.hasSof).map((ct) => makeGroup('sof', ct, 'SOF')),
		},
		{
			id: 'boost-center',
			name: 'Boost & Center',
			definitions: active
				.filter((ct) => ct.hasBoostAndCenter)
				.map((ct) => makeGroup('boost-center', ct, 'Boost & Center')),
		},
	)
}
