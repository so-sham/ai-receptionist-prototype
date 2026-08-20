// Section 5: the structured note that was written to the chart.
//
// This is the clinical/booking record — the human-readable half of the drawer.
// It must not carry any AI-performance data; that lives only in the agent panel
// at the bottom (README §3.8).

import styles from './CallHighlights.module.css';

const EMPTY = '—';

const FOOTER =
  'This is what went into the chart. Member IDs are stored once on the record and masked everywhere else, including here.';

/** The five label/value rows, in the README's order. */
function noteRows(h) {
  const nextAction = h.owner && h.owner !== EMPTY ? `${h.nextAction} · ${h.owner}` : h.nextAction;
  return [
    { label: 'Reason, as stated', value: h.reason },
    // Tagged so nobody reads a clinical line as a diagnosis: the agent
    // transcribes what was said, it does not interpret it.
    { label: 'Clinical mentions', value: h.clinicalMentions, tag: h.clinicalMentions !== EMPTY },
    // Already masked to the last four in the fixture — never unmask here.
    { label: 'Insurance', value: h.insurance, mono: true },
    { label: 'What we promised', value: h.promised },
    { label: 'Next action', value: nextAction },
  ];
}

export default function CallHighlights({ highlights }) {
  return (
    <div className={styles.wrap}>
      <dl className={styles.rows}>
        {noteRows(highlights).map((row) => (
          <div key={row.label} className={styles.row}>
            <dt className={styles.label}>{row.label}</dt>
            <dd className={styles.valueCell}>
              <div
                className={[
                  row.mono ? styles.valueMono : styles.value,
                  row.value === EMPTY ? styles.empty : null,
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                {row.value}
              </div>
              {row.tag ? <div className={styles.tag}>verbatim, not interpreted</div> : null}
            </dd>
          </div>
        ))}
      </dl>
      <p className={styles.footer}>{FOOTER}</p>
    </div>
  );
}
