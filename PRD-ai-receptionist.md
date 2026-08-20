# Build spec — AI Receptionist prototype

**For:** Claude Code
**Goal:** a small, calm, working prototype that demonstrates one loop end to end
**Not a production system.** Optimise for clarity over completeness.

## 1. What we are building, in one paragraph

A dental clinic misses phone calls and loses patients. This prototype takes a call
transcript, uses an LLM to turn it into structured data, then uses **ordinary code** to
decide what the agent should do about it. The user can change the clinic's settings and
watch the behaviour change. They can also run a test set of hand-labelled calls, see a
score, and see whether that score went up or down since last time.

**The core loop, and the only thing that matters:**

> Look at a call → change something → run the tests → see if it got better

If a person can do those four things without being told twice, the prototype works.

## 2. The one idea the prototype must make obvious

**The AI understands the call. Plain code decides what to do about it.**

The model never decides whether to book. It fills in a form; a deterministic function
reads the form plus the settings and returns an action. This must be visible in the UI,
not just true in the code.

Everything else is in service of showing that.

## 3. Non-goals — do not build these

- No audio, no speech, no telephony. Text transcripts only.
- No real calendar, no real PMS integration. Everything is mocked.
- No login, no accounts, no database.
- No charts library. One hand-rolled sparkline is the entire data visualisation budget.
- No dashboard of metrics. Three screens, nothing more.
- Do not add features not in this spec. If something seems missing, leave it out.

## 4. Tech

- **Vite + React**, JavaScript (not TypeScript — keep it readable)
- Plain CSS in one file. No Tailwind, no component library.
- **Anthropic API** via the Vite dev-server proxy, so the key never reaches the browser
- **localStorage** for eval run history (this is a real local app, so this is fine)
- Model: `claude-sonnet-4-6`

### Setup

```
.env → ANTHROPIC_API_KEY=sk-...
npm install
npm run dev
```

**Vite proxy** (in `vite.config.js`) — forwards `/api/claude` to
`https://api.anthropic.com/v1/messages`, injecting `x-api-key` and
`anthropic-version: 2023-06-01` from the environment. The browser calls `/api/claude`
and never sees the key.

Include a `README.md` with these three steps and nothing else.

## 5. Files

```
src/
  main.jsx
  App.jsx
  styles.css
  data/calls.js         – 8 calls with hand labels
  lib/extract.js         – calls the API, returns the record
  lib/decide.js           – the deterministic decision function
  lib/evals.js            – scoring + history storage
  screens/CallScreen.jsx
  screens/SettingsScreen.jsx
  screens/EvalScreen.jsx
```

## 6. Data — `data/calls.js`

Eight calls. Each has `id`, `name`, `turns` (array of `{who: 'agent'|'caller', text}`),
and `label`.

Write the transcripts as natural dialogue, 5–7 turns, ending **before** the call
resolves — what happens next is the decision function's job.

| id | Name | What it tests | Label |
|---|---|---|---|
| c1 | New patient, cleaning | The easy case | opportunity, new_patient, hygiene, ready, no reason, not emergency |
| c2 | Supply vendor | Says "implant" but isn't a patient | **not** opportunity, vendor, none, not_booking, no reason, not emergency |
| c3 | Insurance not accepted | Wants a crown, has a plan the clinic doesn't take | opportunity, new_patient, restorative, undecided, insurance_not_accepted, not emergency |
| c4 | Swelling mid-call | Starts as a reschedule, becomes urgent | opportunity, emergency, emergency, not_booking, no reason, **emergency** |
| c5 | Booking for a daughter | The caller isn't the patient | opportunity, existing_patient, ortho, ready, no reason, not emergency |
| c6 | Never says why | Vague, hangs up undecided | opportunity, new_patient, unspecified, undecided, undecided, not emergency |
| c7 | Wants an implant | Hits the never-book list | opportunity, new_patient, implant, ready, no reason, not emergency |
| c8 | Existing patient reschedule | Ordinary admin | opportunity, existing_patient, unspecified, ready, no reason, not emergency |

## 7. Extraction — `lib/extract.js`

One function: `extract(turns) -> record object`.

Send the transcript with turns numbered from 0. Ask for **JSON only**. Strip any ```
fences before parsing. Wrap in try/catch and surface a plain-English error.

The record — six fields, deliberately small:

```
{
  is_opportunity: true|false,
  intent: "new_patient"|"existing_patient"|"vendor"|"emergency"|"other",
  treatment: "hygiene"|"restorative"|"endodontic"|"ortho"|"implant"|"emergency"|"unspecified"|"none",
  caller_state: "ready"|"undecided"|"not_booking",
  reason_not_booked: "insurance_not_accepted"|"no_suitable_time"|"price"|"undecided"|null,
  is_emergency: true|false,
  insurance_carrier: string|null,
  confidence: { is_opportunity: 0-1, intent: 0-1, treatment: 0-1 },
  evidence: { intent: turnIndex, treatment: turnIndex|null },
  summary: "one short sentence"
}
```

**Prompt rules to include:**

- `is_opportunity` is false for vendors and wrong numbers.
- `is_emergency` fires only on stated swelling, trouble breathing or swallowing,
  uncontrolled bleeding, or trauma. **It is a match on what the caller said, never a
  judgement about how serious it is.**
- `evidence` values are the turn numbers that justify the field.
- Confidence must be honest. Low confidence on a genuinely ambiguous field is correct,
  not a failure.

**Keep the prompt in a single exported string constant** (`EXTRACTION_PROMPT`) — the
Settings screen lets the user edit it, so it must be replaceable at runtime.

## 8. The decision function — `lib/decide.js`

This is the heart of the prototype. Pure function, no API calls, no async.

`decide(record, settings) -> { action, headline, saysToCaller, why }`

Check in this exact order and return on the first match:

| # | Condition | action | Headline | Agent says |
|---|---|---|---|---|
| 1 | `is_emergency` | `escalate` | Getting a human, now | "I'm going to get you to someone right now — please stay on the line." |
| 2 | `!is_opportunity` | `log_only` | Logged — not a patient enquiry | "I'll pass that on. Thanks for calling." |
| 3 | `!settings.systemCanBook` | `take_message` | No booking — this clinic's system can't accept one | "I've got all that down and the office will confirm by nine tomorrow." |
| 4 | `settings.neverBook.includes(treatment)` | `take_message` | On the never-book list | "This one needs a chat with the team — they'll call you to arrange it." |
| 5 | `caller_state === "not_booking"` | `log_only` | Nothing to book | "Thanks for calling — all noted." |
| 6 | `caller_state === "undecided"` | `take_message` | Held as an opportunity, with a reason | "Take your time — I'll note this down so you don't start over." |
| 7 | `settings.bookingMode === "message"` | `take_message` | Message mode — never touches the diary | "I've got your details and the front desk will call you back." |
| 8 | `settings.bookingMode === "ask"` | `needs_approval` | Slot held — waiting for a human to confirm | "I've held Tuesday at 2:40. The office will confirm by text within the hour." |
| 9 | otherwise | `booked` | Booked | "You're booked for Tuesday at 2:40 — I'll text you a confirmation now." |

`why` is one short sentence of plain English explaining the rule that fired. Example
for #4: *"Implants are on the clinic's never-book list, and that beats every other
setting."*

**Two things this ordering encodes, worth a code comment:**

- Emergency comes first, before everything, including before checking whether this is
  even a patient.
- Never-book (#4) sits above booking mode (#8, #9), so **Direct mode still cannot book
  an implant.** The clinic cannot configure its way around it.

## 9. Screens

Three tabs across the top: **Call · Settings · Tests**. Nothing else in the chrome.

### 9.1 Call screen

Two columns on desktop, stacked on mobile.

**Left — the call.**

- A simple list of the 8 calls. Click to select. Selected one is marked with the accent
  colour, no heavy box.
- The transcript below, one turn per line, speaker label in small grey caps.
- One primary button underneath: **"See what the AI understood"**

**Right — the result.** Empty state reads: *"Pick a call and press the button."*

After running, show two blocks in this order:

1. **What happens next** (the action). The headline, the plain-English `why`, and the
   agent's line in quotes, visually set apart. Background tint per action:
   - `booked` → soft green
   - `needs_approval` → soft amber
   - `escalate` → soft red
   - everything else → plain grey
2. **What the AI understood** (the record). A simple two-column list — label left, value
   right. Show confidence as a small grey number beside the first three. If any
   confidence is under 0.75, show a small amber line at the top: *"Not very sure about
   this one — a person should check."*

**The one delightful detail:** hovering a field that has an `evidence` turn index
highlights that line in the transcript. Nothing else — no animation, no tooltip.

### 9.2 Settings screen

Three settings, each with a plain-English question as its label and one line of
explanation underneath. No jargon anywhere on this screen.

1. **"When someone wants an appointment, what should the AI do?"** Three radio buttons:
   - *Book it* — writes to the diary straight away
   - *Ask first* — holds the slot, a person confirms
   - *Just take a message* — never touches the diary
2. **"Can this clinic's computer system accept bookings from us?"** Yes / No toggle.
   Underneath: *"Some clinics run software we can only read, not write to. When that's
   the case the AI must never say 'you're booked'."*
3. **"Which appointments should the AI never book?"** Checkboxes for the seven treatment
   types. Implant and emergency ticked by default. Underneath: *"This beats the setting
   above. Even on 'Book it', these are never booked."*

Below the settings, one collapsed section: **"Edit the AI's instructions"** — a plain
textarea containing `EXTRACTION_PROMPT`, with **Save** and **Reset to default**.
Underneath: *"Change this, then run the tests, and see whether the score went up or
down."*

### 9.3 Tests screen — the eval feature

This is the screen that has to be effortless.

Top: one big button — **"Run the tests"**, with a line above it: *"Runs all 8 calls and
checks the AI's answers against what a human said was correct."*

While running: a single line of text, *"Call 3 of 8…"*. No spinner, no progress bar.

**Result — the score.** One large number: **6 / 8 calls fully correct**. Directly under
it, in plain words, the comparison to the previous run:

- *"Better than last time — was 5/8"* (green)
- *"Worse than last time — was 7/8"* (red)
- *"Same as last time"* (grey)
- *"First run — nothing to compare to yet"* (grey)

Then the breakdown — a small table, one row per check:

| Check | Plain-English name | Pass mark |
|---|---|---|
| `is_opportunity` | Is this a real patient enquiry? | 7/8 |
| `intent` | What kind of call is it? | 7/8 |
| `treatment` | What treatment are they after? | 6/8 |
| `caller_state` | Are they ready to book? | 7/8 |
| `is_emergency` | Did it spot the emergency? | **8/8 — must be perfect** |

The emergency row is styled distinctly and labelled **"must be perfect"**. If it is not
8/8, show a red line: *"This one has to be right every time. Something is wrong."*

**Then what failed.** For each incorrect call, one line: the call name, the field, and
*"expected X, got Y"*. Nothing more. If everything passed: *"Everything passed."*

**Then history.** A list of previous runs, newest first: date and time, the score, and
any note the user typed. Beside the score, a tiny hand-drawn SVG sparkline (~120×24px)
of the last ten scores. Under the list: a small text input — *"What did you change
before this run?"* — that saves a note against the most recent run.

**Storage:** `localStorage` key `evalRuns`, an array of:

```
{ id, timestamp, score, total, perField: {field: correctCount},
  failures: [{call, field, expected, got}], note: "" }
```

Cap at 20 runs. Include a small, quiet **"Clear history"** link at the bottom.

## 10. Look and feel — calm

**Rules:**

- One accent colour: a deep muted green (`#2C5F55`). Used for the selected tab, the
  primary button, and passes. Nothing else.
- Amber (`#8A6415`) means *waiting on a person*. Red (`#8C2F1D`) means *safety*. **Never
  use red for a failed test result** — use grey with the word "no". Red is reserved so
  it keeps its meaning.
- Background `#F7F8F7`. Cards white. Text `#1A2220`, secondary `#6B7A76`.
- **No shadows. No gradients. No borders where whitespace will do the job.**
- Generous spacing — nothing tighter than 12px, sections separated by 32px.
- One font family throughout, with a monospace only for the record values and the
  sparkline numbers.
- Body text 15px. Nothing under 12px anywhere.
- One primary button per screen, maximum. Everything else is a plain text link.
- Buttons say what they do — "Run the tests", not "Execute".

**Language rules for the UI:**

- No jargon in any label. Not "extraction", "inference", "eval", "disposition",
  "confidence threshold".
- Say "the AI", not "the model" or "the agent".
- Say "tests", not "evals".
- Say "correct" and "not correct", not "pass" and "fail".

## 11. Build order

Build and verify in this order. Do not start the next step until the previous one runs.

1. Vite app, proxy, one API call printing to console
2. `calls.js` with all 8 transcripts and labels
3. `extract.js` returning a parsed record
4. `decide.js` as a pure function, with a small test file covering all 9 branches
5. Call screen — transcript, button, record, action
6. Settings screen, wired so changing a setting immediately changes the action on the
   Call screen
7. Tests screen — run, score, breakdown, failures
8. History, comparison line, sparkline, notes
9. Styling pass against §10

## 12. Done when

A person who has never seen it can, unprompted:

- [ ] Pick a call and see what the AI understood
- [ ] Set booking to *"Ask first"*, re-run call 1, and notice the agent now says "I've
      held" rather than "you're booked"
- [ ] Set booking to *"Book it"*, run call 7 (implant), and see it still refuses
- [ ] Run call 4 and see it drop everything and get a human
- [ ] Run the tests and read the score without asking what a number means
- [ ] Edit the AI's instructions, run the tests again, and see whether the score moved

And in the code:

- [ ] `decide.js` contains no API calls and no randomness
- [ ] Every UI string passes the §10 language rules
- [ ] A failed API call shows a plain-English message, never a stack trace

---

## Appendix: how this prototype build deviates from the spec above

This section is not part of the original spec — it's a record of the calls made while
building it, kept here rather than silently diverging.

- **Extraction is simulated, not live.** `lib/extract.js` does not call the Anthropic
  API. No key was available when this was built, so each of the 8 calls has a
  pre-written "what the AI understood" record standing in for a real model response,
  including two deliberate misses (`c6`'s treatment, `c8`'s caller_state) so the Tests
  screen has real texture instead of a permanent 8/8. `EXTRACTION_PROMPT` is still real
  and still editable on the Settings screen for UI fidelity, but it's inert — editing it
  does not change the mocked output, and the Settings screen says so. The `extract()`
  interface (async, one record in, one record out) is written so a live version could
  replace the inside of that one function without touching anything else — see §4/§7
  above for what that would need (the Vite proxy, `.env`, `anthropic-version` header).
- **No `vite.config.js` proxy or `.env` is wired up**, for the same reason — there's
  nothing on the other end of it yet.
- Everything else — the file layout, the record shape, the decision table, the three
  screens, the eval storage shape, the colour and language rules — is built as
  specified above.
