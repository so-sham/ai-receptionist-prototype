import styles from './Toggle.module.css'

/**
 * 34x19 switch. readOnly dims the control (opacity .4) and, on click, calls
 * onBlocked instead of onChange -- for "this setting is fixed" cases.
 */
export default function Toggle({ checked = false, onChange, readOnly = false, onBlocked, label, className }) {
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
    >
      <span className={styles.knob} />
    </button>
  )
}
