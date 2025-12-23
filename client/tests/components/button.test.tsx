import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from '@/shared/components/Button'

describe('Button component', () => {
  it('renders children and applies classes for variant/size', () => {
    render(<Button variant="primary" size="lg">Click me</Button>)
    const btn = screen.getByRole('button', { name: /click me/i })
    expect(btn).toBeInTheDocument()
    expect(btn).toHaveClass('bg-blue-600')
    expect(btn).toHaveClass('px-4')
  })

  it('applies fullWidth and custom className and disabled state', async () => {
    const handle = vi.fn()
    render(
      <Button fullWidth className="my-custom" disabled onClick={handle}>
        Hola
      </Button>,
    )

    const btn = screen.getByRole('button', { name: /hola/i })
    expect(btn).toHaveClass('w-full')
    expect(btn).toHaveClass('my-custom')
    expect(btn).toBeDisabled()

    fireEvent.click(btn)
    expect(handle).not.toHaveBeenCalled()
  })
})
