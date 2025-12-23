import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { WebsocketClient } from '@/shared/services/websocket-client.service'
import { appConfig } from '@/shared/config'

class MockWS {
  static OPEN = 1
  static lastInstance: any = null
  public onopen: ((ev?: any) => void) | null = null
  public onmessage: ((ev: any) => void) | null = null
  public onclose: ((ev: any) => void) | null = null
  public onerror: ((ev: any) => void) | null = null
  public readyState = MockWS.OPEN
  public url: string
  public send = vi.fn()
  public close = vi.fn()

  constructor(url: string) {
    this.url = url
    ;(MockWS as any).lastInstance = this
  }
}

describe('WebsocketClient', () => {
  let originalWS: any

  beforeEach(() => {
    originalWS = (globalThis as any).WebSocket
    ;(globalThis as any).WebSocket = MockWS
  })

  afterEach(() => {
    ;(globalThis as any).WebSocket = originalWS
    ;(appConfig as any).proxyUrl = ''
    ;(appConfig as any).basePath = ''
    vi.restoreAllMocks()
  })

  it('uses proxyUrl and basePath to build ws url (protocol switched)', () => {
    ;(appConfig as any).proxyUrl = 'http://proxy.example.com'
    ;(appConfig as any).basePath = '/base'

    const client = new WebsocketClient()
    client.connect()

    const inst = (MockWS as any).lastInstance
    expect(inst).toBeTruthy()
    expect(inst.url).toBe('ws://proxy.example.com/base/ws')
  })

  it('falls back to window.location when proxyUrl is invalid', () => {
    ;(appConfig as any).proxyUrl = 'not-a-valid-url'
    ;(appConfig as any).basePath = '/app'

    const client = new WebsocketClient()
    client.connect()

    const inst = (MockWS as any).lastInstance
    const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws'
    const expected = `${protocol}://${window.location.host}/app/ws`.replace(
      /\/+/g,
      '/',
    )
    expect(inst.url).toBe(expected)
  })

  it('forwards messages to registered listeners', () => {
    const client = new WebsocketClient()
    client.connect()

    const listener = vi.fn()
    const off = client.onMessage(listener)

    const inst = (MockWS as any).lastInstance
    inst.onmessage?.({ data: JSON.stringify({ type: 'ping', hello: 1 }) })

    expect(listener).toHaveBeenCalledWith({ type: 'ping', hello: 1 })

    // unregister and ensure not called again
    off()
    inst.onmessage?.({ data: JSON.stringify({ type: 'ping', hello: 2 }) })
    expect(listener).toHaveBeenCalledTimes(1)
  })

  it('handles session-id and delegates to configManager and logs', () => {
    const configManager = { setSessionId: vi.fn() }
    const logger = { debug: vi.fn(), warn: vi.fn() }

    const client = new WebsocketClient({
      configManager: configManager as any,
      logger: logger as any,
    })
    client.connect()

    const inst = (MockWS as any).lastInstance
    inst.onmessage?.({
      data: JSON.stringify({ type: 'session-id', sessionId: 'abc123' }),
    })

    expect(configManager.setSessionId).toHaveBeenCalledWith('abc123')
    expect(logger.debug as any).toHaveBeenCalled()
  })

  it('send serializes and sends when socket open', () => {
    const client = new WebsocketClient()
    client.connect()

    const inst = (MockWS as any).lastInstance
    client.send({ type: 'hello' })

    expect(inst.send).toHaveBeenCalledWith(JSON.stringify({ type: 'hello' }))
  })

  it('does not send when socket is not open', () => {
    const client = new WebsocketClient()
    client.connect()

    const inst = (MockWS as any).lastInstance
    inst.readyState = 0
    client.send({ type: 'hello' })

    expect(inst.send).not.toHaveBeenCalled()
  })

  it('logs warning for invalid JSON messages', () => {
    const logger = { debug: vi.fn(), warn: vi.fn() }
    const client = new WebsocketClient({ logger: logger as any })
    client.connect()

    const inst = (MockWS as any).lastInstance
    inst.onmessage?.({ data: 'not-json' })

    expect(logger.warn as any).toHaveBeenCalled()
  })
})
