interface MessageWithContext {
  message: string
  context?: Record<string, any>
}

type SimpleMessage = string

export type LoggerMessage = SimpleMessage | MessageWithContext

export interface ILogger {
  debug: (message: LoggerMessage) => void
  info: (message: LoggerMessage) => void
  warn: (message: LoggerMessage) => void
  error: (message: LoggerMessage) => void
  fatal: (message: LoggerMessage) => void
}
