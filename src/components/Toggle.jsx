import styles from './Toggle.module.css'

/**
 * 34x19 switch. readOnly dims the control (opacity .4) and, on click, calls
 * onBlocked instead of onChange -- for "this setting is fixed" cases.
 */
export default function Toggle({
  checked = false,
  onChange,
  readOnly = false,
  onBlocked,
  label,
  // Id of visible or screen-reader-only text explaining WHY a read-only toggle
  // is fixed. aria-disabled on its own says "you can't", not "here's why".
  describedBy,
  className,
}) {
  const classes = [styles.track, checked ? styles.on : styles.off, readOnly ? styles.readOnly : null, className]
    .filter(Boolean)
    .join(' ')

  const handleClick = () => {
    if (readOnly) {
      onBlocked && onBlocked()
      return
    }
    onChange && onChange(!checked)
  }

  return (
    <button
      type="button"
      className={classes}
      onClick={handleClick}
      role="switch"
      aria-checked={checked}
      aria-label={label}
      aria-disabled={readOnly || undefined}
      aria-describedby={describedBy}
    >
      <span className={styles.knob} />
    </button>
  )
}
