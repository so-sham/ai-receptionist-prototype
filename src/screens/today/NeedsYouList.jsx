// "Needs you" worklist — README §1b. A worklist, not a feed: rows sorted by
// urgency then value (the fixture order in data/today.js is already sorted).
// Row click opens the call drawer in place; the action button does the same
// thing but must not also trigger the row's own click handler.

import { useNavigate } from 'react-router-dom';

import { Card, CardHeader, Button, StatusGlyph, EmptyState } from '../../components';
import { NEEDS_YOU } from '../../data';
import { useConsole } from '../../state';

import styles from './NeedsYouList.module.css';

export default function NeedsYouList() {
  const navigate = useNavigate();
  const { openCall } = useConsole();

  const seeAll = () => navigate('/calls');

  return (
    <Card>
      <CardHeader
        title="Needs you"
        action={
          <Button variant="quiet" onClick={seeAll}>
            See all
          </Button>
        }
      />

      {NEEDS_YOU.length ? (
        <div className={styles.rows}>
          {NEEDS_YOU.map((n) => (
            // The whole row is the target (README: "Needs-you row (anywhere on
            // the row)"), so it has to be reachable and operable from the
            // keyboard too — a bare onClick div is mouse-only.
            <div
              key={n.callId}
              className={styles.row}
              role="button"
              tabIndex={0}
              aria-label={`${n.title} — ${n.sub}. Open the call.`}
              onClick={() => openCall(n.callId)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  openCall(n.callId);
                }
              }}
            >
              <StatusGlyph kind={n.kind} />
              <div className={styles.text}>
                <div className="t-body-strong">{n.title}</div>
                <div className={`t-small ${styles.sub}`}>{n.sub}</div>
              </div>
              <div className={`t-mono ${styles.time}`}>{n.time}</div>
              <Button
                variant="secondary"
                size="lg"
                onClick={(e) => {
                  e.stopPropagation();
                  openCall(n.callId);
                }}
              >
                {n.action}
              </Button>
            </div>
          ))}
          <div className={`t-small ${styles.footer}`}>Sorted by urgency, then value.</div>
        </div>
      ) : (
        <EmptyState message="Nothing needs you. The agent handled all 47 calls." />
      )}
    </Card>
  );
}
