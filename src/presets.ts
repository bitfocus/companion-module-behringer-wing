import { combineRgb, CompanionPresetDefinitions, CompanionButtonPresetDefinition } from '@companion-module/base'
import { InstanceBaseExt } from './types.js'
import { WingConfig } from './config.js'
import { CommonActions } from './actions/common.js'
import { FeedbackId } from './feedbacks.js'

export function GetPresets(_instance: InstanceBaseExt<WingConfig>): CompanionPresetDefinitions {
	const presets: {
		[id: string]: CompanionButtonPresetDefinition | undefined
	} = {}

	presets['mute-button'] = {
		name: 'Mute Button',
		category: 'Channel',
		type: 'button',
		style: {
			text: 'Mute\\n$(wing:ch1_name)',
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
						options: { sel: '/ch/1', mute: 2 },
					},
				],
				up: [],
			},
		],
		feedbacks: [
			{
				feedbackId: FeedbackId.Mute,
				options: { sel: '/ch/1', mute: 1 },
				style: {
					color: combineRgb(255, 255, 255),
					bgcolor: combineRgb(255, 0, 0),
				},
			},
		],
	}

	presets['solo-button'] = {
		name: 'Solo Button',
		category: 'Channel',
		type: 'button',
		style: {
			text: 'Solo CH1',
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
						actionId: CommonActions.DeltaFader,
						options: {
							sel: '/ch/1',
							delta: 3,
							fadeDuration: 1000,
							fadeAlgorithm: 'quadratic',
							fadeType: 'ease-in-out',
						},
					},
					{
						actionId: CommonActions.StorePanorama,
						options: { sel: '/ch/1' },
					},
					{
						actionId: CommonActions.SetPanorama,
						options: { sel: '/ch/1', pan: 0, fadeDuration: 1000, fadeAlgorithm: 'quadratic', fadeType: 'ease-in-out' },
					},
				],
				up: [],
			},
			{
				down: [
					{
						actionId: CommonActions.UndoDeltaFader,
						options: { sel: '/ch/1', fadeDuration: 1000, fadeAlgorithm: 'quadratic', fadeType: 'ease-in-out' },
					},
					{
						actionId: CommonActions.RestorePanorama,
						options: { sel: '/ch/1', fadeDuration: 1000, fadeAlgorithm: 'quadratic', fadeType: 'ease-in-out' },
					},
				],
				up: [],
			},
		],
		feedbacks: [],
	}

	return presets
}
