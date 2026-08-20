import styles from './SectionHead.module.css'

/**
 * Micro eyebrow text sitting over a hairline rule (e.g. "What happened",
 * "Booking mode"). Generic section divider used across screens.
 */
export default function SectionHead({ children, className }) {
  const classes = [styles.head, className].filter(Boolean).join(' ')

  return <div className={classes}>{children}</div>
}
