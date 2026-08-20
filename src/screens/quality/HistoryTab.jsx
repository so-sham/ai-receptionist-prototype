// Quality → History. Score by run, the run list (with its two-run compare
// selection), and the modification taxonomy.

import { Button, Card, TableHeader, TableRow, TableShell } from '../../components';
import { MOD_READING, MOD_TAXONOMY } from '../../data';
import { useConsole, selectors } from '../../state';

import TrendChart from './TrendChart.jsx';
import styles from './HistoryTab.module.css';

const RUN_COLS = '34px 60px 120px 1fr 100px 90px';

// Accent at reducing alpha, never new hues.
const BAR_FILLS = ['var(--accent)', 'var(--series-3)', 'var(--series-5)', 'var(--series-7)'];

const isNegative = (delta) => String(delta).startsWith('↓');

export default function HistoryTab() {
  const { state, toggleRunSelection, openCompare } = useConsole();
  const runs = selectors.runRows(state);
  const canCompare = selectors.canCompare(state);

  return (
    <div>
      <Card className={styles.trendCard}>
        <div className={styles.cardHead}>
          <h2 className="t-h2">Score by run</h2>
          <div className={`t-small ${styles.muted}`}>Dashed line is the 80% target</div>
        </div>
        <TrendChart />
      </Card>

      <TableShell>
        <TableHeader cols={RUN_COLS} className={styles.gutter}>
          <div />
          <div>Run</div>
          <div>When</div>
          <div>Note</div>
          <div className={styles.right}>Score</div>
          <div className={styles.right}>Change</div>
        </TableHeader>

        {runs.map((r) => (
          <TableRow
            key={r.n}
            cols={RUN_COLS}
            selected={r.selected}
            onClick={() => toggleRunSelection(r.n)}
            className={styles.gutter}
          >
            <span
              className={`${styles.box} ${r.selected ? styles.boxOn : ''}`}
              role="checkbox"
              aria-checked={r.selected}
              aria-label={`Compare run ${r.n}`}
            >
              {r.selected ? '✓' : ''}
            </span>
            <div className="t-mono">{r.n}</div>
            <div className={`t-small ${styles.muted}`}>{r.when}</div>
            <div className={`t-body ${r.hasNote ? '' : styles.faint}`}>{r.note}</div>
            <div className={`t-mono-lg ${styles.right}`}>{r.score}</div>
            <div
              className={`t-mono ${styles.right} ${isNegative(r.delta) ? styles.negative : styles.muted}`}
            >
              {r.delta}
            </div>
          </TableRow>
        ))}

        <div className={styles.compareBar}>
          <div className={`t-small ${styles.muted}`}>{selectors.compareHint(state)}</div>
          <Button size="sm" onClick={openCompare} disabled={!canCompare}>
            Compare
          </Button>
        </div>
      </TableShell>

      <Card className={styles.taxonomyCard}>
        <h2 className={`t-h2 ${styles.taxonomyTitle}`}>What you change when you approve</h2>
        <div className={`t-small ${styles.taxonomySub}`}>
          Last 52 approvals. What people correct says where the agent is weak.
        </div>

        <div className={styles.bars}>
          {MOD_TAXONOMY.map((m, i) => (
            <div key={m.label} className={styles.barRow}>
              <div className="t-body">{m.label}</div>
              <div className={styles.track}>
                <div
                  className={styles.fill}
                  style={{ width: m.pct, background: BAR_FILLS[i] || BAR_FILLS[BAR_FILLS.length - 1] }}
                />
              </div>
              <div className={`t-mono ${styles.right}`}>{m.count}</div>
            </div>
          ))}
        </div>

        <p className={`t-body ${styles.reading}`}>{MOD_READING}</p>
      </Card>
    </div>
  );
}
