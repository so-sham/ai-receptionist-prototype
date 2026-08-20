// Mobile (<900) only: a 56px sticky bar carrying the practice mark and the
// signed-in avatar. Navigation lives in the fixed BottomNav below it.

import { PRACTICE, SIGNED_IN_USER } from './navItems.js';
import styles from './TopBar.module.css';

export default function TopBar() {
  return (
    <header className={styles.topbar}>
      <div className={styles.practice}>
        <span className={styles.mark} aria-hidden="true" />
        <span className={styles.name}>{PRACTICE.name}</span>
      </div>
      <button type="button" className={styles.avatar} title={SIGNED_IN_USER.name}>
        {SIGNED_IN_USER.initials}
      </button>
    </header>
  );
}
