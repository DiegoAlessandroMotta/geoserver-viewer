import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { LayerItem } from '@/features/sidebar/components/LayerItem'

describe('LayerItem', () => {
  beforeEach(() => vi.restoreAllMocks())

  it('calls onToggle when checkbox or name clicked and expands to show details', () => {
    const onToggle = vi.fn()
    const onZoom = vi.fn()
    const layer: any = {
      name: 'ns:l1',
      short: 'l1',
      enabled: false,
      workspace: 'ws',
      store: 'st',
      crs: ['EPSG:4326'],
      color: '#fff',
      minZoom: 2,
      maxZoom: 10,
    }

    render(
      <LayerItem layer={layer} onToggle={onToggle} onZoomChange={onZoom} />,
    )

    const input = screen.getByRole('checkbox')
    fireEvent.click(input)
    expect(onToggle).toHaveBeenCalled()

    const name = screen.getByText('l1')
    fireEvent.click(name)
    expect(onToggle).toHaveBeenCalledTimes(2)

    const expBtn = screen.getByRole('button')
    fireEvent.click(expBtn)

    expect(screen.getByText(/Workspace:/)).toBeTruthy()
    expect(screen.getByText(/Store:/)).toBeTruthy()
    expect(screen.getByText(/CRS:/)).toBeTruthy()
  })

  it('debounces zoom changes and calls onZoomChange', async () => {
    vi.useFakeTimers()
    const onZoom = vi.fn()
    const layer: any = {
      name: 'ns:l2',
      short: 'l2',
      enabled: true,
      color: '#000',
      minZoom: 1,
      maxZoom: 20,
    }

    render(<LayerItem layer={layer} onToggle={vi.fn()} onZoomChange={onZoom} />)

    const expBtn = screen.getByRole('button')
    fireEvent.click(expBtn)

    const minInput = screen.getAllByRole('spinbutton')[0]
    const maxInput = screen.getAllByRole('spinbutton')[1]

    fireEvent.change(minInput, { target: { value: '5' } })
    fireEvent.change(maxInput, { target: { value: '6' } })

    await act(async () => {
      vi.advanceTimersByTime(350)
    })

    expect(onZoom).toHaveBeenCalledWith(5, 6)

    vi.useRealTimers()
  })

  it('resets min/max when layer name changes', () => {
    const onZoom = vi.fn()
    const layer1: any = { name: 'a', short: 'a', minZoom: 2, maxZoom: 5, color: '#000' }
    const { rerender } = render(
      <LayerItem layer={layer1} onToggle={vi.fn()} onZoomChange={onZoom} />,
    )

    const expBtn = screen.getByRole('button')
    fireEvent.click(expBtn)

    const inputs = screen.getAllByRole('spinbutton') as HTMLInputElement[]
    expect(inputs[0].value).toBe('2')
    expect(inputs[1].value).toBe('5')

    const layer2: any = { name: 'b', short: 'b', minZoom: 8, maxZoom: 12, color: '#000' }
    rerender(<LayerItem layer={layer2} onToggle={vi.fn()} onZoomChange={onZoom} />)

    const inputs2 = screen.getAllByRole('spinbutton') as HTMLInputElement[]
    expect(inputs2[0].value).toBe('8')
    expect(inputs2[1].value).toBe('12')
  })

  it('clamps min and adjusts max when min > max', async () => {
    vi.useFakeTimers()
    const onZoom = vi.fn()
    const layer: any = { name: 'c', short: 'c', minZoom: 1, maxZoom: 10, color: '#000' }
    render(<LayerItem layer={layer} onToggle={vi.fn()} onZoomChange={onZoom} />)

    const expBtn = screen.getByRole('button')
    fireEvent.click(expBtn)

    const minInput = screen.getAllByRole('spinbutton')[0]
    fireEvent.change(minInput, { target: { value: '12' } })

    await act(async () => {
      vi.advanceTimersByTime(350)
    })

    expect(onZoom).toHaveBeenCalledWith(12, 12)

    vi.useRealTimers()
  })

  it('clamps max and adjusts min when max < min', async () => {
    vi.useFakeTimers()
    const onZoom = vi.fn()
    const layer: any = { name: 'd', short: 'd', minZoom: 5, maxZoom: 20, color: '#000' }
    render(<LayerItem layer={layer} onToggle={vi.fn()} onZoomChange={onZoom} />)

    const expBtn = screen.getByRole('button')
    fireEvent.click(expBtn)

    const maxInput = screen.getAllByRole('spinbutton')[1]
    fireEvent.change(maxInput, { target: { value: '2' } })

    await act(async () => {
      vi.advanceTimersByTime(350)
    })

    expect(onZoom).toHaveBeenCalledWith(2, 2)

    vi.useRealTimers()
  })
})
