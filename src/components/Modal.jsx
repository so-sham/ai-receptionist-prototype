import { useEffect } from 'react'
import styles from './Modal.module.css'
import useFocusTrap from './internal/useFocusTrap.js'

/**
 * Centred modal, width 460-480px (default 460px). Esc and a backdrop click
 * both call onClose. Traps focus while open and restores focus on close.
 */
export default function Modal({ open, onClose, width = '460px', title, children, footer }) {
  const panelRef = useFocusTrap(open)

  useEffect(() => {
    if (!open) return undefined

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose && onClose()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className={styles.root}>
      <div className={styles.backdrop} onClick={onClose} />
      <div
        ref={panelRef}
        className={styles.panel}
        style={{ width }}
        role="dialog"
        aria-modal="true"
        aria-label={typeof title === 'string' ? title : undefined}
        tabIndex={-1}
      >
        {title ? <div className={styles.title}>{title}</div> : null}
        <div className={styles.body}>{children}</div>
        {footer ? <div className={styles.footer}>{footer}</div> : null}
      </div>
    </div>
  )
}
