import { describe, it, expect, vi } from 'vitest'
import { WebSocketSessionService } from '@/shared/services/websocket-server/websocket-session.service'

describe('WebSocketSessionService', () => {
  it('registers and unregisters clients', () => {
    const logger: any = { debug: vi.fn(), warn: vi.fn(), error: vi.fn() }
    const svc = new WebSocketSessionService(logger)

    const fakeWs: any = { readyState: 1, send: vi.fn() }
    svc.registerClient('s1', fakeWs)
    expect(svc.getClient('s1')).toBe(fakeWs)
    expect(svc.isClientConnected('s1')).toBe(true)

    svc.unregisterClient('s1')
    expect(svc.getClient('s1')).toBeUndefined()
    expect(svc.isClientConnected('s1')).toBe(false)
  })

  it('sends message when client connected and handles send errors', () => {
    const warn = vi.fn()
    const logger: any = { debug: vi.fn(), warn, error: vi.fn() }
    const svc = new WebSocketSessionService(logger)

    const goodWs: any = { readyState: 1, send: vi.fn() }
    svc.registerClient('ok', goodWs)
    svc.sendToClient('ok', { type: 'probe' } as any)
    expect(goodWs.send).toHaveBeenCalled()

    const badWs: any = {
      readyState: 1,
      send: vi.fn(() => {
        throw new Error('boom')
      }),
    }
    svc.registerClient('bad', badWs)
    svc.sendToClient('bad', { type: 'probe' } as any)
    expect(warn).toHaveBeenCalled()
  })
})
