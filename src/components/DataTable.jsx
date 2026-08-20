import styles from './DataTable.module.css'

/**
 * Outer bordered white wrapper for a data table.
 */
export function TableShell({ children, className }) {
  const classes = [styles.shell, className].filter(Boolean).join(' ')
  return <div className={classes}>{children}</div>
}

/**
 * 36px header row on --surface-sunk with micro caps column labels.
 * cols is a CSS grid-template-columns string, e.g. "32px 220px 1fr 100px".
 * children are the column head labels, one per grid cell.
 */
export function TableHeader({ cols, children, className }) {
  const classes = [styles.header, className].filter(Boolean).join(' ')
  return (
    <div className={classes} style={{ gridTemplateColumns: cols }}>
      {children}
    </div>
  )
}

/**
 * A single table row. height defaults to 52px (the table row geometry).
 * selected paints the row --accent-wash; onClick makes the row interactive
 * (cursor pointer, hover --accent-wash).
 */
export function TableRow({ cols, height = 52, selected = false, onClick, children, className }) {
  const clickable = typeof onClick === 'function'
  const classes = [styles.row, clickable ? styles.clickable : null, selected ? styles.selected : null, className]
    .filter(Boolean)
    .join(' ')

  return (
    <div
      className={classes}
      style={{ gridTemplateColumns: cols, height }}
      onClick={onClick}
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
      onKeyDown={
        clickable
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onClick(e)
              }
            }
          : undefined
      }
    >
      {children}
    </div>
  )
}
