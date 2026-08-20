// "What it can do here" — README §5c. Two independent columns: whether the
// connected practice-management system supports a capability (read-only,
// always toasts — there is nothing to configure there) and whether the
// manager has switched it on (a real Toggle, blocked for unsupported rows).
// Status names which of the two is currently limiting the agent.

import { Toggle, TableShell, SectionHead } from '../../components';
import { useConsole, selectors, TOAST_COPY } from '../../state';

import styles from './CapabilityTable.module.css';

const TONE_CLASS = {
  settled: 'toneSettled',
  pending: 'tonePending',
  faint: 'toneFaint',
};

export default function CapabilityTable() {
  const { state, toggleCapability, toast } = useConsole();
  const rows = selectors.capabilityRows(state);
  const footnote =
    selectors.capabilitiesFootnote(state) ||
    'Every capability your software supports is switched on.';

  const flashUnsupported = () => toast(TOAST_COPY.capabilityUnsupported);

  return (
    <section className={styles.section}>
      <SectionHead>What it can do here</SectionHead>
      <TableShell className={styles.shell}>
        <div className={styles.header}>
          <div>Capability</div>
          <div className={styles.center}>Your software supports it</div>
          <div className={styles.center}>You've switched on</div>
          <div>Status</div>
        </div>
        {rows.map((c) => {
          // The support column is read-only for EVERY row — it reports what the
          // connected system exposes, which is not a practice setting. Both the
          // fact and the reason have to reach a screen reader, so the glyph gets
          // a real name and the reason gets its own referenced text.
          const supportReasonId = `cap-support-reason-${c.key}`;
          const offReasonId = `cap-off-reason-${c.key}`;
          return (
            <div key={c.key} className={styles.row}>
              <div className="t-body">{c.label}</div>
              <button
                type="button"
                className={`${styles.supportBtn} ${
                  c.supported ? styles.supported : styles.unsupported
                }`}
                onClick={flashUnsupported}
                aria-label={`${c.label}: your software ${
                  c.supported ? 'supports this' : 'does not support this'
                }`}
                aria-disabled="true"
                aria-describedby={supportReasonId}
              >
                <span aria-hidden="true">{c.supported ? '✓' : '✗'}</span>
              </button>
              <span id={supportReasonId} className="u-sr-only">
                Read-only: this reflects your practice management system, not a setting you
                control.
              </span>
              <div className={styles.toggleCell}>
                <Toggle
                  checked={c.on}
                  readOnly={!c.supported}
                  onChange={() => toggleCapability(c.key)}
                  onBlocked={() => toggleCapability(c.key)}
                  label={`Switch ${c.label} on or off`}
                  describedBy={c.supported ? undefined : offReasonId}
                />
              </div>
              {c.supported ? null : (
                <span id={offReasonId} className="u-sr-only">
                  {TOAST_COPY.capabilityUnsupported}
                </span>
              )}
              <div className={`${styles.status} ${styles[TONE_CLASS[c.statusTone]]}`}>{c.status}</div>
            </div>
          );
        })}
        <div className={styles.footer}>{footnote}</div>
      </TableShell>
    </section>
  );
}
