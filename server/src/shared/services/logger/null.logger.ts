import type {
  ILogger,
  LoggerMessage,
} from '@/shared/interfaces/logger.interface'

export class NullLogger implements ILogger {
  debug(_message: LoggerMessage): void {}
  info(_message: LoggerMessage): void {}
  warn(_message: LoggerMessage): void {}
  error(_message: LoggerMessage): void {}
  fatal(_message: LoggerMessage): void {}
}
