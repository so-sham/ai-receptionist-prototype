// Shared row for "What it may touch" and "When it can't handle a call" —
// label left, mono value button right. Locked rows get a sunk background and
// a fixed "⁝" in place of the "▾" chevron. There's no real edit flow specced
// for either card, so every row's click just toasts (the reason it's fixed,
// or a placeholder "editing" note) rather than opening anything.

import styles from './TouchRow.module.css';

// `reason` is the plain sentence explaining why a locked row is fixed. It is
// rendered as screen-reader-only text and referenced by the button, so the
// explanation reaches keyboard and screen-reader users who never hover and
// never see the toast.
export default function TouchRow({ label, value, locked, onClick, title, reason }) {
  const reasonId = locked && reason ? `touch-reason-${label.replace(/\W+/g, '-').toLowerCase()}` : undefined;

  return (
    <div className={styles.row}>
      <div className={`t-body ${styles.label}`}>{label}</div>
      <button
        type="button"
        className={`t-mono ${styles.value} ${locked ? styles.locked : ''}`}
        onClick={onClick}
        title={title}
        aria-label={`${label}: ${value}`}
        aria-disabled={locked || undefined}
        aria-describedby={reasonId}
      >
        {value}
        <span className={styles.chevron} aria-hidden="true">
          {locked ? '⁝' : '▾'}
        </span>
      </button>
      {reasonId ? (
        <span id={reasonId} className="u-sr-only">
          {reason}
        </span>
      ) : null}
    </div>
  );
}
