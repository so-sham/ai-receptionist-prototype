import { useEffect, useRef, useState } from 'react';
import { Button, StatusGlyph, FactGrid, InlineBanner } from '../../components';
import { useConsole } from '../../state';
import { approvalStatusOf } from '../../state/selectors.js';
import styles from './HeldSlotCard.module.css';

const UNDO_WINDOW_MS = 10000;

function settledLine(slot, status, reason) {
  if (status === 'declined' && reason === 'Callback task') {
    return `Hold released — ${slot.slot}`;
  }
  if (status === 'declined') {
    return `Declined — ${slot.slot}`;
  }
  if (status === 'approved' && reason) {
    return `Booked with changes — ${slot.slot}`;
  }
  return `Booked — ${slot.slot}`;
}

/**
 * One held-slot card on the "Held slots" tab. Renders the full open card
 * (README §4) while approvalStatusOf() is 'open', and collapses to a single
 * settled line with a 10-second Undo once it isn't.
 */
export default function HeldSlotCard({ slot }) {
  const { state, approve, openModify, openDecline, releaseHold, undoApproval, openCall } =
    useConsole();

  const status = approvalStatusOf(state, slot.id);
  const reason = state.approvalReason[slot.id];
  const open = status === 'open';

  // Show Undo for 10 seconds after the card settles (README: "Never remove
  // it instantly; people misclick"). Resets whenever the card re-opens (Undo
  // was already clicked) so a later action gets its own fresh window.
  const [showUndo, setShowUndo] = useState(false);
  const prevOpenRef = useRef(open);

  useEffect(() => {
    const wasOpen = prevOpenRef.current;
    prevOpenRef.current = open;

    if (wasOpen && !open) {
      setShowUndo(true);
      const t = setTimeout(() => setShowUndo(false), UNDO_WINDOW_MS);
      return () => clearTimeout(t);
    }
    if (open) setShowUndo(false);
    return undefined;
  }, [open]);

  const cardClasses = [styles.card, slot.urgent ? styles.urgent : null]
    .filter(Boolean)
    .join(' ');

  if (!open) {
    return (
      <div className={cardClasses}>
        <div className={styles.settled}>
          <StatusGlyph kind={status === 'approved' ? 'settled' : 'neutral'} />
          <div className={`${styles.settledLine} t-body`}>
            {settledLine(slot, status, reason)}
          </div>
          {showUndo ? (
            <Button variant="secondary" size="sm" onClick={() => undoApproval(slot.id)}>
              Undo
            </Button>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div className={cardClasses}>
      <div className={styles.rowTop}>
        <div className={styles.heldTag}>
          <StatusGlyph kind="pending" label="Held" />
          <span className={`t-micro ${styles.heldLabel}`}>Held</span>
        </div>
        <div className={`${styles.expiry} ${slot.urgent ? styles.expiryUrgent : ''}`}>
          expires in {slot.expires}
        </div>
      </div>

      <h2 className={`t-h2 ${styles.slotLine}`}>{slot.slot}</h2>
      <p className={`t-body ${styles.reason}`}>{slot.reason}</p>

      <div className={styles.hairline} />

      <div className={styles.facts}>
        <FactGrid facts={slot.facts} />
      </div>

      <div className={styles.patient}>{slot.patient}</div>
      {slot.quote ? <p className={`t-body ${styles.quote}`}>“{slot.quote}”</p> : null}

      {slot.note ? (
        <div className={styles.banner}>
          <InlineBanner tone="pending" glyph="◐">
            {slot.note}
          </InlineBanner>
        </div>
      ) : null}

      <div className={styles.actions}>
        <Button variant="primary" size="lg" onClick={() => approve(slot.id)}>
          Approve
        </Button>
        <Button variant="secondary" size="lg" onClick={() => openModify(slot.id)}>
          Change something
        </Button>
        <Button variant="secondary" size="lg" onClick={() => openDecline(slot.id)}>
          Decline
        </Button>
        <Button variant="secondary" size="lg" onClick={() => releaseHold(slot.id)}>
          Create callback task
        </Button>
        <Button
          variant="quiet"
          size="lg"
          className={styles.openCall}
          onClick={() => openCall(slot.callId)}
        >
          Open the call →
        </Button>
      </div>
    </div>
  );
}
