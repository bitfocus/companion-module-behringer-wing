import { combineRgb, CompanionPresetDefinitions, CompanionButtonPresetDefinition } from '@companion-module/base'
import { InstanceBaseExt } from './types.js'
import { WingConfig } from './config.js'
import { CommonActions } from './actions/common.js'
import { FeedbackId } from './feedbacks.js'
import { ConfigActions } from './actions/config.js'

export function GetPresets(_instance: InstanceBaseExt<WingConfig>): CompanionPresetDefinitions {
	const model = _instance.model

	const presets: {
		[id: string]: CompanionButtonPresetDefinition | undefined
	} = {}

	for (let i = 1; i <= model.channels; i++) {
		presets[`ch${i}-mute-button`] = getMutePreset('ch', i)
		presets[`ch${i}-boost-and-center-button`] = getBoostAndCenterPreset('ch', i)
	}

	for (let i = 1; i <= model.auxes; i++) {
		presets[`aux${i}-mute-button`] = getMutePreset('aux', i)
		presets[`aux${i}-boost-and-center-button`] = getBoostAndCenterPreset('aux', i)
	}

	for (let i = 1; i <= model.busses; i++) {
		presets[`bus${i}-mute-button`] = getMutePreset('bus', i)
	}

	for (let i = 1; i <= model.matrices; i++) {
		presets[`mtx${i}-mute-button`] = getMutePreset('mtx', i)
	}

	for (let i = 1; i <= model.mains; i++) {
		presets[`main${i}-mute-button`] = getMutePreset('main', i)
	}

	presets[`talkback-a-button`] = getTalkbackPreset('A')
	presets[`talkback-b-button`] = getTalkbackPreset('B')

	return presets
}

function getMutePreset(base: string, val: number): CompanionButtonPresetDefinition {
	const path = `/${base}/${val}`
	return {
		name: 'Mute Button',
		category: 'Mute',
		type: 'button',
		style: {
			text: `Mute\\n$(wing:${base}${val}_name)`,
			size: 'auto',
			color: combineRgb(255, 255, 255),
			bgcolor: combineRgb(0, 0, 0),
		},
		options: {
			stepAutoProgress: true,
		},
		steps: [
			{
				down: [
					{
						actionId: CommonActions.SetMute,
						options: { sel: path, mute: 2 },
					},
				],
				up: [],
			},
		],
		feedbacks: [
			{
				feedbackId: FeedbackId.Mute,
				options: { sel: path, mute: 1 },
				style: {
					color: combineRgb(255, 255, 255),
					bgcolor: combineRgb(255, 0, 0),
				},
			},
		],
	}
}

function getBoostAndCenterPreset(base: string, val: number): CompanionButtonPresetDefinition {
	const path = `/${base}/${val}`
	return {
		name: 'Boost and Center Button',
		category: 'Boost',
		type: 'button',
		style: {
			text: `Boost & Center\\n$(wing:${base}${val}_name)`,
			size: 'auto',
			color: combineRgb(255, 255, 255),
			bgcolor: combineRgb(0, 0, 0),
		},
		options: {
			stepAutoProgress: true,
		},
		steps: [
			{
				down: [
					{
						actionId: CommonActions.StoreFader,
						options: { sel: path },
					},
					{
						actionId: CommonActions.DeltaFader,
						options: {
							sel: path,
							delta: 3,
							fadeDuration: 1000,
							fadeAlgorithm: 'quadratic',
							fadeType: 'ease-in-out',
						},
					},
					{
						actionId: CommonActions.StorePanorama,
						options: { sel: path },
					},
					{
						actionId: CommonActions.SetPanorama,
						options: { sel: path, pan: 0, fadeDuration: 1000, fadeAlgorithm: 'quadratic', fadeType: 'ease-in-out' },
					},
				],
				up: [],
			},
			{
				down: [
					{
						actionId: CommonActions.RestoreFader,
						options: { sel: path, fadeDuration: 1000, fadeAlgorithm: 'quadratic', fadeType: 'ease-in-out' },
					},
					{
						actionId: CommonActions.RestorePanorama,
						options: { sel: path, fadeDuration: 1000, fadeAlgorithm: 'quadratic', fadeType: 'ease-in-out' },
					},
				],
				up: [],
			},
		],
		feedbacks: [],
	}
}

function getTalkbackPreset(talkback: 'A' | 'B'): CompanionButtonPresetDefinition {
	return {
		name: `Talkback ${talkback}`,
		category: 'Talkback',
		type: 'button',
		style: {
			text: `TB ${talkback}`,
			size: 'auto',
			color: combineRgb(255, 255, 255),
			bgcolor: combineRgb(0, 0, 0),
		},
		options: {
			stepAutoProgress: true,
		},
		steps: [
			{
				down: [
					{
						actionId: ConfigActions.TalkbackOn,
						options: {
							tb: `${talkback}`,
							solo: 2,
						},
					},
				],
				up: [],
			},
		],
		feedbacks: [
			{
				feedbackId: FeedbackId.TalkbackOn,
				options: { tb: `${talkback}`, on: '1' },
				style: {
					color: combineRgb(255, 255, 255),
					bgcolor: combineRgb(255, 0, 0),
				},
			},
		],
	}
}
