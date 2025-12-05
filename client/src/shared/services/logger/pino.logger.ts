import type {
  ILogger,
  LoggerMessage,
} from '@/shared/interfaces/logger.interface'

type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal'

export class ConsoleLogger implements ILogger {
  private formatMessage(message: LoggerMessage): {
    msg: string
    context?: Record<string, unknown>
  } {
    if (typeof message === 'string') {
      return { msg: message }
    }
    const { msg, ...context } = message
    return {
      msg: msg,
      context: Object.keys(context).length > 0 ? context : undefined,
    }
  }

  private log(level: LogLevel, message: LoggerMessage) {
    const { msg, context } = this.formatMessage(message)
    const timestamp = new Date().toISOString()
    const prefix = `[${timestamp}] [${level.toUpperCase()}]`
    const consoleMethod = level === 'fatal' ? 'error' : level

    if (context) {
      ;(console[consoleMethod as keyof typeof console] as any)(
        `${prefix} ${msg}`,
        context,
      )
    } else {
      ;(console[consoleMethod as keyof typeof console] as any)(
        `${prefix} ${msg}`,
      )
    }
  }

  debug(message: LoggerMessage) {
    this.log('debug', message)
  }

  info(message: LoggerMessage) {
    this.log('info', message)
  }

  warn(message: LoggerMessage) {
    this.log('warn', message)
  }

  error(message: LoggerMessage) {
    this.log('error', message)
  }

  fatal(message: LoggerMessage) {
    this.log('fatal', message)
  }
}
