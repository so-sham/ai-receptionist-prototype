# AI Receptionist — prototype

A small, working prototype built from [`PRD-ai-receptionist.md`](PRD-ai-receptionist.md).
It demonstrates one idea end to end: **the AI understands the call, plain code decides
what to do about it.** A transcript goes in, a structured record comes out, and a pure
function reads that record plus the clinic's settings to decide what happens next —
booked, held for approval, taken as a message, logged, or escalated to a human.

## Run it

```bash
npm install
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`).

## Note on the "AI" step

This build's extraction step (`src/lib/extract.js`) is **simulated**, not a live model
call — no Anthropic API key was available while building it. Each of the 8 calls has a
pre-written "what the AI understood" record, including two deliberate mistakes so the
Tests screen has real failures to show. The "Edit the AI's instructions" box on the
Settings screen is real and editable, but it doesn't change the (mocked) output — it
says so underneath the box. See `CLAUDE.md` for exactly what wiring up a live call would
take.

## What to click first

1. **Call → "New patient, cleaning" → "See what the AI understood."** Watch the record
   build on the right, and the action block above it (in this default "Ask first" mode,
   the AI holds the slot rather than confirming).
2. **Settings → set booking to "Book it"**, go back to Call and rerun **"Wants an
   implant."** It still refuses — implants are on the never-book list, and that beats
   every other setting, including "Book it."
3. **Call → "Swelling mid-call."** Run it. The AI drops everything and escalates to a
   human, regardless of what else was happening on the call.
4. **Tests → "Run the tests."** Runs all 8 calls against their hand labels and shows a
   score, a per-field breakdown, what failed, and a run history with a sparkline.

## Verify the decision logic

```bash
npm test
```

Runs `test/decide.test.js` — 9 plain assertions, one per branch of `decide()`, the pure
function at the heart of this prototype. Expects `9 checks, 0 failures`.

## Layout

```
src/
  App.jsx                    tab navigation + top-level state
  data/calls.js                8 scripted calls with hand labels
  lib/decide.js                 the decision function — see CLAUDE.md
  lib/extract.js                 simulated "AI understanding" (see note above)
  lib/evals.js                    scoring + localStorage history
  screens/CallScreen.jsx           pick a call, see the record + the action
  screens/SettingsScreen.jsx        booking mode, capability toggle, never-book list
  screens/EvalScreen.jsx             run the tests, see the score
test/decide.test.js         branch coverage for decide()
PRD-ai-receptionist.md    the build spec this was built from
CLAUDE.md                  handoff notes for an agent picking this up
```

## Handing this to an agent

`CLAUDE.md` has the architecture, the load-bearing function, what's mocked and why, and
the decisions made where the spec was silent.
