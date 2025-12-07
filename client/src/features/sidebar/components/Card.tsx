import { cn } from '@/shared/lib/utils'
import { forwardRef } from 'react'

import type { ReactNode, HTMLAttributes } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode
  className?: string
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ children, className = '', ...rest }, ref) => {
    return (
      <section
        ref={ref}
        className={cn(
          'bg-white shadow rounded-lg p-2 border-2 border-blue-400',
          className,
        )}
        {...rest}
      >
        {children}
      </section>
    )
  },
)
