import { describe, it, expect, vi, afterEach } from 'vitest'
import { WebsocketClient } from '@/shared/services/websocket-client.service'

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
    MockWS.lastInstance = this
  }
}

describe('WebsocketClient', () => {
  afterEach(() => {
    MockWS.lastInstance = null
    vi.restoreAllMocks()
  })

  it('uses proxyUrl and basePath to build ws url (protocol switched)', () => {
    const client = new WebsocketClient({
      WSClass: MockWS,
      config: {
        proxyUrl: 'http://proxy.example.com',
        basePath: '/base',
      },
    } as any)
    client.connect()

    const inst = MockWS.lastInstance
    expect(inst).toBeTruthy()
    expect(inst.url).toBe('ws://proxy.example.com/base/ws')
  })

  it('falls back to provided location when proxyUrl is invalid', () => {
    const client = new WebsocketClient({
      WSClass: MockWS,
      config: { proxyUrl: 'not-a-valid-url', basePath: '/app' } as any,
      location: {
        protocol: 'http:',
        host: 'example.com',
        origin: 'http://example.com',
      },
    } as any)
    client.connect()

    const inst = (MockWS as any).lastInstance
    const expected = `ws://example.com/app/ws`.replace(/\/+/g, '/')
    expect(inst.url).toBe(expected)
  })

  it('forwards messages to registered listeners and ignores listener errors', () => {
    const client = new WebsocketClient({
      WSClass: MockWS as any,
      config: { proxyUrl: '', basePath: '' } as any,
    } as any)
    client.connect()

    const good = vi.fn()
    const bad = vi.fn(() => {
      throw new Error('boom')
    })

    client.onMessage(bad)
    client.onMessage(good)

    const inst = MockWS.lastInstance
    inst.onmessage?.({ data: JSON.stringify({ type: 'ping', hello: 1 }) })

    expect(good).toHaveBeenCalledWith({ type: 'ping', hello: 1 })
  })

  it('onMessage returns unsubscribe function', () => {
    const client = new WebsocketClient({
      WSClass: MockWS as any,
      config: { proxyUrl: '', basePath: '' } as any,
    } as any)
    client.connect()

    const listener = vi.fn()
    const off = client.onMessage(listener)
    const inst = MockWS.lastInstance

    inst.onmessage?.({ data: JSON.stringify({ type: 'ping', hello: 1 }) })
    expect(listener).toHaveBeenCalledTimes(1)

    off()
    inst.onmessage?.({ data: JSON.stringify({ type: 'ping', hello: 2 }) })
    expect(listener).toHaveBeenCalledTimes(1)
  })

  it('handles session-id and delegates to configManager and logs', () => {
    const configManager = { setSessionId: vi.fn() }
    const logger = { debug: vi.fn(), warn: vi.fn() }
    const client = new WebsocketClient({
      configManager: configManager,
      logger: logger,
      WSClass: MockWS,
      config: { proxyUrl: '', basePath: '' } as any,
    } as any)
    client.connect()

    const inst = MockWS.lastInstance
    inst.onmessage?.({
      data: JSON.stringify({ type: 'session-id', sessionId: 'abc123' }),
    })

    expect(configManager.setSessionId).toHaveBeenCalledWith('abc123')
    expect(logger.debug).toHaveBeenCalled()
  })

  it('send serializes and sends when socket open', () => {
    const client = new WebsocketClient({
      WSClass: MockWS as any,
      config: { proxyUrl: '', basePath: '' } as any,
    } as any)
    client.connect()

    const inst = MockWS.lastInstance
    client.send({ type: 'hello' })

    expect(inst.send).toHaveBeenCalledWith(JSON.stringify({ type: 'hello' }))
  })

  it('does not send when socket is not open', () => {
    const client = new WebsocketClient({
      WSClass: MockWS,
      config: { proxyUrl: '', basePath: '' } as any,
    } as any)
    client.connect()

    const inst = MockWS.lastInstance
    inst.readyState = 0
    client.send({ type: 'hello' })

    expect(inst.send).not.toHaveBeenCalled()
  })

  it('logs warning for invalid JSON messages', () => {
    const logger = { debug: vi.fn(), warn: vi.fn() }
    const client = new WebsocketClient({
      logger: logger,
      WSClass: MockWS,
      config: { proxyUrl: '', basePath: '' } as any,
    } as any)
    client.connect()

    const inst = MockWS.lastInstance
    inst.onmessage?.({ data: 'not-json' })

    expect(logger.warn).toHaveBeenCalled()
  })

  it('schedules reconnect on connect failure and respects attempts', () => {
    vi.useFakeTimers()
    const logger = { debug: vi.fn(), warn: vi.fn() }

    class ThrowingWS {
      constructor() {
        throw new Error('nope')
      }
    }

    const client: any = new WebsocketClient({
      WSClass: ThrowingWS as any,
      logger: logger as any,
      config: { proxyUrl: '', basePath: '' } as any,
    } as any)
    client.connect()

    expect(logger.warn).toHaveBeenCalled()
    vi.advanceTimersByTime(1000)
    expect(client.reconnectAttempts).toBeGreaterThanOrEqual(1)
    vi.useRealTimers()
  })

  it('does not schedule reconnect when max attempts reached', () => {
    const logger = { debug: vi.fn(), warn: vi.fn() }
    const client: any = new WebsocketClient({
      WSClass: MockWS as any,
      logger: logger as any,
      config: { proxyUrl: '', basePath: '' } as any,
    } as any)

    client.reconnectAttempts = 10
    ;(client as any).scheduleReconnect()

    expect(logger.warn).toHaveBeenCalledWith({
      msg: 'WebsocketClient: max reconnect attempts reached',
    })
  })

  it('disconnect closes socket and prevents reconnect on close', () => {
    const logger = { debug: vi.fn(), warn: vi.fn() }
    const client: any = new WebsocketClient({
      WSClass: MockWS as any,
      logger: logger as any,
      config: { proxyUrl: '', basePath: '' } as any,
    } as any)
    client.connect()

    const inst = MockWS.lastInstance
    const schedSpy = vi.spyOn(client as any, 'scheduleReconnect')

    client.disconnect()
    expect(inst.close).toHaveBeenCalled()

    inst.onclose?.({ code: 1000, reason: 'client disconnect' })
    expect(schedSpy).not.toHaveBeenCalled()
  })

  it('send warns when send throws and onerror warns', () => {
    const logger = { debug: vi.fn(), warn: vi.fn() }
    const client: any = new WebsocketClient({
      WSClass: MockWS as any,
      logger: logger as any,
      config: { proxyUrl: '', basePath: '' } as any,
    } as any)
    client.connect()

    const inst = MockWS.lastInstance
    inst.send = () => {
      throw new Error('boom')
    }

    client.send({ type: 'x' })
    expect(logger.warn).toHaveBeenCalled()

    inst.onerror?.(new Error('socket'))
    expect(logger.warn).toHaveBeenCalled()
  })

  it('handles proxy-response silently and logs generic messages', () => {
    const logger = { debug: vi.fn(), warn: vi.fn() }
    const client: any = new WebsocketClient({
      WSClass: MockWS as any,
      logger: logger as any,
      config: { proxyUrl: '', basePath: '' } as any,
    } as any)
    client.connect()

    const inst = MockWS.lastInstance
    inst.onmessage?.({
      data: JSON.stringify({ type: 'proxy-response', url: 'u' }),
    })
    expect(logger.debug as any).not.toHaveBeenCalledWith(
      expect.objectContaining({ msg: 'WebsocketClient: generic message' }),
    )

    inst.onmessage?.({ data: JSON.stringify({ type: 'other', x: 1 }) })
    expect(logger.debug as any).toHaveBeenCalledWith(
      expect.objectContaining({ msg: 'WebsocketClient: generic message' }),
    )
  })

  it('schedules reconnect with correct delay and calls connect after delay', () => {
    vi.useFakeTimers()
    const logger = { debug: vi.fn(), warn: vi.fn() }
    const client: any = new WebsocketClient({
      WSClass: MockWS as any,
      logger: logger as any,
      config: { proxyUrl: '', basePath: '' } as any,
    } as any)

    const connectSpy = vi.spyOn(client as any, 'connect')
    client.reconnectAttempts = 2
    ;(client as any).scheduleReconnect()

    const expectedDelay = Math.min(1000 * 2 ** 2, 30_000)
    expect(logger.debug).toHaveBeenCalledWith(
      expect.objectContaining({
        msg: 'WebsocketClient: reconnect scheduled',
        delay: expectedDelay,
      }),
    )

    vi.advanceTimersByTime(expectedDelay)
    expect(connectSpy).toHaveBeenCalled()
    vi.useRealTimers()
  })
})
