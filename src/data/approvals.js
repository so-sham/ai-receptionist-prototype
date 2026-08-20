// Fixture data extracted from the design prototype
// (AI Receptionist Console.dc.html, approvalData / reviewRows / modifyReasons / declineReasons).
// Data only — no colours, no callbacks, no JSX.

const facts = (rows) =>
  rows.map(([label, value, mono]) => ({ label, value, mono }));

export const APPROVAL_SLOTS = [
  {
    id: 1,
    slot: 'Tuesday 2:40pm · Dr. Okonjo · 60 min',
    reason: 'New patient — implant consult',
    patient: 'Priya Raman · 555-0142 · Cigna ••••3806',
    quote: 'Lost a molar, referred by a colleague, flexible on timing',
    note: 'Low confidence on treatment type',
    expires: '42 min',
    urgent: false,
    callId: 2,
    facts: facts([
      ['Caller', 'New to the practice', false],
      ['Worth', '$4,200', true],
      ['Insurance', 'Cigna ••••3806 · accepted', true],
      ['Heard at', '7:15pm, after hours', true],
    ]),
  },
  {
    id: 2,
    slot: 'Wednesday 4:00pm · Dr. Reyes · 45 min',
    reason: 'New patient — child hygiene',
    patient: 'Teodora Vlad · 555-0177 · Aetna ••••2214',
    quote: 'It’s for my son, he’s nine, after school if you can',
    note: 'Booking for another person',
    expires: '11 min',
    urgent: true,
    callId: 8,
    facts: facts([
      ['Caller', 'Mother, patient is 9', false],
      ['Worth', '$260', true],
      ['Insurance', 'Aetna ••••2214 · accepted', true],
      ['Heard at', '1:05pm, at lunch', true],
    ]),
  },
  {
    id: 3,
    slot: 'Friday 9:20am · Dr. Okonjo · 30 min',
    reason: 'Existing patient — crown check',
    patient: 'Dwayne Ellis · 555-0163 · Delta ••••8890',
    quote: 'The temporary feels loose but it isn’t painful',
    note: null,
    expires: '2 hr 14 min',
    urgent: false,
    callId: 4,
    facts: facts([
      ['Caller', 'Patient since 2019', false],
      ['Worth', '$1,150', true],
      ['Insurance', 'Delta ••••8890 · accepted', true],
      ['Heard at', '5:38pm, after hours', true],
    ]),
  },
];

export const REVIEW_ITEMS = [
  {
    id: 1,
    glyph: '◐',
    kind: 'pending',
    caller: 'Teodora Vlad',
    time: '1:05pm',
    context: 'new patient, child hygiene',
    why: 'The agent wasn’t sure whether this was hygiene or an ortho assessment, so it held the slot without setting a type.',
    field: 'treatment_category',
    confidence: { filled: 2, title: '40% confidence' },
    action: 'Set the type',
    callId: 8,
    facts: facts([
      ['Wanted', 'Wednesday after school', false],
      ['Worth', '$260', true],
      ['Insurance', 'Aetna ••••2214', true],
    ]),
  },
  {
    id: 2,
    glyph: '·',
    kind: 'neutral',
    caller: '555-0163',
    time: '11:20am',
    context: 'same-day extraction',
    why: 'Caller asked for a same-day extraction. That type is on your never-book list, so it was captured with a reason instead.',
    field: 'constraint_blocked',
    confidence: { filled: 5, title: '100% confidence' },
    action: 'Call back',
    callId: 4,
    facts: facts([
      ['Wanted', 'Today if possible', false],
      ['Worth', 'Not estimated', false],
      ['Insurance', 'Delta ••••8890', true],
    ]),
  },
  {
    id: 3,
    glyph: '·',
    kind: 'neutral',
    caller: 'Beatrix Ohl',
    time: '9:14am',
    context: 'insurance question',
    why: 'Carrier heard as “Delta” but the member ID didn’t match the format we expect, so nothing was written to the chart field.',
    field: 'insurance_carrier',
    confidence: { filled: 2, title: '40% confidence' },
    action: 'Check the ID',
    callId: 11,
    facts: facts([
      ['Wanted', 'A cleaning, undated', false],
      ['Worth', '$310 if booked', true],
      ['Insurance', 'Delta ••••4402 · unverified', true],
    ]),
  },
];

export const DECLINE_REASONS = [
  'Slot not actually free',
  'Wrong provider',
  'Needs a longer appointment',
  'Not a patient we can take',
  'Wrong treatment read',
];

export const MODIFY_REASONS = [
  'Time slot',
  'Provider',
  'Appointment type',
  'Length',
  'Patient details',
];
