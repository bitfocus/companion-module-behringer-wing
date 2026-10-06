import { CompanionBooleanFeedbackDefinition, CompanionFeedbackInfo } from '@companion-module/base'
import { InstanceBaseExt } from '../types.js'
import { WingConfig } from '../config.js'
import { StateUtil, WingState, WingSubscriptions } from '../state/index.js'
import * as ActionUtil from '../actions/utils.js'

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
	SofActive = 'sof-active',
}

export interface FeedbackContext {
	state: WingState
	subs: WingSubscriptions
	ensureLoaded: (path: string) => void
}

export function getFeedbackContext(self: InstanceBaseExt<WingConfig>): FeedbackContext {
	const state = self.stateHandler?.state
	if (!state) throw new Error('State handler or state is not available')
	const subs = self.feedbackHandler?.subscriptions
	if (!subs) throw new Error('Feedback handler or subscriptions are not available')
	const stateHandler = self.stateHandler
	if (!stateHandler) throw new Error('State handler or ensureLoaded is not available')
	return { state, subs, ensureLoaded: (path) => stateHandler.ensureLoaded(path) }
}

export type WingFeedbackDefinition = Omit<CompanionBooleanFeedbackDefinition, 'callback' | 'unsubscribe'> & {
	/** The desk paths the feedback state depends on, for the given options */
	paths: (event: CompanionFeedbackInfo) => string[]
	/** Called to get the feedback value, with the paths returned by `paths` for the current options */
	callback: (event: CompanionFeedbackInfo, paths: string[]) => boolean
}

/**
 * Create a boolean feedback that keeps its path subscriptions in sync with its options.
 *
 * API v2 feedbacks have no subscribe hook, so subscriptions are set up in the callback:
 * paths only used by `previousOptions` are dropped, and the current paths are (re-)registered.
 * Registering is idempotent, and only paths new to this feedback instance are requested from the desk.
 * Re-registering on every run also restores subscriptions after the feedback handler is recreated.
 */
export function createFeedback(
	ctx: FeedbackContext,
	definition: WingFeedbackDefinition,
): CompanionBooleanFeedbackDefinition {
	const { paths, callback, ...rest } = definition
	return {
		...rest,
		callback: (event) => {
			const currentPaths = paths(event)
			const current = new Set(currentPaths)
			if (event.previousOptions) {
				for (const path of paths({ ...event, options: event.previousOptions })) {
					if (!current.has(path)) ctx.subs.unsubscribe(path, event.id)
				}
			}
			for (const path of current) {
				if (ctx.subs.subscribe(path, event.id, event.feedbackId as FeedbackId)) ctx.ensureLoaded(path)
			}
			return callback(event, currentPaths)
		},
		unsubscribe: (event) => {
			for (const path of paths(event)) {
				ctx.subs.unsubscribe(path, event.id)
			}
		},
	}
}

/**
 * Check whether the numeric desk value at `cmd` equals the number selected in the given option.
 */
export function stateMatchesNumberOption(
	state: WingState,
	event: CompanionFeedbackInfo,
	cmd: string,
	option: string,
): boolean {
	const val = ActionUtil.getNumberWithVariables(event, option)
	const currentValue = StateUtil.getNumberFromState(cmd, state)
	return typeof currentValue === 'number' && currentValue == val
}
