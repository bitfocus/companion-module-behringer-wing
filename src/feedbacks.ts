import { WingSubscriptions } from './state/index.js'
import { InstanceBaseExt } from './types.js'
import { WingConfig } from './config.js'
import { SetRequired } from 'type-fest' // eslint-disable-line n/no-missing-import
import {
	combineRgb,
	CompanionBooleanFeedbackDefinition,
	CompanionFeedbackDefinitions,
	CompanionFeedbackInfo,
} from '@companion-module/base'
import {
	GetDropdown,
	GetDropdownWithVariables,
	GetMuteDropdownWithVariables,
	GetSendSourceDestinationFieldsWithVariables,
} from './choices/common.js'
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
import { CardsCommands } from './commands/cards.js'
import { IoCommands } from './commands/io.js'

import { getCardsChoices, getCardsStatusChoices, getCardsActionChoices } from './choices/cards.js'

type CompanionFeedbackWithCallback = SetRequired<
	CompanionBooleanFeedbackDefinition,
	'callback' | 'subscribe' | 'unsubscribe'
>

export enum FeedbackId {
	Mute = 'mute',
	SendMute = 'send-mute',
	AesStatus = 'aes-status',
	RecorderState = 'recorder-state',
	PlayerState = 'player-state',
	WLiveSDState = 'wlive-sd-state',
	WLivePlaybackState = 'wlive-playback-state',
	GpioState = 'gpio-state',
	Solo = 'solo',
	SoloDim = 'solo-dim',
	SoloMono = 'solo-mono',
	SoloLRSwap = 'solo-lr-swap',
	Talkback = 'talkback',
	TalkbackAssign = 'talkback-assign',
	InsertOn = 'insert-on',
	MainAltSwitch = 'main-alt-switch',
	ActiveScene = 'active-scene',
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

export function GetFeedbacksList(_self: InstanceBaseExt<WingConfig>): CompanionFeedbackDefinitions {
	const state = _self.stateHandler?.state
	if (!state) throw new Error('State handler or state is not available')
	const subs = _self.feedbackHandler?.subscriptions
	if (!subs) throw new Error('Feedback handler or subscriptions are not available')
	const ensureLoaded = _self.stateHandler?.ensureLoaded.bind(_self.stateHandler)
	if (!ensureLoaded) throw new Error('State handler or ensureLoaded is not available')
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

	const feedbacks: { [id in FeedbackId]: CompanionFeedbackWithCallback | undefined } = {
		[FeedbackId.MainAltSwitch]: {
			type: 'boolean',
			name: 'Main/Alt Input Source',
			description: 'React to the selected input source group (Main or Alt).',
			options: [
				...GetDropdownWithVariables('Selected', 'sel', [getIdLabelPair('1', 'Main'), getIdLabelPair('0', 'Alt')]),
			],
			defaultStyle: { bgcolor: combineRgb(0, 255, 0), color: combineRgb(0, 0, 0) },
			callback: (event: CompanionFeedbackInfo): boolean => {
				const cmd = IoCommands.MainAltSwitch()
				const sel = ActionUtil.getStringWithVariables(event, 'sel')
				const currentValue = StateUtil.getNumberFromState(cmd, state)
				// Wing reports 0 for Main, 1 for Alt; invert to match UI labels
				return typeof currentValue === 'number' && `${Number(!currentValue)}` === sel
			},
			subscribe: async (event): Promise<void> => {
				const cmd = IoCommands.MainAltSwitch()
				subscribeFeedback(ensureLoaded, subs, cmd, event)
			},
			unsubscribe: (event: CompanionFeedbackInfo): void => {
				const cmd = IoCommands.MainAltSwitch()
				unsubscribeFeedback(subs, cmd, event)
			},
		},
		[FeedbackId.Mute]: {
			type: 'boolean',
			name: 'Mute',
			description: "React to a change in a channel's mute state",
			options: [
				...GetDropdownWithVariables('Selection', 'sel', [...allChannelsAndDcas, ...state.namedChoices.mutegroups]),
				...GetMuteDropdownWithVariables('mute', 'State', false),
			],
			defaultStyle: { bgcolor: combineRgb(0, 255, 0), color: combineRgb(0, 0, 0) },
			callback: (event: CompanionFeedbackInfo): boolean => {
				const sel = ActionUtil.getStringWithVariables(event, 'sel')
				const mute = ActionUtil.getNumberWithVariables(event, 'mute')
				const cmd = ActionUtil.getMuteCommand(sel, ActionUtil.getNodeNumberFromID(sel))
				const currentValue = StateUtil.getNumberFromState(cmd, state)
				return typeof currentValue === 'number' && currentValue == mute
			},
			subscribe: async (event): Promise<void> => {
				const sel = ActionUtil.getStringWithVariables(event, 'sel')
				const cmd = ActionUtil.getMuteCommand(sel, ActionUtil.getNodeNumberFromID(sel))
				subscribeFeedback(ensureLoaded, subs, cmd, event)
			},
			unsubscribe: (event: CompanionFeedbackInfo): void => {
				const sel = ActionUtil.getStringWithVariables(event, 'sel')
				const cmd = ActionUtil.getMuteCommand(sel, ActionUtil.getNodeNumberFromID(sel))
				unsubscribeFeedback(subs, cmd, event)
			},
		},
		[FeedbackId.SendMute]: {
			type: 'boolean',
			name: 'Send Mute',
			description: "React to a change in a channel's send mute state",
			options: [
				...GetSendSourceDestinationFieldsWithVariables(
					allSendSources,
					channelAuxBusSendDestinations,
					mainSendDestinations,
				),
				...GetMuteDropdownWithVariables('mute', 'Mute', false),
			],
			defaultStyle: { bgcolor: combineRgb(0, 255, 0), color: combineRgb(0, 0, 0) },
			callback: (event: CompanionFeedbackInfo): boolean => {
				const { src, dest } = ActionUtil.GetSendSourceDestinationFieldsWithVariables(event)
				const cmd = ActionUtil.getSendMuteCommand(src, dest)
				let val = ActionUtil.getNumberWithVariables(event, 'mute')
				// Mute states are inverted for sends
				if (val != -1) {
					val = val == 0 ? 1 : 0
				}
				const currentValue = StateUtil.getNumberFromState(cmd, state)
				return typeof currentValue === 'number' && currentValue != val
			},
			subscribe: async (event): Promise<void> => {
				const { src, dest } = ActionUtil.GetSendSourceDestinationFieldsWithVariables(event)
				const cmd = ActionUtil.getSendMuteCommand(src, dest)
				subscribeFeedback(ensureLoaded, subs, cmd, event)
			},
			unsubscribe: (event: CompanionFeedbackInfo): void => {
				const { src, dest } = ActionUtil.GetSendSourceDestinationFieldsWithVariables(event)
				const cmd = ActionUtil.getSendMuteCommand(src, dest)
				unsubscribeFeedback(subs, cmd, event)
			},
		},
		[FeedbackId.AesStatus]: {
			type: 'boolean',
			name: 'AES Status',
			description: 'Status of an AES Connection',
			options: [
				...GetDropdownWithVariables('Interface', 'aes', [
					getIdLabelPair('A', 'AES A'),
					getIdLabelPair('B', 'AES B'),
					getIdLabelPair('C', 'AES C'),
				]),
				...GetDropdownWithVariables('Status', 'status', [
					getIdLabelPair('OK', 'OK'),
					getIdLabelPair('ERR', 'Error'),
					getIdLabelPair('UPD', 'Updating'),
					getIdLabelPair('-', 'Not Connected'),
				]),
			],
			defaultStyle: { bgcolor: combineRgb(0, 255, 0), color: combineRgb(0, 0, 0) },
			callback: (event: CompanionFeedbackInfo): boolean => {
				const aes = ActionUtil.getStringWithVariables(event, 'aes')
				const status = ActionUtil.getStringWithVariables(event, 'status')
				const cmd = StatusCommands.AesStatus(aes)
				const val = StateUtil.getStringFromState(cmd, state) as string
				return val === status
			},
			subscribe: async (event): Promise<void> => {
				const aes = ActionUtil.getStringWithVariables(event, 'aes')
				const cmd = StatusCommands.AesStatus(aes)
				subscribeFeedback(ensureLoaded, subs, cmd, event)
			},
			unsubscribe: (event: CompanionFeedbackInfo): void => {
				const aes = ActionUtil.getStringWithVariables(event, 'aes')
				const cmd = StatusCommands.AesStatus(aes)
				unsubscribeFeedback(subs, cmd, event)
			},
		},
		[FeedbackId.RecorderState]: {
			type: 'boolean',
			name: 'USB Recorder State',
			description: 'React to the current state of the USB Recorder',
			options: [
				...GetDropdownWithVariables('State', 'state', [
					getIdLabelPair('REC', 'Recording'),
					getIdLabelPair('PAUSE', 'Paused'),
					getIdLabelPair('STOP', 'Stopped'),
				]),
			],
			defaultStyle: { bgcolor: combineRgb(255, 0, 0), color: combineRgb(255, 255, 255) },
			callback: (event: CompanionFeedbackInfo): boolean => {
				const val = ActionUtil.getStringWithVariables(event, 'state')
				const cmd = UsbPlayerCommands.RecorderActiveState()
				const recState = StateUtil.getStringFromState(cmd, state)
				return recState === val
			},
			subscribe: async (event): Promise<void> => {
				const cmd = UsbPlayerCommands.RecorderActiveState()
				subscribeFeedback(ensureLoaded, subs, cmd, event)
			},
			unsubscribe: (event: CompanionFeedbackInfo): void => {
				const cmd = UsbPlayerCommands.RecorderActiveState()
				unsubscribeFeedback(subs, cmd, event)
			},
		},
		[FeedbackId.PlayerState]: {
			type: 'boolean',
			name: 'USB Player State',
			description: 'React to the current state of the USB Player',
			options: [
				...GetDropdownWithVariables('State', 'state', [
					getIdLabelPair('PLAY', 'Playing'),
					getIdLabelPair('PAUSE', 'Paused'),
					getIdLabelPair('STOP', 'Stopped'),
				]),
			],
			defaultStyle: { bgcolor: combineRgb(0, 255, 0), color: combineRgb(0, 0, 0) },
			callback: (event: CompanionFeedbackInfo): boolean => {
				const val = ActionUtil.getStringWithVariables(event, 'state')
				const cmd = UsbPlayerCommands.PlayerActiveState()
				const playerState = StateUtil.getStringFromState(cmd, state)
				return playerState === val
			},
			subscribe: async (event): Promise<void> => {
				const cmd = UsbPlayerCommands.PlayerActiveState()
				subscribeFeedback(ensureLoaded, subs, cmd, event)
			},
			unsubscribe: (event: CompanionFeedbackInfo): void => {
				const cmd = UsbPlayerCommands.PlayerActiveState()
				unsubscribeFeedback(subs, cmd, event)
			},
		},
		[FeedbackId.WLiveSDState]: {
			type: 'boolean',
			name: 'WLive SD State',
			description: 'React to the state of the WLive SD Cards.',
			options: [
				...GetDropdownWithVariables('Card', 'card', getCardsChoices()),
				...GetDropdownWithVariables('State', 'state', getCardsStatusChoices()),
			],
			defaultStyle: { bgcolor: combineRgb(0, 255, 0), color: combineRgb(0, 0, 0) },
			callback: (event: CompanionFeedbackInfo): boolean => {
				const card = ActionUtil.getNumberWithVariables(event, 'card')
				const val = ActionUtil.getStringWithVariables(event, 'state')
				const cmd = CardsCommands.WLiveCardSDState(card)
				const currentValue = StateUtil.getStringFromState(cmd, state)
				return currentValue == val
			},
			subscribe: async (event): Promise<void> => {
				const card = ActionUtil.getNumberWithVariables(event, 'card')
				const cmd = CardsCommands.WLiveCardSDState(card)
				subscribeFeedback(ensureLoaded, subs, cmd, event)
			},
			unsubscribe: (event: CompanionFeedbackInfo): void => {
				const card = ActionUtil.getNumberWithVariables(event, 'card')
				const cmd = CardsCommands.WLiveCardSDState(card)
				unsubscribeFeedback(subs, cmd, event)
			},
		},
		[FeedbackId.WLivePlaybackState]: {
			type: 'boolean',
			name: 'WLive Playback State',
			description: 'React to the playback state of a WLive Card.',
			options: [
				...GetDropdownWithVariables('Card', 'card', getCardsChoices()),
				...GetDropdownWithVariables('State', 'state', getCardsActionChoices()),
			],
			defaultStyle: { bgcolor: combineRgb(0, 255, 0), color: combineRgb(0, 0, 0) },
			callback: (event: CompanionFeedbackInfo): boolean => {
				const card = ActionUtil.getNumberWithVariables(event, 'card')
				const val = ActionUtil.getStringWithVariables(event, 'state')
				const cmd = CardsCommands.WLiveCardState(card)
				const currentValue = StateUtil.getStringFromState(cmd, state)
				return currentValue == val
			},
			subscribe: async (event): Promise<void> => {
				const card = ActionUtil.getNumberWithVariables(event, 'card')
				const cmd = CardsCommands.WLiveCardState(card)
				subscribeFeedback(ensureLoaded, subs, cmd, event)
			},
			unsubscribe: (event: CompanionFeedbackInfo): void => {
				const card = ActionUtil.getNumberWithVariables(event, 'card')
				const cmd = CardsCommands.WLiveCardState(card)
				unsubscribeFeedback(subs, cmd, event)
			},
		},
		[FeedbackId.GpioState]: {
			type: 'boolean',
			name: 'GPIO State',
			description: "React to a change in a gpio's state",
			options: [
				...GetDropdownWithVariables('Selection', 'sel', getGpios(4)),
				...GetDropdownWithVariables('State', 'state', [getIdLabelPair('1', 'On'), getIdLabelPair('0', 'Off')]),
			],
			defaultStyle: { bgcolor: combineRgb(0, 255, 0), color: combineRgb(0, 0, 0) },
			callback: (event: CompanionFeedbackInfo): boolean => {
				const sel = ActionUtil.getNumberWithVariables(event, 'sel')
				const val = ActionUtil.getNumberWithVariables(event, 'state')
				const cmd = ControlCommands.GpioReadState(sel)
				const currentValue = StateUtil.getNumberFromState(cmd, state)
				return typeof currentValue === 'number' && currentValue == val
			},
			subscribe: async (event): Promise<void> => {
				const sel = ActionUtil.getNumberWithVariables(event, 'sel')
				const cmd = ControlCommands.GpioReadState(sel)
				subscribeFeedback(ensureLoaded, subs, cmd, event)
			},
			unsubscribe: (event: CompanionFeedbackInfo): void => {
				const sel = ActionUtil.getNumberWithVariables(event, 'sel')
				const cmd = ControlCommands.GpioReadState(sel)
				unsubscribeFeedback(subs, cmd, event)
			},
		},
		[FeedbackId.Solo]: {
			type: 'boolean',
			name: 'Solo',
			description: "React to a change in a channel's solo state",
			options: [
				...GetDropdownWithVariables('Selection', 'sel', [
					getIdLabelPair('any', 'Any'),
					getIdLabelPair('all', 'All'),
					...allChannelsAndDcas,
				]),
				...GetDropdownWithVariables('Solo', 'solo', [getIdLabelPair('1', 'On'), getIdLabelPair('0', 'Off')]),
			],
			defaultStyle: { bgcolor: combineRgb(255, 255, 0), color: combineRgb(0, 0, 0) },
			callback: (event: CompanionFeedbackInfo): boolean => {
				const sel = ActionUtil.getStringWithVariables(event, 'sel')
				const solo = ActionUtil.getNumberWithVariables(event, 'solo')
				if (sel == 'any') {
					return allChannelsAndDcas.some((s) => {
						const num = s.id.toString().split('/')[2] as unknown as number
						const cmd = ActionUtil.getSoloCommand(s.id as string, num)
						const currentValue = StateUtil.getNumberFromState(cmd, state)
						return currentValue == solo
					})
				} else if (sel == 'all') {
					return allChannelsAndDcas.every((s) => {
						const num = s.id.toString().split('/')[2] as unknown as number
						const cmd = ActionUtil.getSoloCommand(s.id as string, num)
						const currentValue = StateUtil.getNumberFromState(cmd, state)
						return currentValue == solo
					})
				} else {
					const cmd = ActionUtil.getSoloCommand(sel, getNodeNumber(event, 'sel'))
					const currentValue = StateUtil.getNumberFromState(cmd, state)
					return typeof currentValue === 'number' && currentValue == solo
				}
			},
			subscribe: async (event): Promise<void> => {
				const sel = ActionUtil.getStringWithVariables(event, 'sel')
				if (sel == 'any' || sel == 'all') {
					allChannelsAndDcas.forEach((s) => {
						const num = s.id.toString().split('/')[2] as unknown as number
						const cmd = ActionUtil.getSoloCommand(s.id as string, num)
						subscribeFeedback(ensureLoaded, subs, cmd, event)
					})
				} else {
					const cmd = ActionUtil.getSoloCommand(sel, getNodeNumber(event, 'sel'))
					subscribeFeedback(ensureLoaded, subs, cmd, event)
				}
			},
			unsubscribe: (event: CompanionFeedbackInfo): void => {
				const sel = ActionUtil.getStringWithVariables(event, 'sel')
				if (sel == 'any' || sel == 'all') {
					allChannelsAndDcas.forEach((s) => {
						const num = s.id.toString().split('/')[2] as unknown as number
						const cmd = ActionUtil.getSoloCommand(s.id as string, num)
						unsubscribeFeedback(subs, cmd, event)
					})
				} else {
					const cmd = ActionUtil.getSoloCommand(sel, getNodeNumber(event, 'sel'))
					unsubscribeFeedback(subs, cmd, event)
				}
			},
		},
		[FeedbackId.SoloDim]: {
			type: 'boolean',
			name: 'Solo Dim',
			description: 'React to the dim state of the solo output.',
			options: [...GetDropdownWithVariables('Dim', 'dim', [getIdLabelPair('1', 'On'), getIdLabelPair('0', 'Off')])],
			defaultStyle: { bgcolor: combineRgb(255, 255, 0), color: combineRgb(0, 0, 0) },
			callback: (event: CompanionFeedbackInfo): boolean => {
				const val = ActionUtil.getNumberWithVariables(event, 'dim')
				const cmd = ConfigurationCommands.SoloDim()
				const currentValue = StateUtil.getNumberFromState(cmd, state)
				return typeof currentValue === 'number' && currentValue == val
			},
			subscribe: (event): void => {
				const cmd = ConfigurationCommands.SoloDim()
				subscribeFeedback(ensureLoaded, subs, cmd, event)
			},
			unsubscribe: (event: CompanionFeedbackInfo): void => {
				const cmd = ConfigurationCommands.SoloDim()
				unsubscribeFeedback(subs, cmd, event)
			},
		},
		[FeedbackId.SoloMono]: {
			type: 'boolean',
			name: 'Solo Mono',
			description: 'React to the mono state of the solo output.',
			options: [...GetDropdownWithVariables('Mono', 'mono', [getIdLabelPair('1', 'On'), getIdLabelPair('0', 'Off')])],
			defaultStyle: { bgcolor: combineRgb(255, 255, 0), color: combineRgb(0, 0, 0) },
			callback: (event: CompanionFeedbackInfo): boolean => {
				const val = ActionUtil.getNumberWithVariables(event, 'mono')
				const cmd = ConfigurationCommands.SoloMono()
				const currentValue = StateUtil.getNumberFromState(cmd, state)
				return typeof currentValue === 'number' && currentValue == val
			},
			subscribe: (event): void => {
				const cmd = ConfigurationCommands.SoloMono()
				subscribeFeedback(ensureLoaded, subs, cmd, event)
			},
			unsubscribe: (event: CompanionFeedbackInfo): void => {
				const cmd = ConfigurationCommands.SoloMono()
				unsubscribeFeedback(subs, cmd, event)
			},
		},
		[FeedbackId.SoloLRSwap]: {
			type: 'boolean',
			name: 'Solo LR Swap',
			description: 'React to the left-right channel swap state of the solo output.',
			options: [...GetDropdownWithVariables('Swap', 'swap', [getIdLabelPair('1', 'On'), getIdLabelPair('0', 'Off')])],
			defaultStyle: { bgcolor: combineRgb(255, 255, 0), color: combineRgb(0, 0, 0) },
			callback: (event: CompanionFeedbackInfo): boolean => {
				const val = ActionUtil.getNumberWithVariables(event, 'swap')
				const cmd = ConfigurationCommands.SoloLRSwap()
				const currentValue = StateUtil.getNumberFromState(cmd, state)
				return typeof currentValue === 'number' && currentValue == val
			},
			subscribe: (event): void => {
				const cmd = ConfigurationCommands.SoloLRSwap()
				subscribeFeedback(ensureLoaded, subs, cmd, event)
			},
			unsubscribe: (event: CompanionFeedbackInfo): void => {
				const cmd = ConfigurationCommands.SoloLRSwap()
				unsubscribeFeedback(subs, cmd, event)
			},
		},
		[FeedbackId.Talkback]: {
			type: 'boolean',
			name: 'Talkback',
			description: 'React to the status of a talkback channel.',
			options: [
				...GetDropdownWithVariables('Talkback', 'tb', getTalkbackOptions()),
				...GetDropdownWithVariables('On/Off', 'on', [getIdLabelPair('1', 'On'), getIdLabelPair('0', 'Off')]),
			],
			defaultStyle: { bgcolor: combineRgb(255, 0, 0), color: combineRgb(0, 0, 0) },
			callback: (event: CompanionFeedbackInfo): boolean => {
				const tb = ActionUtil.getStringWithVariables(event, 'tb')
				const val = ActionUtil.getNumberWithVariables(event, 'on')
				const cmd = ConfigurationCommands.TalkbackOn(tb)
				const currentValue = StateUtil.getNumberFromState(cmd, state)
				return typeof currentValue === 'number' && currentValue == val
			},
			subscribe: async (event): Promise<void> => {
				const tb = ActionUtil.getStringWithVariables(event, 'tb')
				const cmd = ConfigurationCommands.TalkbackOn(tb)
				subscribeFeedback(ensureLoaded, subs, cmd, event)
			},
			unsubscribe: (event: CompanionFeedbackInfo): void => {
				const tb = ActionUtil.getStringWithVariables(event, 'tb')
				const cmd = ConfigurationCommands.TalkbackOn(tb)
				unsubscribeFeedback(subs, cmd, event)
			},
		},
		[FeedbackId.TalkbackAssign]: {
			type: 'boolean',
			name: 'Talkback Assign',
			description: 'React to the assignment of a talkback channel to a bus matrix or main',
			options: [
				...GetDropdownWithVariables('Talkback', 'tb', getTalkbackOptions()),
				...GetDropdownWithVariables('Destination', 'dest', [
					...state.namedChoices.busses,
					...state.namedChoices.matrices,
					...state.namedChoices.mains,
				]),
				...GetDropdownWithVariables('Assign', 'assign', [
					getIdLabelPair('1', 'Assigned'),
					getIdLabelPair('0', 'Not Assigned'),
				]),
			],
			defaultStyle: { bgcolor: combineRgb(0, 255, 0), color: combineRgb(0, 0, 0) },
			callback: (event: CompanionFeedbackInfo): boolean => {
				const talkback = ActionUtil.getStringWithVariables(event, 'tb')
				const destination = ActionUtil.getStringWithVariables(event, 'dest')
				const assign = ActionUtil.getNumberWithVariables(event, 'assign')
				const cmd = ActionUtil.getTalkbackAssignCommand(talkback, destination)
				const currentValue = StateUtil.getNumberFromState(cmd, state)
				return typeof currentValue === 'number' && currentValue == assign
			},
			subscribe: async (event): Promise<void> => {
				const talkback = ActionUtil.getStringWithVariables(event, 'tb')
				const destination = ActionUtil.getStringWithVariables(event, 'dest')
				const cmd = ActionUtil.getTalkbackAssignCommand(talkback, destination)
				subscribeFeedback(ensureLoaded, subs, cmd, event)
			},
			unsubscribe: (event: CompanionFeedbackInfo): void => {
				const talkback = ActionUtil.getStringWithVariables(event, 'tb')
				const destination = ActionUtil.getStringWithVariables(event, 'dest')
				const cmd = ActionUtil.getTalkbackAssignCommand(talkback, destination)
				unsubscribeFeedback(subs, cmd, event)
			},
		},
		[FeedbackId.InsertOn]: {
			type: 'boolean',
			name: 'Insert On',
			description: 'React to a change for an insert on a channel, aux, bus, matrix or main.',
			options: [
				...GetDropdownWithVariables('Insert', 'insert', [
					getIdLabelPair('pre', 'Pre-Insert'),
					getIdLabelPair('post', 'Post-Insert'),
					getIdLabelPair('both', 'Both'),
					getIdLabelPair('either', 'Either'),
				]),
				...GetDropdownWithVariables('Selection', 'sel', [...allChannels]),
				...GetDropdownWithVariables('On/Off', 'on', [getIdLabelPair('1', 'On'), getIdLabelPair('0', 'Off')]),
			],
			defaultStyle: { bgcolor: combineRgb(255, 0, 0), color: combineRgb(0, 0, 0) },
			callback: (event: CompanionFeedbackInfo): boolean => {
				const insert = ActionUtil.getStringWithVariables(event, 'insert')
				const sel = ActionUtil.getStringWithVariables(event, 'sel')
				const on = ActionUtil.getNumberWithVariables(event, 'on')

				let preOn = false
				let postOn = false

				let cmd = ActionUtil.getPreInsertOnCommand(sel, getNodeNumber(event, 'sel'))
				let currentValue = StateUtil.getNumberFromState(cmd, state)
				preOn = (currentValue ?? 0) == on

				cmd = ActionUtil.getPostInsertCommand(sel, getNodeNumber(event, 'sel'))
				currentValue = StateUtil.getNumberFromState(cmd, state)
				postOn = (currentValue ?? 0) == on

				if (insert === 'pre') return preOn
				if (insert === 'post') return postOn
				if (insert === 'both') return preOn && postOn
				if (insert === 'either') return preOn || postOn
				return false
			},
			subscribe: async (event): Promise<void> => {
				const sel = ActionUtil.getStringWithVariables(event, 'sel')
				let cmd = ActionUtil.getPreInsertOnCommand(sel, getNodeNumber(event, 'sel'))
				subscribeFeedback(ensureLoaded, subs, cmd, event)
				cmd = ActionUtil.getPostInsertCommand(sel, getNodeNumber(event, 'sel'))
				subscribeFeedback(ensureLoaded, subs, cmd, event)
			},
			unsubscribe: (event: CompanionFeedbackInfo): void => {
				const sel = ActionUtil.getStringWithVariables(event, 'sel')
				let cmd = ActionUtil.getPreInsertOnCommand(sel, getNodeNumber(event, 'sel'))
				unsubscribeFeedback(subs, cmd, event)
				cmd = ActionUtil.getPostInsertCommand(sel, getNodeNumber(event, 'sel'))
				unsubscribeFeedback(subs, cmd, event)
			},
		},
		[FeedbackId.ActiveScene]: {
			type: 'boolean',
			name: 'Active Scene',
			description: 'React to the currently active scene',
			options: [GetDropdown('Scene', 'scene', state.namedChoices.scenes)],
			defaultStyle: { bgcolor: combineRgb(0, 255, 0), color: combineRgb(0, 0, 0) },
			callback: (event: CompanionFeedbackInfo): boolean => {
				const sceneName = event.options.scene as string
				const sceneNumber = state.sceneNameToIdMap.get(sceneName) ?? 0
				const cmd = ControlCommands.LibraryActiveSceneIndex()
				const currentSceneNumber = StateUtil.getNumberFromState(cmd, state)
				return typeof currentSceneNumber === 'number' && currentSceneNumber === sceneNumber
			},
			subscribe: (event): void => {
				const cmd = ControlCommands.LibraryActiveSceneIndex()
				subscribeFeedback(ensureLoaded, subs, cmd, event)
			},
			unsubscribe: (event: CompanionFeedbackInfo): void => {
				const cmd = ControlCommands.LibraryActiveSceneIndex()
				unsubscribeFeedback(subs, cmd, event)
			},
		},
	}

	return feedbacks
}
