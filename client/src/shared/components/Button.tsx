import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '../lib/utils'

type ButtonVariant = 'primary' | 'outline' | 'danger' | 'ghost'
type ButtonSize = 'sm' | 'md' | 'lg'

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  variant?: ButtonVariant
  size?: ButtonSize
  fullWidth?: boolean
}

export function Button({
  children,
  variant = 'outline',
  size = 'md',
  fullWidth = false,
  className = '',
  type = 'button',
  disabled = false,
  ...rest
}: Props) {
  const sizes: Record<ButtonSize, string> = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-2 text-sm',
    lg: 'px-4 py-2 text-base',
  }

  const variants: Record<ButtonVariant, string> = {
    primary:
      'font-medium border bg-blue-600 text-white not-disabled:hover:bg-blue-700 border-transparent',
    outline:
      'font-medium border bg-blue-50 border-blue-600 text-blue-600 not-disabled:hover:bg-blue-100',
    danger:
      'font-medium border bg-red-50 border-red-600 text-red-600 not-disabled:hover:bg-red-100',
    ghost:
      'font-medium border bg-transparent text-blue-600 not-disabled:hover:bg-blue-50 border-transparent',
  }

  const width = fullWidth ? 'w-full' : ''

  return (
    <button
      type={type}
      className={cn(
        'inline-flex items-center justify-center rounded disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed',
        sizes[size],
        variants[variant],
        width,
        className,
      )}
      disabled={disabled}
      {...rest}
    >
      {children}
    </button>
  )
}
