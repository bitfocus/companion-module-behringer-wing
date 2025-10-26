import { LogLevel } from '@companion-module/base'

type LoggerFunction = (level: LogLevel, message: string) => void

export class ModuleLogger {
	private moduleName: string
	private loggerFn?: LoggerFunction

	constructor(moduleName: string, loggerFn?: LoggerFunction) {
		this.moduleName = moduleName
		this.loggerFn = loggerFn
	}

	setLoggerFn(loggerFn: LoggerFunction): void {
		this.loggerFn = loggerFn
	}

	debug(message: string): void {
		if (this.loggerFn) {
			this.loggerFn('debug', `[${this.moduleName}] ${message}`)
		} else {
			console.log(`[${this.moduleName}] ${message}`)
		}
	}

	info(message: string): void {
		if (this.loggerFn) {
			this.loggerFn('info', `[${this.moduleName}] ${message}`)
		} else {
			console.log(`[${this.moduleName}] ${message}`)
		}
	}

	error(message: string): void {
		if (this.loggerFn) {
			this.loggerFn('error', `[${this.moduleName}] ${message}`)
		} else {
			console.log(`[${this.moduleName}] ${message}`)
		}
	}

	warn(message: string): void {
		if (this.loggerFn) {
			this.loggerFn('warn', `[${this.moduleName}] ${message}`)
		} else {
			console.log(`[${this.moduleName}] ${message}`)
		}
	}
}
