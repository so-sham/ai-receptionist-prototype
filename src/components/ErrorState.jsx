import Button from './Button.jsx'
import styles from './ErrorState.module.css'

/**
 * Plain-sentence error state with a Retry button. Never shows an error code.
 */
export default function ErrorState({ message, onRetry, className }) {
  const classes = [styles.wrap, className].filter(Boolean).join(' ')

  return (
    <div className={classes}>
      <div className={styles.message}>{message}</div>
      {onRetry ? (
        <Button variant="secondary" size="sm" onClick={onRetry}>
          Retry
        </Button>
      ) : null}
    </div>
  )
}
