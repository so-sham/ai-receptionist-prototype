// "The quality set · N calls" — a disclosure that starts COLLAPSED. The set
// is reference material: you look at it when a case is wrong, not every time
// you read a score.
//
// The header count is the live one (it grows when a call is added to the set
// from the call drawer); the row list is the named fixture set.

import { QUALITY_SET_ROWS } from '../../data';
import { useConsole } from '../../state';

import styles from './QualitySetDisclosure.module.css';

const COLS = '1fr 220px 130px 60px';

export default function QualitySetDisclosure() {
  const { state, toggleQualitySet } = useConsole();
  const open = state.qualitySetExpanded;

  return (
    <div className={styles.wrap}>
      <button
        type="button"
        className={styles.trigger}
        onClick={toggleQualitySet}
        aria-expanded={open}
      >
        <span className="t-body-strong">The quality set · {state.qualitySetCount} calls</span>
        <span className={styles.chevron} aria-hidden="true">
          {open ? '▲' : '▼'}
        </span>
      </button>

      {open ? (
        <div className={styles.rows}>
          {QUALITY_SET_ROWS.map((row) => (
            <div key={row.name} className={styles.row} style={{ gridTemplateColumns: COLS }}>
              <div className="t-body">{row.name}</div>
              <div className={`t-mono ${styles.label}`}>{row.label}</div>
              <div className={styles.origin}>{row.origin}</div>
              <div className={styles.right}>
                {/* Editing a case is out of scope for the prototype. */}
                <button type="button" className={styles.edit}>
                  Edit
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
