import React from 'react'
import { cn } from '../lib/utils'

export type SpinSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number

export interface SpinProps {
  size?: SpinSize
  thickness?: 'sm' | 'md' | 'lg'
  className?: string
  label?: string
}

const sizeMap: Record<Exclude<SpinSize, number>, string> = {
  xs: 'size-4',
  sm: 'size-6',
  md: 'size-8',
  lg: 'size-10',
  xl: 'size-12',
}

const thicknessMap: Record<NonNullable<SpinProps['thickness']>, string> = {
  sm: 'border-2',
  md: 'border-3',
  lg: 'border-4',
}

export const Spin: React.FC<SpinProps> = ({
  size = 'md',
  thickness = 'md',
  className,
  label = 'Cargando...',
}) => {
  const sizeClass =
    typeof size === 'number' ? `size-[${size}px]` : sizeMap[size]

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={label}
      className={cn(
        'rounded-full animate-spin border-blue-400',
        sizeClass,
        thicknessMap[thickness],
        className,
        'border-t-transparent',
      )}
    >
      <span className="sr-only">{label}</span>
    </div>
  )
}
