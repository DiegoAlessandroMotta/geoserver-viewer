import type {
  ILogger,
  LoggerMessage,
} from '@/shared/interfaces/logger.interface'

export class ConsoleLogger implements ILogger {
  debug(message: LoggerMessage) {
    console.debug('[DEBUG]', message)
  }

  info(message: LoggerMessage) {
    console.info('[INFO]', message)
  }

  warn(message: LoggerMessage) {
    console.warn('[WARN]', message)
  }

  error(message: LoggerMessage) {
    console.error('[ERROR]', message)
  }

  fatal(message: LoggerMessage) {
    console.error('[FATAL]', message)
  }
}
