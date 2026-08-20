# AI Receptionist — interactive prototype

A single-file, dependency-free prototype of the autonomous voice agent described in
`docs/PRD-ai-receptionist.md`. No backend, no model, no telephony — all conversation is
scripted and all metrics are simulated.

## Run it

Open `ai-receptionist-prototype.html` in any browser. That's it.

## Build it

```bash
./build.sh                 # concatenates src/* -> ai-receptionist-prototype.html
node scripts/check.js      # 20 behavioural assertions, expects FAILURES: 0
node scripts/shot.js       # screenshots every view into ./shots (needs Playwright)
```

Edit files in `src/`, never the built HTML.

## What to click first

1. **Live call → New patient · implant consult.** Press *Place call*. Watch the latency
   breakdown per turn and the structured record building on the right.
2. Switch **Write mode** to *Direct write* and replay the same call. The caller now hears a
   confirmation instead of a hold.
3. Go to **Capability registry**, set the connected PMS to *Eaglesoft (server, on-prem)*, and
   replay it again. The agent stops promising something the system cannot deliver.

Same call, three different promises. That is the §5.4 argument, made clickable.

Then: **Approval queue** (press *Advance clock 1h* to see a hold expire into a broken
promise), **Constraints & modes** (try setting sedation to direct write — you can't),
**Dashboard**, and **Evaluation & gates**.

## Surfaces

| View | PRD sections |
|---|---|
| Live call simulator | §5.1 latency, §5.2 turn-taking, §5.6 escalation, §5.7 failure modes |
| Approval queue | §5.4.1, §7.1.6 approval-mode eval signal |
| Review queue | §5.5 confidence threshold, §6 P0.15 |
| Constraints & modes | §5.3 constraint set, §5.4.1 write modes |
| Capability registry | §5.4 two-axis capability |
| Dashboard | §7 success metrics, §7.1.12 production monitoring |
| Evaluation & gates | §7.1 in full |

## Scenarios

Drawn from the adversarial set in §7.1.2: new patient implant consult (after hours),
non-accepted carrier, emergency language mid-booking, supply vendor using treatment
vocabulary, returning patient with a write collision, barge-in plus an explicit request for a
human, sedation blackout, and a caller who appears to be a minor.

## Handing this to an agent

`CLAUDE.md` has the architecture, the invariants, the decisions made where the PRD is silent,
and what was deliberately left out.
