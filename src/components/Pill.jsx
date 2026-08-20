import styles from './Pill.module.css'

/**
 * Enum pill. tone: 'settled' | 'pending' | 'attention' | 'neutral'.
 * glyph is an optional leading character (e.g. a status glyph).
 */
export default function Pill({ tone = 'neutral', glyph, children, className }) {
  const classes = [styles.pill, styles[tone], className].filter(Boolean).join(' ')

  return (
    <span className={classes}>
      {glyph ? <span aria-hidden="true">{glyph}</span> : null}
      {children}
    </span>
  )
}
