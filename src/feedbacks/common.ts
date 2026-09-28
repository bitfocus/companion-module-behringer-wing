import { combineRgb, CompanionFeedbackDefinitions } from '@companion-module/base'
import { InstanceBaseExt } from '../types.js'
import { WingConfig } from '../config.js'
import { GetDropdown, GetMuteDropdown, GetSendSourceDestinationFields } from '../choices/common.js'
import { getIdLabelPair } from '../choices/utils.js'
import { getNodeNumber } from '../actions/utils.js'
import * as ActionUtil from '../actions/utils.js'
import { StateUtil } from '../state/index.js'
import { createFeedback, FeedbackId, getFeedbackContext, stateMatchesNumberOption } from './utils.js'

export function createCommonFeedbacks(self: InstanceBaseExt<WingConfig>): CompanionFeedbackDefinitions {
	const ctx = getFeedbackContext(self)
	const { state } = ctx

	const allChannels = [
		...state.namedChoices.channels,
		...state.namedChoices.auxes,
		...state.namedChoices.busses,
		...state.namedChoices.matrices,
		...state.namedChoices.mains,
	]

	const allChannelsAndDcas = [...allChannels, ...state.namedChoices.dcas]

	const allSendSources = [
		...state.namedChoices.channels,
		...state.namedChoices.auxes,
		...state.namedChoices.busses,
		...state.namedChoices.mains,
	]

	const channelAuxBusSendDestinations = [
		...state.namedChoices.busses,
		...state.namedChoices.mains,
		...state.namedChoices.matrices,
	]
	const mainSendDestinations = [...state.namedChoices.matrices]

	return {
		[FeedbackId.Mute]: createFeedback(ctx, {
			type: 'boolean',
			name: 'Mute',
			description: "React to a change in a channel's mute state",
			options: [
				GetDropdown('Selection', 'sel', [...allChannelsAndDcas, ...state.namedChoices.mutegroups]),
				GetMuteDropdown('mute', 'State', false),
			],
			defaultStyle: { bgcolor: combineRgb(0, 255, 0), color: combineRgb(0, 0, 0) },
			paths: (event) => {
				const sel = ActionUtil.getStringWithVariables(event, 'sel')
				return [ActionUtil.getMuteCommand(sel, ActionUtil.getNodeNumberFromID(sel))]
			},
			callback: (event, [cmd]) => stateMatchesNumberOption(state, event, cmd, 'mute'),
		}),
		[FeedbackId.SendMute]: createFeedback(ctx, {
			type: 'boolean',
			name: 'Send Mute',
			description: "React to a change in a channel's send mute state",
			options: [
				...GetSendSourceDestinationFields(allSendSources, channelAuxBusSendDestinations, mainSendDestinations),
				GetMuteDropdown('mute', 'Mute', false),
			],
			defaultStyle: { bgcolor: combineRgb(0, 255, 0), color: combineRgb(0, 0, 0) },
			paths: (event) => {
				const { src, dest } = ActionUtil.GetSendSourceDestinationFieldsWithVariables(event)
				return [ActionUtil.getSendMuteCommand(src, dest)]
			},
			callback: (event, [cmd]) => {
				let val = ActionUtil.getNumberWithVariables(event, 'mute')
				// Mute states are inverted for sends
				if (val != -1) {
					val = val == 0 ? 1 : 0
				}
				const currentValue = StateUtil.getNumberFromState(cmd, state)
				return typeof currentValue === 'number' && currentValue != val
			},
		}),
		[FeedbackId.Solo]: createFeedback(ctx, {
			type: 'boolean',
			name: 'Solo',
			description: "React to a change in a channel's solo state",
			options: [
				GetDropdown('Selection', 'sel', [
					getIdLabelPair('any', 'Any'),
					getIdLabelPair('all', 'All'),
					...allChannelsAndDcas,
				]),
				GetDropdown('Solo', 'solo', [getIdLabelPair('1', 'On'), getIdLabelPair('0', 'Off')]),
			],
			defaultStyle: { bgcolor: combineRgb(255, 255, 0), color: combineRgb(0, 0, 0) },
			paths: (event) => {
				const sel = ActionUtil.getStringWithVariables(event, 'sel')
				if (sel == 'any' || sel == 'all') {
					return allChannelsAndDcas.map((s) => {
						const num = s.id.toString().split('/')[2] as unknown as number
						return ActionUtil.getSoloCommand(s.id as string, num)
					})
				}
				return [ActionUtil.getSoloCommand(sel, getNodeNumber(event, 'sel'))]
			},
			callback: (event, cmds) => {
				const sel = ActionUtil.getStringWithVariables(event, 'sel')
				const solo = ActionUtil.getNumberWithVariables(event, 'solo')
				const isSolo = (cmd: string): boolean => StateUtil.getNumberFromState(cmd, state) == solo
				if (sel == 'any') return cmds.some(isSolo)
				if (sel == 'all') return cmds.every(isSolo)
				const currentValue = StateUtil.getNumberFromState(cmds[0], state)
				return typeof currentValue === 'number' && currentValue == solo
			},
		}),
		[FeedbackId.InsertOn]: createFeedback(ctx, {
			type: 'boolean',
			name: 'Insert On',
			description: 'React to a change for an insert on a channel, aux, bus, matrix or main.',
			options: [
				GetDropdown('Insert', 'insert', [
					getIdLabelPair('pre', 'Pre-Insert'),
					getIdLabelPair('post', 'Post-Insert'),
					getIdLabelPair('both', 'Both'),
					getIdLabelPair('either', 'Either'),
				]),
				GetDropdown('Selection', 'sel', [...allChannels]),
				GetDropdown('On/Off', 'on', [getIdLabelPair('1', 'On'), getIdLabelPair('0', 'Off')]),
			],
			defaultStyle: { bgcolor: combineRgb(255, 0, 0), color: combineRgb(0, 0, 0) },
			paths: (event) => {
				const sel = ActionUtil.getStringWithVariables(event, 'sel')
				return [
					ActionUtil.getPreInsertOnCommand(sel, getNodeNumber(event, 'sel')),
					ActionUtil.getPostInsertCommand(sel, getNodeNumber(event, 'sel')),
				]
			},
			callback: (event, [preCmd, postCmd]) => {
				const insert = ActionUtil.getStringWithVariables(event, 'insert')
				const on = ActionUtil.getNumberWithVariables(event, 'on')

				const preOn = (StateUtil.getNumberFromState(preCmd, state) ?? 0) == on
				const postOn = (StateUtil.getNumberFromState(postCmd, state) ?? 0) == on

				if (insert === 'pre') return preOn
				if (insert === 'post') return postOn
				if (insert === 'both') return preOn && postOn
				if (insert === 'either') return preOn || postOn
				return false
			},
		}),
	}
}
