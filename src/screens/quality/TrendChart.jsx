// "Score by run" — a plain inline SVG polyline, no chart library.
//
// Geometry is transcribed from the prototype: a 1100×200 viewBox with a 24px
// pad, stretched to the container width (preserveAspectRatio="none"), and a
// fixed 16–24 value window so the five scores fill the height. No gridlines;
// the only reference is the dashed target line.

import { RUNS, TREND_SCORES, TREND_TARGET } from '../../data';

import styles from './TrendChart.module.css';

const W = 1100;
const H = 200;
const PAD = 24;

// The value window the y-axis spans. 24 is a full-marks run, 16 is below any
// score the practice would tolerate.
const MIN = 16;
const SPAN = 8;

const x = (i, n) => PAD + (i * (W - PAD * 2)) / Math.max(1, n - 1);
const y = (v) => H - PAD - ((v - MIN) / SPAN) * (H - PAD * 2);

// RUNS is newest-first; TREND_SCORES is oldest-first, so the run numbers under
// the points come from the reversed list rather than a hardcoded start index.
const RUN_NUMBERS = [...RUNS].map((r) => r.n).reverse();

export default function TrendChart() {
  const n = TREND_SCORES.length;
  const points = TREND_SCORES.map((v, i) => `${x(i, n)},${y(v)}`).join(' ');

  return (
    <svg
      className={styles.chart}
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      role="img"
      aria-label={`Score by run: ${TREND_SCORES.map(
        (v, i) => `run ${RUN_NUMBERS[i]} scored ${v} of 24`
      ).join(', ')}.`}
    >
      <line
        x1={PAD}
        x2={W - PAD}
        y1={y(TREND_TARGET)}
        y2={y(TREND_TARGET)}
        stroke="var(--line-strong)"
        strokeDasharray="4 5"
        strokeWidth={1}
      />
      <polyline points={points} fill="none" stroke="var(--accent)" strokeWidth={2} />
      {TREND_SCORES.map((v, i) => (
        <circle
          key={`p-${RUN_NUMBERS[i]}`}
          cx={x(i, n)}
          cy={y(v)}
          r={4}
          fill="var(--surface)"
          stroke="var(--accent)"
          strokeWidth={2}
        />
      ))}
      {TREND_SCORES.map((v, i) => (
        <text
          key={`l-${RUN_NUMBERS[i]}`}
          x={x(i, n)}
          y={H - 4}
          textAnchor="middle"
          fill="var(--ink-faint)"
          fontSize={11}
          fontFamily="IBM Plex Mono, monospace"
        >
          run {RUN_NUMBERS[i]}
        </text>
      ))}
    </svg>
  );
}
