import EventEmitter from 'events'
import debounceFn from 'debounce-fn'
import type { FeedbackId } from '../feedbacks/index.js'
import type { OscMessage } from 'osc'
import { WingSubscriptions } from '../state/index.js'
import type { ModuleLogger } from '@companion-module/base'

/**
 * Handles feedback updates based on incoming OSC messages and manages feedback subscriptions.
 * Emits 'check-feedbacks' events.
 */
export class FeedbackHandler extends EventEmitter {
	private readonly messageFeedbacks = new Set<FeedbackId>()
	private readonly debounceMessageFeedbacks: () => void
	private logger: ModuleLogger | undefined

	subscriptions?: WingSubscriptions

	/**
	 * Create a new FeedbackHandler.
	 * @param logger Optional logger for debug output.
	 */
	constructor(logger?: ModuleLogger) {
		super()

		this.logger = logger
		this.subscriptions = new WingSubscriptions()

		this.debounceMessageFeedbacks = debounceFn(
			() => {
				const feedbacks = Array.from(this.messageFeedbacks).map((feedback) => feedback.toString())
				this.messageFeedbacks.clear()
				this.emit('check-feedbacks', feedbacks)
			},
			{
				wait: 100,
				maxWait: 500,
				before: true,
				after: true,
			},
		)
	}

	/**
	 * Process an OSC message and trigger feedback checks if needed.
	 * @param msg OSC message to process.
	 */
	processMessage(msgs: Set<OscMessage>): void {
		this.logger?.debug(`Processing messages for feedbacks`)
		for (const msg of msgs) {
			const toUpdate = this.subscriptions?.getFeedbacks(msg.address)
			if (toUpdate === undefined) {
				continue
			}
			if (toUpdate.length > 0) {
				toUpdate.forEach((f) => this.messageFeedbacks.add(f))
				this.debounceMessageFeedbacks()
			}
		}
	}

	/**
	 * Request the values that feedbacks need to poll.
	 * Emits 'poll-request' with array of paths to poll.
	 */
	public startPolling(): void {
		const paths = this.subscriptions?.getPollPaths() || []
		if (paths.length === 0) {
			return
		}

		this.emit('poll-request', paths)
	}
}
