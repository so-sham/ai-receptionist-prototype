// Quality → Check. One card in three states (idle / running / result), then
// the result's four blocks: verdict, emergency row + per-check table, the
// failures section, and the collapsed quality-set disclosure.
//
// The card is REPLACED IN PLACE between states — no modal, no navigation —
// and the idle state deliberately carries nothing but the one button. Per the
// README: "the person who most needs this is not an engineer, and a screen of
// controls stops them running it at all."

import { Button, Card, Pill, ProgressBar, TableHeader, TableRow, TableShell } from '../../components';
import { CHECKS, EMERGENCY_CHECK, FAILURES, RUNS, RUN_NAMES } from '../../data';
import { useConsole, selectors } from '../../state';

import FailureCard from './FailureCard.jsx';
import QualitySetDisclosure from './QualitySetDisclosure.jsx';
import styles from './CheckTab.module.css';

// Column track shared by the per-check table's header and rows.
const CHECK_COLS = '1fr 110px 90px 90px 130px';

// RUNS is newest-first. RUNS[0] is the run the result state reports (the one
// you just did); RUNS[1] is what "Last run …" refers to on the idle card —
// which is why the design's idle copy says "3 days ago · 21 of 24" while the
// result says "22 of 24 correct".
const LATEST_RUN = RUNS[0];
const PREVIOUS_RUN = RUNS[1];

const scoreWords = (score) => String(score).replace('/', ' of ');
const correctCount = (score) => parseInt(String(score), 10);

// Change/delta strings carry colour ONLY when they are negative.
const isNegative = (delta) => String(delta).startsWith('↓');

export default function CheckTab() {
  const { state, startRun, cancelRun } = useConsole();

  if (state.runState === 'running') {
    return (
      <Card className={styles.card}>
        <div role="status" aria-live="polite">
          <div className={`t-h2 ${styles.runningTitle}`}>
            Checking call {state.runIndex} of {state.qualitySetCount}
          </div>
          <ProgressBar value={selectors.runPercent(state)} />
          <div className={`t-body ${styles.runningCase}`}>
            “{selectors.runningCaseName(state, RUN_NAMES)}”
          </div>
        </div>
        <Button variant="secondary" size="sm" onClick={cancelRun} className={styles.cancel}>
          Cancel
        </Button>
      </Card>
    );
  }

  if (state.runState === 'done') return <ResultState />;

  return (
    <Card className={`${styles.card} ${styles.cardCentred}`}>
      <h2 className={`t-h1 ${styles.idleTitle}`}>How accurate is the agent?</h2>
      <p className={`t-body ${styles.idleBody}`}>
        We keep {state.qualitySetCount} calls where we already know the right answer. This runs
        them through and scores it.
      </p>
      <Button onClick={startRun}>Run the check</Button>
      <div className={`t-small ${styles.lastRun}`}>
        Last run {PREVIOUS_RUN.when} ·{' '}
        <span className="t-mono">{scoreWords(PREVIOUS_RUN.score)}</span>
      </div>
    </Card>
  );
}

function ResultState() {
  const { state, noteRun, openCall } = useConsole();

  const correct = correctCount(LATEST_RUN.score);
  // The emergency check is the safety check: it is the one that decides
  // whether the run is "passing" regardless of the numeric total.
  const safetyPassed = EMERGENCY_CHECK.pass;

  return (
    <div>
      <Card className={styles.verdict}>
        <div>
          <div className="t-display">
            {correct} of {state.qualitySetCount} correct
          </div>
          <div className={styles.verdictMeta}>
            <Pill tone={safetyPassed ? 'settled' : 'attention'}>
              {safetyPassed ? '✓ Passing' : '✗ Failing'}
            </Pill>
            <span className={`t-small ${styles.verdictNote}`}>
              {safetyPassed ? 'All safety checks passed' : 'A safety check failed'}
            </span>
          </div>
        </div>

        <div className={styles.verdictRight}>
          <div
            className={`t-mono-lg ${isNegative(LATEST_RUN.delta) ? styles.negative : styles.positive}`}
          >
            {LATEST_RUN.delta} since last run
          </div>
          <Button variant="secondary" size="sm" onClick={noteRun} className={styles.noteButton}>
            {selectors.runNoteLabel(state)}
          </Button>
        </div>
      </Card>

      <TableShell className={styles.checkTable}>
        <TableHeader cols={CHECK_COLS} className={styles.tableRow}>
          <div>Check</div>
          <div className={styles.right}>Score</div>
          <div className={styles.right}>Target</div>
          <div className={styles.right}>Change</div>
          <div />
        </TableHeader>

        {/* Not one row among equals: the must-always-pass check gets the full
            width, its own wash, and a badge where the others carry a target. */}
        <div
          className={`${styles.emergency} ${
            EMERGENCY_CHECK.pass ? styles.emergencyPass : styles.emergencyFail
          }`}
        >
          <div>
            <div className="t-body-strong">{EMERGENCY_CHECK.question}</div>
            <div className={styles.fieldStrong}>{EMERGENCY_CHECK.field}</div>
          </div>
          <div className={styles.emergencyRight}>
            <div className="t-mono-lg">{EMERGENCY_CHECK.score}</div>
            <Pill tone={EMERGENCY_CHECK.pass ? 'settled' : 'attention'} className={styles.mustPass}>
              {EMERGENCY_CHECK.badge}
            </Pill>
          </div>
        </div>

        {CHECKS.map((c) => (
          <TableRow key={c.field} cols={CHECK_COLS} height="auto" className={styles.checkRow}>
            <div>
              <div className="t-body">{c.question}</div>
              <div className={styles.field}>{c.field}</div>
            </div>
            <div className={`t-mono-lg ${styles.right}`}>{c.score}</div>
            <div className={`t-mono ${styles.right} ${styles.muted}`}>{c.target}</div>
            <div
              className={`t-mono ${styles.right} ${isNegative(c.change) ? styles.negative : styles.muted}`}
            >
              {c.change}
            </div>
            <div className={styles.right}>
              <Pill tone={c.pass ? 'settled' : 'pending'}>{c.pill}</Pill>
            </div>
          </TableRow>
        ))}
      </TableShell>

      {/* Failures only, and expanded by default — a regression you have to
          open a disclosure to find is a regression nobody reads. */}
      <div className={`t-micro ${styles.sectionLabel}`}>What it got wrong</div>
      <div className={styles.failures}>
        {FAILURES.map((f) => (
          <FailureCard key={f.name} failure={f} onListen={() => openCall(f.callId)} />
        ))}
      </div>

      <QualitySetDisclosure />
    </div>
  );
}
