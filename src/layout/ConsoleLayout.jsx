// The persistent app shell. Everything outside the routed screen lives here:
// the sidebar / rail (>=900) or top bar + bottom nav (<900), the content column
// with its per-breakpoint max-width, gutters and padding, and the two overlay
// mount points (the call drawer and the toast).
//
// This file is FROZEN after Phase 4. Screens are mounted through <Outlet/> and
// the drawer through <CallDrawer/>, which reads everything it needs from the
// store — so no later phase has a reason to edit the shell or the router.

import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';

import { Toast } from '../components';
import { useConsole, useConsoleKeyboard, useToast } from '../state';
import CallDrawer from '../features/call-drawer/CallDrawer.jsx';

import Sidebar from './Sidebar.jsx';
import TopBar from './TopBar.jsx';
import BottomNav from './BottomNav.jsx';
import useViewport from './useViewport.js';
import styles from './ConsoleLayout.module.css';

export default function ConsoleLayout() {
  const { narrow, mid, wide, xwide } = useViewport();
  const { pathname, search } = useLocation();
  const { setRoute, setDataState } = useConsole();

  // Global keyboard (Esc / j / k / Enter) and the toast auto-dismiss timer are
  // each mounted exactly once, here.
  useConsoleKeyboard(pathname);
  const { toast } = useToast();

  // README: "Nav item / bottom-bar icon → switch destination, close any open
  // drawer." SET_ROUTE clears openCallId and highlightedTurn, so mirroring the
  // router's location into the store covers every way a route can change —
  // clicks, deep links, and the browser's back button alike.
  useEffect(() => {
    setRoute(pathname);
  }, [pathname, setRoute]);

  // Dev affordance only. There is no backend to fail, so `?state=loading` and
  // `?state=error` are how the loading and error states specified for every
  // screen can actually be seen and reviewed. Anything else means 'ready', so
  // a plain URL always lands on real data.
  useEffect(() => {
    const requested = new URLSearchParams(search).get('state');
    setDataState(requested === 'loading' || requested === 'error' ? requested : 'ready');
  }, [search, setDataState]);

  const mainClass = [
    styles.main,
    narrow ? null : wide ? styles.mainWide : styles.mainRail,
  ]
    .filter(Boolean)
    .join(' ');

  const contentClass = [
    styles.content,
    mid ? styles.contentMid : null,
    wide ? styles.contentWide : null,
    xwide ? styles.contentXWide : null,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={styles.shell}>
      {narrow ? <TopBar /> : <Sidebar collapsed={mid} />}

      <div className={mainClass}>
        <main className={contentClass}>
          <Outlet />
        </main>
      </div>

      {narrow ? <BottomNav /> : null}

      {/* Overlay mount points — one instance each, for the whole app. */}
      <CallDrawer />
      <Toast message={toast} />
    </div>
  );
}
