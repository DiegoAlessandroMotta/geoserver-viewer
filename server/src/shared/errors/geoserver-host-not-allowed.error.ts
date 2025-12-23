import { AppError } from './AppError'
import { errorCodesEnum } from '../enums/error-codes.enum'

export class GeoServerHostNotAllowedError extends AppError {
  constructor(host: string, previous?: Error) {
    super({
      message: `GeoServer host not allowed: ${host}`,
      statusCode: 403,
      errorCode: errorCodesEnum.GEOSERVER_HOST_NOT_ALLOWED,
      previous,
    })

    Object.setPrototypeOf(this, GeoServerHostNotAllowedError.prototype)
  }
}
