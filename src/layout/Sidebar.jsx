// The persistent left sidebar: 232px at >=1240, a 68px icon rail at 900–1239,
// not rendered at all below 900 (TopBar + BottomNav take over).
//
// Contents, top to bottom (README "Sidebar contents"): practice switcher,
// 24px gap, five nav items, margin-top:auto, hairline, the standing line naming
// the live booking mode, Settings, the signed-in user.

import { NavLink } from 'react-router-dom';

import { useConsole } from '../state';
import { pendingApprovalCount, modeLine } from '../state/selectors.js';

import { NAV_ITEMS, SETTINGS_ICON, PRACTICE, SIGNED_IN_USER } from './navItems.js';
import styles from './Sidebar.module.css';

export default function Sidebar({ collapsed = false }) {
  const { state } = useConsole();
  const pending = pendingApprovalCount(state);
  const mode = modeLine(state);

  // On the rail the labels are gone, so every row keeps a `title` tooltip.
  const showLabels = !collapsed;

  return (
    <nav
      className={collapsed ? `${styles.sidebar} ${styles.rail}` : styles.sidebar}
      aria-label="Main"
    >
      <button type="button" className={styles.practice} title={PRACTICE.name}>
        <span className={styles.mark} aria-hidden="true" />
        {showLabels ? (
          <>
            <span className={styles.practiceName}>{PRACTICE.name}</span>
            <span className={styles.chevron} aria-hidden="true">
              ▾
            </span>
          </>
        ) : null}
      </button>

      <div className={styles.nav}>
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
              <span className={styles.icon} aria-hidden="true">
                {item.icon}
              </span>
              {showLabels ? <span className={styles.label}>{item.label}</span> : null}
              {badge !== null ? (
                <span className={styles.badge} aria-label={`${badge} awaiting approval`}>
                  {badge}
                </span>
              ) : null}
            </NavLink>
          );
        })}
      </div>

      <div className={styles.footer}>
        {/* The sidebar echoes the live booking mode. Hidden on the rail — there
            is no room for a sentence in 68px. */}
        {showLabels ? <div className={styles.modeLine}>{mode}</div> : null}

        {/* Settings is not a route in this console; the row is present because
            the design calls for it, and is inert. */}
        <div className={styles.settings} title="Settings">
          <span className={styles.icon} aria-hidden="true">
            {SETTINGS_ICON}
          </span>
          {showLabels ? <span>Settings</span> : null}
        </div>

        <div className={styles.user} title={SIGNED_IN_USER.name}>
          <span className={styles.avatarSlot}>
            <span className={styles.avatar} aria-hidden="true">
              {SIGNED_IN_USER.initials}
            </span>
          </span>
          {showLabels ? <span>{SIGNED_IN_USER.name}</span> : null}
        </div>
      </div>
    </nav>
  );
}
