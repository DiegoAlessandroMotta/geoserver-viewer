import { describe, it, expect } from 'vitest'
import {
  cn,
  generateSHA1HexHash,
  randomColorFromString,
  hslToHex,
} from '@/shared/lib/utils'

describe('utils', () => {
  it('cn merges classes', () => {
    expect(cn('a', 'b', { c: true, d: false })).toContain('a')
    expect(cn('a', 'b')).toContain('b')
  })

  it('generateSHA1HexHash returns consistent hash', async () => {
    const h = await generateSHA1HexHash('hello')
    expect(h).toMatch(/^[0-9a-f]{40}$/)
  })

  it('hslToHex returns expected hex for known values', () => {
    expect(hslToHex(0, 100, 50)).toBe('#ff0000')
    expect(hslToHex(120, 100, 50)).toBe('#00ff00')
  })

  it('randomColorFromString returns deterministic hex and truncates long input', () => {
    const a = randomColorFromString('short')
    const b = randomColorFromString('short')
    expect(a).toBe(b)

    const long = 'x'.repeat(100)
    const c = randomColorFromString(long)
    const d = randomColorFromString(long)
    expect(c).toBe(d)
    expect(typeof c).toBe('string')
    expect(c).toMatch(/^#[0-9a-f]{6}$/)
  })
})
