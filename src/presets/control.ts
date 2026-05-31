import { combineRgb } from '@companion-module/base'
import type { WingPresetsContext } from './types.js'
import { ConfigActions } from '../actions/config.js'
import { OtherActionId } from '../actions/control.js'
import { FeedbackId } from '../feedbacks.js'

/**
 * Adds non-channel-strip presets (talkback and console lights) to the context.
 * These are static presets with no template expansion.
 */
export function createControlPresets(context: WingPresetsContext): void {
	// ─── Talkback ───

	context.definitions['talkback-a'] = {
		type: 'simple',
		name: 'Talkback A',
		style: {
			text: 'TB A',
			size: 'auto',
			color: combineRgb(255, 255, 255),
			bgcolor: combineRgb(0, 0, 0),
		},
		options: { stepAutoProgress: true },
		steps: [
			{
				down: [{ actionId: ConfigActions.TalkbackOn, options: { tb: 'A', solo: 2 } }],
				up: [],
			},
		],
		feedbacks: [
			{
				feedbackId: FeedbackId.Talkback,
				options: { tb: 'A', on: '1' },
				style: {
					color: combineRgb(255, 255, 255),
					bgcolor: combineRgb(255, 0, 0),
				},
			},
		],
	}

	context.definitions['talkback-b'] = {
		type: 'simple',
		name: 'Talkback B',
		style: {
			text: 'TB B',
			size: 'auto',
			color: combineRgb(255, 255, 255),
			bgcolor: combineRgb(0, 0, 0),
		},
		options: { stepAutoProgress: true },
		steps: [
			{
				down: [{ actionId: ConfigActions.TalkbackOn, options: { tb: 'B', solo: 2 } }],
				up: [],
			},
		],
		feedbacks: [
			{
				feedbackId: FeedbackId.Talkback,
				options: { tb: 'B', on: '1' },
				style: {
					color: combineRgb(255, 255, 255),
					bgcolor: combineRgb(255, 0, 0),
				},
			},
		],
	}

	// ─── Console lights ───

	context.definitions['lights-bright'] = {
		type: 'simple',
		name: 'Lights: Bright',
		style: {
			text: 'Lights\nBright',
			size: 'auto',
			color: combineRgb(255, 255, 255),
			bgcolor: combineRgb(0, 0, 0),
		},
		steps: [
			{
				down: [
					{
						actionId: OtherActionId.SetLightIntensities,
						options: {
							lamp: '100',
							btns: '100',
							leds: '100',
							meters: '100',
							rgbleds: '100',
							chlcds: '80',
							chlcdctr: '',
							chedit: '100',
							main: '100',
							glow: '100',
							patch: '100',
							fadeDuration: 1000,
							fadeAlgorithm: 'linear',
							snapToGrid: false,
						},
					},
				],
				up: [],
			},
		],
		feedbacks: [],
	}

	context.definitions['lights-dark'] = {
		type: 'simple',
		name: 'Lights: Dark',
		style: {
			text: 'Lights\nDark',
			size: 'auto',
			color: combineRgb(255, 255, 255),
			bgcolor: combineRgb(0, 0, 0),
		},
		steps: [
			{
				down: [
					{
						actionId: OtherActionId.SetLightIntensities,
						options: {
							lamp: '10',
							btns: '80',
							leds: '40',
							meters: '30',
							rgbleds: '10',
							chlcds: '30',
							chlcdctr: '',
							chedit: '10',
							main: '10',
							glow: '10',
							patch: '10',
							fadeDuration: 1000,
							fadeAlgorithm: 'linear',
							snapToGrid: false,
						},
					},
				],
				up: [],
			},
		],
		feedbacks: [],
	}

	// ─── Section ───

	context.sections.push({
		id: 'control',
		name: 'Control',
		definitions: [
			{
				id: 'talkback',
				type: 'simple',
				name: 'Talkback',
				presets: ['talkback-a', 'talkback-b'],
			},
			{
				id: 'lights',
				type: 'simple',
				name: 'Lights',
				presets: ['lights-bright', 'lights-dark'],
			},
		],
	})
}
