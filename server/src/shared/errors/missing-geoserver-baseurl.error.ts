import { AppError } from './AppError'
import { errorCodesEnum } from '../enums/error-codes.enum'

export class MissingGeoServerBaseUrlError extends AppError {
  constructor(previous?: Error) {
    super({
      message: 'Missing X-GeoServer-BaseUrl header',
      statusCode: 400,
      errorCode: errorCodesEnum.MISSING_GEOSERVER_BASEURL,
      previous,
    })

    Object.setPrototypeOf(this, MissingGeoServerBaseUrlError.prototype)
  }
}
