import { StatusGlyph, Pill } from '../../components/index.js';
import { OUTCOME_GLYPH } from './glyphs.js';
import styles from './CallCard.module.css';

/**
 * Stacked call row for <900px: glyph, name + time, About, then a row of
 * outcome pill / type pill / value.
 */
export default function CallCard({ call, selected, onOpen }) {
  const classes = [styles.card, selected ? styles.selected : null].filter(Boolean).join(' ');

  return (
    <div
      className={classes}
      onClick={onOpen}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onOpen();
        }
      }}
    >
      <StatusGlyph kind={call.kind} className={styles.glyph} />
      <div className={styles.body}>
        <div className={styles.top}>
          <div className={[styles.caller, call.unmatched ? styles.faint : null].filter(Boolean).join(' ')}>
            {call.caller}
          </div>
          <div className={`t-mono ${styles.time}`}>{call.time}</div>
        </div>
        <div className={`t-small ${styles.about}`}>{call.about}</div>
        <div className={styles.row}>
          <Pill tone={call.outcomeKind} glyph={OUTCOME_GLYPH[call.outcomeKind]}>
            {call.outcome}
          </Pill>
          <Pill tone="neutral">{call.type}</Pill>
          <span className={`t-mono-lg ${styles.value}`}>{call.value}</span>
        </div>
      </div>
    </div>
  );
}
