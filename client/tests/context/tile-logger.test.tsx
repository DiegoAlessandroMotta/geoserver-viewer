import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import React from 'react'
import { render, screen, act } from '@testing-library/react'
import { TileLoggerProvider } from '@/shared/context/tile-logger/TileLoggerProvider'
import { TileLoggerContext } from '@/shared/context/tile-logger/TileLoggerContext'
import { websocketClient } from '@/shared/providers'

describe('TileLoggerProvider', () => {
  let onMessageSpy: any

  beforeEach(() => {
    onMessageSpy = vi
      .spyOn(websocketClient, 'onMessage')
      .mockImplementation((cb: any) => {
        ;(onMessageSpy as any).cb = cb
        return (() => {}) as any
      })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('adds logs when proxy-response messages arrive and respects maxLogs', () => {
    function Consumer() {
      const ctx = React.useContext(TileLoggerContext)!
      return (
        <div>
          <span data-testid="cnt">{ctx.logs.length}</span>
          <button onClick={() => ctx.clearLogs()}>clear</button>
          <button onClick={() => ctx.close()}>close</button>
          <span data-testid="visible">{String(ctx.visible)}</span>
        </div>
      )
    }

    render(
      <TileLoggerProvider maxLogs={2}>
        <Consumer />
      </TileLoggerProvider>,
    )

    act(() => {
      ;(onMessageSpy as any).cb({
        type: 'proxy-response',
        url: 'u1',
        target: 't',
        status: 200,
        cacheResult: null,
        viaProxy: false,
        durationMs: null,
        headers: {},
      })
      ;(onMessageSpy as any).cb({
        type: 'proxy-response',
        url: 'u2',
        target: 't',
        status: 200,
        cacheResult: null,
        viaProxy: false,
        durationMs: null,
        headers: {},
      })
    })

    expect(screen.getByTestId('cnt').textContent).toBe('2')

    act(() => {
      ;(onMessageSpy as any).cb({
        type: 'proxy-response',
        url: 'u3',
        target: 't',
        status: 200,
        cacheResult: null,
        viaProxy: false,
        durationMs: null,
        headers: {},
      })
    })

    expect(screen.getByTestId('cnt').textContent).toBe('2')

    act(() => screen.getByText('clear').click())
    expect(screen.getByTestId('cnt').textContent).toBe('0')

    act(() => screen.getByText('close').click())
    expect(screen.getByTestId('visible').textContent).toBe('false')
  })
})
