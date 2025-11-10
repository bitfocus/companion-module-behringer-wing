import EventEmitter from 'events'
import { ModuleLogger } from './logger.js'
import debounceFn from 'debounce-fn'
import { FeedbackId } from '../feedbacks.js'
import { OscMessage } from 'osc'
import { WingSubscriptions } from '../state/index.js'

/**
 * Handles feedback updates based on incoming OSC messages and manages feedback subscriptions.
 * Emits 'check-feedbacks' events.
 */
export class FeedbackHandler extends EventEmitter {
	private readonly messageFeedbacks = new Set<FeedbackId>()
	private readonly debounceMessageFeedbacks: () => void
	private logger?: ModuleLogger

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
	processMessage(msg: OscMessage): void {
		this.logger?.debug(`Processing message for feedbacks: ${msg.address}`)

		const toUpdate = this.subscriptions?.getFeedbacks(msg.address)
		if (toUpdate === undefined) {
			return
		}
		if (toUpdate.length > 0) {
			toUpdate.forEach((f) => this.messageFeedbacks.add(f))
			this.debounceMessageFeedbacks()
		}
	}
}
