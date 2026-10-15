import type { ReactNode, Ref } from 'react'

const variants = {
  primary: 'border-transparent bg-brand text-on-brand group-hover:bg-brand-hover',
  secondary: 'border-line-strong bg-surface text-brand group-hover:bg-brand-soft',
}

type PillButtonProps = {
  children: ReactNode
  onClick: () => void
  variant?: keyof typeof variants
  icon?: string
  hiddenText?: string
  ref?: Ref<HTMLButtonElement>
}

export function PillButton({
  children,
  onClick,
  variant = 'secondary',
  icon,
  hiddenText,
  ref,
}: PillButtonProps) {
  return (
    <button
      ref={ref}
      type="button"
      className="group flex min-h-11 items-center px-1"
      onClick={onClick}
    >
      <span
        className={`flex items-center gap-1 rounded-control border px-2 py-1 text-sm font-semibold ${variants[variant]}`}
      >
        {icon && <span aria-hidden="true">{icon}</span>}
        {children}
      </span>
      {hiddenText && (
        <>
          {' '}
          <span className="sr-only">{hiddenText}</span>
        </>
      )}
    </button>
  )
}
