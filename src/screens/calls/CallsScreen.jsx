import { useConsole } from '../../state/index.js';
import {
  visibleCalls,
  callCountLine,
  filterChipLabels,
  FILTER_PILLS,
  isNarrow,
  breakpoint,
} from '../../state/selectors.js';
import {
  TableShell,
  EmptyState,
  ErrorState,
  SkeletonTable,
  Chip,
  Button,
} from '../../components/index.js';
import FilterBar from './FilterBar.jsx';
import CallsTable, { DESKTOP_COLS, TABLET_COLS } from './CallsTable.jsx';
import CallCard from './CallCard.jsx';
import styles from './CallsScreen.module.css';

// The stacked-card layout under 900px has no columns, so its skeleton is a
// single wide block per row rather than the table's eight tracks.
const CARD_COLS = '1fr';

export default function CallsScreen() {
  const { state, openCall, setQuery, toggleFilter, removeFilter, clearFilters, setDataState } =
    useConsole();

  const rows = visibleCalls(state);
  const chips = filterChipLabels(state);
  const hasQuery = state.query.trim() !== '';
  const showActiveRow = chips.length > 0 || hasQuery;

  const narrow = isNarrow(state);
  const tablet = breakpoint(state) === 'tablet';

  const loading = state.dataState === 'loading';
  const errored = state.dataState === 'error';

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
        activeFilters={state.filters}
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
        {loading ? (
          // Five skeleton rows on the real column tracks — never a full-page
          // spinner, and never a layout that jumps when the data lands.
          <SkeletonTable rows={5} cols={narrow ? CARD_COLS : tablet ? TABLET_COLS : DESKTOP_COLS} />
        ) : (
        <TableShell>
          {errored ? (
            <ErrorState
              message="We couldn’t load your calls just now. Check your connection and try again."
              onRetry={() => setDataState('ready')}
            />
          ) : rows.length === 0 ? (
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
        )}
      </div>

      {loading || errored ? null : (
        <div className={`t-small ${styles.hint}`}>j / k to move · Enter to open · Esc to close</div>
      )}
    </div>
  );
}
