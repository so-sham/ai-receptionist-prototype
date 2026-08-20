// Fixture data extracted from the design prototype
// (AI Receptionist Console.dc.html, modes / typeModes / capData / limits / rules / blocked).
// Data only — no colours, no callbacks, no JSX.

export const BOOKING_MODES = [
  {
    key: 'details',
    title: 'Takes details only',
    consequence: 'Never touches the schedule.',
    callerHears: 'The front desk will call you back.',
    default: false,
  },
  {
    key: 'ask',
    title: 'Asks you first',
    consequence: 'Holds the slot, you approve.',
    callerHears: 'I’ve held Tuesday 2:40 — the office will confirm.',
    default: true,
  },
  {
    key: 'direct',
    title: 'Books directly',
    consequence: 'Writes into the schedule.',
    callerHears: 'You’re booked for Tuesday at 2:40.',
    default: false,
  },
];

// Per appointment type: which booking modes apply, whether it's locked to
// 'details' regardless of setting, and the default mode when unlocked.
export const APPOINTMENT_TYPES = [
  {
    key: 'hygiene',
    label: 'Hygiene & recall',
    modes: ['details', 'ask', 'direct'],
    defaultMode: 'direct',
    locked: false,
    lockReason: null,
  },
  {
    key: 'exam',
    label: 'New patient exam',
    modes: ['details', 'ask', 'direct'],
    defaultMode: 'ask',
    locked: false,
    lockReason: null,
  },
  {
    key: 'restorative',
    label: 'Crowns & restorative',
    modes: ['details', 'ask', 'direct'],
    defaultMode: 'ask',
    locked: false,
    lockReason: null,
  },
  {
    key: 'implant',
    label: 'Implant consult',
    modes: ['details', 'ask', 'direct'],
    defaultMode: 'ask',
    locked: false,
    lockReason: null,
  },
  {
    key: 'surgery',
    label: 'Oral surgery & sedation',
    modes: ['details'],
    defaultMode: 'details',
    locked: true,
    lockReason: 'Never book',
  },
];

export const CAPABILITIES = [
  { key: 'lookup', label: 'Look up patients by phone', supported: true, on: true, status: 'Working' },
  { key: 'schedule', label: 'See the schedule', supported: true, on: true, status: 'Working' },
  { key: 'book', label: 'Book appointments', supported: true, on: true, status: 'Working' },
  { key: 'notes', label: 'Write notes to the chart', supported: true, on: true, status: 'Working' },
  { key: 'create', label: 'Create new patients', supported: false, on: false, status: 'Not available' },
];

export const DEFAULT_NEVER_BOOK = ['Emergencies', 'Oral surgery', 'Sedation cases', 'Anyone under 18'];

export const EMERGENCY_SCRIPT =
  'That sounds like something we need to look at today. I’m not going to book you an appointment — please hold and I’ll put you through to the practice now.';

export const LIMITS = [
  { label: 'Bookable hours', value: '08:00 – 16:30', locked: false, toast: null },
  { label: 'Providers it may book', value: 'Okonjo, Reyes', locked: false, toast: null },
  { label: 'Providers taking new patients', value: 'Okonjo only', locked: false, toast: null },
  { label: 'Most it may book in a day', value: '6', locked: false, toast: null },
  { label: 'Length per type', value: '4 types set', locked: false, toast: null },
  {
    label: 'Double-booking',
    value: 'Never',
    locked: true,
    toast: 'Fixed — the agent can never double-book.',
  },
];

export const FALLBACK_RULES = [
  { label: 'Doesn’t understand, twice', value: 'Take a message', locked: false, toast: null },
  {
    label: 'Asked for a person',
    value: 'Put them through',
    locked: true,
    toast: 'Always honoured immediately, with no attempt to keep the caller.',
  },
  {
    label: 'Sounds like a child',
    value: 'No booking',
    locked: true,
    toast: 'No identity collected, no booking made, details discarded.',
  },
  {
    label: 'Emergency words',
    value: 'Stop and escalate',
    locked: true,
    toast: 'The booking flow stops. The agent never judges how serious it is.',
  },
  { label: 'Schedule system unreachable', value: 'Take details', locked: false, toast: null },
  { label: 'A language it doesn’t speak', value: 'Take a number', locked: false, toast: null },
  { label: 'Vendor or spam', value: 'Log and end', locked: false, toast: null },
];
