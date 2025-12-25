import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ChevronDownIcon } from '@/shared/components/icons/ChevronDownIcon'

describe('ChevronDownIcon', () => {
  it('is aria-hidden when no label provided', () => {
    const { container } = render(<ChevronDownIcon />)
    const svg = container.querySelector('svg')!
    expect(svg.getAttribute('aria-hidden')).toBe('true')
  })

  it('sets aria-label and role when provided', () => {
    render(<ChevronDownIcon ariaLabel="down" />)
    const svg = screen.getByRole('img')
    expect(svg).toHaveAttribute('aria-label', 'down')
  })

  it('applies strokeWidth prop', () => {
    const { container } = render(<ChevronDownIcon strokeWidth={2} />)
    const svg = container.querySelector('svg')!
    expect(svg.getAttribute('stroke-width')).toBe('2')
  })
})