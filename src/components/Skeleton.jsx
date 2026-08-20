import styles from './Skeleton.module.css'

/**
 * A single 52px skeleton table row. cols is a grid-template-columns string
 * matching the real table's columns.
 */
export function SkeletonRow({ cols = '1fr 1fr 1fr 1fr', height = 52 }) {
  const cells = cols.trim().split(/\s+/)

  return (
    <div className={styles.row} style={{ gridTemplateColumns: cols, height }}>
      {cells.map((_, i) => (
        <div key={i} className={styles.block} />
      ))}
    </div>
  )
}

/**
 * A stack of skeleton rows matching a table's geometry, used while data is
 * loading. rows defaults to 5; cols is the same grid-template-columns
 * string the real TableHeader/TableRow use.
 */
export function SkeletonTable({ rows = 5, cols = '1fr 1fr 1fr 1fr' }) {
  const items = []
  for (let i = 0; i < rows; i += 1) {
    items.push(i)
  }

  return (
    <div className={styles.shell}>
      {items.map((i) => (
        <SkeletonRow key={i} cols={cols} />
      ))}
    </div>
  )
}
