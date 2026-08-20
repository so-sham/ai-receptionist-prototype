// Compare drawer — "Run 12 vs run 11".
//
// The ORDER of the body is load-bearing, not stylistic: "Got worse" renders
// first whenever it is non-empty, because (README) "a regression you have to
// scroll to find is a regression that ships". Only then Got better, then the
// full per-check table.
//
// Fixture note: the prototype hardcoded the got-worse / got-better lists as
// three named cases with no data behind them. They are derived from
// COMPARE_ROWS here instead — every row whose delta fell is a regression,
// every row that rose is an improvement — so the two sections stay truthful
// when the underlying rows change. The counts match the design (1 and 2).

import { Drawer, SectionHead } from '../../components';
import { COMPARE_ROWS, RUNS } from '../../data';
import { useConsole, selectors } from '../../state';
import { drawerWidth } from '../../layout/useViewport.js';

import styles from './CompareDrawer.module.css';

const fell = (row) => String(row.delta).startsWith('↓');
const rose = (row) => String(row.delta).startsWith('↑');

const scoreOf = (n) => {
  const run = RUNS.find((r) => r.n === n);
  return run ? run.score : '—';
};

export default function CompareDrawer() {
  const { state, closeCompare } = useConsole();

  // Newest run first, matching the title selector.
  const [a, b] = [...state.compareSelection].sort((x, y) => y - x);

  const worse = COMPARE_ROWS.filter(fell);
  const better = COMPARE_ROWS.filter(rose);

  return (
    <Drawer
      open={state.compareOpen}
      onClose={closeCompare}
      width={drawerWidth(state.viewportWidth)}
      header={
        <div>
          <div className="t-h2">{selectors.compareTitle(state)}</div>
          <div className={`t-mono ${styles.summary}`}>
            {scoreOf(a)} · {scoreOf(b)}
          </div>
        </div>
      }
    >
      {worse.length ? (
        <>
          <div className={`t-body-strong ${styles.worseTitle}`}>Got worse ({worse.length})</div>
          <div className={styles.group}>
            {worse.map((row) => (
              <div key={row.question} className={`${styles.item} ${styles.itemWorse}`}>
                <span className={styles.worseGlyph} aria-hidden="true">
                  ✗
                </span>
                <span className={`t-body ${styles.itemLabel}`}>{row.question}</span>
                <span className={`t-mono ${styles.worseDelta}`}>
                  was {row.was} → now {row.now}
                </span>
              </div>
            ))}
          </div>
        </>
      ) : null}

      {better.length ? (
        <>
          <div className={`t-body-strong ${styles.betterTitle}`}>Got better ({better.length})</div>
          <div className={styles.group}>
            {better.map((row) => (
              <div key={row.question} className={styles.item}>
                <span className={styles.betterGlyph} aria-hidden="true">
                  ✓
                </span>
                <span className={`t-body ${styles.itemLabel}`}>{row.question}</span>
                <span className={`t-mono ${styles.mutedDelta}`}>
                  was {row.was} → now {row.now}
                </span>
              </div>
            ))}
          </div>
        </>
      ) : null}

      <SectionHead>Per check</SectionHead>
      {COMPARE_ROWS.map((row) => (
        <div key={row.question} className={styles.checkRow}>
          <div className="t-body">{row.question}</div>
          <div className={`t-mono ${styles.right} ${styles.muted}`}>{row.was}</div>
          <div className={`t-mono ${styles.right}`}>{row.now}</div>
          <div className={`t-mono ${styles.right} ${fell(row) ? styles.attention : styles.muted}`}>
            {row.delta}
          </div>
        </div>
      ))}
    </Drawer>
  );
}
