import { AppError } from './AppError'
import { errorCodesEnum } from '../enums/error-codes.enum'

export class InvalidGeoServerUrlError extends AppError {
  constructor(value: string | undefined, previous?: Error) {
    super({
      message: `Invalid GeoServer URL: ${value ?? 'undefined'}`,
      statusCode: 400,
      errorCode: errorCodesEnum.INVALID_GEOSERVER_URL,
      previous,
    })

    Object.setPrototypeOf(this, InvalidGeoServerUrlError.prototype)
  }
}
