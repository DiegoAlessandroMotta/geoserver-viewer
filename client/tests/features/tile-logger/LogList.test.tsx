import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { LogList } from '@/features/tile-logger/components/LogList'

const baseCtx = { logs: [] }

vi.mock('@/features/tile-logger/components/LogItem', () => ({
  LogItem: (props: any) => (
    <div data-testid={`li-${props.item.id}`}>{props.item.id}</div>
  ),
}))

import * as tileHook from '@/shared/context/tile-logger/useTileLogger'
vi.mock('@/shared/context/tile-logger/useTileLogger', () => ({
  useTileLoggerContext: () => baseCtx,
}))

describe('LogList', () => {
  beforeEach(() => vi.restoreAllMocks())

  it('shows empty message when no logs', () => {
    vi.spyOn(tileHook, 'useTileLoggerContext').mockReturnValue({
      logs: [],
    } as any)
    render(<LogList />)
    expect(screen.getByText(/No hay registros aún/i)).toBeTruthy()
  })

  it('renders LogItem elements when logs exist', () => {
    vi.spyOn(tileHook, 'useTileLoggerContext').mockReturnValue({
      logs: [{ id: 'a' }, { id: 'b' }],
    } as any)
    render(<LogList />)
    expect(screen.getByTestId('li-a')).toBeTruthy()
    expect(screen.getByTestId('li-b')).toBeTruthy()
  })
})
