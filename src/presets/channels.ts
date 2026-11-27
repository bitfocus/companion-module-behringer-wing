import { combineRgb } from '@companion-module/base'
import type { WingPresetsContext } from './types.js'
import { CommonActions } from '../actions/common.js'
import { OtherActionId } from '../actions/control.js'
import { FeedbackId } from '../feedbacks/index.js'
import type { ModelSpec } from '../models/types.js'

/**
 * Button text: the console's name for the strip, or the fallback while the name is empty.
 * Companion replaces the `wing` label with the connection's label when the preset is added.
 */
function nameOrFallbackText(chType: ChannelTypeSpec, index: number, fallback: string): string {
	return `$(wing:${chType.id}${index}_name) || ${JSON.stringify(fallback)}`
}

interface ChannelTypeSpec {
	id: string
	name: string
	base: string
	label: string
	count: number
	hasSof: boolean
	hasBoostAndCenter: boolean
}

type ChannelPreset = WingPresetsContext['definitions'][string]

const textStyle = {
	textExpression: true,
	size: 'auto',
	color: combineRgb(255, 255, 255),
	bgcolor: combineRgb(0, 0, 0),
} as const

const fade = { fadeDuration: 1000, fadeAlgorithm: 'quadratic', fadeType: 'ease-in-out' }

function mutePreset(sel: string, name: string, text: string): ChannelPreset {
	return {
		type: 'simple',
		name,
		style: { ...textStyle, text },
		options: { stepAutoProgress: true },
		steps: [{ down: [{ actionId: CommonActions.SetMute, options: { sel, mute: '-1' } }], up: [] }],
		feedbacks: [
			{
				feedbackId: FeedbackId.Mute,
				options: { sel, mute: '1' },
				style: { color: combineRgb(255, 255, 255), bgcolor: combineRgb(255, 0, 0) },
			},
		],
	}
}

function soloPreset(sel: string, name: string, text: string): ChannelPreset {
	return {
		type: 'simple',
		name,
		style: { ...textStyle, text },
		options: { stepAutoProgress: true },
		steps: [{ down: [{ actionId: CommonActions.SetSolo, options: { sel, solo: '-1' } }], up: [] }],
		feedbacks: [
			{
				feedbackId: FeedbackId.Solo,
				options: { sel, solo: '1' },
				style: { color: combineRgb(0, 0, 0), bgcolor: combineRgb(255, 255, 0) },
			},
		],
	}
}

function sofPreset(sel: string, name: string, text: string): ChannelPreset {
	return {
		type: 'simple',
		name,
		style: { ...textStyle, text },
		steps: [{ down: [{ actionId: OtherActionId.SetSOF, options: { toggle: true, channel: sel } }], up: [] }],
		feedbacks: [
			{
				feedbackId: FeedbackId.SofActive,
				options: { channel: sel },
				style: { bgcolor: combineRgb(255, 165, 0) },
			},
		],
	}
}

function boostAndCenterPreset(sel: string, name: string, text: string): ChannelPreset {
	return {
		type: 'simple',
		name,
		style: { ...textStyle, text },
		options: { stepAutoProgress: true },
		steps: [
			{
				// Boost by 3 dB and center, storing the previous values for step 2
				down: [
					{ actionId: CommonActions.StoreFader, options: { sel } },
					{ actionId: CommonActions.DeltaFader, options: { sel, delta: 3, ...fade } },
					{ actionId: CommonActions.StorePanorama, options: { sel } },
					{ actionId: CommonActions.SetPanorama, options: { sel, pan: 0, ...fade } },
				],
				up: [],
			},
			{
				down: [
					{ actionId: CommonActions.RestoreFader, options: { sel, ...fade } },
					{ actionId: CommonActions.RestorePanorama, options: { sel, ...fade } },
				],
				up: [],
			},
		],
		feedbacks: [],
	}
}

const presetKinds = [
	{ id: 'mute', name: 'Mute', label: 'Mute', create: mutePreset, applies: () => true },
	{ id: 'solo', name: 'Solo', label: 'Solo', create: soloPreset, applies: () => true },
	{ id: 'sof', name: 'Sends on Fader', label: 'SOF', create: sofPreset, applies: (ct: ChannelTypeSpec) => ct.hasSof },
	{
		id: 'boost-center',
		name: 'Boost & Center',
		label: 'Boost & Center',
		create: boostAndCenterPreset,
		applies: (ct: ChannelTypeSpec) => ct.hasBoostAndCenter,
	},
]

/**
 * Adds one preset per strip and preset kind, grouped by strip type.
 */
export function createChannelPresets(context: WingPresetsContext, model: ModelSpec): void {
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
		{ id: 'aux', name: 'Auxes', base: '/aux', label: 'AUX', count: model.auxes, hasSof: true, hasBoostAndCenter: true },
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

	for (const kind of presetKinds) {
		context.sections.push({
			id: kind.id,
			name: kind.name,
			definitions: active.filter(kind.applies).map((ct) => {
				const presets: string[] = []
				for (let index = 1; index <= ct.count; index++) {
					const presetId = `${ct.id}${index}-${kind.id}`
					const name = `${kind.label} ${ct.label} ${index}`
					context.definitions[presetId] = kind.create(`${ct.base}/${index}`, name, nameOrFallbackText(ct, index, name))
					presets.push(presetId)
				}
				return { id: `${ct.id}-${kind.id}`, type: 'simple' as const, name: ct.name, presets }
			}),
		})
	}
}
