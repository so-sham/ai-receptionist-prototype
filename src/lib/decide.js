// The AI understands the call. Plain code decides what to do about it.
//
// decide() is a pure function — no API calls, no randomness, no async. It reads the
// record the AI extracted plus the clinic's settings, and returns the one action that
// should happen next. Branches are checked in order and the first match wins.
//
// Two things this ordering encodes:
// - Emergency comes first, before everything, including before checking whether this
//   is even a patient enquiry.
// - Never-book (#4) sits above booking mode (#7/#8/#9), so "Book it" still cannot book
//   an implant. The clinic cannot configure its way around it.

export function decide(record, settings) {
  // 1. Emergency — stop everything, get a human.
  if (record.is_emergency) {
    return {
      action: 'escalate',
      headline: 'Getting a human, now',
      saysToCaller: "I'm going to get you to someone right now — please stay on the line.",
      why: 'Whatever else this call was about, a stated medical emergency ends it here.',
    }
  }

  // 2. Not a patient enquiry at all.
  if (!record.is_opportunity) {
    return {
      action: 'log_only',
      headline: 'Logged — not a patient enquiry',
      saysToCaller: "I'll pass that on. Thanks for calling.",
      why: "This wasn't a patient trying to book anything, so there's nothing to act on.",
    }
  }

  // 3. The connected system can't accept a write at all.
  if (!settings.systemCanBook) {
    return {
      action: 'take_message',
      headline: "No booking — this clinic's system can't accept one",
      saysToCaller: "I've got all that down and the office will confirm by nine tomorrow.",
      why: "This clinic's system can only be read from, not written to, so the AI never says 'you're booked'.",
    }
  }

  // 4. Never-book list — beats every setting below, including "Book it".
  if (settings.neverBook.includes(record.treatment)) {
    return {
      action: 'take_message',
      headline: 'On the never-book list',
      saysToCaller: "This one needs a chat with the team — they'll call you to arrange it.",
      why: `${labelTreatment(record.treatment)} is on the clinic's never-book list, and that beats every other setting.`,
    }
  }

  // 5. Caller isn't booking anything.
  if (record.caller_state === 'not_booking') {
    return {
      action: 'log_only',
      headline: 'Nothing to book',
      saysToCaller: 'Thanks for calling — all noted.',
      why: "The caller wasn't trying to book, so there's nothing to hold or confirm.",
    }
  }

  // 6. Caller hasn't decided yet — hold the opportunity, don't force a slot.
  if (record.caller_state === 'undecided') {
    return {
      action: 'take_message',
      headline: 'Held as an opportunity, with a reason',
      saysToCaller: "Take your time — I'll note this down so you don't start over.",
      why: "The caller hadn't decided, so the AI holds it as an opportunity instead of pushing for a slot.",
    }
  }

  // 7. Message-only mode — never touches the diary.
  if (settings.bookingMode === 'message') {
    return {
      action: 'take_message',
      headline: 'Message mode — never touches the diary',
      saysToCaller: "I've got your details and the front desk will call you back.",
      why: 'The clinic has this AI set to message-only, so it never writes to the diary itself.',
    }
  }

  // 8. Ask-first mode — hold the slot, a person confirms.
  if (settings.bookingMode === 'ask') {
    return {
      action: 'needs_approval',
      headline: 'Slot held — waiting for a human to confirm',
      saysToCaller: "I've held Tuesday at 2:40. The office will confirm by text within the hour.",
      why: 'The clinic has this AI set to ask first, so the slot is held but not confirmed until a person signs off.',
    }
  }

  // 9. Otherwise: direct booking.
  return {
    action: 'booked',
    headline: 'Booked',
    saysToCaller: "You're booked for Tuesday at 2:40 — I'll text you a confirmation now.",
    why: 'Everything checked out and the clinic has this AI set to book directly.',
  }
}

function labelTreatment(treatment) {
  const names = {
    hygiene: 'Hygiene',
    restorative: 'Restorative work',
    endodontic: 'Endodontic work',
    ortho: 'Orthodontic treatment',
    implant: 'Implant treatment',
    emergency: 'Emergency treatment',
    unspecified: 'This treatment',
    none: 'This',
  }
  return names[treatment] || 'This treatment'
}

export const TREATMENT_TYPES = [
  'hygiene',
  'restorative',
  'endodontic',
  'ortho',
  'implant',
  'emergency',
  'unspecified',
]

export const DEFAULT_SETTINGS = {
  bookingMode: 'ask', // 'book' | 'ask' | 'message'
  systemCanBook: true,
  neverBook: ['implant', 'emergency'],
}
