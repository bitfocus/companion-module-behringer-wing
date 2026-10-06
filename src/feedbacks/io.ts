import { combineRgb, CompanionFeedbackDefinitions } from '@companion-module/base'
import { InstanceBaseExt } from '../types.js'
import { WingConfig } from '../config.js'
import { GetDropdown } from '../choices/common.js'
import { getIdLabelPair } from '../choices/utils.js'
import { IoCommands } from '../commands/io.js'
import { StatusCommands } from '../commands/status.js'
import * as ActionUtil from '../actions/utils.js'
import { StateUtil } from '../state/index.js'
import { createFeedback, FeedbackId, getFeedbackContext } from './utils.js'

export function createIoFeedbacks(self: InstanceBaseExt<WingConfig>): CompanionFeedbackDefinitions {
	const ctx = getFeedbackContext(self)
	const { state } = ctx

	return {
		[FeedbackId.MainAltSwitch]: createFeedback(ctx, {
			type: 'boolean',
			name: 'Main/Alt Input Source',
			description: 'React to the selected input source group (Main or Alt).',
			options: [GetDropdown('Selected', 'sel', [getIdLabelPair('1', 'Main'), getIdLabelPair('0', 'Alt')])],
			defaultStyle: { bgcolor: combineRgb(0, 255, 0), color: combineRgb(0, 0, 0) },
			paths: () => [IoCommands.MainAltSwitch()],
			callback: (event, [cmd]) => {
				const sel = ActionUtil.getStringWithVariables(event, 'sel')
				const currentValue = StateUtil.getNumberFromState(cmd, state)
				// Wing reports 0 for Main, 1 for Alt; invert to match UI labels
				return typeof currentValue === 'number' && `${Number(!currentValue)}` === sel
			},
		}),
		[FeedbackId.AesStatus]: createFeedback(ctx, {
			type: 'boolean',
			name: 'AES Status',
			description: 'Status of an AES Connection',
			options: [
				GetDropdown('Interface', 'aes', [
					getIdLabelPair('A', 'AES A'),
					getIdLabelPair('B', 'AES B'),
					getIdLabelPair('C', 'AES C'),
				]),
				GetDropdown('Status', 'status', [
					getIdLabelPair('OK', 'OK'),
					getIdLabelPair('ERR', 'Error'),
					getIdLabelPair('UPD', 'Updating'),
					getIdLabelPair('-', 'Not Connected'),
				]),
			],
			defaultStyle: { bgcolor: combineRgb(0, 255, 0), color: combineRgb(0, 0, 0) },
			paths: (event) => [StatusCommands.AesStatus(ActionUtil.getStringWithVariables(event, 'aes'))],
			callback: (event, [cmd]) => {
				const status = ActionUtil.getStringWithVariables(event, 'status')
				return StateUtil.getStringFromState(cmd, state) === status
			},
		}),
	}
}
