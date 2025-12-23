import { describe, it, expect, vi } from 'vitest'
import { ConcurrencyExecutor } from '@/shared/services/concurrency.executor'

describe('ConcurrencyExecutor', () => {
  it('processes items and retains order', async () => {
    const exec = new ConcurrencyExecutor<number, number>(2)
    const items = [1, 2, 3, 4]

    const result = await exec.run(items, async (n) => {
      await new Promise((r) => setTimeout(r, 10 * (5 - n)))
      return n * 2
    })

    expect(result).toEqual([2, 4, 6, 8])
  })

  it('returns null for items whose executor throws and logs error', async () => {
    const logger = { error: vi.fn() }
    const exec = new ConcurrencyExecutor<number, number>(3, logger as any)
    const items = [1, 2, 3]

    const result = await exec.run(items, async (n) => {
      if (n === 2) throw new Error('boom')
      return n + 1
    })

    expect(result).toEqual([2, null, 4])
    expect(logger.error as any).toHaveBeenCalled()
  })
})
