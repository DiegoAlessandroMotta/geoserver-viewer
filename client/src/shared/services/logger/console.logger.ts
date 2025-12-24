import type {
  ILogger,
  LoggerMessage,
} from '@/shared/interfaces/logger.interface'
import { appConfig } from '@/shared/config'

export class ConsoleLogger implements ILogger {
  private shouldLog(
    level: 'debug' | 'info' | 'warn' | 'error' | 'fatal',
  ): boolean {
    if (appConfig.isTest) return false
    if (appConfig.isProduction) {
      return level === 'fatal'
    }
    return true
  }

  debug(message: LoggerMessage) {
    if (this.shouldLog('debug')) {
      console.debug('[DEBUG]', message)
    }
  }

  info(message: LoggerMessage) {
    if (this.shouldLog('info')) {
      console.info('[INFO]', message)
    }
  }

  warn(message: LoggerMessage) {
    if (this.shouldLog('warn')) {
      console.warn('[WARN]', message)
    }
  }

  error(message: LoggerMessage) {
    if (this.shouldLog('error')) {
      console.error('[ERROR]', message)
    }
  }

  fatal(message: LoggerMessage) {
    if (this.shouldLog('fatal')) {
      console.error('[FATAL]', message)
    }
  }
}
