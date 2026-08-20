import styles from './StatusGlyph.module.css'

const GLYPHS = {
  attention: '!',
  pending: '◐',
  settled: '✓',
  neutral: '·',
}

const DEFAULT_LABELS = {
  attention: 'Attention',
  pending: 'Pending',
  settled: 'Settled',
  neutral: 'Neutral',
}

/**
 * 16px status glyph. kind: 'attention' | 'pending' | 'settled' | 'neutral'.
 * Never colour alone -- always carries an aria-label with the text meaning.
 */
export default function StatusGlyph({ kind = 'neutral', label, className }) {
  const classes = [styles.glyph, styles[kind], className].filter(Boolean).join(' ')
  const accessibleLabel = label || DEFAULT_LABELS[kind]

  return (
    <span className={classes} role="img" aria-label={accessibleLabel}>
      {GLYPHS[kind]}
    </span>
  )
}
