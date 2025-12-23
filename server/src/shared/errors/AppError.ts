import { AppErrorResponse } from '../interfaces/app-error-response.interface'

interface AppErrorArgs {
  message: string
  statusCode: number
  errorCode: string
  previous?: Error
}

export class AppError extends Error {
  public readonly message: string
  public readonly statusCode: number
  public readonly errorCode: string
  public readonly previous?: Error

  constructor(args: AppErrorArgs) {
    const { message, statusCode, errorCode, previous } = args

    super(message)
    this.message = message
    this.statusCode = statusCode
    this.errorCode = errorCode
    this.previous = previous

    Object.setPrototypeOf(this, AppError.prototype)

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor)
    }
  }

  public toResponse(): AppErrorResponse {
    return {
      message: this.message,
      statusCode: this.statusCode,
      errorCode: this.errorCode,
    }
  }

  public toJSON(): Record<string, any> {
    return {
      message: this.message,
      statusCode: this.statusCode,
      errorCode: this.errorCode,
      previousError: this.previous
        ? {
            message: this.previous.message,
            stack: this.previous.stack,
          }
        : undefined,
    }
  }

  public toString(): string {
    let errorString = `[${this.errorCode}] (${this.statusCode}) ${this.message}`

    if (this.previous != null) {
      errorString += ` - Previous ${this.previous.message}`
    }

    return errorString
  }
}
