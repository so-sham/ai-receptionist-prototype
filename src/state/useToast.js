// Toast plumbing: the 2.6s auto-dismiss from the README's component table.
//
// Mount this ONCE in the app shell (the same place that renders <Toast/>).
// Because the timer keys off `state.toastSeq`, any component anywhere can call
// `toast(...)` from useConsole() and still get the auto-clear — including when
// the same message fires twice in a row, which would otherwise leave the timer
// un-restarted.

import { useEffect, useRef } from 'react';
import { useConsole } from './ConsoleStore.jsx';

export const TOAST_DURATION_MS = 2600;

export default function useToast() {
  const { state, toast, clearToast } = useConsole();
  const timerRef = useRef(null);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (!state.toast) return undefined;
    timerRef.current = setTimeout(clearToast, TOAST_DURATION_MS);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = null;
    };
    // toastSeq changes on every toast, so a repeat of the same string still
    // restarts the countdown.
  }, [state.toastSeq, state.toast, clearToast]);

  return {
    toast: state.toast,
    showToast: toast,
    clearToast,
    duration: TOAST_DURATION_MS,
  };
}

export { useToast };
