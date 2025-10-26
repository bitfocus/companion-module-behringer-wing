import { WingSubscriptions } from './state/index.js'
import { InstanceBaseExt } from './types.js'
import { WingConfig } from './config.js'
import { SetRequired } from 'type-fest' // eslint-disable-line n/no-missing-import
import {
	combineRgb,
	CompanionBooleanFeedbackDefinition,
	CompanionFeedbackDefinitions,
	CompanionFeedbackInfo,
	CompanionOptionValues,
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
	Talkback = 'talkback',
	TalkbackAssign = 'talkback-assign',
	InsertOn = 'insert-on',
	MainAltSwitch = 'main-alt-switch',
}

function subscribeFeedback(
	ensureLoaded: (path: string) => Promise<void>,
	subs: WingSubscriptions,
	path: string,
	event: CompanionFeedbackInfo,
): void {
	subs.subscribe(path, event.id, event.feedbackId as FeedbackId)
	ensureLoaded(path).catch(() => {})
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
			options: [GetDropdown('Selected', 'sel', [getIdLabelPair('1', 'Main'), getIdLabelPair('0', 'Alt')])],
			defaultStyle: { bgcolor: combineRgb(0, 255, 0), color: combineRgb(0, 0, 0) },
			callback: (event: CompanionFeedbackInfo): boolean => {
				const cmd = IoCommands.MainAltSwitch()
				const currentValue = StateUtil.getNumberFromState(cmd, state)
				// Wing reports 0 for Main, 1 for Alt; invert to match UI labels
				return typeof currentValue === 'number' && `${Number(!currentValue)}` === (event.options.sel as string)
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
				GetDropdown('Selection', 'sel', [...allChannelsAndDcas, ...state.namedChoices.mutegroups]),
				GetMuteDropdown('mute', 'State', false),
			],
			defaultStyle: { bgcolor: combineRgb(0, 255, 0), color: combineRgb(0, 0, 0) },
			callback: (event: CompanionFeedbackInfo): boolean => {
				const sel = event.options.sel as string
				const cmd = ActionUtil.getMuteCommand(sel, getNodeNumber(event, 'sel'))
				const currentValue = StateUtil.getNumberFromState(cmd, state)
				return typeof currentValue === 'number' && currentValue == event.options.mute
			},
			subscribe: async (event): Promise<void> => {
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
				GetDropdown('From', 'src', allSendSources),
				{
					...GetDropdown('To', 'dest', channelAuxBusSendDestinations),
					isVisible: (options: CompanionOptionValues): boolean => {
						const source = options.src as string
						return !source.startsWith('/main')
					},
				},
				{
					...GetDropdown('To', 'mainDest', mainSendDestinations),
					isVisible: (options: CompanionOptionValues): boolean => {
						const source = options.src as string
						return source.startsWith('/main')
					},
				},
				GetMuteDropdown('mute', 'State', false),
			],
			defaultStyle: { bgcolor: combineRgb(0, 255, 0), color: combineRgb(0, 0, 0) },
			callback: (event: CompanionFeedbackInfo): boolean => {
				const src = event.options.src as string
				let dest = ''
				if (src.startsWith('/main')) {
					dest = event.options.mainDest as string
				} else {
					dest = event.options.dest as string
				}
				const cmd = ActionUtil.getSendMuteCommand(src, dest)
				const currentValue = StateUtil.getNumberFromState(cmd, state)
				return typeof currentValue === 'number' && currentValue != event.options.mute
			},
			subscribe: async (event): Promise<void> => {
				const src = event.options.src as string
				let dest = ''
				if (src.startsWith('/main')) {
					dest = event.options.mainDest as string
				} else {
					dest = event.options.dest as string
				}
				const cmd = ActionUtil.getSendMuteCommand(src, dest)
				subscribeFeedback(ensureLoaded, subs, cmd, event)
			},
			unsubscribe: (event: CompanionFeedbackInfo): void => {
				const src = event.options.src as string
				let dest = ''
				if (src.startsWith('/main')) {
					dest = event.options.mainDest as string
				} else {
					dest = event.options.dest as string
				}
				const cmd = ActionUtil.getSendMuteCommand(src, dest)
				unsubscribeFeedback(subs, cmd, event)
			},
		},
		[FeedbackId.AesStatus]: {
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
			callback: (event: CompanionFeedbackInfo): boolean => {
				const cmd = StatusCommands.AesStatus(event.options.aes as string)
				const val = StateUtil.getStringFromState(cmd, state) as string
				return val === event.options.status
			},
			subscribe: async (event): Promise<void> => {
				const cmd = StatusCommands.AesStatus(event.options.aes as string)
				subscribeFeedback(ensureLoaded, subs, cmd, event)
			},
			unsubscribe: (event: CompanionFeedbackInfo): void => {
				const cmd = StatusCommands.AesStatus(event.options.aes as string)
				unsubscribeFeedback(subs, cmd, event)
			},
		},
		[FeedbackId.RecorderState]: {
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
			callback: (event: CompanionFeedbackInfo): boolean => {
				const cmd = UsbPlayerCommands.RecorderActiveState()
				const recState = StateUtil.getStringFromState(cmd, state)
				return recState === event.options.state
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
				GetDropdown('State', 'state', [
					getIdLabelPair('PLAY', 'Playing'),
					getIdLabelPair('PAUSE', 'Paused'),
					getIdLabelPair('STOP', 'Stopped'),
				]),
			],
			defaultStyle: { bgcolor: combineRgb(0, 255, 0), color: combineRgb(0, 0, 0) },
			callback: (event: CompanionFeedbackInfo): boolean => {
				const cmd = UsbPlayerCommands.PlayerActiveState()
				const playerState = StateUtil.getStringFromState(cmd, state)
				return playerState === event.options.state
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
			options: [GetDropdown('Card', 'card', getCardsChoices()), GetDropdown('State', 'state', getCardsStatusChoices())],
			defaultStyle: { bgcolor: combineRgb(0, 255, 0), color: combineRgb(0, 0, 0) },
			callback: (event: CompanionFeedbackInfo): boolean => {
				const cmd = CardsCommands.WLiveCardSDState(event.options.card as number)
				const currentValue = StateUtil.getStringFromState(cmd, state)
				return currentValue == event.options.state
			},
			subscribe: async (event): Promise<void> => {
				const cmd = CardsCommands.WLiveCardSDState(event.options.card as number)
				subscribeFeedback(ensureLoaded, subs, cmd, event)
			},
			unsubscribe: (event: CompanionFeedbackInfo): void => {
				const cmd = CardsCommands.WLiveCardSDState(event.options.card as number)
				unsubscribeFeedback(subs, cmd, event)
			},
		},
		[FeedbackId.WLivePlaybackState]: {
			type: 'boolean',
			name: 'WLive Playback State',
			description: 'React to the playback state of a WLive Card.',
			options: [GetDropdown('Card', 'card', getCardsChoices()), GetDropdown('State', 'state', getCardsActionChoices())],
			defaultStyle: { bgcolor: combineRgb(0, 255, 0), color: combineRgb(0, 0, 0) },
			callback: (event: CompanionFeedbackInfo): boolean => {
				const cmd = CardsCommands.WLiveCardState(event.options.card as number)
				const currentValue = StateUtil.getStringFromState(cmd, state)
				return currentValue == event.options.state
			},
			subscribe: async (event): Promise<void> => {
				const cmd = CardsCommands.WLiveCardState(event.options.card as number)
				subscribeFeedback(ensureLoaded, subs, cmd, event)
			},
			unsubscribe: (event: CompanionFeedbackInfo): void => {
				const cmd = CardsCommands.WLiveCardState(event.options.card as number)
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
			defaultStyle: { bgcolor: combineRgb(0, 255, 0), color: combineRgb(0, 0, 0) },
			callback: (event: CompanionFeedbackInfo): boolean => {
				const sel = event.options.sel as number
				const cmd = ControlCommands.GpioReadState(sel)
				const currentValue = StateUtil.getNumberFromState(cmd, state)
				return typeof currentValue === 'number' && currentValue == event.options.state
			},
			subscribe: async (event): Promise<void> => {
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
				GetDropdown('Selection', 'sel', [
					getIdLabelPair('any', 'Any'),
					getIdLabelPair('all', 'All'),
					...allChannelsAndDcas,
				]),
				GetDropdown('Solo', 'solo', [getIdLabelPair('1', 'On'), getIdLabelPair('0', 'Off')]),
			],
			defaultStyle: { bgcolor: combineRgb(255, 255, 0), color: combineRgb(0, 0, 0) },
			callback: (event: CompanionFeedbackInfo): boolean => {
				const sel = event.options.sel as string
				if (sel == 'any') {
					return allChannelsAndDcas.some((s) => {
						const num = s.id.toString().split('/')[2] as unknown as number
						const cmd = ActionUtil.getSoloCommand(s.id as string, num)
						const currentValue = StateUtil.getNumberFromState(cmd, state)
						return currentValue == event.options.solo
					})
				} else if (sel == 'all') {
					return allChannelsAndDcas.every((s) => {
						const num = s.id.toString().split('/')[2] as unknown as number
						const cmd = ActionUtil.getSoloCommand(s.id as string, num)
						const currentValue = StateUtil.getNumberFromState(cmd, state)
						return currentValue == event.options.solo
					})
				} else {
					const cmd = ActionUtil.getSoloCommand(sel, getNodeNumber(event, 'sel'))
					const currentValue = StateUtil.getNumberFromState(cmd, state)
					return typeof currentValue === 'number' && currentValue == event.options.solo
				}
			},
			subscribe: async (event): Promise<void> => {
				const sel = event.options.sel as string
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
				const sel = event.options.sel as string
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
		[FeedbackId.Talkback]: {
			type: 'boolean',
			name: 'Talkback',
			description: 'React to the status of a talkback channel.',
			options: [
				GetDropdown('Talkback', 'tb', getTalkbackOptions()),
				GetDropdown('On/Off', 'on', [getIdLabelPair('1', 'On'), getIdLabelPair('0', 'Off')]),
			],
			defaultStyle: { bgcolor: combineRgb(255, 0, 0), color: combineRgb(0, 0, 0) },
			callback: (event: CompanionFeedbackInfo): boolean => {
				const cmd = ConfigurationCommands.TalkbackOn(event.options.tb as string)
				const currentValue = StateUtil.getNumberFromState(cmd, state)
				return typeof currentValue === 'number' && currentValue == event.options.on
			},
			subscribe: async (event): Promise<void> => {
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
			defaultStyle: { bgcolor: combineRgb(0, 255, 0), color: combineRgb(0, 0, 0) },
			callback: (event: CompanionFeedbackInfo): boolean => {
				const talkback = event.options.tb as string
				const destination = event.options.dest as string
				const cmd = ActionUtil.getTalkbackAssignCommand(talkback, destination)
				const currentValue = StateUtil.getNumberFromState(cmd, state)
				return typeof currentValue === 'number' && currentValue == event.options.assign
			},
			subscribe: async (event): Promise<void> => {
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
		[FeedbackId.InsertOn]: {
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
			callback: (event: CompanionFeedbackInfo): boolean => {
				const insert = event.options.insert as string
				let preOn = false
				let postOn = false

				const sel = event.options.sel as string

				let cmd = ActionUtil.getPreInsertOnCommand(sel, getNodeNumber(event, 'sel'))
				let currentValue = StateUtil.getNumberFromState(cmd, state)
				preOn = Boolean(currentValue ?? 0 > 0)

				cmd = ActionUtil.getPostInsertCommand(sel, getNodeNumber(event, 'sel'))
				currentValue = StateUtil.getNumberFromState(cmd, state)
				postOn = Boolean(currentValue ?? 0 > 0)

				if (insert === 'pre') return preOn
				if (insert === 'post') return postOn
				if (insert === 'both') return preOn && postOn
				if (insert === 'either') return preOn || postOn
				return false
			},
			subscribe: async (event): Promise<void> => {
				const sel = event.options.sel as string
				let cmd = ActionUtil.getPreInsertOnCommand(sel, getNodeNumber(event, 'sel'))
				subscribeFeedback(ensureLoaded, subs, cmd, event)
				cmd = ActionUtil.getPostInsertCommand(sel, getNodeNumber(event, 'sel'))
				subscribeFeedback(ensureLoaded, subs, cmd, event)
			},
			unsubscribe: (event: CompanionFeedbackInfo): void => {
				const sel = event.options.sel as string
				let cmd = ActionUtil.getPreInsertOnCommand(sel, getNodeNumber(event, 'sel'))
				unsubscribeFeedback(subs, cmd, event)
				cmd = ActionUtil.getPostInsertCommand(sel, getNodeNumber(event, 'sel'))
				unsubscribeFeedback(subs, cmd, event)
			},
		},
	}

	return feedbacks
}
