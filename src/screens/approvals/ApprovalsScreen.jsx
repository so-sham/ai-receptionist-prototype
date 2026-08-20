import { Tabs } from '../../components';
import { useConsole } from '../../state';
import { approvalsLine, approvalStatusOf, pendingApprovalCount } from '../../state/selectors.js';
import { APPROVAL_SLOTS, REVIEW_ITEMS } from '../../data/index.js';
import HeldSlotCard from './HeldSlotCard.jsx';
import DeclinePanel from './DeclinePanel.jsx';
import ChangeModal from './ChangeModal.jsx';
import ReviewItem from './ReviewItem.jsx';
import styles from './ApprovalsScreen.module.css';

// "47 of 52 (90%)" is the README's own illustrative figure for this strip —
// there's no eval-history data file backing it yet, so it's reproduced
// verbatim rather than invented from nothing.
const APPROVED_WITHOUT_CHANGES = { n: 47, of: 52 };

// Parses fixture expiry strings ("42 min", "2 hr 14 min") into minutes so the
// queue-age line can name the oldest (soonest-expiring) open hold instead of
// hardcoding one.
function expiryMinutes(text) {
  const hr = /(\d+)\s*hr/.exec(text);
  const min = /(\d+)\s*min/.exec(text);
  return (hr ? Number(hr[1]) * 60 : 0) + (min ? Number(min[1]) : 0);
}

function oldestOpenHold(state) {
  const open = APPROVAL_SLOTS.filter((a) => approvalStatusOf(state, a.id) === 'open');
  if (!open.length) return null;
  return open.reduce((oldest, a) =>
    expiryMinutes(a.expires) < expiryMinutes(oldest.expires) ? a : oldest
  );
}

export default function ApprovalsScreen() {
  const { state, setApprovalsTab } = useConsole();

  const tabs = [
    { key: 'held', label: 'Held slots', count: pendingApprovalCount(state) },
    { key: 'review', label: 'Needs review', count: REVIEW_ITEMS.length },
  ];

  const oldest = oldestOpenHold(state);
  const pct = Math.round((APPROVED_WITHOUT_CHANGES.n / APPROVED_WITHOUT_CHANGES.of) * 100);

  return (
    <div>
      <div className={styles.header}>
        <h1 className={`t-h1 ${styles.title}`}>Approvals</h1>
        <p className={`t-body ${styles.subtitle}`}>{approvalsLine(state)}</p>
      </div>

      <div className={styles.tabs}>
        <Tabs tabs={tabs} activeKey={state.approvalsTab} onChange={setApprovalsTab} />
      </div>

      {state.approvalsTab === 'held' ? (
        <div>
          <div className={styles.list}>
            {APPROVAL_SLOTS.map((slot) => (
              <HeldSlotCard key={slot.id} slot={slot} />
            ))}
          </div>

          <DeclinePanel />

          <div className={styles.strip}>
            <div className={`t-body ${styles.stripLine}`}>
              Approved without changes:{' '}
              <span className="t-mono-lg">
                {APPROVED_WITHOUT_CHANGES.n} of {APPROVED_WITHOUT_CHANGES.of} ({pct}%)
              </span>
              . Practices usually switch to direct booking above 85%.
            </div>
            <div className={`t-small ${styles.stripSub}`}>
              {oldest ? (
                <>
                  Oldest hold in the queue: <span className="t-mono">{oldest.expires}</span>.{' '}
                </>
              ) : null}
              Holds release after 4 hours and the caller is told the office will ring — nobody is
              left waiting on silence.
            </div>
          </div>
        </div>
      ) : (
        <div>
          <div className={styles.reviewList}>
            {REVIEW_ITEMS.map((item) => (
              <ReviewItem key={item.id} item={item} />
            ))}
          </div>
          <p className={`t-small ${styles.reviewFooter}`}>
            Two kinds of item sit here: a field the agent wasn’t sure enough of to act on, and a
            caller who wanted something it isn’t allowed to book. Both were captured with a reason
            rather than guessed at.
          </p>
        </div>
      )}

      <ChangeModal />
    </div>
  );
}
