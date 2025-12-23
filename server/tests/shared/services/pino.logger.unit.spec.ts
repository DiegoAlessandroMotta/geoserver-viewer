import { describe, it, expect } from 'vitest'
import { PinoLogger } from '@/shared/services/logger/pino.logger'

describe('PinoLogger', () => {
  it('constructs and exposes pino instance', () => {
    const logger = new PinoLogger()
    const p = logger.getPinoInstance()
    expect(p).toBeDefined()
    expect(typeof p.info).toBe('function')
  })

  it('accepts messages and does not throw', () => {
    const logger = new PinoLogger()
    expect(() => logger.info('hello')).not.toThrow()
    expect(() => logger.debug({ message: 'm', context: { a: 1 } })).not.toThrow()
    expect(() => logger.error('err')).not.toThrow()
  })
})