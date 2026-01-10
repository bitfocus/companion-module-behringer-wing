import EventEmitter from 'events'
import debounceFn from 'debounce-fn'
import { FeedbackId } from '../feedbacks.js'
import { OscMessage } from 'osc'
import { WingSubscriptions } from '../state/index.js'
import { ModuleLogger } from './logger.js'

/**
 * Handles feedback updates based on incoming OSC messages and manages feedback subscriptions.
 * Emits 'check-feedbacks' events.
 */
export class FeedbackHandler extends EventEmitter {
	private readonly messageFeedbacks = new Set<FeedbackId>()
	private readonly debounceMessageFeedbacks: () => void
	private pollTimeout?: NodeJS.Timeout
	private pollInterval: number = 3000
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
	 * Start polling for feedback updates and set up connection timeout detection.
	 * Emits 'poll-request' with array of paths to poll.
	 * Emits 'connection-timeout' if no response received within the poll interval.
	 */
	public startPolling(): void {
		const paths = this.subscriptions?.getPollPaths() || []
		if (paths.length === 0) {
			return
		}

		this.clearPollTimeout()
		this.pollTimeout = setTimeout(() => {
			this.logger?.warn('Poll request was not answered')
			this.emit('poll-connection-timeout')
		}, this.pollInterval)

		this.emit('poll-request', paths)
	}

	/**
	 * Clear the current poll timeout (called when a response is received).
	 */
	public clearPollTimeout(): void {
		if (this.pollTimeout) {
			clearTimeout(this.pollTimeout)
			this.pollTimeout = undefined
		}
	}

	/**
	 * Set the poll interval for connection timeout detection.
	 * @param interval Interval in milliseconds.
	 */
	public setPollInterval(interval: number): void {
		this.pollInterval = interval
	}
}
