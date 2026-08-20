// extract(call) -> Promise<record>
//
// The spec for this prototype calls the Anthropic API here. This build runs without a
// key, so extraction is simulated: each call has a pre-written "what the AI understood"
// record below, including two deliberate mistakes so the Tests screen has something real
// to show. The interface (async, one record out, same six fields) is what a live version
// would keep — only the inside of this function would change.
//
// EXTRACTION_PROMPT is still real and still editable on the Settings screen, because the
// UI has to look and feel true to the finished product — but note it's inert here, since
// there's no model reading it. See the Settings screen for that note.

export const EXTRACTION_PROMPT = `You turn a dental-clinic phone transcript into a structured record. Read every turn, then return JSON only — no prose, no markdown fences.

Fields:
- is_opportunity: false for vendors and wrong numbers, true for anything else a patient might want.
- intent: "new_patient" | "existing_patient" | "vendor" | "emergency" | "other"
- treatment: "hygiene" | "restorative" | "endodontic" | "ortho" | "implant" | "emergency" | "unspecified" | "none"
- caller_state: "ready" | "undecided" | "not_booking"
- reason_not_booked: "insurance_not_accepted" | "no_suitable_time" | "price" | "undecided" | null
- is_emergency: true only on stated swelling, trouble breathing or swallowing, uncontrolled
  bleeding, or trauma. This is a match on what the caller said, never a judgement about how
  serious it sounds.
- insurance_carrier: string or null
- confidence: { is_opportunity, intent, treatment }, each 0–1. Be honest — low confidence on a
  genuinely ambiguous field is correct, not a failure.
- evidence: { intent: turnIndex, treatment: turnIndex|null } — the turn numbers that justify
  the field.
- summary: one short sentence.`

const MOCK_DELAY_MS = 550

// Ground-truth-shaped records, keyed by call id, standing in for a live model response.
// c6 and c8 each carry one intentional miss so the eval screen has texture.
const MOCK_RECORDS = {
  c1: {
    is_opportunity: true,
    intent: 'new_patient',
    treatment: 'hygiene',
    caller_state: 'ready',
    reason_not_booked: null,
    is_emergency: false,
    insurance_carrier: null,
    confidence: { is_opportunity: 0.95, intent: 0.93, treatment: 0.9 },
    evidence: { intent: 3, treatment: 1 },
    summary: 'New patient wants a cleaning, ready to book next week mornings.',
  },
  c2: {
    is_opportunity: false,
    intent: 'vendor',
    treatment: 'none',
    caller_state: 'not_booking',
    reason_not_booked: null,
    is_emergency: false,
    insurance_carrier: null,
    confidence: { is_opportunity: 0.97, intent: 0.95, treatment: 0.9 },
    evidence: { intent: 1, treatment: null },
    summary: 'Vendor rep pitching implant supplies, not a patient call.',
  },
  c3: {
    is_opportunity: true,
    intent: 'new_patient',
    treatment: 'restorative',
    caller_state: 'undecided',
    reason_not_booked: 'insurance_not_accepted',
    is_emergency: false,
    insurance_carrier: 'Delta Dental PPO',
    confidence: { is_opportunity: 0.96, intent: 0.9, treatment: 0.85 },
    evidence: { intent: 3, treatment: 1 },
    summary: "New patient needs a crown, but the clinic doesn't take their insurance — undecided.",
  },
  c4: {
    is_opportunity: true,
    intent: 'emergency',
    treatment: 'emergency',
    caller_state: 'not_booking',
    reason_not_booked: null,
    is_emergency: true,
    insurance_carrier: null,
    confidence: { is_opportunity: 0.9, intent: 0.97, treatment: 0.93 },
    evidence: { intent: 3, treatment: 5 },
    summary: 'Started as a reschedule; caller reports worsening facial swelling — treated as an emergency.',
  },
  c5: {
    is_opportunity: true,
    intent: 'existing_patient',
    treatment: 'ortho',
    caller_state: 'ready',
    reason_not_booked: null,
    is_emergency: false,
    insurance_carrier: null,
    confidence: { is_opportunity: 0.95, intent: 0.82, treatment: 0.93 },
    evidence: { intent: 3, treatment: 1 },
    summary: 'Parent booking an ortho consult for her daughter, an existing patient.',
  },
  c6: {
    is_opportunity: true,
    intent: 'new_patient',
    treatment: 'hygiene', // mistake — the caller never said this; truth is "unspecified"
    caller_state: 'undecided',
    reason_not_booked: 'undecided',
    is_emergency: false,
    insurance_carrier: null,
    confidence: { is_opportunity: 0.8, intent: 0.7, treatment: 0.35 },
    evidence: { intent: 1, treatment: null },
    summary: "Vague enquiry — caller didn't say what they need and wants to call back.",
  },
  c7: {
    is_opportunity: true,
    intent: 'new_patient',
    treatment: 'implant',
    caller_state: 'ready',
    reason_not_booked: null,
    is_emergency: false,
    insurance_carrier: null,
    confidence: { is_opportunity: 0.96, intent: 0.9, treatment: 0.95 },
    evidence: { intent: 3, treatment: 1 },
    summary: 'New patient ready to book an implant consult.',
  },
  c8: {
    is_opportunity: true,
    intent: 'existing_patient',
    treatment: 'unspecified',
    caller_state: 'undecided', // mistake — the caller settled on Monday morning; truth is "ready"
    reason_not_booked: 'no_suitable_time',
    is_emergency: false,
    insurance_carrier: null,
    confidence: { is_opportunity: 0.93, intent: 0.88, treatment: 0.5 },
    evidence: { intent: 1, treatment: null },
    summary: 'Existing patient rescheduling from Friday to Monday morning.',
  },
}

export async function extract(call) {
  await new Promise((resolve) => setTimeout(resolve, MOCK_DELAY_MS))
  const record = MOCK_RECORDS[call.id]
  if (!record) {
    throw new Error(`No simulated understanding for call "${call.id}" yet.`)
  }
  return record
}
