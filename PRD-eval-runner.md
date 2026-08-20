# Eval Runner — Product Requirements Document

**Feature:** In-app, runnable evaluation check for the AI Receptionist prototype
**Author:** Shamitha
**Status:** Draft
**Version:** 0.1

**Relationship to the main PRD.** [`PRD-ai-receptionist.md`](PRD-ai-receptionist.md) already
specifies a full evaluation framework in its §7.1 — four independent layers, per-field
targets, a safety suite, release gates, drift monitoring. That framework is written for and
by engineers. This document specifies one delivery surface inside it: a version of "does this
still work" that the person who is not an engineer can run themselves, on demand, and trust
the answer to. It is deliberately narrow. Where this document is silent, §7.1 governs.

---

## 0. How this document was built

This PRD formalizes an eval-runner brief handed over separately from the main PRD, refined
against a working reference implementation built directly from it — the "Run the check" card
now live in the prototype's Evaluation & gates view. Building it first and writing the PRD
after is backwards for a real feature, but it means every claim below about what works has
already been clicked, not just specified. Where the brief was silent and a decision got made
anyway, it is recorded as an open question in §9, not silently assumed.

---

## 1. Problem

§3 of the main PRD says it plainly for the constraint set: *"The safety model lives or dies on
whether \[the practice manager] can understand it."* The same sentence is just as true of the
quality model, and today nothing serves it.

§7.1 gives the practice fourteen named checks, a four-layer breakdown, per-field macro-F1
targets, a safety suite, and a release-gate table — and every one of them requires reading a
number like 0.907 and knowing whether that is good. It isn't written for the buyer in §3, the
practice manager, or the front desk. It's an engineering artifact, correctly so — but it means
the one framework designed to answer "is this actually working" is unusable by the one person
whose trust decides whether the product survives its first month. Today, if a practice manager
wants to know whether a prompt change helped or hurt, they ask an engineer and wait.

That is Finding 3 from the main PRD's field research, recurring one layer up: free-text
disposition made the call centre's reporting unreliable because nobody could act on it without
translation. An eval framework nobody but an engineer can run has the identical failure shape —
technically rigorous, operationally inert.

---

## 2. What this is

A single card, at the top of the existing Evaluation & gates view: **one button that plays a
fixed set of scripted calls against a hand-written answer key, scores the result in plain
language, and remembers every run** — so "did that change help" has an answer that doesn't
require asking anyone.

It is not a replacement for §7.1. It is a small, honest subset of it — eight calls, five
questions, two absolute rules — built to be operated by someone who has never seen a macro-F1
score and never should have to.

---

## 3. Users

| Who | What they need from this |
|---|---|
| **Practice manager** | The primary user. Wants to press one button after a setting or prompt changes and get a plain answer: did that help. Does not know what a field is, macro-F1 is, or what `treatment_category` means. |
| **The engineer/agent maintaining the prototype** | Uses this as a fast, in-browser sanity check before reaching for `scripts/check.js`'s stricter, headless-Chromium version. Wants the two to agree, not compete. |
| **The doctor/owner** | Occasionally checks the trend line before making a call — e.g. before approving a switch from approval mode to direct write, referencing the "accepted without changes" figure §5.4.1 already asks for. |

---

## 4. Goals and non-goals

### Goals

1. Let a non-engineer run a real check against real scenario data with one button, with zero
   setup and zero jargon.
2. Show a plain verdict ("it got *N* of *M* right") and, when it doesn't get everything right,
   show exactly what it got wrong — never a hidden or aggregated-away failure.
3. Make "better or worse than last time" answerable at a glance, not a question that requires
   remembering yesterday's number.
4. Hold two rules to zero tolerance, visibly separate from everything that is merely a target.

### Non-goals

- **Not a replacement for the engineering eval suite.** §7.1's four-layer framework, held-out
  set, and release gates remain the release-blocking authority. This tool is a sanity check, not
  a gate.
- **Not a labelling tool.** It does not help anyone write new hand-labelled calls; it runs
  against a fixed, small, already-labelled set.
- **Not live-model evaluation in v1.** See §9.2 — there is no model in the loop yet, and this
  document does not resolve what changes when there is one.
- **Not a dashboard.** It is one card with a history table, not a second Dashboard view.

---

## 5. Core design decisions

### 5.1 What it checks

A fixed set of calls, each with a human-written correct answer, scored against **plain
questions**, not field names:

| Plain question | Underlying field | Why this question, not the field name |
|---|---|---|
| Is this a possible patient? | `is_opportunity` | Load-bearing — every other number on the Dashboard depends on getting this right first (main PRD §5.5). |
| What did they want? | `intent` | The routing decision. Getting this wrong means every downstream action is aimed at the wrong outcome. |
| What kind of treatment? | `treatment_category` | The main PRD calls this the hardest field, because callers don't use clinical vocabulary — the one most worth watching. |
| Were they ready to book? | *(no existing field — new)* | Distinct from booking *outcome*. A caller can be ready and still not end up booked, for reasons that have nothing to do with readiness (an emergency interrupts, a constraint blocks it). Conflating readiness with outcome would misreport why a call didn't book. |
| Did it spot the emergency? | `emergency_signal` | The one question with no acceptable trade-off — see §5.5. |

Each run scores every call against all five questions, then reports two numbers: **per call**
("it got 6 of 8 right" — a call only counts as right if every question about it was answered
correctly) and **per question** (how many of the 8 calls got that one question right, against a
target).

### 5.2 It has to be runnable by anyone

Four requirements, in order of how easily they get silently dropped under schedule pressure:

1. **One button.** Not a config screen, not a call-selection step. "Run the check" and nothing
   else required before a result appears.
2. **Plain questions, not field names.** The table in §5.1 is the whole contract — if a future
   field is added to the extraction schema, it needs a plain-language question before it can
   appear here, not just a key name.
3. **A plain verdict.** "It got 6 of 8 right," not a percentage, not a decimal, not a chart
   requiring interpretation. The precise breakdown is available underneath, but the headline
   is the sentence a practice manager would say out loud.
4. **Failures shown, not hidden.** Every miss names the call, the question, what the answer
   should have been, and what the AI said instead. A tool that shows a score without the
   specific misses invites the exact failure mode §7.1.3 warns about for human labellers:
   nobody can tell whether a low score means a bad model or an ambiguous question, because
   nobody can see the actual disagreement.

### 5.3 It has to track results over time

A single score is close to useless on its own — restated from the brief because it is the
single most important design constraint in this document, and the easiest one to build a demo
without. The requirement:

- Every run is saved with a timestamp and an optional note (e.g. *"after tightening the
  prompt"*).
- Each result shows its **change since the last run** — up, down, or unchanged — not just the
  raw number.
- A history list makes the trend visible without asking the reader to hold previous numbers in
  their head.

Without this, a practice manager who changes a setting, reruns the check, and sees a different
number has no way to know whether that number moved *because of them*. That ambiguity is the
whole reason this feature exists; a version without history is a demo, not this feature.

### 5.4 Targets

| Plain question | Target | Note |
|---|---|---|
| Is this a possible patient? | 90% | Every other number depends on this one. |
| What did they want? | 85% | |
| What kind of treatment? | 80% | |
| Were they ready to book? | 85% | |
| Did it spot the emergency? | 99% | Never traded away. |

**Why emergency is different.** A false alarm costs a human thirty seconds of attention. A miss
is a patient with facial swelling told to call back Monday. The target is set high and is
never relaxed to reduce false alarms — the asymmetry is deliberate, and it is the same
asymmetry the main PRD's §7.1.8 already commits to for the emergency classifier generally. This
feature does not introduce a new policy here; it surfaces the existing one in a place a
non-engineer will actually see it.

### 5.5 The two rules that never bend

Everything in §5.4 is a target — a number to watch, allowed to occasionally miss, allowed a
conversation about why. These two are not targets. They are checked separately, reported
separately, and never folded into a passing score:

1. **Zero double-bookings.**
2. **Zero silent overwrites of something a human typed.**

Not "very few." Zero.

**Why only two.** If every rule in this document is framed as non-negotiable, then at 6pm on a
Friday with a release waiting, all of them quietly become negotiable — there is no way to tell
the ones that matter from the ones that are merely inconvenient. Naming exactly two, and never
adding a third without removing the guarantee from the rest, is what makes these two actually
hold. This mirrors the main PRD's own §7.1.11, which names exactly two release gates as the
ones that "cannot be overridden by a release manager under time pressure, because it is the
one that will be" — same argument, applied one level down.

### 5.6 Relationship to the engineer-facing suite

`scripts/check.js` already asserts twenty behavioural invariants in headless Chromium,
including both absolute rules above. This feature is not a replacement for that script — it is
a second, plain-language surface answering a narrower question, built to be run by someone who
will never open a terminal. The two should never disagree about the two absolute rules; if they
ever do, that is a bug in one of them, not a product decision to make.

---

## 6. Functional requirements

**P0**

1. Run all scenarios in the fixed call set against their hand-labelled answers with a single
   button press, no configuration.
2. Score and display a plain per-call verdict ("it got *N* of *M* right").
3. Score and display a per-question breakdown against the targets in §5.4.
4. List every miss by call, question, expected answer, and actual answer.
5. Check and display the two absolute rules from §5.5, visually distinct from the target
   breakdown, never counted toward the score.
6. Save every run with a timestamp and an optional free-text note.
7. Show the change vs. the immediately preceding run on the current result.
8. Show a history list of past runs (at minimum: date, score, change, note).
9. History must survive a page reload.

**P1**

10. A visual trend (sparkline or equivalent) over recent runs, so the trend is visible without
    reading every row.
11. Exportable or shareable history — see open question §9.4.

**Out of scope for v1:** a live model in the loop (§9.2), growing the call set beyond a fixed
small number (§9.5), a labelling workflow for new calls, any change to what counts as a
release-blocking gate in §7.1.11.

---

## 7. How we'd know it worked

| Measure | Target |
|---|---|
| Calls answered that would otherwise have been missed | >98% |
| Calls fully handled without a human | 55% |
| Bookings needing a human to fix | <0.5% |
| Double-bookings | 0 |
| Approvals accepted without changes, before switching to direct booking | >85% |
| Escalated calls where the human had to re-ask basics | <10% |

These are the main PRD's own §7 success metrics, restated here because they are the numbers
this tool exists to make legible to someone who isn't going to read §7.1 to find them. This
feature does not introduce a new success metric of its own beyond adoption — see §9.6.

---

## 8. Dependencies

| Dependency | Why it gates |
|---|---|
| A fixed, hand-labelled call set | The entire check is only as honest as its answer key. Today this is 8 scripted calls; see §9.5 for what changes as it grows. |
| A place to keep run history | v0.1 uses `localStorage` in the browser running the check. See §9.4 for why this is a real limitation, not a footnote. |
| The main PRD's §7.1 framework | This tool inherits its targets and its absolute rules from §7.1 rather than defining its own; if §7.1's numbers change, this tool's targets should change with them, not drift independently. |

---

## 9. Open questions

1. **Is an optional note enough, or does it need to be required?** A history of scores with no
   note attached is a chart with no story — six months from now, "6/8, 20 Aug" tells nobody
   why. The brief specifies optional; building it surfaced that optional very easily means
   *usually blank*.
2. **What changes when a live model replaces the mocked extraction step?** Today's score is
   fully deterministic — the same 8 calls score identically every run unless someone edits the
   answer key by hand. That is correct for validating the runner itself, but it cannot yet
   demonstrate the thing §5.3 is built for: seeing a real score move because of a real change.
   This is the load-bearing open question — everything else in this document works today; this
   one doesn't, yet.
3. **What is the blast radius of a failed absolute-rule run?** Right now a failure renders as a
   red chip on the card and nothing else. The main PRD's own §7.1.11 treats its two hard gates
   as release-blocking. Should a failure here carry the same weight — a banner, a notification,
   something that can't be scrolled past — or is that authority reserved for the engineer-facing
   suite in §7.1, with this tool staying advisory?
4. **Does history need to leave the browser it was run in?** `localStorage` is per
   browser-and-device. If the practice manager runs this from their laptop one week and the
   front desk's computer the next, the trend line silently resets with no warning that it did.
   Is a single-machine trend acceptable for v1, or does "so you can tell whether a change
   helped" require history that survives a different machine, a cleared cache, or a second
   person running the check?
5. **Who owns growing the call set past eight, and how does history stay comparable when it
   grows?** The main PRD's own labelling protocol (§7.1.3) requires two independent labellers
   and adjudicated disagreement before a label is trusted — none of that rigor is attached to
   this tool's 8-call set. Separately: if a ninth call is added, is "6 of 8" from last month
   comparable to "7 of 9" from today, or does the history need to record the call-set size
   alongside the score?
6. **Is adoption itself a metric?** §7 lists product outcomes this tool helps make legible, but
   nothing measures whether the tool is actually being used — whether a practice manager who
   was handed this actually presses the button after a change, or whether it goes unused and
   the ambiguity in §5.3 persists exactly as before it existed.

---

## 10. What the reference implementation proves, and doesn't

**Proves.** All of §5.1–§5.6 and P0 items 1–9 are built and working in the prototype: one
button, plain questions, a plain per-call verdict, failures shown with expected-vs-actual, the
two absolute rules checked independently and never folded into the score, and history that
survives a reload with a visible delta.

**Deliberately not proven.** The two deliberate wrong answers in the reference build (see
`CLAUDE.md`, "Eval runner") exist only so the tool has something real to show on its very first
run — they are not evidence that the underlying classifier is actually imperfect in that
specific way; they are hand-placed to make §5.2's "failures shown, not hidden" requirement
demonstrable before question §9.2 has an answer.
