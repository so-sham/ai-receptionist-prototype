import styles from './InlineBanner.module.css'

/**
 * Inline banner. tone: 'settled' | 'pending' | 'attention'.
 */
export default function InlineBanner({ tone = 'settled', glyph, children, className }) {
  const classes = [styles.banner, styles[tone], className].filter(Boolean).join(' ')

  return (
    <div className={classes}>
      {glyph ? <span aria-hidden="true">{glyph}</span> : null}
      <span>{children}</span>
    </div>
  )
}
