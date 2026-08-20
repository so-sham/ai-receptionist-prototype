// Booking mode — README §5a. Three radio cards; the selected card gets a 2px
// accent border and a filled radio dot. Selected/unselected padding differ
// by 1px so the border-width change never shifts the card's content by a
// pixel. The "CALLER HEARS" block sits at margin-top: auto so its hairline
// lines up across all three cards regardless of how long each card's
// consequence line runs.

import { SectionHead } from '../../components';
import { useConsole, selectors } from '../../state';

import styles from './BookingModeCards.module.css';

export default function BookingModeCards() {
  const { state, setBookingMode } = useConsole();
  const modes = selectors.bookingModes(state);

  return (
    <section className={styles.section}>
      <SectionHead>Booking mode</SectionHead>
      <div className={styles.row}>
        {modes.map((m) => (
          <button
            key={m.key}
            type="button"
            className={`${styles.card} ${m.selected ? styles.selected : ''}`}
            onClick={() => setBookingMode(m.key)}
            aria-pressed={m.selected}
          >
            <div className={styles.titleRow}>
              <span className={styles.dot} aria-hidden="true">
                <span className={styles.dotInner} />
              </span>
              <div className={`t-h2 ${styles.title}`}>{m.title}</div>
            </div>
            <div className={`t-body ${styles.consequence}`}>{m.consequence}</div>
            <div className={styles.hears}>
              <div className={`t-micro ${styles.hearsLabel}`}>Caller hears</div>
              <div className={`t-body ${styles.hearsText}`}>“{m.callerHears}”</div>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
