import assert from 'node:assert/strict'
import { decide, DEFAULT_SETTINGS } from '../src/lib/decide.js'

const base = {
  is_opportunity: true,
  intent: 'new_patient',
  treatment: 'hygiene',
  caller_state: 'ready',
  reason_not_booked: null,
  is_emergency: false,
}

const settings = { ...DEFAULT_SETTINGS }
let n = 0
function check(name, actual, expected) {
  n++
  assert.equal(actual, expected, `${name}: expected "${expected}", got "${actual}"`)
  console.log(`ok ${n} - ${name}`)
}

// 1. Emergency beats everything, even a non-opportunity.
check(
  '1 emergency wins over everything',
  decide({ ...base, is_emergency: true, is_opportunity: false }, settings).action,
  'escalate',
)

// 2. Not an opportunity -> log only.
check(
  '2 non-opportunity is logged',
  decide({ ...base, is_opportunity: false }, settings).action,
  'log_only',
)

// 3. System can't book -> take message, regardless of booking mode.
check(
  "3 system can't book -> message",
  decide(base, { ...settings, systemCanBook: false, bookingMode: 'book' }).action,
  'take_message',
)

// 4. Never-book beats "Book it".
check(
  '4 never-book beats direct booking',
  decide({ ...base, treatment: 'implant' }, { ...settings, bookingMode: 'book' }).action,
  'take_message',
)

// 5. Caller not booking -> log only.
check(
  '5 not_booking -> log only',
  decide({ ...base, caller_state: 'not_booking' }, settings).action,
  'log_only',
)

// 6. Undecided -> take message, holding the opportunity.
check(
  '6 undecided -> take message',
  decide({ ...base, caller_state: 'undecided' }, settings).action,
  'take_message',
)

// 7. Message mode never books.
check(
  '7 message mode -> take message',
  decide(base, { ...settings, bookingMode: 'message' }).action,
  'take_message',
)

// 8. Ask-first mode holds for approval.
check(
  '8 ask mode -> needs approval',
  decide(base, { ...settings, bookingMode: 'ask' }).action,
  'needs_approval',
)

// 9. Otherwise, direct booking.
check(
  '9 book mode -> booked',
  decide(base, { ...settings, bookingMode: 'book' }).action,
  'booked',
)

console.log(`\n${n} checks, 0 failures`)
