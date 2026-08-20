import Button from './Button.jsx'
import styles from './EmptyState.module.css'

/**
 * Centred empty state, no illustration. action: { label, onClick }.
 */
export default function EmptyState({ message, action, className }) {
  const classes = [styles.wrap, className].filter(Boolean).join(' ')

  return (
    <div className={classes}>
      <div className={styles.message}>{message}</div>
      {action ? (
        <Button variant="secondary" size="sm" onClick={action.onClick}>
          {action.label}
        </Button>
      ) : null}
    </div>
  )
}
