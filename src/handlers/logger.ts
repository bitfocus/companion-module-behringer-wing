import { LogLevel } from '@companion-module/base'

type LoggerFunction = (level: LogLevel, message: string) => void

/**
 * Simple logger for module messages, supporting log levels and optional custom output.
 */
export class ModuleLogger {
	private moduleName: string
	private loggerFn?: LoggerFunction
	debugMode: boolean
	timestamps: boolean

	/**
	 * Create a new ModuleLogger.
	 * @param moduleName Name to prefix log messages.
	 * @param loggerFn Optional custom log function.
	 * @param debugMode Whether to include source location information in logs.
	 * @param timestamps Whether to include timestamps in logs.
	 */
	constructor(moduleName: string, loggerFn?: LoggerFunction) {
		this.moduleName = moduleName
		this.loggerFn = loggerFn
		this.debugMode = false
		this.timestamps = false
	}

	/**
	 * Set or update the logger function.
	 * @param loggerFn Function to handle log output.
	 */
	setLoggerFn(loggerFn: LoggerFunction): void {
		this.loggerFn = loggerFn
	}

	/**
	 * Log a debug message.
	 * @param message Message to log.
	 */
	debug(message: string): void {
		const msg = this.formatMessage(message)
		if (this.loggerFn) {
			this.loggerFn('debug', `[${this.moduleName}] ${msg}`)
		} else {
			console.log(`[${this.moduleName}] ${msg}`)
		}
	}

	/**
	 * Log an info message.
	 * @param message Message to log.
	 */
	info(message: string): void {
		const msg = this.formatMessage(message)
		if (this.loggerFn) {
			this.loggerFn('info', `[${this.moduleName}] ${msg}`)
		} else {
			console.log(`[${this.moduleName}] ${msg}`)
		}
	}

	/**
	 * Log an error message.
	 * @param message Message to log.
	 */
	error(message: string): void {
		const msg = this.formatMessage(message)
		if (this.loggerFn) {
			this.loggerFn('error', `[${this.moduleName}] ${msg}`)
		} else {
			console.log(`[${this.moduleName}] ${msg}`)
		}
	}

	/**
	 * Log a warning message.
	 * @param message Message to log.
	 */
	warn(message: string): void {
		const msg = this.formatMessage(message)
		if (this.loggerFn) {
			this.loggerFn('warn', `[${this.moduleName}] ${msg}`)
		} else {
			console.log(`[${this.moduleName}] ${msg}`)
		}
	}

	/**
	 * Format the message with optional timestamp and source location.
	 * @private
	 */
	private formatMessage(message: string): string {
		const parts: string[] = []
		if (this.timestamps) {
			parts.push(this.getTimestamp())
		}
		if (this.debugMode) {
			parts.push(this.getSourceLocation())
		}
		parts.push(message)
		return parts.join(' ')
	}

	/**
	 * Get the current timestamp in ISO format.
	 * @private
	 */
	private getTimestamp(): string {
		return new Date().toISOString()
	}

	/**
	 * Get the call stack
	 * @private
	 */
	private getSourceLocation(): string {
		try {
			const stack = new Error().stack || ''
			const lines = stack.split('\n')
			const callers: string[] = []
			let lineNumber = 0

			for (const line of lines) {
				if (line.includes('handlers/logger')) {
					continue
				}

				// Extract function name from stack trace
				const match = line.match(/at\s+(?:(?:new\s+)?(\w+)\.)?(\w+)(?:\s+|$)/)
				if (match) {
					const className = match[1]
					const functionName = match[2]
					const caller = className && className !== 'Object' ? `${className}.${functionName}` : functionName
					callers.push(caller)

					// Get line number from the first non-logger caller
					if (callers.length === 1) {
						const lineMatch = line.match(/:(\d+):/)
						if (lineMatch) {
							lineNumber = parseInt(lineMatch[1], 10)
						}
					}
				}
			}

			if (callers.length > 0) {
				const reversed = callers.reverse()
				const limited = reversed.slice(-3)
				const hierarchy = limited.join('/')
				return `[${hierarchy}:${lineNumber}]`
			}
		} catch (_) {
			return '[unknown - error retrieving source location]'
		}
		return '[unknown]'
	}
}
