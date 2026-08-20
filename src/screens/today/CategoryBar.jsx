// "What people called about" — README §1c. A single stacked bar (never a pie
// chart) plus a legend, both keyed by CATEGORIES[i].seriesIndex into the
// --series-N alpha ramp defined in tokens.css.

import { Card } from '../../components';
import { CATEGORIES } from '../../data';

import styles from './CategoryBar.module.css';

// "47 calls" is the Today fixture's own narrative total (README §1c) — it
// does not derive from data/calls.js, which holds only the handful of full
// call records the Calls screen demo needs. Kept literal, same as the
// header's "Thursday 20 August" copy.
export default function CategoryBar() {
  return (
    <Card>
      <h2 className={`t-h2 ${styles.title}`}>What people called about</h2>
      <div className={`t-small ${styles.subline}`}>47 calls, ordered by value</div>

      <div className={styles.bar}>
        {CATEGORIES.map((c) => (
          <div
            key={c.name}
            style={{ width: c.pct, background: `var(--series-${c.seriesIndex})` }}
          />
        ))}
      </div>

      <div className={styles.legend}>
        {CATEGORIES.map((c) => (
          <div key={c.name} className={styles.legendRow}>
            <span className={styles.swatch} style={{ background: `var(--series-${c.seriesIndex})` }} />
            <span className={`t-small ${styles.name}`}>{c.name}</span>
            <span className={`t-mono ${styles.count}`}>{c.count}</span>
            <span className={`t-mono ${styles.value}`}>{c.value}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}
