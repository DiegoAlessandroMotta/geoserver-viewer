import { Request, Response, NextFunction } from 'express'
import { ILogger } from '../interfaces/logger.interface'
import { AppError } from '../errors/AppError'
import { AppErrorResponse } from '../interfaces/app-error-response.interface'
import { errorCodesEnum } from '../enums/error-codes.enum'

export class ErrorHandlerMiddleware {
  constructor(private readonly logger: ILogger) {}

  handle = (err: Error, req: Request, res: Response, _next: NextFunction) => {
    this.logger.error(err)

    if (err instanceof AppError) {
      return res.status(err.statusCode).json(err.toResponse())
    }

    const errorResponse: AppErrorResponse = {
      message: 'Internal server error',
      statusCode: 500,
      errorCode: errorCodesEnum.INTERNAL_SERVER_ERROR,
    }

    res.status(errorResponse.statusCode).json(errorResponse)
  }
}
