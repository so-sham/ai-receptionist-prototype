import styles from './Chip.module.css'

/**
 * Chip. variant: 'filter' (26px, label + optional remove) |
 * 'never-book' (28px, label + optional remove) |
 * 'add' (dashed "+ children" button, calls onClick, no remove).
 */
export default function Chip({ children, onRemove, onClick, variant = 'filter', className }) {
  if (variant === 'add') {
    const classes = [styles.chip, styles.add, className].filter(Boolean).join(' ')
    return (
      <button type="button" className={classes} onClick={onClick}>
        <span aria-hidden="true">+</span> {children}
      </button>
    )
  }

  const classes = [styles.chip, variant === 'never-book' ? styles.neverBook : styles.filter, className]
    .filter(Boolean)
    .join(' ')

  return (
    <span className={classes}>
      <span>{children}</span>
      {onRemove ? (
        <button
          type="button"
          className={styles.remove}
          onClick={onRemove}
          aria-label={`Remove ${typeof children === 'string' ? children : 'item'}`}
        >
          ✕
        </button>
      ) : null}
    </span>
  )
}
