import { describe, it, expect } from 'vitest'
import { parseCenter, parseProxyUrl, parseBasePath } from '@/shared/config'

describe('config parsers', () => {
  it('parseCenter returns default for null/invalid', () => {
    expect(parseCenter(undefined)).toEqual({
      lat: -12.046390113132471,
      lon: -77.0427648515243,
    })
    expect(parseCenter('')).toEqual({
      lat: -12.046390113132471,
      lon: -77.0427648515243,
    })
    expect(parseCenter('abc,def')).toEqual({
      lat: -12.046390113132471,
      lon: -77.0427648515243,
    })
  })

  it('parseCenter parses valid string', () => {
    expect(parseCenter('10.5, -20.1')).toEqual({ lat: 10.5, lon: -20.1 })
  })

  it('parseBasePath normalizes paths', () => {
    expect(parseBasePath(undefined)).toBe('')
    expect(parseBasePath('')).toBe('')
    expect(parseBasePath('/')).toBe('')
    expect(parseBasePath('app')).toBe('/app')
    expect(parseBasePath('/app/')).toBe('/app')
  })

  it('parseProxyUrl handles absolute and relative paths', () => {
    const base = window.location.origin
    const defaultVal = base + '/api/proxy'

    expect(parseProxyUrl(undefined, '')).toBe(defaultVal)

    expect(parseProxyUrl('/proxy', '')).toBe(base + '/proxy')

    expect(parseProxyUrl('https://proxy.foo/v1', '')).toBe(
      'https://proxy.foo/v1',
    )

    expect(parseProxyUrl('proxy/v1', '/base')).toBe(base + '/base/proxy/v1')
  })
})
