// Per-appointment-type table — README §5b. Every row shows all three mode
// pills; the locked row (oral surgery & sedation) dims the two it can never
// reach and always resolves to "details". Clicking any pill just calls
// setTypeMode — on the locked row that's a safe no-op the reducer already
// guards and explains with a toast, so this file doesn't special-case it.

import { TableShell, SectionHead } from '../../components';
import { APPOINTMENT_TYPES } from '../../data';
import { useConsole, selectors } from '../../state';

import styles from './PerTypeTable.module.css';

const MODE_OPTIONS = [
  { key: 'details', label: 'details' },
  { key: 'ask', label: 'asks you' },
  { key: 'direct', label: 'direct' },
];

export default function PerTypeTable() {
  const { state, setTypeMode } = useConsole();

  return (
    <section className={styles.section}>
      <SectionHead>Per appointment type</SectionHead>
      <TableShell className={styles.shell}>
        {APPOINTMENT_TYPES.map((t) => {
          const current = selectors.typeModeFor(state, t.key);
          return (
            <div key={t.key} className={styles.row}>
              <div className="t-body">{t.label}</div>
              <div className={styles.pills}>
                {MODE_OPTIONS.map((o) => {
                  const selected = current === o.key;
                  const classes = [
                    styles.pill,
                    selected ? styles.pillSelected : '',
                    t.locked && !selected ? styles.pillDimmed : '',
                  ]
                    .filter(Boolean)
                    .join(' ');
                  return (
                    <button
                      key={o.key}
                      type="button"
                      className={classes}
                      title={t.locked ? 'On the never-book list — details only' : o.label}
                      onClick={() => setTypeMode(t.key, o.key)}
                    >
                      {o.label}
                    </button>
                  );
                })}
              </div>
              <div className={styles.lock}>{t.lockReason || ''}</div>
            </div>
          );
        })}
        <div className={styles.footer}>
          Anything on the never-book list stays details-only whatever you set here. You can’t
          configure your way into the agent booking sedation.
        </div>
      </TableShell>
    </section>
  );
}
