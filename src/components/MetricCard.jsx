import styles from './MetricCard.module.css'

/**
 * Metric card. valueFont defaults to 'mono' (the display token). Use 'sans'
 * for the one exception the type scale calls out: currency values, where a
 * monospace face makes commas misalign with digits ("$12,400" reading as
 * "$12 , 400").
 */
export default function MetricCard({
  label,
  value,
  note,
  noteAttention = false,
  linkLabel,
  onClick,
  valueFont = 'mono',
  className,
}) {
  const clickable = typeof onClick === 'function'
  const classes = [styles.card, clickable ? styles.clickable : null, className]
    .filter(Boolean)
    .join(' ')
  const valueClasses = [styles.value, valueFont === 'sans' ? styles.valueSans : styles.valueMono]
    .filter(Boolean)
    .join(' ')
  const noteClasses = [styles.note, noteAttention ? styles.noteAttention : null]
    .filter(Boolean)
    .join(' ')

  const Wrapper = clickable ? 'button' : 'div'

  return (
    <Wrapper
      type={clickable ? 'button' : undefined}
      className={classes}
      onClick={onClick}
    >
      <div className={styles.label}>{label}</div>
      <div className={valueClasses}>{value}</div>
      {note ? <div className={noteClasses}>{note}</div> : null}
      {linkLabel ? <div className={styles.link}>{linkLabel}</div> : null}
    </Wrapper>
  )
}
