import type { ReactNode } from 'react'

type ReviewTileProps = {
  icon: string
  label: string
  children: ReactNode
  className?: string
}

export function ReviewTile({ icon, label, children, className = '' }: ReviewTileProps) {
  return (
    <div className={`space-y-2 rounded-card border border-line bg-canvas p-4 ${className}`}>
      <dt className="flex items-center gap-2 text-sm font-semibold text-ink-muted">
        <span
          aria-hidden="true"
          className="flex size-8 items-center justify-center rounded-full bg-brand-soft text-base"
        >
          {icon}
        </span>
        {label}
      </dt>
      <dd>{children || <p className="text-ink-muted">Nothing mentioned</p>}</dd>
    </div>
  )
}
