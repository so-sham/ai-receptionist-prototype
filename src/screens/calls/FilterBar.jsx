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
const INERT_REASON_ID = 'filter-pill-inert-reason';

export default function FilterBar({
  query,
  onQueryChange,
  pills,
  activeFilters = [],
  onTogglePill,
  onExport,
  stickyTop,
}) {
  return (
    <div className={styles.bar} style={{ top: stickyTop }}>
      <input
        className={styles.search}
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        placeholder="Search name, number, or words in the call"
        aria-label="Search name, number, or words in the call"
      />
      {pills.map((pill) => {
        // The two inert pills are still keyboard-reachable, so they have to say
        // why nothing happens. A toast-on-click would only reach people who
        // click; aria-disabled + a described-by reason reaches everyone.
        const inert = !pill.filter;
        const active = !inert && activeFilters.includes(pill.filter);
        return (
          <button
            key={pill.label}
            type="button"
            className={styles.pill}
            onClick={() => onTogglePill(pill.filter)}
            aria-pressed={inert ? undefined : active}
            aria-disabled={inert || undefined}
            aria-describedby={inert ? INERT_REASON_ID : undefined}
          >
            {pill.label} <span className={styles.chevron} aria-hidden="true">▾</span>
          </button>
        );
      })}
      <span id={INERT_REASON_ID} className="u-sr-only">
        Not available in this preview — filter by outcome or type instead.
      </span>
      <Button variant="secondary" size="sm" onClick={onExport}>
        Export
      </Button>
    </div>
  );
}
