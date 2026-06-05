'use client'

import { clsx } from 'clsx'

interface PillButtonProps {
  active?: boolean
  onClick?: () => void
  children: React.ReactNode
  className?: string
  size?: 'sm' | 'md' | 'lg'
  type?: 'button' | 'submit'
  disabled?: boolean
}

export default function PillButton({
  active = false,
  onClick,
  children,
  className,
  size = 'md',
  type = 'button',
  disabled,
}: PillButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={clsx(
        'cursor-pointer border transition-all duration-150 ease-in-out',
        'font-medium tracking-[-0.028px] whitespace-nowrap',
        size === 'sm' && 'rounded-[4px] px-3 py-1.5 text-xs',
        size === 'md' && 'rounded-[4px] px-5 py-2 text-sm',
        size === 'lg' && 'rounded-[4px] px-5 py-3 text-sm',
        active
          ? 'border-ink bg-ink text-paper'
          : 'border-hairline bg-paper text-graphite hover:border-graphite',
        !active && size === 'lg' && 'active:scale-[0.97]',
        disabled && 'cursor-not-allowed opacity-50',
        className
      )}
    >
      {children}
    </button>
  )
}
