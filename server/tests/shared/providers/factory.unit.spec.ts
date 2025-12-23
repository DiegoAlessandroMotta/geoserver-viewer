import { describe, it, expect } from 'vitest'
import { ProviderFactory } from '@/shared/providers/factory'
import { NullLogger } from '@/shared/services/logger/null.logger'
import { PinoLogger } from '@/shared/services/logger/pino.logger'
import { serverConfig } from '@/shared/config'

describe('ProviderFactory', () => {
  it('returns NullLogger when serverConfig.isTesting is true', () => {
    const original = serverConfig.isTesting
    serverConfig.isTesting = true

    const logger = ProviderFactory.getLogger()
    expect(logger).toBeInstanceOf(NullLogger)

    serverConfig.isTesting = original
  })

  it('returns PinoLogger when not testing', () => {
    const original = serverConfig.isTesting
    serverConfig.isTesting = false

    const logger = ProviderFactory.getLogger()
    expect(logger).toBeInstanceOf(PinoLogger)

    serverConfig.isTesting = original
  })
})
