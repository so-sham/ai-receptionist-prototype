// Shared row for "What it may touch" and "When it can't handle a call" —
// label left, mono value button right. Locked rows get a sunk background and
// a fixed "⁝" in place of the "▾" chevron. There's no real edit flow specced
// for either card, so every row's click just toasts (the reason it's fixed,
// or a placeholder "editing" note) rather than opening anything.

import styles from './TouchRow.module.css';

export default function TouchRow({ label, value, locked, onClick, title }) {
  return (
    <div className={styles.row}>
      <div className={`t-body ${styles.label}`}>{label}</div>
      <button
        type="button"
        className={`t-mono ${styles.value} ${locked ? styles.locked : ''}`}
        onClick={onClick}
        title={title}
      >
        {value}
        <span className={styles.chevron} aria-hidden="true">
          {locked ? '⁝' : '▾'}
        </span>
      </button>
    </div>
  );
}
