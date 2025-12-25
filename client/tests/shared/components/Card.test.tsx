import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Card } from '@/shared/components/Card'

describe('Card', () => {
  it('renders children and applies semiTransparent class when true', () => {
    render(<Card semiTransparent>hello</Card>)
    const el = screen.getByText('hello')
    expect(el).toBeTruthy()
    const section = el.closest('section')!
    expect(section.className).toContain('backdrop-blur')
  })

  it('does not include semiTransparent classes when false', () => {
    render(<Card>no</Card>)
    const el = screen.getByText('no')
    const section = el.closest('section')!
    expect(section.className).not.toContain('backdrop-blur')
  })
})