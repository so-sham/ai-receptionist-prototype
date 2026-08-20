// Fixture data extracted from the design prototype
// (AI Receptionist Console.dc.html, checks / failures / setRows / runs /
// compareRows / RUN_NAMES / trendEl / modTaxonomy / liveMetrics / signals).
// Data only — no colours, no callbacks, no JSX.
//
// NOTE on QUALITY_SET_ROWS: the prototype's source only spells out 6 named
// rows in `setRows` plus 4 more distinct case names inside RUN_NAMES (used
// for the "Checking call N of 24" running label), for 10 uniquely-named
// cases total. The quality set itself is stated to hold 24 calls
// (`setCount: 24`), but the other 14 rows are never individually named in
// the source. Those 14 below are inferred/invented, kept in the same style
// as the real ones, and are the one place in this file that isn't a literal
// transcription — flagged here so it's easy to replace with real data later.

export const CHECKS = [
  {
    question: 'Is this a possible patient?',
    field: 'lead_qualification',
    score: '23/24 · 96%',
    target: '85%',
    change: '↑ 4%',
    pass: true,
    pill: '✓ Pass',
  },
  {
    question: 'Did it work out what they wanted?',
    field: 'intent_detection',
    score: '22/24 · 92%',
    target: '85%',
    change: '—',
    pass: true,
    pill: '✓ Pass',
  },
  {
    question: 'Did it work out what kind of treatment?',
    field: 'treatment_class',
    score: '21/24 · 88%',
    target: '80%',
    change: '↑ 4%',
    pass: true,
    pill: '✓ Pass',
  },
  {
    question: 'Did it read the insurance correctly?',
    field: 'payer_extraction',
    score: '19/24 · 79%',
    target: '80%',
    change: '↓ 4%',
    pass: false,
    pill: '◐ Below target',
  },
  {
    question: 'Did it know when not to book?',
    field: 'booking_restraint',
    score: '24/24 · 100%',
    target: '90%',
    change: '—',
    pass: true,
    pill: '✓ Pass',
  },
];

// The always-must-pass row, rendered first and differently from the rest —
// a badge instead of a numeric target.
export const EMERGENCY_CHECK = {
  question: 'Did it spot an emergency?',
  field: 'emergency_detection',
  score: '4/4 · 100%',
  pass: true,
  badge: '✓ Must always pass',
};

export const FAILURES = [
  {
    name: 'Supply vendor using a treatment word',
    expected: 'Not a possible patient',
    got: 'A possible patient',
    why: 'The caller mentioned “implant components” but was selling supplies, not asking for treatment.',
    callId: 6,
  },
  {
    name: 'Insurance we do not accept',
    expected: 'Guardian · out of network',
    got: 'Guardian · in network',
    why: 'The agent read the payer correctly but quoted in-network pricing. It should have said we are out of network before offering a figure.',
    callId: 3,
  },
];

export const QUALITY_SET_ROWS = [
  // The 6 rows given verbatim in `setRows`.
  { name: 'Caller with facial swelling', label: 'emergency · escalate', origin: 'From a real call' },
  { name: 'Supply vendor using a treatment word', label: 'not a patient', origin: 'From a real call' },
  { name: 'Insurance we do not accept', label: 'out of network', origin: 'Seeded' },
  { name: 'Family member booking', label: 'new patient · minor', origin: 'Seeded' },
  { name: 'Caller who never states a reason', label: 'unknown intent', origin: 'Seeded' },
  { name: 'Two appointments in one call', label: 'multi-booking', origin: 'From a real call' },
  // The 4 additional case names that appear only in RUN_NAMES, not in
  // `setRows` — label/origin inferred from context (marked below).
  { name: 'Existing patient moving a cleaning', label: 'reschedule · hygiene', origin: 'From a real call' },
  { name: 'New patient, implant consult', label: 'new patient · implant', origin: 'From a real call' },
  { name: 'Caller on a bad line', label: 'audio quality', origin: 'Seeded' },
  { name: 'Child patient, parent calling', label: 'new patient · minor', origin: 'From a real call' },
  // The remaining 14 rows are not named anywhere in the source (the quality
  // set is only ever stated to total 24 calls). Invented in the same style,
  // to be replaced with real data.
  { name: 'Caller asking for pricing only', label: 'pricing question', origin: 'Seeded' },
  { name: 'Vendor spam call', label: 'not a patient', origin: 'Seeded' },
  { name: 'Caller confirms an existing appointment', label: 'confirmation', origin: 'From a real call' },
  { name: 'Billing dispute call', label: 'billing', origin: 'From a real call' },
  { name: 'Caller requests a language other than English', label: 'language fallback', origin: 'Seeded' },
  { name: 'Caller asks for a specific person by name', label: 'transfer request', origin: 'Seeded' },
  { name: 'Out-of-hours emergency call', label: 'emergency · after hours', origin: 'Seeded' },
  { name: 'New patient with no insurance', label: 'self-pay', origin: 'From a real call' },
  { name: 'Caller reschedules twice in one call', label: 'multi-reschedule', origin: 'Seeded' },
  { name: 'Silent call, no response', label: 'no engagement', origin: 'From a real call' },
  { name: 'Caller asks about parking and hours', label: 'general question', origin: 'From a real call' },
  { name: 'Insurance carrier not recognized', label: 'unverified insurance', origin: 'Seeded' },
  { name: 'Caller requests same-day appointment', label: 'urgent, non-emergency', origin: 'Seeded' },
  { name: 'Provider-specific request', label: 'provider preference', origin: 'Seeded' },
];

export const RUNS = [
  { n: 12, when: '2 hrs ago', note: 'after changing the greeting', score: '22/24', delta: '↑ 1' },
  { n: 11, when: '3 days ago', note: 'baseline', score: '21/24', delta: '↓ 2' },
  { n: 10, when: '6 days ago', note: '—', score: '23/24', delta: '↑ 3' },
  { n: 9, when: '2 wks ago', note: 'shorter hold script', score: '20/24', delta: '↑ 1' },
  { n: 8, when: '3 wks ago', note: 'first run', score: '19/24', delta: '—' },
];

// Compare drawer default: "Run 12 vs run 11".
export const COMPARE_ROWS = [
  { question: 'Is this a possible patient?', was: '22/24', now: '23/24', delta: '↑ 1' },
  { question: 'Did it work out what they wanted?', was: '22/24', now: '22/24', delta: '—' },
  { question: 'Treatment class', was: '20/24', now: '21/24', delta: '↑ 1' },
  { question: 'Insurance', was: '20/24', now: '19/24', delta: '↓ 1' },
  { question: 'Knew when not to book', was: '24/24', now: '24/24', delta: '—' },
];

// Case names cycled through during "Checking call N of 24".
export const RUN_NAMES = [
  'Existing patient moving a cleaning',
  'Caller with facial swelling',
  'Supply vendor using a treatment word',
  'Insurance we do not accept',
  'Family member booking',
  'Caller who never states a reason',
  'New patient, implant consult',
  'Two appointments in one call',
  'Caller on a bad line',
  'Child patient, parent calling',
];

// Score-by-run line chart, most recent 5 runs (out of 24), oldest to newest.
export const TREND_SCORES = [19, 20, 23, 21, 22];
export const TREND_TARGET = 19.2; // dashed reference line, 80% of 24

export const MOD_TAXONOMY = [
  { label: 'Time slot', count: 9, pct: '60%' },
  { label: 'Appointment type', count: 3, pct: '20%' },
  { label: 'Length', count: 2, pct: '13%' },
  { label: 'Provider', count: 1, pct: '7%' },
];

export const MOD_READING =
  'Most corrections are the time, not the treatment — the agent is reading calls correctly and reading your availability a few minutes late. That is an integration fix, not a retraining one.';

export const LIVE_METRICS = [
  { label: 'Reply speed, typical', value: '740ms', note: 'Under the 800ms budget', attention: false },
  {
    label: 'Reply speed, worst 1%',
    value: '1.9s',
    note: 'Long enough to sound like a dropped call',
    attention: true,
  },
  { label: 'Stops when talked over', value: '160ms', note: '1.4% stopped by a “mm-hm”', attention: false },
  { label: 'Calls with no record', value: '0', note: 'Should always be zero', attention: false },
];

export const SIGNALS = [
  {
    label: 'Front desk corrected the agent',
    sub: 'The most honest quality signal you have',
    thisWeek: '5 of 52',
    lastWeek: '9 of 61',
    status: '✓ Falling',
    ok: true,
  },
  {
    label: 'Escalated to a human',
    sub: 'A spike here is a capability problem first',
    thisWeek: '12%',
    lastWeek: '11%',
    status: '✓ Steady',
    ok: true,
  },
  {
    label: 'Review queue',
    sub: 'Against a budget of 12% of calls',
    thisWeek: '9%',
    lastWeek: '7%',
    status: '✓ In budget',
    ok: true,
  },
  {
    label: 'Patient rang back after an agent call',
    sub: 'They did not get what they called for',
    thisWeek: '6%',
    lastWeek: '4%',
    status: '◐ Watch',
    ok: false,
  },
  {
    label: 'Held slots that expired unworked',
    sub: 'Each one is a promise the practice broke',
    thisWeek: '2',
    lastWeek: '0',
    status: '◐ Watch',
    ok: false,
  },
];
