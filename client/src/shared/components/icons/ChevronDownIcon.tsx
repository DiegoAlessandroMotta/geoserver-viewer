import { cn } from '@/shared/lib/utils'
import { forwardRef } from 'react'

export interface ChevronDownIconProps extends React.SVGProps<SVGSVGElement> {
  strokeWidth?: number | string
  ariaLabel?: string
}

export const ChevronDownIcon = forwardRef<SVGSVGElement, ChevronDownIconProps>(
  ({ strokeWidth = 1.5, ariaLabel, className, ...rest }, ref) => {
    const ariaProps = ariaLabel
      ? { 'aria-label': ariaLabel, role: 'img' as const }
      : { 'aria-hidden': true }

    return (
      <svg
        ref={ref}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={cn('size-6', className)}
        {...ariaProps}
        {...rest}
      >
        <path d="m19.5 8.25-7.5 7.5-7.5-7.5" />
      </svg>
    )
  },
)
