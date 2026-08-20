// Today screen — README §1. The screen 80% of sessions open and close on:
// header, four-card metric strip, "Needs you" worklist, and two half-width
// summary cards (category stacked bar, hour-of-day histogram).

import { useNavigate } from 'react-router-dom';

import { MetricCard } from '../../components';
import { TODAY_METRICS } from '../../data';
import { useConsole } from '../../state';

import NeedsYouList from './NeedsYouList.jsx';
import CategoryBar from './CategoryBar.jsx';
import HourHistogram from './HourHistogram.jsx';
import styles from './TodayScreen.module.css';

export default function TodayScreen() {
  const navigate = useNavigate();
  const { goToCallsWithFilter } = useConsole();

  return (
    <div>
      <div className={styles.header}>
        <h1 className="t-h1">Today</h1>
        {/* Fixture copy — the design's date/time isn't part of data/today.js,
            so the prototype's own sample string is kept verbatim. */}
        <div className={`t-small ${styles.date}`}>Thursday 20 August · through 9:04pm</div>
      </div>

      <div className={styles.metricStrip}>
        {TODAY_METRICS.map((m) => (
          <MetricCard
            key={m.key}
            label={m.label}
            value={m.value}
            note={m.note}
            noteAttention={m.attention}
            linkLabel={m.clickable ? m.linkText : null}
            valueFont={m.key === 'value_at_risk' ? 'sans' : 'mono'}
            onClick={
              m.clickable
                ? () => {
                    const path = goToCallsWithFilter(m.filter);
                    navigate(path);
                  }
                : undefined
            }
          />
        ))}
      </div>

      <div className={styles.needsWrap}>
        <NeedsYouList />
      </div>

      <div className={styles.halfGrid}>
        <CategoryBar />
        <HourHistogram />
      </div>
    </div>
  );
}
