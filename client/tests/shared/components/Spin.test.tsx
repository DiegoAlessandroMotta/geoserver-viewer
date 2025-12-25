import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Spin } from '@/shared/components/Spin'

describe('Spin', () => {
  it('applies size and thickness classes and label', () => {
    render(<Spin size="sm" thickness="lg" label="Loading" />)
    const el = screen.getByRole('status')
    expect(el).toHaveAttribute('aria-label', 'Loading')
    expect(el.className).toContain('size-6')
    expect(el.className).toContain('border-4')
  })

  it('supports numeric sizes', () => {
    render(<Spin size={42} />)
    const el = screen.getByRole('status')
    expect(el.className).toContain('size-[42px]')
  })
})