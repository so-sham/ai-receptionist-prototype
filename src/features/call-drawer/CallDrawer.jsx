// The call drawer.
//
// Contract with the shell (set in Phase 4, unchanged): a DEFAULT-exported
// component with NO required props, reading everything from useConsole(), so
// ConsoleLayout.jsx never has to be touched again.
//
// Section order is the README's, which is deliberately NOT the order the
// prototype markup happens to use (the prototype renders Flags immediately
// after the summary and the escalation block after them). The README's order is
// the argument: human-readable content first, machine self-report last, and
// Flags sitting directly above the Transcript so the "at 3:14 ->" click lands
// on something the reader can already see.
//
//   1 sticky header · 2 outcome banner · 3 what happened ·
//   4 escalation block (escalated calls only) · 5 call highlights · 6 flags ·
//   7 transcript · 8 how the agent handled it · 9 sticky footer

import { Button, Drawer, SectionHead } from '../../components';
import { TOAST_COPY, useConsole } from '../../state';
import { approvalForCall, callById, drawerPrimaryLabel } from '../../state/selectors.js';

import AgentPanel from './AgentPanel.jsx';
import CallHighlights from './CallHighlights.jsx';
import EscalationBlock from './EscalationBlock.jsx';
import FlagList from './FlagList.jsx';
import OutcomeBanner from './OutcomeBanner.jsx';
import QualitySetModal from './QualitySetModal.jsx';
import TranscriptList from './TranscriptList.jsx';
import TranscriptPlayer from './TranscriptPlayer.jsx';
import styles from './CallDrawer.module.css';

// README layout table: 560px at the design target, 600px at >=1680,
// 440px on tablet, a full-screen sheet on mobile.
function drawerWidth(vw) {
  if (vw < 900) return '100vw';
  if (vw < 1240) return '440px';
  return vw >= 1680 ? '600px' : '560px';
}

/* ---- 1. Sticky header ------------------------------------------------- */

function DrawerHeader({ call }) {
  return (
    <div>
      <h2 className={styles.caller}>{call.caller}</h2>
      <div className={styles.meta}>
        {call.time} · {call.duration} · {call.type.toLowerCase()}
      </div>
    </div>
  );
}

/* ---- 9. Sticky footer ------------------------------------------------- */

function DrawerFooter({ call }) {
  const { state, approve, closeDrawer, openQualitySetModal, toast } = useConsole();

  const primaryLabel = drawerPrimaryLabel(state, call.id);
  const approval = approvalForCall(state, call.id);

  const onPrimary = () => {
    if (primaryLabel === 'Approve the hold' && approval) {
      // APPROVE raises "Booked. Undo available for 10 seconds." itself.
      approve(approval.id);
    } else {
      toast(`Calling ${call.caller}…`);
    }
    closeDrawer();
  };

  // README interactions table: "Create callback task | Releases the hold
  // (Approvals) or ATTACHES THE CALL (drawer/review) and toasts." So the drawer
  // copy deliberately does NOT release a hold — releasing is the Approvals
  // card's action, and doing it from here would silently retract a slot the
  // operator can still see held on the other screen.
  const onCallbackTask = () => {
    toast(TOAST_COPY.callbackTask);
    closeDrawer();
  };

  return (
    <div className={styles.footerRow}>
      <Button
        variant="secondary"
        className={styles.compact}
        onClick={() => openQualitySetModal(call.about)}
      >
        Add to quality set
      </Button>
      <Button variant="secondary" className={styles.compact} onClick={onCallbackTask}>
        Create callback task
      </Button>
      <Button variant="primary" className={styles.primaryAction} onClick={onPrimary}>
        {primaryLabel}
      </Button>
    </div>
  );
}

/* ---- 2-8. Body -------------------------------------------------------- */

function DrawerBody({ call }) {
  return (
    <>
      <div className={styles.banner}>
        <OutcomeBanner call={call} />
      </div>

      <SectionHead>What happened</SectionHead>
      <p className={styles.summary}>{call.summary}</p>

      {call.escalated ? <EscalationBlock highlights={call.highlights} /> : null}

      <SectionHead>Call highlights</SectionHead>
      <CallHighlights highlights={call.highlights} />

      {call.flags.length > 0 ? (
        <>
          <SectionHead>Flags</SectionHead>
          <FlagList flags={call.flags} />
        </>
      ) : null}

      <SectionHead>Transcript</SectionHead>
      <TranscriptPlayer />
      <TranscriptList callId={call.id} />

      <AgentPanel call={call} />

      {/* Rendered inside the drawer on purpose: both Drawer and Modal trap Tab
          on `document`, and only a nested modal ends up inside the drawer's own
          container, which is what stops the two traps fighting over focus. */}
      <QualitySetModal call={call} />
    </>
  );
}

export default function CallDrawer() {
  const { state, closeDrawer } = useConsole();
  const call = state.openCallId === null ? null : callById(state.openCallId);

  return (
    <Drawer
      open={Boolean(call)}
      onClose={closeDrawer}
      width={drawerWidth(state.viewportWidth)}
      header={call ? <DrawerHeader call={call} /> : null}
      footer={call ? <DrawerFooter call={call} /> : null}
    >
      {call ? <DrawerBody call={call} /> : null}
    </Drawer>
  );
}
