# AI Receptionist — prototype handoff

Context for an agent picking this up cold. Read this before touching anything.

## What this is

A small, working Vite + React prototype built from
[`PRD-ai-receptionist.md`](PRD-ai-receptionist.md) ("Build spec — AI Receptionist
prototype", for Claude Code). It demonstrates one idea end to end:

> **The AI understands the call. Plain code decides what to do about it.**

A call transcript goes in, an "AI" extraction step turns it into a small structured
record (six-ish fields: is it an opportunity, what kind of call, what treatment, is the
caller ready, why not if not, is it an emergency), and a pure function —
[`decide()`](src/lib/decide.js) — reads that record plus the clinic's settings and
returns the one thing that should happen next. The extraction step is never allowed to
decide whether to book; only `decide()` does that, and it's a plain deterministic
function with no model in the loop.

The core loop the prototype is built to make effortless: **look at a call → change a
setting → run the tests → see if the score moved.**

This build is not wired to a live model — see "What's mocked" below — but everything
else (file layout, record shape, decision table, the three screens, the eval/history
storage, the colour and language rules) follows the spec in `PRD-ai-receptionist.md`
directly. If you change behaviour, that file is the spec to check against; its short
appendix at the bottom lists the handful of places this build intentionally deviates
(and why).

## Layout

```
index.html               Vite entry point (mounts #root)
vite.config.js            Vite + React plugin config
package.json
src/
  main.jsx                React root
  App.jsx                 Tab state (Call / Settings / Tests), settings state, prompt state
  styles.css               all styling — one file, calm palette (see §10 of the PRD)
  data/calls.js             the 8 scripted calls + hand labels (ground truth for eval)
  lib/decide.js              the load-bearing pure function — see below
  lib/extract.js             simulated "AI understanding" step (mocked, see below)
  lib/evals.js                scoring against calls.js labels + localStorage history
  screens/CallScreen.jsx       pick a call, run it, see the record + the action
  screens/SettingsScreen.jsx    booking mode / system-can-book / never-book / prompt editor
  screens/EvalScreen.jsx        run the tests, see the score, breakdown, failures, history
test/decide.test.js         9 assertions, one per decide() branch — `npm test`
PRD-ai-receptionist.md    the build spec this was built from (verbatim + an appendix)
```

Run it: `npm install && npm run dev`, then open the printed localhost URL.
Verify the decision logic: `npm test` (plain Node + `assert`, no test framework
dependency — expects `9 checks, 0 failures`).

## The load-bearing function

```js
decide(record, settings)  // src/lib/decide.js
```

Pure, synchronous, no API calls, no randomness. Nine branches, checked in order, first
match wins:

1. `is_emergency` → `escalate` — beats everything, including whether this is even a
   patient enquiry.
2. `!is_opportunity` → `log_only`
3. `!settings.systemCanBook` → `take_message` — the AI must never say "you're booked"
   against a read-only system.
4. `settings.neverBook.includes(treatment)` → `take_message` — **this sits above booking
   mode**, so "Book it" still cannot book an implant. The clinic cannot configure its way
   around it.
5. `caller_state === 'not_booking'` → `log_only`
6. `caller_state === 'undecided'` → `take_message` — held as an opportunity, not forced
   into a slot.
7. `settings.bookingMode === 'message'` → `take_message`
8. `settings.bookingMode === 'ask'` → `needs_approval`
9. otherwise → `booked`

`test/decide.test.js` asserts all nine branches directly. **If you change this function,
run `npm test`.**

## How a call works

A call in `src/data/calls.js` is `{ id, name, what, turns, label }`. `turns` is natural
5–7 turn dialogue (`{who: 'agent'|'caller', text}`), written to end *before* the call
resolves — resolution is `decide()`'s job, not the transcript's. `label` is the
hand-labelled ground truth used by the eval screen: `is_opportunity`, `intent`,
`treatment`, `caller_state`, `reason_not_booked`, `is_emergency`.

To add a call: append to `CALLS` in `calls.js`, then add a matching entry to
`MOCK_RECORDS` in `lib/extract.js` (see below — there's no live model to generate one
for you).

## What's mocked, and why

**`lib/extract.js` does not call the Anthropic API.** The build spec calls for a Vite
dev-server proxy forwarding to `https://api.anthropic.com/v1/messages` with a key from
`.env`; that wasn't available while building this, so `extract(call)` instead returns a
pre-written record from `MOCK_RECORDS`, keyed by call id, after a simulated delay. Two
of the eight are deliberately wrong (`c6`'s treatment, `c8`'s caller_state) so the Tests
screen has real failures to show instead of a permanent 8/8.

Consequences worth knowing before you touch this:

- **The eval score is deterministic.** Every run scores the same, because the mock
  always returns the same records. "Better/worse than last time" only changes if you
  edit `MOCK_RECORDS` and rerun — there's no live variance to demo.
- **`EXTRACTION_PROMPT` (in `extract.js`) is inert.** It's still real, still exported,
  still editable on the Settings screen — that's there for UI fidelity to the spec — but
  nothing reads it. The Settings screen says so directly, right under the editor.
- **To make this live:** replace the body of `extract()` with a `fetch('/api/claude', …)`
  call, add the proxy block to `vite.config.js` (commented stub already there), add
  `.env` with `ANTHROPIC_API_KEY`, and keep the function signature (`async, call in,
  record out`) so nothing else has to change.

## Design decisions made while building, that the spec leaves open

**1. `extract()` takes the call object, not raw `turns`.** The spec's signature is
`extract(turns)`. Since this build has no model to hand a transcript to, `extract()`
instead needs to know *which* call it's simulating, so it takes the whole `call` (used
to key into `MOCK_RECORDS` by `call.id`). A live implementation can accept the same
object and just read `call.turns`.

**2. Default settings.** The spec doesn't state defaults. This build defaults to
`bookingMode: 'ask'` (a practice's first month should not default to direct write),
`systemCanBook: true`, and `neverBook: ['implant', 'emergency']` (explicitly required by
§9.2). See `DEFAULT_SETTINGS` in `decide.js`.

**3. The Settings screen's prompt editor has Save + Reset, not live-on-type.** The spec
lists both buttons; since the prompt doesn't functionally affect anything in this mocked
build, a live-on-type textarea would have been indistinguishable from a no-op either way
— Save/Reset was kept so the screen matches the spec and so a future live version has
somewhere to hang a "did I mean to change this" affordance.

**4. Sparkline is one shared chart, not one per history row.** §9.3 says "beside the
score, a sparkline of the last ten scores" inside the per-run history list; read
literally that's a sparkline repeated on every row. This build renders it once, next to
the "History" heading, since a trend chart that repeats identically on every list item
doesn't add information ten times over.

## Deliberately not built

Same non-goals as the spec (§3): no audio/speech/telephony, no real PMS/calendar, no
login/accounts/real database, no charts library beyond the one sparkline, no dashboard
beyond the three tabs, nothing outside this spec.

## Style conventions

- Colours are CSS custom properties on `:root` in `src/styles.css` — one accent
  (`--accent`, deep muted green), amber for "waiting on a person", red reserved for
  safety/escalation only. Never introduce a raw hex in a component; add a token.
- UI copy follows the spec's language rules (§10): "the AI" not "the model" or "the
  agent"; "tests" not "evals"; "correct"/"not correct" not "pass"/"fail"; no jargon
  ("extraction", "inference", "confidence threshold") in any user-facing label.
- One primary button per screen (`.btn-primary`); everything else is a `.btn-link`.

## Suggested next steps, in order of value

1. **Wire up the real Anthropic call.** The mock's interface is already shaped for this
   — see "What's mocked" above for exactly what's missing (`vite.config.js` proxy,
   `.env`, and the fetch call inside `extract()`).
2. **Add more calls** once extraction is live, to stress-test the prompt beyond the
   original 8 — particularly ambiguous `caller_state` and ordinary-vs-emergency
   `treatment` framing, since those are where the two seeded mock mismatches live.
3. **A "why" audit**: `decide()`'s `why` strings are hand-written per branch. If the
   never-book list or booking-mode set grows, make sure new treatment types get a
   grammatical `labelTreatment()` entry (see the comment in `decide.js` — this bit a
   grammar bug once already: "Implants is..." needed to become "Implant treatment is...").
