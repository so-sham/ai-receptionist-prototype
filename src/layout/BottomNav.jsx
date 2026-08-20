// Mobile (<900) only: the fixed 64px bottom nav. Same five destinations and
// icons as the sidebar, always labelled — a phone has room for the labels the
// tablet rail has to drop.

import { NavLink } from 'react-router-dom';

import { useConsole } from '../state';
import { pendingApprovalCount } from '../state/selectors.js';

import { NAV_ITEMS } from './navItems.js';
import styles from './BottomNav.module.css';

export default function BottomNav() {
  const { state } = useConsole();
  const pending = pendingApprovalCount(state);

  return (
    <nav className={styles.bottomnav} aria-label="Main">
      {NAV_ITEMS.map((item) => {
        const badge = item.badge === 'approvals' && pending > 0 ? pending : null;
        return (
          <NavLink
            key={item.to}
            to={item.to}
            title={item.label}
            className={({ isActive }) =>
              isActive ? `${styles.item} ${styles.active}` : styles.item
            }
          >
            <span className={styles.iconWrap} aria-hidden="true">
              {item.icon}
              {badge !== null ? <span className={styles.badge}>{badge}</span> : null}
            </span>
            {item.label}
          </NavLink>
        );
      })}
    </nav>
  );
}
