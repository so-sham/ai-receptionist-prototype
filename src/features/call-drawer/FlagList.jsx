// Section 6: the evidence trail.
//
// Each flag is a button that jumps the reader to the exact moment the agent
// heard the thing it acted on — it turns "the AI said so" into "here is where
// it heard it". Clicking sets `highlightedTurn`; TranscriptList below reads it.

import { useConsole } from '../../state';
import styles from './FlagList.module.css';

export default function FlagList({ flags }) {
  const { state, highlightTurn } = useConsole();

  return (
    <div className={styles.list}>
      {flags.map((flag, i) => {
        const active = state.highlightedTurn === flag.at;
        return (
          <button
            key={`${flag.at}-${flag.label}-${i}`}
            type="button"
            className={[styles.flag, active ? styles.active : null].filter(Boolean).join(' ')}
            onClick={() => highlightTurn(flag.at)}
            aria-pressed={active}
          >
            <span className={styles.glyph} aria-hidden="true">
              ⚑
            </span>
            <span className={styles.label}>{flag.label}</span>
            <span className={styles.at}>at {flag.at} →</span>
          </button>
        );
      })}
    </div>
  );
}
