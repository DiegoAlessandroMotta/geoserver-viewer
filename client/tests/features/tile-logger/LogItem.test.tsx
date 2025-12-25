import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { LogItem } from '@/features/tile-logger/components/LogItem'

const makeItem = (overrides: any = {}) => ({
  id: overrides.id ?? '1',
  receivedAt: overrides.receivedAt ?? Date.now(),
  target:
    overrides.target ?? 'https://example.com/ws:layer@v/tiles/10/20/30.pbf',
  cacheResult: overrides.cacheResult ?? null,
  durationMs: overrides.durationMs,
})

describe('LogItem', () => {
  it('parses workspace/layer and coords, shows cache tag and green duration', () => {
    const item = makeItem({ cacheResult: 'HIT', durationMs: 1500 })
    render(<LogItem item={item as any} />)

    expect(screen.getByText(/cache/i)).toBeTruthy()
    expect(screen.getByText(/1500 ms/)).toBeTruthy()
    expect(screen.getByText(/Tile:/)).toBeTruthy()
    expect(screen.getByText(/layer \(10,20,30\)/)).toBeTruthy()
    expect(screen.getByText(/1500 ms/).className).toMatch(/green/)
  })

  it('shows yellow and red for different durations and no-cache label', () => {
    const itY = makeItem({ cacheResult: null, durationMs: 3000 })
    const itR = makeItem({ id: 'r', cacheResult: null, durationMs: 6000 })

    const { rerender } = render(<LogItem item={itY as any} />)
    expect(screen.getByText(/3000 ms/).className).toMatch(/yellow/)

    rerender(<LogItem item={itR as any} />)
    expect(screen.getByText(/6000 ms/).className).toMatch(/red/)

    // no cache label
    expect(screen.getByText(/no cache/i)).toBeTruthy()
  })

  it('handles malformed target gracefully', () => {
    const bad = makeItem({
      target: 'not-a-url',
      cacheResult: null,
      durationMs: undefined,
    })
    render(<LogItem item={bad as any} />)

    expect(screen.getByText(/Tile:/)).toBeTruthy()
    expect(screen.queryByText(/ms$/)).toBeNull()
  })
})
