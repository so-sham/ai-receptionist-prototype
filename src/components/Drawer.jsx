import { useEffect } from 'react'
import styles from './Drawer.module.css'
import useFocusTrap from './internal/useFocusTrap.js'

/**
 * Right-side drawer. header/footer are sticky, children scroll in between.
 * Esc and a backdrop click both call onClose. Traps focus while open and
 * restores focus to the triggering element on close.
 */
export default function Drawer({ open, onClose, width = '560px', header, footer, children }) {
  const panelRef = useFocusTrap(open)

  useEffect(() => {
    if (!open) return undefined

    const handleKeyDown = (e) => {
      if (e.key !== 'Escape') return
      // A modal can be rendered INSIDE this drawer (the call drawer's "Add to
      // quality set"). Escape belongs to the innermost layer, so stand down
      // while this panel still contains an open dialog -- otherwise the drawer
      // closes behind the modal and takes the whole call with it.
      if (panelRef.current && panelRef.current.querySelector('[role="dialog"]')) return
      onClose && onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose, panelRef])

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
        tabIndex={-1}
      >
        {header ? (
          <div className={styles.header}>
            <div className={styles.headerContent}>{header}</div>
            <button type="button" className={styles.close} onClick={onClose} aria-label="Close">
              ✕
            </button>
          </div>
        ) : null}
        <div className={styles.body}>{children}</div>
        {footer ? <div className={styles.footer}>{footer}</div> : null}
      </div>
    </div>
  )
}
