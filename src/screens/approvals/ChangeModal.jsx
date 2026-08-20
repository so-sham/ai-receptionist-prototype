import { Button, Modal } from '../../components';
import { useConsole } from '../../state';
import { approvalById } from '../../state/selectors.js';
import { MODIFY_REASONS } from '../../data/index.js';
import styles from './ChangeModal.module.css';

/**
 * README §4 "Change something" modal. Picking a reason books the held slot
 * with changes (confirmModify already toasts and clears modifyFor).
 */
export default function ChangeModal() {
  const { state, closeModify, confirmModify } = useConsole();
  const slot = approvalById(state.modifyFor);
  const open = Boolean(slot);

  return (
    <Modal
      open={open}
      onClose={closeModify}
      width="460px"
      title="What are you changing?"
      footer={
        <Button variant="secondary" size="lg" onClick={closeModify}>
          Cancel
        </Button>
      }
    >
      {slot ? (
        <>
          <div className={`t-small ${styles.subhead}`}>{slot.slot}</div>
          <div className={styles.options}>
            {MODIFY_REASONS.map((label) => (
              <button
                key={label}
                type="button"
                className={styles.option}
                onClick={() => confirmModify(slot.id, label)}
              >
                {label}
                <span className={styles.chevron} aria-hidden="true">
                  ›
                </span>
              </button>
            ))}
          </div>
          <p className={`t-small ${styles.footnote}`}>
            Recorded against this call. What people change tells us where the agent is weak.
          </p>
        </>
      ) : null}
    </Modal>
  );
}
