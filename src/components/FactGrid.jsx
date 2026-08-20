import styles from './FactGrid.module.css'

/**
 * facts: [{ label, value, mono?: bool }]. Renders up to 4 columns, fewer
 * when the array is shorter than 4.
 */
export default function FactGrid({ facts = [], className }) {
  const columnCount = Math.max(1, Math.min(4, facts.length || 1))
  const classes = [styles.grid, className].filter(Boolean).join(' ')

  return (
    <div className={classes} style={{ gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))` }}>
      {facts.map((fact, i) => (
        <div key={fact.label ? `${fact.label}-${i}` : i}>
          <div className={styles.label}>{fact.label}</div>
          <div className={fact.mono ? styles.valueMono : styles.value}>{fact.value}</div>
        </div>
      ))}
    </div>
  )
}
