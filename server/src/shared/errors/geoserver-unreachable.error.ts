import { AppError } from './AppError'
import { errorCodesEnum } from '../enums/error-codes.enum'

export class GeoServerUnreachableError extends AppError {
  constructor(message: string, previous?: Error) {
    super({
      message: message || 'GeoServer unreachable',
      statusCode: 502,
      errorCode: errorCodesEnum.GEOSERVER_UNREACHABLE,
      previous,
    })

    Object.setPrototypeOf(this, GeoServerUnreachableError.prototype)
  }
}
