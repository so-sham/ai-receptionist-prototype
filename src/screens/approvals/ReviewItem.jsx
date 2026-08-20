import { Button, StatusGlyph, ConfidenceDots } from '../../components';
import { useConsole, TOAST_COPY } from '../../state';
import styles from './ReviewItem.module.css';

/**
 * One stacked row on the "Needs review" tab (README §4). These aren't held
 * slots, so there's no approve/decline flow here — resolving the row and
 * creating a callback task are both recorded as a toast, same as every other
 * quiet confirmation in the console.
 */
export default function ReviewItem({ item }) {
  const { toast, openCall } = useConsole();

  return (
    <div className={styles.item}>
      <span className={styles.glyph}>
        <StatusGlyph kind={item.kind} />
      </span>
      <div className={styles.body}>
        <div className={styles.headRow}>
          <h2 className={`t-h2 ${styles.caller}`}>{item.caller}</h2>
          <div className={styles.context}>
            {item.time} · {item.context}
          </div>
        </div>

        <p className={`t-body ${styles.why}`}>{item.why}</p>

        <div className={styles.facts}>
          {item.facts.map((fact, i) => (
            <div key={fact.label ? `${fact.label}-${i}` : i}>
              <div className={`t-micro ${styles.factLabel}`}>{fact.label}</div>
              <div className={fact.mono ? 't-mono' : `t-body ${styles.factValue}`}>
                {fact.value}
              </div>
            </div>
          ))}
          <div>
            <div className={`t-micro ${styles.factLabel}`}>Field in doubt</div>
            <div className="t-mono">{item.field}</div>
            <div className={styles.fieldDots}>
              <ConfidenceDots filled={item.confidence.filled} title={item.confidence.title} />
            </div>
          </div>
        </div>

        <div className={styles.actions}>
          <Button
            variant="primary"
            size="lg"
            onClick={() => toast(`${item.action} — noted.`)}
          >
            {item.action}
          </Button>
          <Button variant="secondary" size="lg" onClick={() => toast(TOAST_COPY.callbackTask)}>
            Create callback task
          </Button>
          <Button
            variant="quiet"
            size="lg"
            className={styles.openCall}
            onClick={() => openCall(item.callId)}
          >
            Open the call →
          </Button>
        </div>
      </div>
    </div>
  );
}
