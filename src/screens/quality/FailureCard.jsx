// One "What it got wrong" card.
//
// Expected-versus-got is STACKED and plainly labelled — no diff colours, no
// side-by-side columns. The reader is a practice owner, not someone reviewing
// a pull request.

import { Button, Card } from '../../components';

import styles from './FailureCard.module.css';

export default function FailureCard({ failure, onListen }) {
  return (
    <Card>
      <div className={styles.head}>
        <span className={styles.glyph} role="img" aria-label="Failed">
          ✗
        </span>
        <span className="t-body-strong">{failure.name}</span>
      </div>

      <div className={styles.rows}>
        <div className={styles.row}>
          <span className={`t-body ${styles.label}`}>Should have been:</span>
          <span className="t-mono">{failure.expected}</span>
        </div>
        <div className={styles.row}>
          <span className={`t-body ${styles.label}`}>It said:</span>
          <span className="t-mono">{failure.got}</span>
        </div>
      </div>

      <p className={`t-body ${styles.why}`}>{failure.why}</p>

      <Button variant="quiet" size="sm" onClick={onListen} className={styles.listen}>
        Listen to this call
      </Button>
    </Card>
  );
}
