import styles from './Tabs.module.css'

/**
 * Underline tabs. tabs: [{ key, label, count }]. count (optional) renders
 * in mono next to the label.
 */
export default function Tabs({ tabs = [], activeKey, onChange, className }) {
  const classes = [styles.list, className].filter(Boolean).join(' ')

  return (
    <div className={classes} role="tablist">
      {tabs.map((tab) => {
        const active = tab.key === activeKey
        const tabClasses = [styles.tab, active ? styles.active : null].filter(Boolean).join(' ')
        return (
          <button
            key={tab.key}
            type="button"
            role="tab"
            aria-selected={active}
            className={tabClasses}
            onClick={() => onChange && onChange(tab.key)}
          >
            {tab.label}
            {tab.count !== undefined && tab.count !== null ? (
              <span className={styles.count}>{tab.count}</span>
            ) : null}
          </button>
        )
      })}
    </div>
  )
}
