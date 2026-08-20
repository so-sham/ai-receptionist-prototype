import { useConsole } from '../../state/index.js';
import {
  visibleCalls,
  callCountLine,
  filterChipLabels,
  FILTER_PILLS,
  isNarrow,
  breakpoint,
} from '../../state/selectors.js';
import { TableShell, EmptyState, Chip, Button } from '../../components/index.js';
import FilterBar from './FilterBar.jsx';
import CallsTable from './CallsTable.jsx';
import CallCard from './CallCard.jsx';
import styles from './CallsScreen.module.css';

export default function CallsScreen() {
  const { state, openCall, setQuery, toggleFilter, removeFilter, clearFilters } = useConsole();

  const rows = visibleCalls(state);
  const chips = filterChipLabels(state);
  const hasQuery = state.query.trim() !== '';
  const showActiveRow = chips.length > 0 || hasQuery;

  const narrow = isNarrow(state);
  const tablet = breakpoint(state) === 'tablet';

  return (
    <div>
      <div className={styles.header}>
        <h1 className="t-h1">Calls</h1>
        <div className={`t-small ${styles.count}`}>{callCountLine(state)}</div>
      </div>

      <FilterBar
        query={state.query}
        onQueryChange={setQuery}
        pills={FILTER_PILLS}
        onTogglePill={toggleFilter}
        onExport={() => {}}
        stickyTop={narrow ? '56px' : '0px'}
      />

      {showActiveRow ? (
        <div className={styles.chipsRow}>
          {chips.map((c) => (
            <Chip key={c.value} onRemove={() => removeFilter(c.value)}>
              {c.label}
            </Chip>
          ))}
          <Button variant="quiet" onClick={clearFilters}>
            Clear filters
          </Button>
        </div>
      ) : null}

      <div className={styles.tableWrap}>
        <TableShell>
          {rows.length === 0 ? (
            <EmptyState
              message="No calls match these filters."
              action={{ label: 'Clear filters', onClick: clearFilters }}
            />
          ) : narrow ? (
            rows.map((call, i) => (
              <CallCard
                key={call.id}
                call={call}
                selected={i === state.selectedIndex}
                onOpen={() => openCall(call.id, i)}
              />
            ))
          ) : (
            <CallsTable
              rows={rows}
              selectedIndex={state.selectedIndex}
              onOpen={openCall}
              tablet={tablet}
            />
          )}
        </TableShell>
      </div>

      <div className={`t-small ${styles.hint}`}>j / k to move · Enter to open · Esc to close</div>
    </div>
  );
}
