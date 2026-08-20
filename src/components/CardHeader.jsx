import styles from './CardHeader.module.css'

/**
 * Card header row: h2 title left, optional right-aligned action slot.
 * Intended as the first child inside a <Card>; adds a hairline rule below.
 */
export default function CardHeader({ title, action, className }) {
  const classes = [styles.header, className].filter(Boolean).join(' ')

  return (
    <div className={classes}>
      <h2 className={styles.title}>{title}</h2>
      {action ? <div className={styles.action}>{action}</div> : null}
    </div>
  )
}
