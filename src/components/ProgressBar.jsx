import styles from './ProgressBar.module.css'

/**
 * 6px progress bar. value is a 0-100 percentage.
 */
export default function ProgressBar({ value = 0, className }) {
  const clamped = Math.max(0, Math.min(100, value))
  const classes = [styles.track, className].filter(Boolean).join(' ')

  return (
    <div
      className={classes}
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div className={styles.fill} style={{ width: `${clamped}%` }} />
    </div>
  )
}
