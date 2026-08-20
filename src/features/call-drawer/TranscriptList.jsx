// Section 7, the turns themselves.
//
// `transcriptTurns` has already resolved the highlight, so the flag buttons
// above and the rows here can never disagree about which turn is lit.

import { useEffect, useRef } from 'react';

import { useConsole } from '../../state';
import { transcriptTurns } from '../../state/selectors.js';
import styles from './TranscriptList.module.css';

export default function TranscriptList({ callId }) {
  const { state } = useConsole();
  const turns = transcriptTurns(state, callId);
  const litRef = useRef(null);

  // A flag can name a turn that is below the fold of the drawer, in which case
  // clicking it would look like nothing happened. 'nearest' scrolls only when
  // the turn is actually out of view.
  useEffect(() => {
    if (state.highlightedTurn && litRef.current) {
      litRef.current.scrollIntoView({ block: 'nearest' });
    }
  }, [state.highlightedTurn]);

  return (
    <ol className={styles.list}>
      {turns.map((turn, i) => (
        <li
          key={`${turn.time}-${i}`}
          ref={turn.highlighted ? litRef : null}
          className={[styles.turn, turn.highlighted ? styles.lit : null]
            .filter(Boolean)
            .join(' ')}
        >
          <div className={styles.at}>{turn.time}</div>
          <div className={styles.speaker}>{turn.speaker}</div>
          <div className={styles.text}>
            {turn.text}
            {turn.flag ? (
              <div className={styles.flag}>
                <span aria-hidden="true">⚑</span> {turn.flag}
              </div>
            ) : null}
          </div>
        </li>
      ))}
    </ol>
  );
}
