# AI Receptionist — prototype handoff

Context for an agent picking this up cold. Read this before touching anything.

## What this is

An interactive, **non-functional** prototype of the AI Receptionist product described in
[`PRD-ai-receptionist.md`](PRD-ai-receptionist.md) (v0.1, author Shamitha). It exists to make the PRD's design
arguments clickable — specifically the three that are hard to convey on paper:

1. **Write mode changes what the caller hears** (§5.4.1). The same call, played in direct
   write / approval / capture-only, produces three different promises.
2. **Capability is not boolean** (§5.4). Switching the connected PMS or toggling a practice
   setting changes agent behaviour mid-flow, and the two axes fail differently.
3. **The constraint set is the safety model** (§5.3). Blackout types and the daily ceiling
   beat every other setting, including a practice manager who wants them not to.

There is no backend, no model, no telephony. All conversation is scripted; all metrics are
invented. That is deliberate — the point is the *shape* of the product surface, not a demo
of model quality.

## Layout

```
index.html                        the built artifact — this is what you open/ship
scripts/check.js                  20 behavioural assertions in headless Chromium — run this
scripts/shot.js                   screenshots every view (light)
scripts/dark.js                   screenshots key views (dark)
PRD-ai-receptionist.md            the source PRD, unmodified
```

Verify: `npm install && npm test` (runs `scripts/check.js`, expects `FAILURES: 0`).
Playwright is required for the scripts only, not for the prototype itself.

**This repo ships only the built `index.html`.** The original authoring environment built it
from a `src/` split (`01-head.html`, `02-body.html`, `03-data.js`, `04-call.js`,
`05-backoffice.js`, `06-dashboard-eval.js`) via `build.sh`, which concatenated those files —
but that split was not carried into this handoff, only the compiled output and the
verification scripts were. Edit `index.html` directly; if you want the `src/*` workflow back,
you'd need to split it out yourself and reintroduce `build.sh`.

## Architecture in one paragraph

Everything is vanilla JS in the global scope — no modules, no framework, no build step
beyond `cat`. `03-data.js` is pure data and holds every user-visible string; the other three
files are pure rendering. State lives in three globals: `CONFIG` (practice settings the
manager edits), `STATE` (session state — connected PMS, practice capability toggles, emitted
records, queues), and the call-simulator locals in `04-call.js` (`scn`, `idx`, `playing`).
Views are `<section class="view">` elements toggled by `go(viewName)`, which calls that
view's `render*()` function. Rendering is always full-innerHTML replacement; there is no
diffing and nothing needs it at this size.

## The load-bearing function

```js
effectiveMode(scn)  // index.html — originally src/04-call.js
```

This is the single place the PRD's precedence rules are encoded, and almost every
interesting behaviour in the prototype falls out of it. Precedence, highest first:

1. `appointment_write` **system-unsupported** → `'unsupported'` (capture & queue).
   The agent must never promise what the connected system cannot deliver (§5.4).
2. Appointment type is **blackout** → `'capture'`. §5.3/§5.4.1 — the practice cannot
   configure its way into the agent booking sedation. This beats a practice set to direct.
3. `appointment_write` **practice-disabled** → `'approval'`. Per the §5.4 table, a
   practice-disabled write is an approval flow, *not* a silent downgrade to capture.
4. Scenario-level `typeMode` (a per-appointment-type override) → that mode.
5. Otherwise `CONFIG.mode`, the practice default.

`scripts/check.js` asserts 1–4 directly. **If you change this function, run the checks.**

Capability itself resolves in `capState(id)`: `PMS_PROFILES[STATE.pms].support[id] &&
STATE.practiceCap[id]`, returning `'live' | 'disabled' | 'unsupported'`. The three states are
kept distinct on purpose — collapsing them into a boolean is the exact failure §5.4 argues
against, and the caller-facing copy differs for each.

## How a scenario works

A scenario in `03-data.js` is a list of turns plus a final record, note and flag set. Turn
shape (all fields optional except `s`):

| field | meaning |
|---|---|
| `s` | `'caller' \| 'agent' \| 'sys' \| 'human'` |
| `t` | the line, or system-event HTML (system lines may contain markup; caller/agent text is escaped) |
| `lat` | key into `LAT` — `full` (810ms budget), `cached` (pre-synthesised, no model call), `small` (small-model routing turn), `slowRead` (PMS read blocking the turn, deliberately over budget) |
| `byMode` | `{direct, approval, capture, unsupported}` — agent line varies by effective mode |
| `byModeSys` | same, for a system line |
| `capVariant` | `{on, off}` — line varies by whether `patient_lookup` is live |
| `cap` + `altOff` | system line that changes when a named capability is not live |
| `bargein` | `{said, unsaid}` — renders the unsaid half struck through (§5.2) |
| `emergency` | replaces the line with `CONFIG.emergency` **verbatim** (§7.1.8 string-match gate) |
| `cached` / `filler` | render an explanatory chip |
| `contextCard` | append the §5.6 context card |

To add a scenario: append to `SCENARIOS`. Nothing else needs touching — the list, the
inspector, the queues and the dashboard all read from it.

## Invariants the checks enforce

`scripts/check.js` is the spec of what must not break. It asserts, in the running page:

- blackout beats direct write
- practice-disabled write routes to approval, not capture
- an unsupported PMS write path produces capture-and-queue language and **never** a
  confirmation ("You're booked" must not appear)
- approval mode emits `pending_approval`, never `booked`, at call end
- the emergency instruction is delivered byte-for-byte from `CONFIG.emergency` (the check
  rewrites the config text first, so it cannot pass by coincidence)
- emergency abandons the booking flow and releases the held slot
- the full insurance member ID (`882410397`) appears in **no** rendered body — comm log,
  approval task, transcript — only the masked `••••0397` (§5.4.2 hard gate)
- no booking for a suspected minor, and identity collected before recognition is deleted
- a supply vendor using treatment vocabulary is not an opportunity
- the write collision fails conditionally rather than overwriting, and the retry reuses the
  idempotency key
- an explicit request for a human escalates live with a context card

## Design decisions made while building, that the PRD does not settle

**1. `outcome` has no value for "held, awaiting a human". This is a real gap.**
§5.5's enum offers `booked | escalated_live | escalated_queue | captured_no_booking |
caller_abandoned | resolved_no_booking`. In approval mode — the default for a practice's
first month, so most early traffic — a call that ends with a held slot is none of these.
Calling it `booked` inflates booking completion by exactly the size of the approval queue;
calling it `captured_no_booking` understates it and pollutes `reason_not_booked`. The
prototype emits `pending_approval` and reconciles to `booked` / `captured_no_booking` when
the approval is worked (`actOnApproval` in `05-backoffice.js`). **This is a schema decision
that needs a real answer** — it is surfaced in-app as a callout on the call record so it
cannot be quietly adopted. It also interacts with open question §9.1.

**2. Hold timeout default is 60 minutes here** (`CONFIG.holdWindowMin`), not the PRD's
4 hours, purely so the expiry state is reachable in a demo. Open question §9.6 is unanswered;
do not read the 60 as a recommendation. "Advance clock 1h" in the approval queue forces the
expired state.

**3. Containment is computed as** `booked + resolved_no_booking + captured_no_booking`
over answered calls. §7 defines containment as "calls fully handled without escalation",
which makes captured-no-booking count as contained. That is defensible but flattering — a
captured opportunity is work the front desk still has to do. Worth deciding whether the
metric the buyer sees should net those out.

**4. Emergency exam is approval-mode, not blackout.** The PRD blacklists "surgical,
sedation, anything the practice flags" but is silent on same-day emergency exams. Booking one
is high value and low risk *if* the emergency-signal path has already fired; the prototype
treats them as ordinary approval-mode bookings. Revisit — the interaction between §5.7's
"stop the booking flow immediately" and an appointment type literally called `emergency_ex`
is unresolved and slightly awkward.

**5. Eaglesoft is modelled as write-unsupported**, not write-degraded. §5.3's honest
limitation says a non-transactional PMS *degrades to best-effort*; the prototype takes the
stronger position from the same paragraph ("on those systems I would default the agent to
capture-and-queue") because a half-safe write is not demonstrable. If the product ships a
best-effort mode, `PMS_PROFILES.eaglesoft.support.appointment_write` becomes a third state,
not a boolean, and `effectiveMode` needs a branch.

## Deliberately not built

- Any real ASR/TTS/LLM/telephony. Latency numbers are the §5.1 budget table played back.
- Free-text caller input. Scenarios are scripted; a rules-engine chat mode was scoped out.
- Persistence. Reloading the page resets every queue. Queues are in-memory arrays on `STATE`.
- Family-member booking within one call (P1), Spanish (P1), rescheduling flows.
- The `is_opportunity` classifier, obviously — its outputs are hardcoded per scenario, and
  the confidence numbers are chosen to make the review-threshold behaviour legible.

## Style conventions

- Colours come from CSS custom properties on `:root` / `:root[data-theme="dark"]`; the
  categorical series and status colours are a CVD-validated set (blue / orange / aqua, plus
  reserved good/warning/serious/critical). Never introduce a raw hex in the body — add a role.
- Section references render as `<span class="ref">§5.4.1</span>` and are load-bearing for
  reviewers. Every non-obvious behaviour on screen should cite the clause it comes from.
- Caller and agent speech is escaped (`esc()`); system lines are trusted HTML because they
  carry inline markup. Do not pass user input to a system line.
- Status colour never carries meaning alone — always with a label or icon.
- Dark mode is a selected set of steps, not an inversion. Both modes are checked by
  `scripts/dark.js`.

## Suggested next steps, in order of value

1. **Resolve the `pending_approval` schema gap** and propagate it through §5.5, the
   dashboard denominators, and the containment definition.
2. **Wire the approval queue to a fake clock** so hold expiry, queue age p90 and the
   broken-promise state can be demoed over a simulated day rather than a button press.
3. **Add the human-rated conversation rubric (§7.1.9) as a surface** — it is the only part
   of the eval framework with no representation in the prototype.
4. **Model the field-routing suite per adapter (§7.1.6)** as a clickable matrix. It is the
   most technically load-bearing eval idea in the PRD and currently appears only as a table
   row. Silent overwrite being a hard gate deserves to be shown, not asserted.
5. **A free-text mode** for the call simulator, if this ever needs to survive a hostile demo
   where someone asks "but what if the caller says X".
