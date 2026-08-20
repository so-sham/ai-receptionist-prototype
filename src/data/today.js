// Fixture data extracted from the design prototype
// (AI Receptionist Console.dc.html, metrics / needs / categories / hours).
// Data only — no colours, no callbacks, no JSX.

export const TODAY_METRICS = [
  {
    key: 'answered',
    label: 'Calls answered',
    value: '47',
    note: '↑ 6 vs average Thursday',
    attention: false,
    clickable: false,
    filter: null,
    linkText: null,
  },
  {
    key: 'handled',
    label: 'Handled by the agent',
    value: '31',
    note: '66% end to end',
    attention: false,
    clickable: false,
    filter: null,
    linkText: null,
  },
  {
    key: 'opportunities',
    label: 'Opportunities found',
    value: '9',
    note: '3 need you',
    attention: false,
    clickable: true,
    filter: 'Opportunity',
    linkText: 'See them →',
  },
  {
    key: 'value_at_risk',
    label: 'Value at risk',
    value: '$12,400',
    note: '4 unreturned',
    attention: true,
    clickable: true,
    filter: 'At risk',
    linkText: 'See the four calls →',
  },
];

// "Needs you" worklist — sorted by urgency then value, never chronologically.
export const NEEDS_YOU = [
  {
    glyph: '!',
    kind: 'attention',
    title: 'Marcus Webb · possible emergency',
    sub: 'Mentioned facial swelling — agent escalated',
    time: '8:42pm',
    action: 'Call back',
    callId: 1,
  },
  {
    glyph: '◐',
    kind: 'pending',
    title: 'New patient · implant consult',
    sub: 'Held Tue 2:40pm — awaiting your approval',
    time: '7:15pm',
    action: 'Review',
    callId: 2,
  },
  {
    glyph: '·',
    kind: 'neutral',
    title: 'Sana Rehman · insurance not accepted',
    sub: 'Asked about Guardian — we’re out of network',
    time: '6:03pm',
    action: 'Call back',
    callId: 3,
  },
  {
    glyph: '·',
    kind: 'neutral',
    title: 'Teodora Vlad · booking for her son',
    sub: 'Held Wed 4:00pm — minor, needs a parent present',
    time: '1:05pm',
    action: 'Review',
    callId: 8,
  },
];

// "What people called about" — stacked bar segments, accent at reducing
// alpha. seriesIndex (1-8) stands in for the chart-series alpha step from
// the design tokens instead of baking in a colour.
export const CATEGORIES = [
  { name: 'Implants & surgery', count: 6, value: '$18,400', pct: '26%', seriesIndex: 1 },
  { name: 'Crowns & restorative', count: 9, value: '$9,800', pct: '22%', seriesIndex: 2 },
  { name: 'New patient exams', count: 11, value: '$3,400', pct: '20%', seriesIndex: 4 },
  { name: 'Hygiene & recall', count: 14, value: '$2,500', pct: '18%', seriesIndex: 6 },
  { name: 'Billing & other', count: 7, value: '—', pct: '14%', seriesIndex: 8 },
];

// "When calls come in" — 24-value histogram, one entry per hour (0 = 12am).
// Values are transcribed as-is from the prototype's `hours` array. Note:
// the prototype's per-hour counts sum to 73 and its business-hours slice
// (8-16) sums to 39, which does not reconcile with the "47 calls" /
// "18 of 47 arrived outside business hours" copy used elsewhere in the same
// file — that mismatch exists in the source prototype itself and is
// preserved here rather than silently corrected.
export const HOURS = [0, 0, 0, 0, 0, 1, 2, 3, 5, 4, 6, 5, 3, 4, 5, 4, 3, 6, 7, 5, 4, 3, 2, 1].map(
  (count, hour) => ({
    hour,
    count,
    businessHours: hour >= 8 && hour < 17,
  })
);

// Business hours, used to shade the histogram's business-hours column.
export const BUSINESS_HOURS_START = 8;
export const BUSINESS_HOURS_END = 17;
