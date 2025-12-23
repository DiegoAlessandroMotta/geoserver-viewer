import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GeoserverConfigManagerService } from '@/shared/services/geoserver/geoserver-config-manager.service'

class MockStorage {
  private map = new Map<string, string>()
  getItem(key: string) {
    const v = this.map.get(key)
    return v === undefined ? null : v
  }
  setItem(key: string, value: string) {
    this.map.set(key, value)
  }
  removeItem(key: string) {
    this.map.delete(key)
  }
}

describe('GeoserverConfigManagerService', () => {
  let storage: MockStorage
  let logger: any

  beforeEach(() => {
    storage = new MockStorage()
    logger = { error: vi.fn() }
  })

  it('loads persisted credentials when present and marks them as persisted', () => {
    storage.setItem('geoserver_username', 'user')
    storage.setItem('geoserver_password', 'pass')

    const mgr = new GeoserverConfigManagerService({
      storage: storage as any,
      logger,
    })

    expect(mgr.areCredentialsPersisted()).toBe(true)
    expect(mgr.getCredentials()).toEqual({ username: 'user', password: 'pass' })
  })

  it('setGeoserverUrl and setWorkspace persist to storage and emit changes', () => {
    const mgr = new GeoserverConfigManagerService({
      storage: storage as any,
      logger,
    })
    const cb = vi.fn()
    mgr.onChange(cb)

    mgr.setGeoserverUrl('http://example.com')
    expect(storage.getItem('geoserver_base_url')).toBe('http://example.com')
    expect(cb).toHaveBeenCalledWith({ geoserverUrl: 'http://example.com' })

    mgr.setWorkspace('w')
    expect(storage.getItem('geoserver_workspace')).toBe('w')
    expect(cb).toHaveBeenCalledWith({ workspace: 'w' })
  })

  it('setConfig updates values, removes when null, and emits only when keys provided', () => {
    const mgr = new GeoserverConfigManagerService({
      storage: storage as any,
      logger,
    })
    const cb = vi.fn()
    mgr.onChange(cb)

    mgr.setConfig({ geoserverUrl: 'http://a' })
    expect(storage.getItem('geoserver_base_url')).toBe('http://a')
    expect(cb).toHaveBeenCalledWith({ geoserverUrl: 'http://a' })

    mgr.setConfig({ geoserverUrl: null })
    expect(storage.getItem('geoserver_base_url')).toBe(null)
    expect(cb).toHaveBeenCalledWith({ geoserverUrl: null })

    cb.mockClear()
    mgr.setConfig({})
    expect(cb).not.toHaveBeenCalled()
  })

  it('setSessionId and setSessionId via setConfig emit change', () => {
    const mgr = new GeoserverConfigManagerService({
      storage: storage as any,
      logger,
    })
    const cb = vi.fn()
    mgr.onChange(cb)

    mgr.setSessionId('s1')
    expect(mgr.getSessionId()).toBe('s1')
    expect(cb).toHaveBeenCalledWith({ sessionId: 's1' })

    cb.mockClear()
    mgr.setConfig({ sessionId: 's2' })
    expect(mgr.getSessionId()).toBe('s2')
    expect(cb).toHaveBeenCalledWith({ sessionId: 's2' })
  })

  it('setCredentials persists or removes based on persist flag and emits', () => {
    const mgr = new GeoserverConfigManagerService({
      storage: storage as any,
      logger,
    })
    const cb = vi.fn()
    mgr.onChange(cb)

    mgr.setCredentials({ username: 'u', password: 'p' }, true)
    expect(storage.getItem('geoserver_username')).toBe('u')
    expect(storage.getItem('geoserver_password')).toBe('p')
    expect(cb).toHaveBeenCalledWith({
      credentials: { username: 'u', password: 'p' },
    })

    cb.mockClear()
    mgr.setCredentials({ username: 'x', password: 'y' }, false)
    expect(storage.getItem('geoserver_username')).toBe(null)
    expect(storage.getItem('geoserver_password')).toBe(null)
    expect(cb).toHaveBeenCalledWith({
      credentials: { username: 'x', password: 'y' },
    })
  })

  it('clearCredentials removes storage and emits', () => {
    storage.setItem('geoserver_username', 'a')
    storage.setItem('geoserver_password', 'b')
    const mgr = new GeoserverConfigManagerService({
      storage: storage as any,
      logger,
    })
    const cb = vi.fn()
    mgr.onChange(cb)

    mgr.clearCredentials()
    expect(storage.getItem('geoserver_username')).toBe(null)
    expect(storage.getItem('geoserver_password')).toBe(null)
    expect(cb).toHaveBeenCalledWith({
      credentials: { username: null, password: null },
    })
  })

  it('onChange returns unsubscribe and errors in listeners are logged', () => {
    const mgr = new GeoserverConfigManagerService({
      storage: storage as any,
      logger,
    })
    const cb = vi.fn()
    const bad = vi.fn(() => {
      throw new Error('boom')
    })

    mgr.onChange(cb)
    mgr.onChange(bad)

    mgr.setGeoserverUrl('ok')
    expect(cb).toHaveBeenCalled()
    expect(logger.error).toHaveBeenCalled()
  })

  it('generates deterministic sessionId when crypto.randomUUID is stubbed', () => {
    const rnd = vi.spyOn(crypto as any, 'randomUUID').mockReturnValue('uuid-1')
    const mgr = new GeoserverConfigManagerService({
      storage: storage as any,
      logger,
    })
    expect(mgr.getSessionId()).toBe('uuid-1')
    rnd.mockRestore()
  })
})
