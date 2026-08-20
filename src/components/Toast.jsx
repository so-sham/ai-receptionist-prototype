import styles from './Toast.module.css'

/**
 * Fixed bottom-centre toast. Renders only while message is non-null.
 * Auto-dismiss is the caller's responsibility (e.g. a useToast hook that
 * clears the message after 2.6s).
 */
export default function Toast({ message }) {
  if (!message) return null

  return (
    <div className={styles.toast} role="status" aria-live="polite">
      {message}
    </div>
  )
}
