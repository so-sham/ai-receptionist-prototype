// "When it can't handle a call" — README §5d. Three of the seven rows are
// locked (asked for a person, sounds like a child, emergency words); each
// carries its own fixed-reason toast in data/agent.js. The remaining rows
// have no real edit flow specced, so their click just gives an "editing"
// toast, matching LimitsCard's interaction pattern.

import { Card } from '../../components';
import { FALLBACK_RULES } from '../../data';
import { useConsole } from '../../state';

import TouchRow from './TouchRow.jsx';
import styles from './FallbackRulesCard.module.css';

export default function FallbackRulesCard() {
  const { toast } = useConsole();

  return (
    <Card>
      <h2 className={`t-h2 ${styles.title}`}>When it can’t handle a call</h2>
      <p className={`t-small ${styles.copy}`}>
        What happens instead. Three of these can’t be turned off.
      </p>
      <div className={styles.rows}>
        {FALLBACK_RULES.map((r) => (
          <TouchRow
            key={r.label}
            label={r.label}
            value={r.value}
            locked={r.locked}
            reason={r.toast}
            title={r.locked ? r.toast : `Change ${r.label.toLowerCase()}`}
            onClick={() => toast(r.locked ? r.toast : `Editing “${r.label.toLowerCase()}”.`)}
          />
        ))}
      </div>
    </Card>
  );
}
