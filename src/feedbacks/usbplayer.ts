import { combineRgb, CompanionFeedbackDefinitions } from '@companion-module/base'
import { InstanceBaseExt } from '../types.js'
import { WingConfig } from '../config.js'
import { GetDropdown } from '../choices/common.js'
import { getIdLabelPair } from '../choices/utils.js'
import { UsbPlayerCommands } from '../commands/usbplayer.js'
import * as ActionUtil from '../actions/utils.js'
import { StateUtil } from '../state/index.js'
import { createFeedback, FeedbackId, getFeedbackContext } from './utils.js'

export function createUsbPlayerFeedbacks(self: InstanceBaseExt<WingConfig>): CompanionFeedbackDefinitions {
	const ctx = getFeedbackContext(self)
	const { state } = ctx

	return {
		[FeedbackId.RecorderState]: createFeedback(ctx, {
			type: 'boolean',
			name: 'USB Recorder State',
			description: 'React to the current state of the USB Recorder',
			options: [
				GetDropdown('State', 'state', [
					getIdLabelPair('REC', 'Recording'),
					getIdLabelPair('PAUSE', 'Paused'),
					getIdLabelPair('STOP', 'Stopped'),
				]),
			],
			defaultStyle: { bgcolor: combineRgb(255, 0, 0), color: combineRgb(255, 255, 255) },
			paths: () => [UsbPlayerCommands.RecorderActiveState()],
			callback: (event, [cmd]) =>
				StateUtil.getStringFromState(cmd, state) === ActionUtil.getStringWithVariables(event, 'state'),
		}),
		[FeedbackId.PlayerState]: createFeedback(ctx, {
			type: 'boolean',
			name: 'USB Player State',
			description: 'React to the current state of the USB Player',
			options: [
				GetDropdown('State', 'state', [
					getIdLabelPair('PLAY', 'Playing'),
					getIdLabelPair('PAUSE', 'Paused'),
					getIdLabelPair('STOP', 'Stopped'),
				]),
			],
			defaultStyle: { bgcolor: combineRgb(0, 255, 0), color: combineRgb(0, 0, 0) },
			paths: () => [UsbPlayerCommands.PlayerActiveState()],
			callback: (event, [cmd]) =>
				StateUtil.getStringFromState(cmd, state) === ActionUtil.getStringWithVariables(event, 'state'),
		}),
	}
}
