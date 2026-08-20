// Section 4: "What the front desk saw before picking up".
//
// Escalated calls only. The point of the block is to answer the question a
// receptionist actually has after taking a handed-over call — did the caller
// have to start again? — so the sentence names the reason and the promise that
// travelled with the call rather than asserting it in the abstract.

import styles from './EscalationBlock.module.css';

// Values the fixtures use for "nothing here".
const isEmpty = (v) => !v || v === '—' || v === 'None';

// Sentence-cases a fragment written as a standalone line ("Wanted to move
// Thursday's appointment" -> "wanted to move Thursday's appointment") so it can
// sit mid-sentence. Only the first character is touched; proper nouns later in
// the string are left alone.
const lower = (s) => (s ? s.charAt(0).toLowerCase() + s.slice(1) : s);

/**
 * Composes the confirming sentence from the call's structured note. Identity is
 * always included; reason and promises only when the fixture has them.
 */
function handoverSentence({ reason, promised }) {
  const why = isEmpty(reason) ? 'the reason they gave' : `why they called (${lower(reason)})`;
  const carried = `Their identity, ${why} and everything the agent had already collected went across with the call`;
  const promise = isEmpty(promised)
    ? `${carried}. `
    : `${carried}, along with what it had promised: ${promised} `;
  return `${promise}The caller did not start again.`;
}

export default function EscalationBlock({ highlights }) {
  const { escalatedNote, owner } = highlights;
  // Who has held it since the handover. The *what* — the next action itself —
  // belongs to Call highlights below and is deliberately not repeated here.
  const next = isEmpty(owner) ? null : `${owner} has owned it since.`;

  return (
    <section className={styles.block}>
      <h3 className={styles.head}>What the front desk saw before picking up</h3>
      <div className={styles.body}>
        {escalatedNote ? <div className={styles.note}>{escalatedNote}</div> : null}
        <p className={styles.sentence}>{handoverSentence(highlights)}</p>
        {next ? <p className={styles.next}>{next}</p> : null}
      </div>
    </section>
  );
}
