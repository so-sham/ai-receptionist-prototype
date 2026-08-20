import styles from './ConfidenceDots.module.css'

const DOT_COUNT = 5

/**
 * Five 5px confidence dots. filled: 0-5. title is the percentage string
 * shown in the native tooltip (e.g. "80% confidence" or "not detected") --
 * the primary display is never a decimal.
 */
export default function ConfidenceDots({ filled = 0, title, className }) {
  const dots = []
  for (let i = 0; i < DOT_COUNT; i += 1) {
    dots.push(i)
  }
  const clamped = Math.max(0, Math.min(DOT_COUNT, filled))

  const classes = [styles.dots, className].filter(Boolean).join(' ')

  return (
    <span className={classes} title={title} role="img" aria-label={title}>
      {dots.map((i) => (
        <span key={i} className={i < clamped ? styles.filled : styles.empty} />
      ))}
    </span>
  )
}
