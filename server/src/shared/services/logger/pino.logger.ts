import {
  ILogger,
  LoggerMessage,
} from '@/apps/proxy/domain/services/logger.interface'
import { serverConfig } from '@/shared/config'
import pino, { type Logger } from 'pino'

export class PinoLogger implements ILogger {
  private readonly logger: Logger

  constructor(options?: pino.LoggerOptions) {
    this.logger = pino({
      level: serverConfig.logLevel,
      transport: serverConfig.isProduction
        ? {
            target: 'pino-pretty',
            options: {
              colorize: true,
              translateTime: 'HH:MM:ss Z',
              ignore: 'pid,hostname',
            },
          }
        : undefined,
      ...options,
    })
  }

  private formatMessage(message: LoggerMessage): {
    msg: string
    context?: Record<string, unknown>
  } {
    if (typeof message === 'string') {
      return { msg: message }
    }
    return { msg: message.message, context: message.context }
  }

  debug(message: LoggerMessage): void {
    const { msg, context } = this.formatMessage(message)
    this.logger.debug(context, msg)
  }

  info(message: LoggerMessage): void {
    const { msg, context } = this.formatMessage(message)
    this.logger.info(context, msg)
  }

  warn(message: LoggerMessage): void {
    const { msg, context } = this.formatMessage(message)
    this.logger.warn(context, msg)
  }

  error(message: LoggerMessage): void {
    const { msg, context } = this.formatMessage(message)
    this.logger.error(context, msg)
  }

  fatal(message: LoggerMessage): void {
    const { msg, context } = this.formatMessage(message)
    this.logger.fatal(context, msg)
  }

  getPinoInstance(): Logger {
    return this.logger
  }
}
