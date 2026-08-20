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
        {rows.map((c) => (
          <div key={c.key} className={styles.row}>
            <div className="t-body">{c.label}</div>
            <button
              type="button"
              className={`${styles.supportBtn} ${
                c.supported ? styles.supported : styles.unsupported
              }`}
              onClick={flashUnsupported}
              title={
                c.supported
                  ? 'Your practice management system permits this'
                  : 'Your practice management system does not expose this'
              }
            >
              {c.supported ? '✓' : '✗'}
            </button>
            <div className={styles.toggleCell}>
              <Toggle
                checked={c.on}
                readOnly={!c.supported}
                onChange={() => toggleCapability(c.key)}
                onBlocked={() => toggleCapability(c.key)}
                label={`Switch ${c.label} on or off`}
              />
            </div>
            <div className={`t-mono ${styles[TONE_CLASS[c.statusTone]]}`}>{c.status}</div>
          </div>
        ))}
        <div className={styles.footer}>{footnote}</div>
      </TableShell>
    </section>
  );
}
