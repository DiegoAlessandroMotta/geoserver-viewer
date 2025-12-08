import { cn } from '@/shared/lib/utils'
import { forwardRef } from 'react'

import type { ReactNode, HTMLAttributes } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode
  className?: string
  semiTransparent?: boolean
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ children, className = '', semiTransparent, ...rest }, ref) => {
    return (
      <section
        ref={ref}
        className={cn(
          'bg-white shadow rounded-lg border-2 border-blue-400',
          semiTransparent
            ? 'bg-white/75 backdrop-blur-sm hover:backdrop-blur-md hover:bg-white transition-[backdrop-filter,background-color] duration-300'
            : undefined,
          className,
        )}
        {...rest}
      >
        {children}
      </section>
    )
  },
)
