// "What it may touch" — README §5d. Six rows; only Double-booking is locked
// (sunk background, "⁝" chevron, fixed toast). The other five have no real
// edit flow specced, so their click just gives an "editing" toast for
// consistent feedback rather than doing nothing.

import { Card } from '../../components';
import { LIMITS } from '../../data';
import { useConsole } from '../../state';

import TouchRow from './TouchRow.jsx';
import styles from './LimitsCard.module.css';

export default function LimitsCard() {
  const { toast } = useConsole();

  return (
    <Card>
      <h2 className={`t-h2 ${styles.title}`}>What it may touch</h2>
      <p className={`t-small ${styles.copy}`}>
        Everything outside these limits is invisible to the agent. It can’t invent a time or a
        length.
      </p>
      <div className={styles.rows}>
        {LIMITS.map((l) => (
          <TouchRow
            key={l.label}
            label={l.label}
            value={l.value}
            locked={l.locked}
            title={l.locked ? l.toast : `Change ${l.label.toLowerCase()}`}
            onClick={() => toast(l.locked ? l.toast : `Editing “${l.label.toLowerCase()}”.`)}
          />
        ))}
      </div>
    </Card>
  );
}
