// Quality screen — README §6. Three tabs over one shared run/compare state:
// Check (idle → running → result), History (trend, runs, compare, taxonomy)
// and Day to day (live metrics + signals).
//
// The run timer is mounted HERE rather than inside CheckTab: the interval has
// to survive a tab switch, otherwise flipping to History mid-run would freeze
// the progress bar at whatever case it had reached. useRunTimer tears its
// interval down whenever runState leaves 'running', so cancelRun() stops it
// with no extra bookkeeping.

import { Tabs } from '../../components';
import { useConsole, useRunTimer } from '../../state';

import CheckTab from './CheckTab.jsx';
import HistoryTab from './HistoryTab.jsx';
import DayToDayTab from './DayToDayTab.jsx';
import CompareDrawer from './CompareDrawer.jsx';
import styles from './QualityScreen.module.css';

const TABS = [
  { key: 'check', label: 'Check' },
  { key: 'history', label: 'History' },
  { key: 'live', label: 'Day to day' },
];

export default function QualityScreen() {
  const { state, setQualityTab } = useConsole();

  useRunTimer();

  return (
    <div>
      <h1 className={`t-h1 ${styles.title}`}>Quality</h1>

      <Tabs
        tabs={TABS}
        activeKey={state.qualityTab}
        onChange={setQualityTab}
        className={styles.tabs}
      />

      {state.qualityTab === 'check' ? <CheckTab /> : null}
      {state.qualityTab === 'history' ? <HistoryTab /> : null}
      {state.qualityTab === 'live' ? <DayToDayTab /> : null}

      {/* The compare drawer belongs to History but mounts at screen level so
          it keeps rendering while it is open. */}
      <CompareDrawer />
    </div>
  );
}
