// The five destinations, shared by the sidebar and the mobile bottom nav so the
// two can never drift apart.
//
// Icons are single glyphs, no icon library (README): Today ◉, Calls ☎,
// Approvals ◐, Agent ◈, Quality ✓, Settings ⚙. Agent must NOT reuse ⚙ — in the
// collapsed rail it would be indistinguishable from Settings.

export const NAV_ITEMS = [
  { to: '/today', label: 'Today', icon: '◉' },
  { to: '/calls', label: 'Calls', icon: '☎' },
  { to: '/approvals', label: 'Approvals', icon: '◐', badge: 'approvals' },
  { to: '/agent', label: 'Agent', icon: '◈' },
  { to: '/quality', label: 'Quality', icon: '✓' },
];

export const SETTINGS_ICON = '⚙';

// Identity shown in the practice switcher / top bar and the signed-in row.
export const PRACTICE = { name: 'Super Frontdesk', initials: 'SF' };
export const SIGNED_IN_USER = { name: 'Marisol Alvarez', initials: 'MA' };

export default NAV_ITEMS;
