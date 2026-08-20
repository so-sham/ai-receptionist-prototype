import { CALLS } from '../data/calls.js'
import { extract } from './extract.js'

export const CHECKED_FIELDS = [
  { field: 'is_opportunity', label: 'Is this a real patient enquiry?' },
  { field: 'intent', label: 'What kind of call is it?' },
  { field: 'treatment', label: 'What treatment are they after?' },
  { field: 'caller_state', label: 'Are they ready to book?' },
  { field: 'is_emergency', label: 'Did it spot the emergency?', mustBePerfect: true },
]

const STORAGE_KEY = 'evalRuns'
const MAX_RUNS = 20

// Runs all 8 calls through extract(), checks the record against each call's hand label,
// and reports progress via onProgress("Call N of 8…") as it goes.
export async function runEvals(onProgress) {
  const perField = Object.fromEntries(CHECKED_FIELDS.map((f) => [f.field, 0]))
  const failures = []
  let fullyCorrect = 0

  for (let i = 0; i < CALLS.length; i++) {
    const call = CALLS[i]
    onProgress?.(`Call ${i + 1} of ${CALLS.length}…`)
    const record = await extract(call)

    let allCorrect = true
    for (const { field } of CHECKED_FIELDS) {
      const expected = call.label[field]
      const got = record[field]
      if (expected === got) {
        perField[field] += 1
      } else {
        allCorrect = false
        failures.push({ call: call.name, field, expected, got })
      }
    }
    if (allCorrect) fullyCorrect += 1
  }

  return {
    score: fullyCorrect,
    total: CALLS.length,
    perField,
    failures,
  }
}

export function loadRuns() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function saveRun(run) {
  const runs = [run, ...loadRuns()].slice(0, MAX_RUNS)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(runs))
  return runs
}

export function updateRunNote(id, note) {
  const runs = loadRuns().map((r) => (r.id === id ? { ...r, note } : r))
  localStorage.setItem(STORAGE_KEY, JSON.stringify(runs))
  return runs
}

export function clearRuns() {
  localStorage.removeItem(STORAGE_KEY)
  return []
}
