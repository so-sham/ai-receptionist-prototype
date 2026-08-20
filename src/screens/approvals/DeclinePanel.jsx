import { useConsole } from '../../state';
import { approvalById } from '../../state/selectors.js';
import { DECLINE_REASONS } from '../../data/index.js';
import styles from './DeclinePanel.module.css';

/**
 * README §4 decline reason panel: not a modal — expands below the held-slot
 * queue. The reason is required (one click both supplies it and confirms).
 */
export default function DeclinePanel() {
  const { state, decline } = useConsole();
  const slot = approvalById(state.declineFor);

  if (!slot) return null;

  return (
    <div className={styles.panel}>
      <h2 className={`t-h2 ${styles.title}`}>Why are you declining?</h2>
      <p className={`t-small ${styles.subhead}`}>This feeds the quality set.</p>
      <div className={styles.chips}>
        {DECLINE_REASONS.map((label) => (
          <button
            key={label}
            type="button"
            className={styles.chip}
            onClick={() => decline(slot.id, label)}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
