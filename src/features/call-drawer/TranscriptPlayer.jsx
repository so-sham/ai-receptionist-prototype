// Section 7, first row: the player.
//
// SIMULATED. There is no audio in the prototype — `playerState` returns a fixed
// 56% / "1:47 / 3:12" while playing and 0% / "0:00 / 3:12" while stopped, per
// the README's "toggle a simulated player (0:00 <-> 1:47 of 3:12)". Swap the
// selector for a real media element when there is one to bind to.

import { ProgressBar } from '../../components';
import { useConsole } from '../../state';
import { playerState } from '../../state/selectors.js';
import styles from './TranscriptPlayer.module.css';

export default function TranscriptPlayer() {
  const { state, togglePlaying } = useConsole();
  const { playing, glyph, percent, time } = playerState(state);

  return (
    <div className={styles.row}>
      <button
        type="button"
        className={styles.play}
        onClick={togglePlaying}
        aria-label={playing ? 'Pause the recording' : 'Play the recording'}
      >
        <span aria-hidden="true">{glyph}</span>
      </button>
      <ProgressBar value={percent} className={styles.bar} />
      <div className={styles.time}>{time}</div>
    </div>
  );
}
