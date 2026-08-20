import { TableHeader, TableRow, StatusGlyph, Pill } from '../../components/index.js';
import { OUTCOME_GLYPH } from './glyphs.js';
import styles from './CallsTable.module.css';

// README §2: tracks at >=1240px vs 900-1239px. The tablet track collapses
// Type to 0px and the cell is hidden with visibility (not display) so later
// columns don't shift — see .hiddenCell below.
// Exported so the loading skeleton can match the real column geometry exactly
// (README: "skeletons matching the final layout").
export const DESKTOP_COLS = '32px 220px 96px minmax(280px,1fr) 150px 140px 100px 40px';
export const TABLET_COLS = '28px 148px 72px minmax(150px,1fr) 0px 132px 74px 20px';

/**
 * Desktop/tablet table body: header + rows, grid-based (>=900px). Callers
 * render this only when `rows` is non-empty and the viewport isn't narrow.
 */
export default function CallsTable({ rows, selectedIndex, onOpen, tablet }) {
  const cols = tablet ? TABLET_COLS : DESKTOP_COLS;

  return (
    <>
      <TableHeader cols={cols}>
        <div />
        <div>Caller</div>
        <div>Time</div>
        <div>About</div>
        <div className={tablet ? styles.hiddenCell : undefined}>Type</div>
        <div>Outcome</div>
        <div className={styles.right}>Value</div>
        <div />
      </TableHeader>

      {rows.map((call, i) => (
        <TableRow
          key={call.id}
          cols={cols}
          selected={i === selectedIndex}
          onClick={() => onOpen(call.id, i)}
        >
          <StatusGlyph kind={call.kind} />
          <div className={[styles.caller, call.unmatched ? styles.faint : null].filter(Boolean).join(' ')}>
            {call.caller}
          </div>
          <div className={`t-mono ${styles.time}`}>{call.time}</div>
          <div className={`t-small ${styles.about}`}>{call.about}</div>
          <div className={tablet ? styles.hiddenCell : undefined}>
            <Pill tone="neutral">{call.type}</Pill>
          </div>
          <div>
            <Pill tone={call.outcomeKind} glyph={OUTCOME_GLYPH[call.outcomeKind]}>
              {call.outcome}
            </Pill>
          </div>
          <div className={`t-mono-lg ${styles.value}`}>{call.value}</div>
          <div className={styles.chevron} aria-hidden="true">
            ›
          </div>
        </TableRow>
      ))}
    </>
  );
}
