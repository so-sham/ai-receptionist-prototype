// Pure state layer for the console: initial state, action-type constants and
// the reducer. Kept free of JSX/React so it can be imported and exercised by a
// plain Node smoke test (see ConsoleStore.jsx for the React wiring).
//
// State shape follows the handoff README "State management" section, with a
// few fields the README omits but the interaction table requires:
//   query, approvalsTab, qualitySetName, neverBook, runNoted,
//   qualitySetExpanded, dataState, route, toastSeq, approvalReason.

import {
  APPROVAL_SLOTS,
  APPOINTMENT_TYPES,
  CAPABILITIES,
  DEFAULT_NEVER_BOOK,
  QUALITY_SET_ROWS,
} from '../data/index.js';

/* ------------------------------------------------------------------ *
 * Copy used by state transitions (kept here so screens never re-type it)
 * ------------------------------------------------------------------ */

export const TOAST_COPY = {
  booked: 'Booked. Undo available for 10 seconds.',
  bookedWithChanges: (reason) => `Booked with changes. “${reason}” logged as eval signal.`,
  declined: 'Declined — reason saved to the quality set.',
  holdReleased: 'Hold released and a callback task created for the front desk.',
  callbackTask: 'Callback task created for the front desk with the call attached.',
  capabilityUnsupported:
    'Your system doesn’t expose this. Contact support to check your version.',
  lockedType: 'This type is on the never-book list.',
  runNoted: (n, note) => `Run ${n} noted: “${note}”.`,
  addedToQualitySet: (count) => `Added. The quality set now has ${count} calls.`,
};

// The run currently at the top of the History list — the one "What changed?"
// writes its note against.
export const CURRENT_RUN_NUMBER = 12;
export const CURRENT_RUN_NOTE = 'after changing the greeting';
// Shown for a run that has not been noted yet.
export const EMPTY_RUN_NOTE = '—';

/* ------------------------------------------------------------------ *
 * Initial state — derived from the fixtures, never hand-copied
 * ------------------------------------------------------------------ */

const initialApprovalStatus = () =>
  APPROVAL_SLOTS.reduce((acc, a) => ({ ...acc, [a.id]: 'open' }), {});

const initialPerTypeMode = () =>
  APPOINTMENT_TYPES.reduce((acc, t) => ({ ...acc, [t.key]: t.defaultMode }), {});

const initialCapabilities = () =>
  CAPABILITIES.reduce((acc, c) => ({ ...acc, [c.key]: Boolean(c.supported && c.on) }), {});

export const initialState = {
  // shell
  route: '/today',
  viewportWidth: typeof window === 'undefined' ? 1440 : window.innerWidth,
  // 'ready' | 'loading' | 'error'. No real fetching happens in the prototype;
  // this exists so later phases can demonstrate the loading/error states the
  // README asks every screen to have.
  dataState: 'ready',

  // calls
  query: '',
  filters: [], // ('Held' | 'Emergency' | 'Opportunity' | 'At risk')[]
  selectedIndex: 0,
  openCallId: null,
  highlightedTurn: null, // transcript timestamp string, e.g. '3:14'
  playing: false,
  agentPanelExpanded: false,

  // approvals
  approvalsTab: 'held', // 'held' | 'review'
  approvalStatus: initialApprovalStatus(), // id -> 'open' | 'approved' | 'declined'
  approvalReason: {}, // id -> the modify/decline reason, captured as eval signal
  modifyFor: null,
  declineFor: null,

  // agent
  bookingMode: 'ask', // 'details' | 'ask' | 'direct'
  perTypeMode: initialPerTypeMode(),
  capabilities: initialCapabilities(),
  neverBook: [...DEFAULT_NEVER_BOOK],

  // quality
  qualityTab: 'check', // 'check' | 'history' | 'live'
  runState: 'idle', // 'idle' | 'running' | 'done'
  runIndex: 0,
  qualitySetCount: QUALITY_SET_ROWS.length, // 24
  qualitySetExpanded: false,
  runNoted: false,
  compareSelection: [CURRENT_RUN_NUMBER, CURRENT_RUN_NUMBER - 1], // max 2
  compareOpen: false,

  // shared
  qualitySetModalOpen: false,
  qualitySetName: '',
  toast: null,
  // Bumped on every toast so an identical repeated message still restarts the
  // 2.6s auto-clear timer in useToast.
  toastSeq: 0,
};

/* ------------------------------------------------------------------ *
 * Action types
 * ------------------------------------------------------------------ */

export const A = {
  SET_ROUTE: 'SET_ROUTE',
  SET_VIEWPORT_WIDTH: 'SET_VIEWPORT_WIDTH',
  SET_DATA_STATE: 'SET_DATA_STATE',

  OPEN_CALL: 'OPEN_CALL',
  CLOSE_DRAWER: 'CLOSE_DRAWER',
  SET_SELECTED_INDEX: 'SET_SELECTED_INDEX',
  MOVE_SELECTION: 'MOVE_SELECTION',
  SET_QUERY: 'SET_QUERY',
  TOGGLE_FILTER: 'TOGGLE_FILTER',
  REMOVE_FILTER: 'REMOVE_FILTER',
  CLEAR_FILTERS: 'CLEAR_FILTERS',
  HIGHLIGHT_TURN: 'HIGHLIGHT_TURN',
  TOGGLE_PLAYING: 'TOGGLE_PLAYING',
  TOGGLE_AGENT_PANEL: 'TOGGLE_AGENT_PANEL',
  GO_TO_CALLS_WITH_FILTER: 'GO_TO_CALLS_WITH_FILTER',

  SET_APPROVALS_TAB: 'SET_APPROVALS_TAB',
  APPROVE: 'APPROVE',
  DECLINE: 'DECLINE',
  UNDO_APPROVAL: 'UNDO_APPROVAL',
  OPEN_MODIFY: 'OPEN_MODIFY',
  CLOSE_MODIFY: 'CLOSE_MODIFY',
  CONFIRM_MODIFY: 'CONFIRM_MODIFY',
  OPEN_DECLINE: 'OPEN_DECLINE',
  CLOSE_DECLINE: 'CLOSE_DECLINE',
  RELEASE_HOLD: 'RELEASE_HOLD',

  SET_BOOKING_MODE: 'SET_BOOKING_MODE',
  SET_TYPE_MODE: 'SET_TYPE_MODE',
  TOGGLE_CAPABILITY: 'TOGGLE_CAPABILITY',
  REMOVE_NEVER_BOOK: 'REMOVE_NEVER_BOOK',
  ADD_NEVER_BOOK: 'ADD_NEVER_BOOK',

  SET_QUALITY_TAB: 'SET_QUALITY_TAB',
  START_RUN: 'START_RUN',
  TICK_RUN: 'TICK_RUN',
  CANCEL_RUN: 'CANCEL_RUN',
  FINISH_RUN: 'FINISH_RUN',
  NOTE_RUN: 'NOTE_RUN',
  TOGGLE_QUALITY_SET: 'TOGGLE_QUALITY_SET',
  TOGGLE_RUN_SELECTION: 'TOGGLE_RUN_SELECTION',
  OPEN_COMPARE: 'OPEN_COMPARE',
  CLOSE_COMPARE: 'CLOSE_COMPARE',

  OPEN_QUALITY_SET_MODAL: 'OPEN_QUALITY_SET_MODAL',
  CLOSE_QUALITY_SET_MODAL: 'CLOSE_QUALITY_SET_MODAL',
  SET_QUALITY_SET_NAME: 'SET_QUALITY_SET_NAME',
  SAVE_TO_QUALITY_SET: 'SAVE_TO_QUALITY_SET',

  TOAST: 'TOAST',
  CLEAR_TOAST: 'CLEAR_TOAST',

  ESCAPE: 'ESCAPE',
};

/* ------------------------------------------------------------------ *
 * Helpers
 * ------------------------------------------------------------------ */

const withToast = (state, message) =>
  message ? { ...state, toast: message, toastSeq: state.toastSeq + 1 } : state;

const setStatus = (state, id, status, reason) => ({
  ...state,
  approvalStatus: { ...state.approvalStatus, [id]: status },
  approvalReason:
    reason === undefined
      ? state.approvalReason
      : { ...state.approvalReason, [id]: reason },
});

const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

// Everything the call drawer owns, cleared together whenever it closes.
const DRAWER_RESET = {
  openCallId: null,
  highlightedTurn: null,
  playing: false,
  agentPanelExpanded: false,
};

/* ------------------------------------------------------------------ *
 * Reducer
 * ------------------------------------------------------------------ */

export function reducer(state, action) {
  switch (action.type) {
    /* ---- shell ---- */

    case A.SET_ROUTE:
      // README: "Nav item / bottom-bar icon → switch destination, close any
      // open drawer."
      return { ...state, route: action.route, openCallId: null, highlightedTurn: null };

    case A.SET_VIEWPORT_WIDTH:
      return state.viewportWidth === action.width
        ? state
        : { ...state, viewportWidth: action.width };

    case A.SET_DATA_STATE:
      return { ...state, dataState: action.dataState };

    /* ---- calls ---- */

    case A.OPEN_CALL:
      return {
        ...state,
        openCallId: action.id,
        // Row clicks pass their index so the j/k cursor follows the click.
        selectedIndex:
          typeof action.index === 'number' ? action.index : state.selectedIndex,
        // Drawer-local UI resets each time a call is opened; the README says
        // the agent panel's state "persists while the drawer is open", i.e.
        // not beyond it.
        highlightedTurn: null,
        playing: false,
        agentPanelExpanded: false,
      };

    case A.CLOSE_DRAWER:
      return {
        ...state,
        openCallId: null,
        highlightedTurn: null,
        playing: false,
        agentPanelExpanded: false,
      };

    case A.SET_SELECTED_INDEX:
      return { ...state, selectedIndex: Math.max(0, action.index) };

    case A.MOVE_SELECTION: {
      // `max` is the length of the currently visible (filtered) list, supplied
      // by the provider which has the selector to hand.
      const last = Math.max(0, (action.max ?? 0) - 1);
      return { ...state, selectedIndex: clamp(state.selectedIndex + action.delta, 0, last) };
    }

    case A.SET_QUERY:
      return { ...state, query: action.query, selectedIndex: 0 };

    case A.TOGGLE_FILTER: {
      const has = state.filters.includes(action.filter);
      return {
        ...state,
        filters: has
          ? state.filters.filter((f) => f !== action.filter)
          : [...state.filters, action.filter],
        selectedIndex: 0,
      };
    }

    case A.REMOVE_FILTER:
      return {
        ...state,
        filters: state.filters.filter((f) => f !== action.filter),
        selectedIndex: 0,
      };

    case A.CLEAR_FILTERS:
      // Matches the prototype: "Clear filters" clears the search box too.
      return { ...state, filters: [], query: '', selectedIndex: 0 };

    case A.HIGHLIGHT_TURN:
      return { ...state, highlightedTurn: action.at };

    case A.TOGGLE_PLAYING:
      return { ...state, playing: !state.playing };

    case A.TOGGLE_AGENT_PANEL:
      return { ...state, agentPanelExpanded: !state.agentPanelExpanded };

    case A.GO_TO_CALLS_WITH_FILTER:
      // Metric-card navigation. Replaces the filter set rather than adding to
      // it, so "Value at risk" never lands on Calls with a stale chip applied.
      return {
        ...state,
        route: '/calls',
        filters: [action.filter],
        query: '',
        selectedIndex: 0,
        openCallId: null,
        highlightedTurn: null,
      };

    /* ---- approvals ---- */

    case A.SET_APPROVALS_TAB:
      return { ...state, approvalsTab: action.tab };

    case A.APPROVE:
      return withToast(setStatus(state, action.id, 'approved'), TOAST_COPY.booked);

    case A.DECLINE:
      return withToast(
        {
          ...setStatus(state, action.id, 'declined', action.reason),
          declineFor: null,
        },
        TOAST_COPY.declined
      );

    case A.UNDO_APPROVAL: {
      const nextReason = { ...state.approvalReason };
      delete nextReason[action.id];
      return {
        ...state,
        approvalStatus: { ...state.approvalStatus, [action.id]: 'open' },
        approvalReason: nextReason,
      };
    }

    case A.OPEN_MODIFY:
      return { ...state, modifyFor: action.id, declineFor: null };

    case A.CLOSE_MODIFY:
      return { ...state, modifyFor: null };

    case A.CONFIRM_MODIFY:
      return withToast(
        { ...setStatus(state, action.id, 'approved', action.reason), modifyFor: null },
        TOAST_COPY.bookedWithChanges(action.reason)
      );

    case A.OPEN_DECLINE:
      return { ...state, declineFor: action.id, modifyFor: null };

    case A.CLOSE_DECLINE:
      return { ...state, declineFor: null };

    case A.RELEASE_HOLD:
      // "Create callback task" on a held slot: the hold goes away and the work
      // moves to the front desk, so the card settles as declined.
      return withToast(
        setStatus(state, action.id, 'declined', 'Callback task'),
        TOAST_COPY.holdReleased
      );

    /* ---- agent ---- */

    case A.SET_BOOKING_MODE:
      return { ...state, bookingMode: action.mode };

    case A.SET_TYPE_MODE: {
      const type = APPOINTMENT_TYPES.find((t) => t.key === action.typeKey);
      // Locked types (oral surgery & sedation) never change — they explain
      // themselves with a toast instead.
      if (!type || type.locked) return withToast(state, TOAST_COPY.lockedType);
      return {
        ...state,
        perTypeMode: { ...state.perTypeMode, [action.typeKey]: action.mode },
      };
    }

    case A.TOGGLE_CAPABILITY: {
      const cap = CAPABILITIES.find((c) => c.key === action.key);
      // The support column is read-only: it reflects the connected practice
      // management system, not a practice setting.
      if (!cap || !cap.supported) return withToast(state, TOAST_COPY.capabilityUnsupported);
      return {
        ...state,
        capabilities: { ...state.capabilities, [action.key]: !state.capabilities[action.key] },
      };
    }

    case A.REMOVE_NEVER_BOOK:
      return { ...state, neverBook: state.neverBook.filter((l) => l !== action.label) };

    case A.ADD_NEVER_BOOK:
      if (!action.label || state.neverBook.includes(action.label)) return state;
      return { ...state, neverBook: [...state.neverBook, action.label] };

    /* ---- quality ---- */

    case A.SET_QUALITY_TAB:
      return { ...state, qualityTab: action.tab };

    case A.START_RUN:
      return { ...state, runState: 'running', runIndex: 1, runNoted: false };

    case A.TICK_RUN:
      if (state.runState !== 'running') return state;
      if (state.runIndex >= state.qualitySetCount) return { ...state, runState: 'done' };
      return { ...state, runIndex: state.runIndex + 1 };

    case A.CANCEL_RUN:
      return { ...state, runState: 'idle', runIndex: 0 };

    case A.FINISH_RUN:
      return { ...state, runState: 'done', runIndex: state.qualitySetCount };

    case A.NOTE_RUN:
      return withToast(
        { ...state, runNoted: true },
        TOAST_COPY.runNoted(CURRENT_RUN_NUMBER, CURRENT_RUN_NOTE)
      );

    case A.TOGGLE_QUALITY_SET:
      return { ...state, qualitySetExpanded: !state.qualitySetExpanded };

    case A.TOGGLE_RUN_SELECTION: {
      const has = state.compareSelection.includes(action.n);
      // Max two; the oldest selection drops off.
      const next = has
        ? state.compareSelection.filter((x) => x !== action.n)
        : [...state.compareSelection, action.n].slice(-2);
      return { ...state, compareSelection: next };
    }

    case A.OPEN_COMPARE:
      if (state.compareSelection.length !== 2) return state;
      return { ...state, compareOpen: true };

    case A.CLOSE_COMPARE:
      return { ...state, compareOpen: false };

    /* ---- quality set modal (shared: opened from the call drawer) ---- */

    case A.OPEN_QUALITY_SET_MODAL:
      return {
        ...state,
        qualitySetModalOpen: true,
        qualitySetName: action.defaultName ?? '',
      };

    case A.CLOSE_QUALITY_SET_MODAL:
      return { ...state, qualitySetModalOpen: false };

    case A.SET_QUALITY_SET_NAME:
      return { ...state, qualitySetName: action.name };

    case A.SAVE_TO_QUALITY_SET: {
      const count = state.qualitySetCount + 1;
      return withToast(
        { ...state, qualitySetCount: count, qualitySetModalOpen: false },
        TOAST_COPY.addedToQualitySet(count)
      );
    }

    /* ---- toast ---- */

    case A.TOAST:
      return withToast(state, action.message);

    case A.CLEAR_TOAST:
      return state.toast === null ? state : { ...state, toast: null };

    /* ---- Escape ---- */

    case A.ESCAPE:
      // README: "Esc → close drawer, compare drawer, quality-set modal, change
      // modal, decline panel."
      //
      // These are NOT mutually exclusive: "Add to quality set" opens its modal
      // from inside the call drawer, so both are open at once. Dismissing every
      // overlay in one go therefore tore the drawer down behind the modal and
      // lost the call the operator was still reading. Escape closes the
      // INNERMOST layer only, outermost last.
      if (state.qualitySetModalOpen) return { ...state, qualitySetModalOpen: false };
      if (state.modifyFor !== null) return { ...state, modifyFor: null };
      if (state.declineFor !== null) return { ...state, declineFor: null };
      if (state.compareOpen) return { ...state, compareOpen: false };
      if (state.openCallId !== null) return { ...state, ...DRAWER_RESET };
      return state;

    default:
      return state;
  }
}

export default reducer;
