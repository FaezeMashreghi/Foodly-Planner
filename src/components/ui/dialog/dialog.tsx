import { useEffect, useId, useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

type DialogProps = {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
}

/** A modal on the native <dialog>: the browser handles the top layer, blocking the page, Esc and focus. */
export function Dialog({ open, onClose, title, children }: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null)
  const titleId = useId()

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  // Portal to <body>: events inside the dialog must not reach the page it was opened from (e.g. a draggable card).
  return createPortal(
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onClose={onClose}
      onClick={(event) => {
        // A click on the <dialog> itself (not its content) is a click on the backdrop.
        if (event.target === event.currentTarget) onClose()
      }}
      className="m-auto w-full max-w-lg rounded-card bg-surface p-0 text-ink shadow-card backdrop:bg-ink/50"
    >
      <div className="space-y-4 p-6">
        <div className="flex items-start justify-between gap-4">
          <h2 id={titleId} className="text-heading">
            {title}
          </h2>
          <button type="button" className="btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
        {children}
      </div>
    </dialog>,
    document.body,
  )
}
