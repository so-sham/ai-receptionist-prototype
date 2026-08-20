// "When calls come in" — README §1c. 24-bar histogram, one bar per hour.
// Business-hours bars sit on a shaded column and render full-opacity; every
// other bar uses the low-alpha out-of-hours series colour.

import { Card } from '../../components';
import { HOURS, BUSINESS_HOURS_START, BUSINESS_HOURS_END } from '../../data';

import styles from './HourHistogram.module.css';

// "6 calls at 10am" — mirrors the source prototype's 12-hour formatting.
function hourLabel(hour) {
  const h12 = hour % 12 === 0 ? 12 : hour % 12;
  const period = hour < 12 ? 'am' : 'pm';
  return `${h12}${period}`;
}

const MAX_COUNT = Math.max(...HOURS.map((h) => h.count));

export default function HourHistogram() {
  return (
    <Card>
      <h2 className={`t-h2 ${styles.title}`}>When calls come in</h2>
      <div className={`t-small ${styles.subline}`}>18 of 47 arrived outside business hours</div>

      <div className={styles.chart}>
        {HOURS.map((h) => {
          const inBusinessHours = h.hour >= BUSINESS_HOURS_START && h.hour < BUSINESS_HOURS_END;
          return (
            <div
              key={h.hour}
              className={`${styles.column} ${inBusinessHours ? styles.columnBusiness : ''}`}
              title={`${h.count} calls at ${hourLabel(h.hour)}`}
            >
              <div
                className={styles.bar}
                style={{
                  height: `${MAX_COUNT ? (h.count / MAX_COUNT) * 100 : 0}%`,
                  background: inBusinessHours ? 'var(--accent)' : 'var(--series-5)',
                }}
              />
            </div>
          );
        })}
      </div>

      <div className={styles.axis}>
        <span>12a</span>
        <span>6a</span>
        <span>12p</span>
        <span>6p</span>
        <span>11p</span>
      </div>

      <div className={`t-small ${styles.legend}`}>
        <span className={styles.swatch} />
        Business hours, 8am–5pm
      </div>
    </Card>
  );
}
