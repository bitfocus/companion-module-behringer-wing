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
import { GetDropdown, GetMuteDropdown } from './choices/common.js'
import { getTalkbackOptions } from './choices/config.js'
import { ConfigurationCommands } from './commands/config.js'
import { getNodeNumber } from './actions/utils.js'
import { StateUtil } from './state/index.js'
import { UsbPlayerCommands } from './commands/usbplayer.js'
import * as ActionUtil from './actions/utils.js'
import { getIdLabelPair } from './choices/utils.js'
import { StatusCommands } from './commands/status.js'
import { getGpios } from './choices/control.js'
import { ControlCommands } from './commands/control.js'

type CompanionFeedbackWithCallback = SetRequired<
	CompanionBooleanFeedbackDefinition | CompanionAdvancedFeedbackDefinition,
	'callback' | 'subscribe' | 'unsubscribe'
>

export enum FeedbackId {
	Mute = 'mute',
	SendMute = 'send-mute',
	AesStatus = 'aes-status',
	RecorderState = 'recorder-state',
	GpioState = 'gpio-state',
	Solo = 'solo',
	Talkback = 'talkback',
	TalkbackAssign = 'talkback-assign',
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
	const allChannels = [
		...state.namedChoices.channels,
		...state.namedChoices.auxes,
		...state.namedChoices.busses,
		...state.namedChoices.matrices,
		...state.namedChoices.mains,
	]

	const feedbacks: { [id in FeedbackId]: CompanionFeedbackWithCallback | undefined } = {
		[FeedbackId.Mute]: {
			type: 'boolean',
			name: 'Mute',
			description: "React to a change in a channel's mute state",
			options: [
				GetDropdown('Selection', 'sel', [...allChannels, ...state.namedChoices.dcas, ...state.namedChoices.mutegroups]),
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
				GetDropdown('From', 'src', allChannels),
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
				{
					type: 'colorpicker',
					id: 'okcolor',
					label: 'Ok',
					tooltip: 'Color of the button when an AES connection is OK',
					default: combineRgb(0, 255, 0),
				},
				{
					type: 'colorpicker',
					id: 'errcolor',
					label: 'Error',
					tooltip: 'Color of the button when an AES connection is not OK',
					default: combineRgb(255, 0, 0),
				},
				{
					type: 'colorpicker',
					id: 'nccolor',
					label: 'Not Connected',
					tooltip: 'Color of the button when the status of an AES connection is unknown/not connected.',
					default: combineRgb(0, 0, 0),
				},
			],
			callback: (event: CompanionFeedbackInfo): CompanionAdvancedFeedbackResult => {
				const cmd = StatusCommands.AesStatus(event.options.aes as string)
				const val = StateUtil.getStringFromState(cmd, state)
				if (val == 'OK') {
					return event.options.okcolor as CompanionAdvancedFeedbackResult
				} else if (val == 'ERR') {
					return event.options.errcolor as CompanionAdvancedFeedbackResult
				} else {
					return event.options.nccolor as CompanionAdvancedFeedbackResult
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
		[FeedbackId.GpioState]: {
			type: 'boolean',
			name: 'GPIO State',
			description: "React to a change in a gpio's state",
			options: [
				GetDropdown('Selection', 'sel', getGpios(4)),
				GetDropdown('State', 'state', [getIdLabelPair('1', 'On'), getIdLabelPair('0', 'Off')]),
			],
			defaultStyle: {
				bgcolor: combineRgb(0, 255, 0),
				color: combineRgb(0, 0, 0),
			},
			callback: (event: CompanionFeedbackInfo): boolean => {
				const sel = event.options.sel as number
				const cmd = ControlCommands.GpioReadState(sel)
				const currentValue = StateUtil.getNumberFromState(cmd, state)
				return typeof currentValue === 'number' && currentValue == event.options.state
			},
			subscribe: (event): void => {
				const sel = event.options.sel as number
				const cmd = ControlCommands.GpioReadState(sel)
				subscribeFeedback(ensureLoaded, subs, cmd, event)
			},
			unsubscribe: (event: CompanionFeedbackInfo): void => {
				const sel = event.options.sel as number
				const cmd = ControlCommands.GpioReadState(sel)
				unsubscribeFeedback(subs, cmd, event)
			},
		},
		[FeedbackId.Solo]: {
			type: 'boolean',
			name: 'Solo',
			description: "React to a change in a channel's solo state",
			options: [
				GetDropdown('Selection', 'sel', [...allChannels, ...state.namedChoices.dcas]),
				GetDropdown('Solo', 'solo', [getIdLabelPair('1', 'On'), getIdLabelPair('0', 'Off')]),
			],
			defaultStyle: {
				bgcolor: combineRgb(255, 255, 0),
				color: combineRgb(0, 0, 0),
			},
			callback: (event: CompanionFeedbackInfo): boolean => {
				const sel = event.options.sel as string
				const cmd = ActionUtil.getSoloCommand(sel, getNodeNumber(event, 'sel'))
				const currentValue = StateUtil.getNumberFromState(cmd, state)
				return typeof currentValue === 'number' && currentValue == event.options.solo
			},
			subscribe: (event): void => {
				const sel = event.options.sel as string
				const cmd = ActionUtil.getSoloCommand(sel, getNodeNumber(event, 'sel'))
				subscribeFeedback(ensureLoaded, subs, cmd, event)
			},
			unsubscribe: (event: CompanionFeedbackInfo): void => {
				const sel = event.options.sel as string
				const cmd = ActionUtil.getSoloCommand(sel, getNodeNumber(event, 'sel'))
				unsubscribeFeedback(subs, cmd, event)
			},
		},
		[FeedbackId.Talkback]: {
			type: 'boolean',
			name: 'Talkback',
			description: 'React to the status of a talkback channel.',
			options: [
				GetDropdown('Talkback', 'tb', getTalkbackOptions()),
				GetDropdown('On/Off', 'on', [getIdLabelPair('1', 'On'), getIdLabelPair('0', 'Off')]),
			],
			defaultStyle: {
				bgcolor: combineRgb(255, 0, 0),
				color: combineRgb(0, 0, 0),
			},
			callback: (event: CompanionFeedbackInfo): boolean => {
				const cmd = ConfigurationCommands.TalkbackOn(event.options.tb as string)
				const currentValue = StateUtil.getNumberFromState(cmd, state)
				return typeof currentValue === 'number' && currentValue == event.options.on
			},
			subscribe: (event): void => {
				const cmd = ConfigurationCommands.TalkbackOn(event.options.tb as string)
				subscribeFeedback(ensureLoaded, subs, cmd, event)
			},
			unsubscribe: (event: CompanionFeedbackInfo): void => {
				const cmd = ConfigurationCommands.TalkbackOn(event.options.tb as string)
				unsubscribeFeedback(subs, cmd, event)
			},
		},
		[FeedbackId.TalkbackAssign]: {
			type: 'boolean',
			name: 'Talkback Assign',
			description: 'React to the assignment of a talkback channel to a bus matrix or main',
			options: [
				GetDropdown('Talkback', 'tb', getTalkbackOptions()),
				GetDropdown('Destination', 'dest', [
					...state.namedChoices.busses,
					...state.namedChoices.matrices,
					...state.namedChoices.mains,
				]),
				GetDropdown('Assign', 'assign', [getIdLabelPair('1', 'Assigned'), getIdLabelPair('0', 'Not Assigned')]),
			],
			defaultStyle: {
				bgcolor: combineRgb(0, 255, 0),
				color: combineRgb(0, 0, 0),
			},
			callback: (event: CompanionFeedbackInfo): boolean => {
				const talkback = event.options.tb as string
				const destination = event.options.dest as string
				const cmd = ActionUtil.getTalkbackAssignCommand(talkback, destination)
				const currentValue = StateUtil.getNumberFromState(cmd, state)
				return typeof currentValue === 'number' && currentValue == event.options.assign
			},
			subscribe: (event): void => {
				const talkback = event.options.tb as string
				const destination = event.options.dest as string
				const cmd = ActionUtil.getTalkbackAssignCommand(talkback, destination)
				subscribeFeedback(ensureLoaded, subs, cmd, event)
			},
			unsubscribe: (event: CompanionFeedbackInfo): void => {
				const talkback = event.options.tb as string
				const destination = event.options.dest as string
				const cmd = ActionUtil.getTalkbackAssignCommand(talkback, destination)
				unsubscribeFeedback(subs, cmd, event)
			},
		},
	}

	return feedbacks
}
