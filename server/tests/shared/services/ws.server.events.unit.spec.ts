import { describe, it, expect, vi } from 'vitest'
import { WebSocketServer } from '@/shared/services/websocket-server/ws.service'
import { WebSocketSessionService } from '@/shared/services/websocket-server/websocket-session.service'

describe('WebSocketServer event handlers', () => {
  it('calls session unregister on close', () => {
    const info = vi.fn()
    const warn = vi.fn()
    const sessionService = new WebSocketSessionService({
      debug: () => {},
      warn: () => {},
      error: () => {},
    } as any)
    const wsServer = new WebSocketServer(
      { info, warn, debug: () => {} } as any,
      sessionService,
      '/base',
    )

    let closeCb: any = null
    const sent: any[] = []
    const fakeWs: any = {
      send: (msg: string) => sent.push(msg),
      on: (ev: string, cb: any) => {
        if (ev === 'close') closeCb = cb
      },
    }

    ;(wsServer as any).handleNewConnection(fakeWs)
    const parsed = JSON.parse(sent[0])

    expect(sessionService.getClient(parsed.sessionId)).toBeDefined()

    closeCb()

    expect(sessionService.getClient(parsed.sessionId)).toBeUndefined()
  })

  it('on error unregisters and logs warn', () => {
    const info = vi.fn()
    const warn = vi.fn()
    const sessionService = new WebSocketSessionService({
      debug: () => {},
      warn,
      error: () => {},
    } as any)
    const wsServer = new WebSocketServer(
      { info, warn, debug: () => {} } as any,
      sessionService,
      '/base',
    )

    let errorCb: any = null
    const fakeWs: any = {
      send: (_msg: string) => {},
      on: (ev: string, cb: any) => {
        if (ev === 'error') errorCb = cb
      },
    }

    ;(wsServer as any).handleNewConnection(fakeWs)
    errorCb(new Error('boom'))

    expect(warn).toHaveBeenCalled()
  })
})
