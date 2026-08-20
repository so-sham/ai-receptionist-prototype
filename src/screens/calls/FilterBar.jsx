import { Button } from '../../components/index.js';
import styles from './FilterBar.module.css';

/**
 * Sticky search + filter pills + Export.
 *
 * Every pill in `pills` renders (README: four pills, always visible). Only
 * two of them carry a real filter value (see selectors.FILTER_PILLS) — the
 * other two are inert by design. onTogglePill is called unconditionally for
 * all of them; useConsole()'s toggleFilter() already no-ops on a null
 * filter, so the inert pills render and do nothing, faithfully matching the
 * source prototype rather than "fixing" it.
 */
export default function FilterBar({ query, onQueryChange, pills, onTogglePill, onExport, stickyTop }) {
  return (
    <div className={styles.bar} style={{ top: stickyTop }}>
      <input
        className={styles.search}
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        placeholder="Search name, number, or words in the call"
      />
      {pills.map((pill) => (
        <button
          key={pill.label}
          type="button"
          className={styles.pill}
          onClick={() => onTogglePill(pill.filter)}
        >
          {pill.label} <span className={styles.chevron} aria-hidden="true">▾</span>
        </button>
      ))}
      <Button variant="secondary" size="sm" onClick={onExport}>
        Export
      </Button>
    </div>
  );
}
