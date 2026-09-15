import EventEmitter from 'events'
import debounceFn from 'debounce-fn'
import { FeedbackId } from '../feedbacks.js'
import { OscMessage } from 'osc'
import { WingSubscriptions } from '../state/index.js'
import { ModuleLogger } from '@companion-module/base'

/**
 * Handles feedback updates based on incoming OSC messages and manages feedback subscriptions.
 * Emits 'check-feedbacks' events.
 */
export class FeedbackHandler extends EventEmitter {
	private readonly messageFeedbacks = new Set<FeedbackId>()
	private readonly debounceMessageFeedbacks: (() => void) & { cancel: () => void }
	private pollTimer?: NodeJS.Timeout
	private awaitingPollResponse: boolean = false
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
	 * Emits 'poll-request' with array of paths to poll on every interval.
	 * Emits 'poll-connection-timeout' if no data was received from the console since the last poll.
	 */
	public startPolling(): void {
		this.stopPolling()
		this.pollTimer = setInterval(() => this.poll(), this.pollInterval)
		this.poll()
	}

	/**
	 * Stop polling for feedback updates.
	 */
	public stopPolling(): void {
		if (this.pollTimer) {
			clearInterval(this.pollTimer)
			this.pollTimer = undefined
		}
		this.awaitingPollResponse = false
	}

	private poll(): void {
		const paths = this.subscriptions?.getPollPaths() ?? []
		if (paths.length === 0) {
			// Nothing to poll, so nothing can time out either
			this.awaitingPollResponse = false
			return
		}

		if (this.awaitingPollResponse) {
			this.logger?.warn('Poll request was not answered')
			this.emit('poll-connection-timeout')
		}

		this.awaitingPollResponse = true
		this.emit('poll-request', paths)
	}

	/**
	 * Report that data was received from the console, which keeps the connection marked as alive.
	 */
	public notifyMessageReceived(): void {
		this.awaitingPollResponse = false
	}

	/**
	 * Stop all timers and listeners of this handler.
	 */
	public destroy(): void {
		this.stopPolling()
		this.debounceMessageFeedbacks.cancel()
		this.messageFeedbacks.clear()
		this.removeAllListeners()
	}

	/**
	 * Set the poll interval for connection timeout detection.
	 * @param interval Interval in milliseconds.
	 */
	public setPollInterval(interval: number): void {
		this.pollInterval = interval
		if (this.pollTimer) {
			this.startPolling()
		}
	}
}
