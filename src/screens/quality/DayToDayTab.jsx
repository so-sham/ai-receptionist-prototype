// Quality → Day to day. The AI-performance surface, deliberately separate
// from call review: latency and operational signals, not accuracy.

import { MetricCard, Pill, TableHeader, TableRow, TableShell } from '../../components';
import { LIVE_METRICS, SIGNALS } from '../../data';

import styles from './DayToDayTab.module.css';

const SIGNAL_COLS = '1fr 130px 130px 130px';

export default function DayToDayTab() {
  return (
    <div>
      <div className={styles.metricStrip}>
        {LIVE_METRICS.map((m) => (
          <MetricCard
            key={m.label}
            label={m.label}
            value={m.value}
            note={m.note}
            noteAttention={m.attention}
          />
        ))}
      </div>

      <TableShell>
        <TableHeader cols={SIGNAL_COLS} className={styles.gutter}>
          <div>Signal</div>
          <div className={styles.right}>This week</div>
          <div className={styles.right}>Last week</div>
          <div />
        </TableHeader>

        {SIGNALS.map((s) => (
          <TableRow key={s.label} cols={SIGNAL_COLS} height="auto" className={styles.signalRow}>
            <div>
              <div className="t-body">{s.label}</div>
              <div className={`t-small ${styles.muted}`}>{s.sub}</div>
            </div>
            <div className={`t-mono-lg ${styles.right}`}>{s.thisWeek}</div>
            <div className={`t-mono ${styles.right} ${styles.muted}`}>{s.lastWeek}</div>
            <div className={styles.right}>
              {/* Falling / Steady / In budget are settled; Watch is pending —
                  a number worth keeping an eye on, not yet a failure. */}
              <Pill tone={s.ok ? 'settled' : 'pending'}>{s.status}</Pill>
            </div>
          </TableRow>
        ))}

        <div className={`t-small ${styles.footer}`}>
          Calls with no record, no outcome and no escalation should be zero. If that number moves,
          something broke before anything else here will show it.
        </div>
      </TableShell>
    </div>
  );
}
