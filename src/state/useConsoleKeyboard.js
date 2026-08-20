// Global keyboard handling. Call this ONCE, from the app shell.
//
//   Esc        close the drawer, compare drawer, quality-set modal, change
//              modal and decline panel
//   j / k      move the selection down / up within the visible call list
//   Enter      open the drawer for the selected call
//
// j/k/Enter are only live on the Calls route, with nothing open over the top
// of it, and only when focus is not inside a text field — otherwise typing
// "jack" in the search box would walk the list.

import { useEffect } from 'react';
import { useConsole } from './ConsoleStore.jsx';

const TEXT_ENTRY_TAGS = ['INPUT', 'TEXTAREA', 'SELECT'];

function isTypingInField() {
  if (typeof document === 'undefined') return false;
  const el = document.activeElement;
  if (!el) return false;
  if (TEXT_ENTRY_TAGS.includes(el.tagName)) return true;
  return el.isContentEditable === true;
}

/** True when anything is layered over the page. */
export function hasOverlayOpen(state) {
  return (
    state.openCallId !== null ||
    state.compareOpen ||
    state.qualitySetModalOpen ||
    state.modifyFor !== null ||
    state.declineFor !== null
  );
}

/**
 * @param {string} [route] The current route path, e.g. '/calls'. Routing is
 *   wired in a later phase, so the shell passes it in; when omitted the hook
 *   falls back to `state.route`.
 */
export default function useConsoleKeyboard(route) {
  const { state, visibleCalls: visible, escape, moveSelection, openCall } = useConsole();

  const activeRoute = route ?? state.route;

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        // Escape works everywhere, including from inside a modal's text input.
        //
        // But Drawer and Modal already close THEMSELVES on Escape, and each one
        // clears its own store flag as it goes. Dispatching the global ESCAPE on
        // top of that closed two layers on a single keypress: the primitive
        // cleared its flag first, then the reducer saw that layer already shut
        // and moved on to the one beneath it — which is how Escape inside the
        // quality-set modal used to tear down the call drawer behind it and lose
        // the call the operator was reading.
        //
        // So the store handles only the overlays no primitive owns. Today that
        // is the Approvals decline panel, which is plain markup rather than a
        // Modal.
        const ownedByAPrimitive =
          state.openCallId !== null ||
          state.compareOpen ||
          state.qualitySetModalOpen ||
          state.modifyFor !== null;
        if (!ownedByAPrimitive) escape();
        return;
      }

      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (activeRoute !== '/calls') return;
      if (hasOverlayOpen(state)) return;
      if (isTypingInField()) return;

      if (e.key === 'j' || e.key === 'k') {
        e.preventDefault();
        moveSelection(e.key === 'j' ? 1 : -1, visible.length);
        return;
      }

      if (e.key === 'Enter') {
        const row = visible[state.selectedIndex];
        if (row) {
          e.preventDefault();
          openCall(row.id, state.selectedIndex);
        }
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [activeRoute, state, visible, escape, moveSelection, openCall]);
}

export { useConsoleKeyboard };
