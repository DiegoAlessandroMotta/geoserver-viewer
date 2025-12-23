import { PinoLogger } from '@/shared/services/logger/pino.logger'
import { NullLogger } from '@/shared/services/logger/null.logger'
import { serverConfig } from '@/shared/config'
import type { ILogger } from '@/shared/interfaces/logger.interface'

export class ProviderFactory {
  static getLogger(): ILogger {
    if (serverConfig.isTesting) {
      return new NullLogger()
    }

    return new PinoLogger()
  }
}
