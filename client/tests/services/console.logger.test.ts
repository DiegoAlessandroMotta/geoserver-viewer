import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { ConsoleLogger } from '@/shared/services/logger/console.logger'
import { appConfig } from '@/shared/config'

describe('ConsoleLogger', () => {
  let spyDebug: any
  let spyInfo: any
  let spyWarn: any
  let spyError: any

  beforeEach(() => {
    spyDebug = vi.spyOn(console, 'debug').mockImplementation(() => {})
    spyInfo = vi.spyOn(console, 'info').mockImplementation(() => {})
    spyWarn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    spyError = vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
    ;(appConfig as any).isProduction = false
  })

  it('logs debug/info/warn/error in non-production', () => {
    ;(appConfig as any).isProduction = false
    const logger = new ConsoleLogger()

    logger.debug({ msg: 'd' })
    logger.info({ msg: 'i' })
    logger.warn({ msg: 'w' })
    logger.error({ msg: 'e' })

    expect(spyDebug).toHaveBeenCalled()
    expect(spyInfo).toHaveBeenCalled()
    expect(spyWarn).toHaveBeenCalled()
    expect(spyError).toHaveBeenCalled()
  })

  it('only logs fatal in production', () => {
    ;(appConfig as any).isProduction = true
    const logger = new ConsoleLogger()

    logger.debug({ msg: 'd' })
    logger.info({ msg: 'i' })
    logger.warn({ msg: 'w' })
    logger.error({ msg: 'e' })
    logger.fatal({ msg: 'f' })

    expect(spyDebug).not.toHaveBeenCalled()
    expect(spyInfo).not.toHaveBeenCalled()
    expect(spyWarn).not.toHaveBeenCalled()
    expect(spyError).toHaveBeenCalledTimes(1) // fatal uses console.error
  })
})
