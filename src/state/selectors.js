// Derived values. Every function here is pure: it takes the console state
// (and/or an id) and reads from src/data. No React, no side effects — screens
// call these instead of re-deriving anything locally.

import {
  CALLS,
  APPROVAL_SLOTS,
  BOOKING_MODES,
  CAPABILITIES,
  APPOINTMENT_TYPES,
  RUNS,
} from '../data/index.js';

import { CURRENT_RUN_NUMBER, CURRENT_RUN_NOTE, EMPTY_RUN_NOTE } from './reducer.js';

/* ------------------------------------------------------------------ *
 * Calls
 * ------------------------------------------------------------------ */

// Everything the search box matches against: the caller (which is the phone
// number itself for unmatched callers), the "About" sentence, the call type,
// the plain-prose summary, and every transcript turn — the README's
// placeholder promises "name, number, or words in the call".
const haystack = (call) =>
  [
    call.caller,
    call.about,
    call.type,
    call.summary,
    ...call.transcript.map((t) => t.text),
  ]
    .join(' ')
    .toLowerCase();

/**
 * The filtered call list the Calls table renders and j/k walks.
 *
 * Four filter values exist. 'Held' and 'Emergency' are the two the filter
 * pills toggle ("Outcome" and "Type"); the prototype's "Opportunity" and
 * "Date" pills are inert. 'Opportunity' and 'At risk' still have to be
 * honoured here because goToCallsWithFilter() sets them from the Today
 * metric cards.
 */
export function visibleCalls(state) {
  const q = (state.query || '').trim().toLowerCase();
  const f = state.filters || [];
  return CALLS.filter((c) => {
    if (q && !haystack(c).includes(q)) return false;
    if (f.includes('Held') && c.outcome !== 'Held') return false;
    if (f.includes('Emergency') && c.type !== 'Emergency') return false;
    // An "opportunity" is a call carrying a monetary value.
    if (f.includes('Opportunity') && c.value === '—') return false;
    // "At risk" is value that has not been converted into a booking.
    if (f.includes('At risk') && !(c.value !== '—' && c.outcome !== 'Booked')) return false;
    return true;
  });
}

export const totalCallCount = () => CALLS.length;

export function callCountLine(state) {
  return `${visibleCalls(state).length} of ${CALLS.length} calls · last 24 hours`;
}

export const callById = (callId) => CALLS.find((c) => c.id === callId) || null;

/** The visible call the j/k cursor is currently on, or null. */
export function selectedCall(state) {
  const rows = visibleCalls(state);
  return rows[state.selectedIndex] || null;
}

/* ---- filter chips ---------------------------------------------------- */

// Raw filter value -> the text shown on its removable chip.
export const FILTER_CHIP_LABELS = {
  Held: 'Outcome: held',
  Emergency: 'Type: emergency',
  Opportunity: 'Opportunities only',
  'At risk': 'Value at risk · not booked',
};

/** [{ value, label }] for every active filter, in the order applied. */
export function filterChipLabels(state) {
  return (state.filters || []).map((value) => ({
    value,
    label: FILTER_CHIP_LABELS[value] || value,
  }));
}

// The four pills in the filter bar and the filter value each one toggles.
// "Opportunity" and "Date" are inert in the design — they carry no filter
// value, so the pill renders but toggling it is a no-op.
export const FILTER_PILLS = [
  { label: 'Outcome', filter: 'Held' },
  { label: 'Type', filter: 'Emergency' },
  { label: 'Opportunity', filter: null },
  { label: 'Date', filter: null },
];

/* ------------------------------------------------------------------ *
 * Approvals
 * ------------------------------------------------------------------ */

export const approvalStatusOf = (state, id) => state.approvalStatus[id] || 'open';

/** Held slots still awaiting a decision — drives the sidebar badge. */
export function pendingApprovalCount(state) {
  return APPROVAL_SLOTS.filter((a) => approvalStatusOf(state, a.id) === 'open').length;
}

export function approvalsLine(state) {
  const n = pendingApprovalCount(state);
  return n
    ? `${n} slots held. The agent won’t write anything until you approve.`
    : 'Nothing held. The agent is waiting on nothing.';
}

/**
 * The held slot belonging to a call, or null.
 *
 * Defect fix: the prototype mapped a drawer back to an approval row with a
 * hardcoded `call.id === 2 ? 1 : 2` ternary, which silently mis-approves for
 * any call other than the two it was written against. APPROVAL_SLOTS carries
 * a `callId` on every row, so look it up.
 */
export function approvalForCall(state, callId) {
  return APPROVAL_SLOTS.find((a) => a.callId === callId) || null;
}

export const approvalById = (id) => APPROVAL_SLOTS.find((a) => a.id === id) || null;

/**
 * The drawer's right-aligned primary action.
 *
 * Note on fixture data: APPROVAL_SLOTS #3 points at call 4, whose own record
 * says outcome 'Booked'. That inconsistency comes from the source prototype
 * (which never linked slot 3 to a drawer). The approval record is treated as
 * authoritative here, per the README: "'Approve the hold' when the call has a
 * held slot."
 */
export function drawerPrimaryLabel(state, callId) {
  const approval = approvalForCall(state, callId);
  const open = approval && approvalStatusOf(state, approval.id) === 'open';
  return open ? 'Approve the hold' : 'Call back';
}

/* ------------------------------------------------------------------ *
 * Call drawer — "How the agent handled it"
 * ------------------------------------------------------------------ */

/** e.g. "3m 12s on the line · handed to a human · 4 of 5 fields read" */
export function agentSummaryLine(callId) {
  const call = callById(callId);
  if (!call) return '';
  const read = call.confidenceFields.filter((u) => u.value !== '—').length;
  const handling = call.escalated ? 'handed to a human' : 'handled end to end';
  return `${call.duration} on the line · ${handling} · ${read} of ${call.confidenceFields.length} fields read`;
}

/**
 * Per-call latency stats for the drawer's "On the line" block.
 *
 * ILLUSTRATIVE ONLY. There is no latency data in the fixtures; the prototype
 * pseudo-derives these from `call.id % n` so each call shows stable, plausible,
 * slightly different numbers. That derivation is reproduced verbatim. Replace
 * wholesale when real per-call telemetry exists.
 *
 * `ok: false` renders the value in --pending (off target).
 */
export function drawerLatencyStats(callId) {
  const call = callById(callId);
  if (!call) return [];
  const slowest = 1.1 + (call.id % 3) * 0.3;
  return [
    {
      label: 'Typical reply speed',
      value: `${(0.6 + (call.id % 4) * 0.1).toFixed(1)}s`,
      ok: true,
    },
    { label: 'Slowest reply', value: `${slowest.toFixed(1)}s`, ok: slowest < 1.8 },
    { label: 'Caller talked over it', value: `${call.id % 3} times`, ok: true },
    {
      label: 'Asked the same thing twice',
      value: call.id % 4 === 0 ? 'Once' : 'No',
      ok: call.id % 4 !== 0,
    },
  ];
}

/** Transcript turns with the flag-highlight state already resolved. */
export function transcriptTurns(state, callId) {
  const call = callById(callId);
  if (!call) return [];
  return call.transcript.map((t) => ({
    ...t,
    flag: t.flag || null,
    highlighted: state.highlightedTurn === t.time,
  }));
}

/* Simulated player, per the README: 0:00 ↔ 1:47 of 3:12. */
export const playerState = (state) => ({
  playing: state.playing,
  glyph: state.playing ? '❚❚' : '▶',
  percent: state.playing ? 56 : 0,
  time: state.playing ? '1:47 / 3:12' : '0:00 / 3:12',
});

/* ------------------------------------------------------------------ *
 * Agent
 * ------------------------------------------------------------------ */

/** The sidebar's standing line naming the live booking mode. */
export function modeLine(state) {
  switch (state.bookingMode) {
    case 'direct':
      return 'Booking directly into the schedule.';
    case 'details':
      return 'Taking details only — the schedule is untouched.';
    case 'ask':
    default:
      return 'Holding slots for your approval.';
  }
}

export const bookingModes = (state) =>
  BOOKING_MODES.map((m) => ({ ...m, selected: state.bookingMode === m.key }));

/** The effective mode for one appointment type; locked types are always details. */
export function typeModeFor(state, typeKey) {
  const type = APPOINTMENT_TYPES.find((t) => t.key === typeKey);
  if (!type) return state.bookingMode;
  if (type.locked) return 'details';
  return state.perTypeMode[typeKey] || state.bookingMode;
}

export const capabilityRows = (state) =>
  CAPABILITIES.map((c) => {
    const on = Boolean(c.supported && state.capabilities[c.key]);
    return {
      ...c,
      on,
      status: on ? 'Working' : c.supported ? 'Switched off' : 'Not available',
      statusTone: on ? 'settled' : c.supported ? 'pending' : 'faint',
    };
  });

/**
 * README §5c: the capability table's footnote names the FIRST supported-but-
 * switched-off capability. Returns null when nothing is switched off, so the
 * caller can fall back to the generic line (or omit the footnote entirely).
 */
export function capabilitiesFootnote(state) {
  const off = CAPABILITIES.find((c) => c.supported && !state.capabilities[c.key]);
  if (!off) return null;
  return `With “${off.label.toLowerCase()}” off, the agent says the front desk will handle it and passes you the details.`;
}

/* ------------------------------------------------------------------ *
 * Quality
 * ------------------------------------------------------------------ */

export const runPercent = (state) =>
  state.qualitySetCount ? Math.round((state.runIndex / state.qualitySetCount) * 100) : 0;

export function runningCaseName(state, runNames) {
  if (!runNames || !runNames.length) return '';
  return runNames[Math.max(0, state.runIndex - 1) % runNames.length];
}

/**
 * The History run list.
 *
 * Defect fix: the prototype wrote `s.runNamed ? 'after changing the greeting'
 * : 'after changing the greeting'` — both branches identical, so run 12 always
 * looked noted. Only the current run (12) is affected by runNoted; the older
 * runs keep their real historical notes from the fixture.
 */
export function runRows(state) {
  return RUNS.map((r) => {
    const isCurrent = r.n === CURRENT_RUN_NUMBER;
    const note = isCurrent ? (state.runNoted ? CURRENT_RUN_NOTE : EMPTY_RUN_NOTE) : r.note;
    return {
      ...r,
      note,
      hasNote: note !== EMPTY_RUN_NOTE,
      selected: state.compareSelection.includes(r.n),
    };
  });
}

/** The "What changed?" button's label, before and after it's used. */
export const runNoteLabel = (state) =>
  state.runNoted ? `Note: ${CURRENT_RUN_NOTE}` : 'What changed?';

export const canCompare = (state) => state.compareSelection.length === 2;

export function compareHint(state) {
  const sel = state.compareSelection;
  if (sel.length === 2) {
    // Newest selection first, matching the design's "Comparing run 12 with run 11".
    const [a, b] = [...sel].sort((x, y) => y - x);
    return `Comparing run ${a} with run ${b}`;
  }
  if (sel.length === 1) return 'Select one more run to compare';
  return 'Select two runs to compare';
}

export function compareTitle(state) {
  const sel = [...state.compareSelection].sort((x, y) => y - x);
  return sel.length === 2 ? `Run ${sel[0]} vs run ${sel[1]}` : '';
}

/* ------------------------------------------------------------------ *
 * Shell
 * ------------------------------------------------------------------ */

// The three breakpoints from the README's layout-shell table.
export function breakpoint(state) {
  const w = state.viewportWidth;
  if (w < 900) return 'mobile';
  if (w < 1240) return 'tablet';
  return 'desktop';
}

export const isNarrow = (state) => state.viewportWidth < 900;
export const isWide = (state) => state.viewportWidth >= 1240;
export const isExtraWide = (state) => state.viewportWidth >= 1680;
