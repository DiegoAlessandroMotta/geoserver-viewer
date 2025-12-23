import { describe, it, expect } from 'vitest'
import { NullLogger } from '@/shared/services/logger/null.logger'

describe('NullLogger', () => {
  it('methods are no-ops and do not throw', () => {
    const l = new NullLogger()
    expect(() => l.debug('x')).not.toThrow()
    expect(() => l.info('x')).not.toThrow()
    expect(() => l.warn('x')).not.toThrow()
    expect(() => l.error('x')).not.toThrow()
    expect(() => l.fatal('x')).not.toThrow()
  })
})
