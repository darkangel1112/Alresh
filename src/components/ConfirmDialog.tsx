'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'

export type ConfirmOptions = {
  title: string
  message: string
  detail?: string
  confirmLabel?: string
  cancelLabel?: string
}

type PendingConfirm = ConfirmOptions & { resolve: (confirmed: boolean) => void }

function ConfirmDialog({ pending, onResolve }: {
  pending: PendingConfirm
  onResolve: (confirmed: boolean) => void
}) {
  const cancelButton = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    cancelButton.current?.focus()
  }, [])

  function handleKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (event.key === 'Escape') {
      event.preventDefault()
      onResolve(false)
      return
    }
    if (event.key !== 'Tab') return

    const buttons = event.currentTarget.querySelectorAll<HTMLButtonElement>('button:not(:disabled)')
    const first = buttons[0]
    const last = buttons[buttons.length - 1]
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault()
      last?.focus()
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault()
      first?.focus()
    }
  }

  return (
    <div
      className="modal-overlay confirm-overlay"
      onMouseDown={event => { if (event.target === event.currentTarget) onResolve(false) }}
    >
      <section
        className="modal confirm-modal"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-message"
        onKeyDown={handleKeyDown}
      >
        <div className="modal-header confirm-modal-header">
          <span className="confirm-icon" aria-hidden="true">!</span>
          <h3 id="confirm-dialog-title">{pending.title}</h3>
        </div>
        <div className="modal-body">
          <p id="confirm-dialog-message">{pending.message}</p>
          {pending.detail && <p className="confirm-detail">{pending.detail}</p>}
        </div>
        <div className="modal-footer">
          <button ref={cancelButton} type="button" className="btn btn-secondary" onClick={() => onResolve(false)}>
            {pending.cancelLabel ?? 'Mégse'}
          </button>
          <button type="button" className="btn btn-danger" onClick={() => onResolve(true)}>
            {pending.confirmLabel ?? 'Törlés'}
          </button>
        </div>
      </section>
    </div>
  )
}

export function useConfirmDialog() {
  const [pending, setPending] = useState<PendingConfirm | null>(null)
  const resolver = useRef<((confirmed: boolean) => void) | null>(null)
  const returnFocus = useRef<HTMLElement | null>(null)

  const requestConfirmation = useCallback((options: ConfirmOptions) => new Promise<boolean>(resolve => {
    resolver.current?.(false)
    resolver.current = resolve
    returnFocus.current = document.activeElement instanceof HTMLElement ? document.activeElement : null
    setPending({ ...options, resolve })
  }), [])

  const resolve = useCallback((confirmed: boolean) => {
    resolver.current?.(confirmed)
    resolver.current = null
    setPending(null)
    const target = returnFocus.current
    returnFocus.current = null
    window.requestAnimationFrame(() => target?.focus())
  }, [])

  useEffect(() => () => {
    resolver.current?.(false)
    resolver.current = null
  }, [])

  const dialog = pending ? <ConfirmDialog pending={pending} onResolve={resolve} /> : null
  return { requestConfirmation, dialog }
}
