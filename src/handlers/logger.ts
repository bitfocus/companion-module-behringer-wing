import { LogLevel } from '@companion-module/base'

type LoggerFunction = (level: LogLevel, message: string) => void

/**
 * Simple logger for module messages, supporting log levels and optional custom output.
 */
export class ModuleLogger {
	private moduleName: string
	private loggerFn?: LoggerFunction

	/**
	 * Create a new ModuleLogger.
	 * @param moduleName Name to prefix log messages.
	 * @param loggerFn Optional custom log function.
	 */
	constructor(moduleName: string, loggerFn?: LoggerFunction) {
		this.moduleName = moduleName
		this.loggerFn = loggerFn
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
		if (this.loggerFn) {
			this.loggerFn('debug', `[${this.moduleName}] ${message}`)
		} else {
			console.log(`[${this.moduleName}] ${message}`)
		}
	}

	/**
	 * Log an info message.
	 * @param message Message to log.
	 */
	info(message: string): void {
		if (this.loggerFn) {
			this.loggerFn('info', `[${this.moduleName}] ${message}`)
		} else {
			console.log(`[${this.moduleName}] ${message}`)
		}
	}

	/**
	 * Log an error message.
	 * @param message Message to log.
	 */
	error(message: string): void {
		if (this.loggerFn) {
			this.loggerFn('error', `[${this.moduleName}] ${message}`)
		} else {
			console.log(`[${this.moduleName}] ${message}`)
		}
	}

	/**
	 * Log a warning message.
	 * @param message Message to log.
	 */
	warn(message: string): void {
		if (this.loggerFn) {
			this.loggerFn('warn', `[${this.moduleName}] ${message}`)
		} else {
			console.log(`[${this.moduleName}] ${message}`)
		}
	}
}
