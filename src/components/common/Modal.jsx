import { useEffect, useRef } from 'react'
import CrossIcon from '../icons/CrossIcon'
import s from './Modal.module.scss'

export default function Modal({ isOpen, onClose, ariaLabel = 'Dialog', children }) {
  const closeButtonRef = useRef(null)
  const modalRef = useRef(null)

  useEffect(() => {
    if (!isOpen) return

    const previouslyFocused = document.activeElement
    const previousOverflow = document.body.style.overflow
    closeButtonRef.current?.focus()

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose?.()
      }

      if (e.key === 'Tab') {
        const focusable = modalRef.current?.querySelectorAll('button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])')
        if (!focusable?.length) return

        const first = focusable[0]
        const last = focusable[focusable.length - 1]
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = previousOverflow
      previouslyFocused?.focus()
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <>
      <div className={s.overlay} onClick={onClose} aria-hidden="true" />
      <div ref={modalRef} className={s.modal} role="dialog" aria-modal="true" aria-label={ariaLabel}>
        <button
          ref={closeButtonRef}
          type="button"
          className={s.closeButton}
          onClick={onClose}
          aria-label="Close"
        >
          <CrossIcon width={16} height={16} fill="currentColor" />
        </button>
        {children}
      </div>
    </>
  )
}
