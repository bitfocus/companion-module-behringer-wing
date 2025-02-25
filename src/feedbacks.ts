import { WingState, WingSubscriptions } from './state/index.js'
import { InstanceBaseExt } from './types.js'
import { WingConfig } from './config.js'
import { SetRequired } from 'type-fest' // eslint-disable-line n/no-missing-import
import {
	combineRgb,
	CompanionAdvancedFeedbackDefinition,
	CompanionAdvancedFeedbackResult,
	CompanionBooleanFeedbackDefinition,
	CompanionFeedbackDefinitions,
	CompanionFeedbackInfo,
} from '@companion-module/base'
// import { compareNumber, GetDropdownFeedback, GetNumberComparator, GetPanoramaSliderFeedback } from './choices/common.js'
import {
	GetDropdown,
	GetMuteDropdown,
	getTimeFormatChoices,
	getTriStateColor,
	getTriStateTextColor,
} from './choices/common.js'
import { getNodeNumber } from './actions/utils.js'
import { StateUtil } from './state/index.js'
import { UsbPlayerCommands } from './commands/usbplayer.js'
import * as ActionUtil from './actions/utils.js'
import { getIdLabelPair } from './choices/utils.js'
import { StatusCommands } from './commands/status.js'

type CompanionFeedbackWithCallback = SetRequired<
	CompanionBooleanFeedbackDefinition | CompanionAdvancedFeedbackDefinition,
	'callback' | 'subscribe' | 'unsubscribe'
>

export enum FeedbackId {
	Mute = 'mute',
	SendMute = 'send-mute',
	AesStatus = 'aes-status',
	RecorderTime = 'recorder-time',
	RecorderState = 'recorder-state',
	PlayerTime = 'player-time',
}

function subscribeFeedback(
	ensureLoaded: (path: string) => void,
	subs: WingSubscriptions,
	path: string,
	event: CompanionFeedbackInfo,
): void {
	subs.subscribe(path, event.id, event.feedbackId as FeedbackId)
	ensureLoaded(path)
}
function unsubscribeFeedback(subs: WingSubscriptions, path: string, event: CompanionFeedbackInfo): void {
	subs.unsubscribe(path, event.id)
}

export function GetFeedbacksList(
	_self: InstanceBaseExt<WingConfig>,
	state: WingState,
	subs: WingSubscriptions,
	ensureLoaded: (path: string) => void,
): CompanionFeedbackDefinitions {
	const feedbacks: { [id in FeedbackId]: CompanionFeedbackWithCallback | undefined } = {
		[FeedbackId.Mute]: {
			type: 'boolean',
			name: 'Mute',
			description: "React to a change in a channel's mute state",
			options: [
				GetDropdown('Selection', 'sel', [
					...state.namedChoices.channels,
					...state.namedChoices.auxes,
					...state.namedChoices.busses,
					...state.namedChoices.matrices,
					...state.namedChoices.mains,
					...state.namedChoices.dcas,
					...state.namedChoices.mutegroups,
				]),
				GetMuteDropdown('mute', 'State', false),
			],
			defaultStyle: {
				bgcolor: combineRgb(0, 255, 0),
				color: combineRgb(0, 0, 0),
			},
			callback: (event: CompanionFeedbackInfo): boolean => {
				const sel = event.options.sel as string
				const cmd = ActionUtil.getMuteCommand(sel, getNodeNumber(event, 'sel'))
				const currentValue = StateUtil.getNumberFromState(cmd, state)
				return typeof currentValue === 'number' && currentValue == event.options.mute
			},
			subscribe: (event): void => {
				const sel = event.options.sel as string
				const cmd = ActionUtil.getMuteCommand(sel, getNodeNumber(event, 'sel'))
				subscribeFeedback(ensureLoaded, subs, cmd, event)
			},
			unsubscribe: (event: CompanionFeedbackInfo): void => {
				const sel = event.options.sel as string
				const cmd = ActionUtil.getMuteCommand(sel, getNodeNumber(event, 'sel'))
				unsubscribeFeedback(subs, cmd, event)
			},
		},
		[FeedbackId.SendMute]: {
			type: 'boolean',
			name: 'Send Mute',
			description: "React to a change in a channel's send mute state",
			options: [
				GetDropdown('From', 'src', [
					...state.namedChoices.channels,
					...state.namedChoices.auxes,
					...state.namedChoices.busses,
					...state.namedChoices.matrices,
					...state.namedChoices.mains,
				]),
				GetDropdown('To Bus', 'dest', state.namedChoices.busses),
				GetMuteDropdown('mute', 'State', false),
			],
			defaultStyle: {
				bgcolor: combineRgb(0, 255, 0),
				color: combineRgb(0, 0, 0),
			},
			callback: (event: CompanionFeedbackInfo): boolean => {
				const sel = event.options.src as string
				const cmd = ActionUtil.getSendMuteCommand(sel, getNodeNumber(event, 'src'), getNodeNumber(event, 'dest'))
				const currentValue = StateUtil.getNumberFromState(cmd, state)
				return typeof currentValue === 'number' && currentValue != event.options.mute
			},
			subscribe: (event): void => {
				const sel = event.options.src as string
				const cmd = ActionUtil.getSendMuteCommand(sel, getNodeNumber(event, 'src'), getNodeNumber(event, 'dest'))
				subscribeFeedback(ensureLoaded, subs, cmd, event)
			},
			unsubscribe: (event: CompanionFeedbackInfo): void => {
				const sel = event.options.src as string
				const cmd = ActionUtil.getSendMuteCommand(sel, getNodeNumber(event, 'src'), getNodeNumber(event, 'dest'))
				unsubscribeFeedback(subs, cmd, event)
			},
		},
		[FeedbackId.AesStatus]: {
			type: 'advanced',
			name: 'AES Status',
			description: 'Status of an AES Connection',
			options: [
				GetDropdown('Interface', 'aes', [
					getIdLabelPair('A', 'AES A'),
					getIdLabelPair('B', 'AES B'),
					getIdLabelPair('C', 'AES C'),
				]),
			],
			callback: (event: CompanionFeedbackInfo): CompanionAdvancedFeedbackResult => {
				const cmd = StatusCommands.AesStatus(event.options.aes as string)
				const val = StateUtil.getStringFromState(cmd, state)
				return {
					bgcolor: getTriStateColor(val),
					color: getTriStateTextColor(val),
				}
			},
			subscribe: (event): void => {
				const cmd = StatusCommands.AesStatus(event.options.aes as string)
				subscribeFeedback(ensureLoaded, subs, cmd, event)
			},
			unsubscribe: (event: CompanionFeedbackInfo): void => {
				const cmd = StatusCommands.AesStatus(event.options.aes as string)
				unsubscribeFeedback(subs, cmd, event)
			},
		},
		[FeedbackId.RecorderTime]: {
			type: 'advanced',
			name: 'USB Recorder Time',
			description: 'Current Time of the Recording',
			options: [GetDropdown('Format', 'format', getTimeFormatChoices())],
			callback: (): CompanionAdvancedFeedbackResult => {
				const cmd = UsbPlayerCommands.RecorderTime()
				const time = StateUtil.getNumberFromState(cmd, state) ?? 'N/A'
				if (time) {
					if (isNaN(Number(time))) {
						return {
							text: time as string,
						}
					} else return {}
				} else return {}
			},
			subscribe: (event): void => {
				const cmd = UsbPlayerCommands.RecorderTime()
				subs.subscribePoll(cmd, event.id, event.feedbackId as FeedbackId)
				subscribeFeedback(ensureLoaded, subs, cmd, event)
			},
			unsubscribe: (event: CompanionFeedbackInfo): void => {
				const cmd = UsbPlayerCommands.RecorderTime()
				subs.unsubscribePoll(cmd, event.feedbackId as FeedbackId)
				unsubscribeFeedback(subs, cmd, event)
			},
		},
		[FeedbackId.RecorderState]: {
			type: 'advanced',
			name: 'USB Recorder State',
			description: 'Current State of the USB Recorder',
			options: [
				{
					type: 'checkbox',
					label: 'Display State Text',
					id: 'stateText',
					default: false,
				},
			],
			callback: (event): CompanionAdvancedFeedbackResult => {
				const cmd = UsbPlayerCommands.RecorderActiveState()
				const recState = StateUtil.getStringFromState(cmd, state)
				let textColor = combineRgb(255, 255, 255)
				let buttonColor = combineRgb(0, 255, 0)
				if (recState == 'REC') {
					buttonColor = combineRgb(255, 0, 0)
				} else if (recState == 'PAUSE') {
					buttonColor = combineRgb(128, 128, 128)
				} else if (recState == 'STOP') {
					buttonColor = combineRgb(0, 0, 0)
				} else {
					buttonColor = combineRgb(255, 255, 0)
					textColor = combineRgb(0, 0, 0)
				}
				const result = {
					color: textColor,
					bgcolor: buttonColor,
				}
				if (event.options.stateText) {
					return {
						text: `${recState ?? 'N/A'}`,
						...result,
					}
				} else {
					return result
				}
			},
			subscribe: (event): void => {
				const cmd = UsbPlayerCommands.RecorderActiveState()
				subscribeFeedback(ensureLoaded, subs, cmd, event)
			},
			unsubscribe: (event: CompanionFeedbackInfo): void => {
				const cmd = UsbPlayerCommands.RecorderActiveState()
				unsubscribeFeedback(subs, cmd, event)
			},
		},
		[FeedbackId.PlayerTime]: {
			type: 'advanced',
			name: 'USB Player Time',
			description: 'Current Time of the USB Player',
			options: [GetDropdown('Format', 'format', getTimeFormatChoices())],
			callback: (): CompanionAdvancedFeedbackResult => {
				const cmd = UsbPlayerCommands.PlayerTotalTime()
				return {
					text: `${StateUtil.getNumberFromState(cmd, state) ?? 'N/A'}`,
				}
			},
			subscribe: (event): void => {
				const cmd = UsbPlayerCommands.PlayerTotalTime()
				subs.subscribePoll(cmd, event.id, event.feedbackId as FeedbackId)
				subscribeFeedback(ensureLoaded, subs, cmd, event)
			},
			unsubscribe: (event: CompanionFeedbackInfo): void => {
				const cmd = UsbPlayerCommands.PlayerTotalTime()
				subs.unsubscribePoll(cmd, event.feedbackId as FeedbackId)
				unsubscribeFeedback(subs, cmd, event)
			},
		},
	}

	return feedbacks
}
