import { WingState, WingSubscriptions } from './state.js'
import { InstanceBaseExt } from './types.js'
import { WingConfig } from './config.js'
import { SetRequired } from 'type-fest' // eslint-disable-line n/no-missing-import
import {
	combineRgb,
	CompanionAdvancedFeedbackDefinition,
	CompanionBooleanFeedbackDefinition,
	CompanionFeedbackDefinitions,
	CompanionFeedbackInfo,
} from '@companion-module/base'
import { compareNumber, GetDropdownFeedback, GetNumberComparator, GetPanoramaSliderFeedback } from './choices/common.js'
import { ChannelCommands } from './commands/channel.js'
import { getNumberValueForCommand, getNodeNumber, getStringValueForCommand } from './actions/utils.js'
import { getIdLabelPair } from './utils.js'
import { StatusCommands } from './commands/status.js'

type CompanionFeedbackWithCallback = SetRequired<
	CompanionBooleanFeedbackDefinition | CompanionAdvancedFeedbackDefinition,
	'callback' | 'subscribe' | 'unsubscribe'
>

export enum FeedbackId {
	AesStatus = 'aes-status',
	ChannelPanning = 'channel-panning',
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
	_send: (cmd: string, argument?: number | string) => void,
	ensureLoaded: (path: string) => void,
): CompanionFeedbackDefinitions {
	const feedbacks: { [id in FeedbackId]: CompanionFeedbackWithCallback | undefined } = {
		[FeedbackId.AesStatus]: {
			type: 'boolean',
			name: 'AES Status',
			description: 'Status of an AES Connection',
			options: [
				GetDropdownFeedback('Interface', 'aes', [
					getIdLabelPair('A', 'AES A'),
					getIdLabelPair('B', 'AES B'),
					getIdLabelPair('C', 'AES C'),
				]),
			],
			defaultStyle: {
				bgcolor: combineRgb(0, 255, 0),
				color: combineRgb(255, 0, 0),
			},
			callback: (event: CompanionFeedbackInfo): boolean => {
				const cmd = StatusCommands.AesStatus(event.options.aes as string)
				const val = getStringValueForCommand(cmd, state)
				return val == 'OK'
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
		[FeedbackId.ChannelPanning]: {
			type: 'boolean',
			name: 'Channel Panorama',
			description: "React to a change in a channel's Panorama",
			options: [
				GetDropdownFeedback('Channel', 'channel', state.namedChoices.channels),
				GetNumberComparator('comparator'),
				...GetPanoramaSliderFeedback('pan'),
			],
			defaultStyle: {
				bgcolor: combineRgb(0, 255, 0),
				color: combineRgb(0, 0, 0),
			},
			callback: (event: CompanionFeedbackInfo): boolean => {
				const cmd = ChannelCommands.Pan(getNodeNumber(event, 'channel'))
				const currentValue = getNumberValueForCommand(cmd, state)
				return (
					typeof currentValue === 'number' && compareNumber(event.options.pan, event.options.comparator, currentValue)
				)
			},
			subscribe: (event): void => {
				const cmd = ChannelCommands.Pan(getNodeNumber(event, 'channel'))
				subscribeFeedback(ensureLoaded, subs, cmd, event)
			},
			unsubscribe: (event: CompanionFeedbackInfo): void => {
				const cmd = ChannelCommands.Pan(getNodeNumber(event, 'channel'))
				unsubscribeFeedback(subs, cmd, event)
			},
		},
	}

	return feedbacks
}
