// React wiring for the console state: one provider at the app root, one
// useConsole() hook everywhere else.
//
// Screens should never dispatch raw actions — every transition is exposed as a
// bound function on the context value, so a screen calls `openCall(5)` rather
// than assembling an action object. `dispatch` is still exposed for escape
// hatches, but reach for it last.

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
} from 'react';

import { reducer, initialState, A } from './reducer.js';
import { visibleCalls } from './selectors.js';

const ConsoleContext = createContext(null);

export function ConsoleProvider({ children, initial }) {
  const [state, dispatch] = useReducer(reducer, { ...initialState, ...initial });

  // The visible list is needed by moveSelection (to clamp) and by the keyboard
  // hook (to resolve Enter), so compute it once per render here.
  const visible = useMemo(() => visibleCalls(state), [state.query, state.filters]);

  // Keep a ref so the bound actions below stay referentially stable while
  // still seeing the current list.
  const visibleRef = useRef(visible);
  visibleRef.current = visible;

  // Nothing else in the app owns the viewport width, and three breakpoints
  // depend on it, so the provider tracks it.
  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const onResize = () => dispatch({ type: A.SET_VIEWPORT_WIDTH, width: window.innerWidth });
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const actions = useMemo(
    () => ({
      /* ---- shell ---- */
      setRoute: (route) => dispatch({ type: A.SET_ROUTE, route }),
      setViewportWidth: (width) => dispatch({ type: A.SET_VIEWPORT_WIDTH, width }),
      setDataState: (dataState) => dispatch({ type: A.SET_DATA_STATE, dataState }),

      /* ---- calls ---- */
      // `index` is optional: pass the row index from a Calls row click so the
      // j/k cursor follows the pointer. Today's worklist omits it.
      openCall: (id, index) => dispatch({ type: A.OPEN_CALL, id, index }),
      closeDrawer: () => dispatch({ type: A.CLOSE_DRAWER }),
      setSelectedIndex: (index) => dispatch({ type: A.SET_SELECTED_INDEX, index }),
      // Clamped against the CURRENTLY VISIBLE list. Pass `max` to override
      // (the keyboard hook does not need to).
      moveSelection: (delta, max) =>
        dispatch({
          type: A.MOVE_SELECTION,
          delta,
          max: typeof max === 'number' ? max : visibleRef.current.length,
        }),
      setQuery: (query) => dispatch({ type: A.SET_QUERY, query }),
      toggleFilter: (filter) => filter && dispatch({ type: A.TOGGLE_FILTER, filter }),
      removeFilter: (filter) => dispatch({ type: A.REMOVE_FILTER, filter }),
      clearFilters: () => dispatch({ type: A.CLEAR_FILTERS }),
      highlightTurn: (at) => dispatch({ type: A.HIGHLIGHT_TURN, at }),
      togglePlaying: () => dispatch({ type: A.TOGGLE_PLAYING }),
      toggleAgentPanel: () => dispatch({ type: A.TOGGLE_AGENT_PANEL }),

      // Today's clickable metric cards. Sets the filter and returns the target
      // path so the caller's onClick can navigate — routing itself is wired in
      // a later phase.
      goToCallsWithFilter: (filter) => {
        dispatch({ type: A.GO_TO_CALLS_WITH_FILTER, filter });
        return '/calls';
      },

      /* ---- approvals ---- */
      setApprovalsTab: (tab) => dispatch({ type: A.SET_APPROVALS_TAB, tab }),
      approve: (id) => dispatch({ type: A.APPROVE, id }),
      decline: (id, reason) => dispatch({ type: A.DECLINE, id, reason }),
      undoApproval: (id) => dispatch({ type: A.UNDO_APPROVAL, id }),
      openModify: (id) => dispatch({ type: A.OPEN_MODIFY, id }),
      closeModify: () => dispatch({ type: A.CLOSE_MODIFY }),
      confirmModify: (id, reason) => dispatch({ type: A.CONFIRM_MODIFY, id, reason }),
      openDecline: (id) => dispatch({ type: A.OPEN_DECLINE, id }),
      closeDecline: () => dispatch({ type: A.CLOSE_DECLINE }),
      releaseHold: (id) => dispatch({ type: A.RELEASE_HOLD, id }),

      /* ---- agent ---- */
      setBookingMode: (mode) => dispatch({ type: A.SET_BOOKING_MODE, mode }),
      setTypeMode: (typeKey, mode) => dispatch({ type: A.SET_TYPE_MODE, typeKey, mode }),
      toggleCapability: (key) => dispatch({ type: A.TOGGLE_CAPABILITY, key }),
      removeNeverBook: (label) => dispatch({ type: A.REMOVE_NEVER_BOOK, label }),
      addNeverBook: (label) => dispatch({ type: A.ADD_NEVER_BOOK, label }),

      /* ---- quality ---- */
      setQualityTab: (tab) => dispatch({ type: A.SET_QUALITY_TAB, tab }),
      startRun: () => dispatch({ type: A.START_RUN }),
      tickRun: () => dispatch({ type: A.TICK_RUN }),
      cancelRun: () => dispatch({ type: A.CANCEL_RUN }),
      finishRun: () => dispatch({ type: A.FINISH_RUN }),
      noteRun: () => dispatch({ type: A.NOTE_RUN }),
      toggleQualitySet: () => dispatch({ type: A.TOGGLE_QUALITY_SET }),
      toggleRunSelection: (n) => dispatch({ type: A.TOGGLE_RUN_SELECTION, n }),
      openCompare: () => dispatch({ type: A.OPEN_COMPARE }),
      closeCompare: () => dispatch({ type: A.CLOSE_COMPARE }),

      /* ---- quality set modal ---- */
      openQualitySetModal: (defaultName) =>
        dispatch({ type: A.OPEN_QUALITY_SET_MODAL, defaultName }),
      closeQualitySetModal: () => dispatch({ type: A.CLOSE_QUALITY_SET_MODAL }),
      setQualitySetName: (name) => dispatch({ type: A.SET_QUALITY_SET_NAME, name }),
      saveToQualitySet: () => dispatch({ type: A.SAVE_TO_QUALITY_SET }),

      /* ---- shared ---- */
      toast: (message) => dispatch({ type: A.TOAST, message }),
      clearToast: () => dispatch({ type: A.CLEAR_TOAST }),
      // Closes every overlay at once — used by the Escape key.
      escape: () => dispatch({ type: A.ESCAPE }),
    }),
    []
  );

  const value = useMemo(
    () => ({ state, dispatch, visibleCalls: visible, ...actions }),
    [state, visible, actions]
  );

  return <ConsoleContext.Provider value={value}>{children}</ConsoleContext.Provider>;
}

export function useConsole() {
  const ctx = useContext(ConsoleContext);
  if (!ctx) throw new Error('useConsole() must be used inside <ConsoleProvider>');
  return ctx;
}

export { ConsoleContext };
export default ConsoleProvider;
