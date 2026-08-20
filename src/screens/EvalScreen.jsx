import { useEffect, useState } from 'react'
import { runEvals, CHECKED_FIELDS, loadRuns, saveRun, updateRunNote, clearRuns } from '../lib/evals.js'

function fieldLabel(field) {
  return CHECKED_FIELDS.find((f) => f.field === field)?.label || field
}

function formatValue(v) {
  if (v === true) return 'Yes'
  if (v === false) return 'No'
  if (v === null || v === undefined) return 'nothing'
  return String(v)
}

function Sparkline({ scores }) {
  const width = 120
  const height = 24
  if (scores.length < 2) {
    return <svg width={width} height={height} className="sparkline" aria-hidden="true" />
  }
  const max = Math.max(...scores)
  const min = Math.min(...scores)
  const range = max - min || 1
  const step = width / (scores.length - 1)
  const points = scores
    .map((s, i) => {
      const x = i * step
      const y = height - ((s - min) / range) * (height - 4) - 2
      return `${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(' ')
  return (
    <svg width={width} height={height} className="sparkline" aria-hidden="true">
      <polyline points={points} fill="none" strokeWidth="1.5" className="sparkline-line" />
    </svg>
  )
}

export default function EvalScreen() {
  const [runs, setRuns] = useState([])
  const [running, setRunning] = useState(false)
  const [progressText, setProgressText] = useState('')
  const [latest, setLatest] = useState(null)

  useEffect(() => {
    setRuns(loadRuns())
  }, [])

  async function handleRun() {
    setRunning(true)
    setProgressText('')
    const result = await runEvals((text) => setProgressText(text))
    const run = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      timestamp: Date.now(),
      score: result.score,
      total: result.total,
      perField: result.perField,
      failures: result.failures,
      note: '',
    }
    const updated = saveRun(run)
    setRuns(updated)
    setLatest(run)
    setRunning(false)
    setProgressText('')
  }

  function handleNoteChange(id, note) {
    const updated = updateRunNote(id, note)
    setRuns(updated)
  }

  function handleClearHistory() {
    setRuns(clearRuns())
    setLatest(null)
  }

  const previousRun = latest ? runs.find((r) => r.id !== latest.id) : null
  const emergency = latest?.perField?.is_emergency
  const emergencyTotal = latest?.total

  return (
    <div className="eval-screen">
      <p className="eval-intro">
        Runs all 8 calls and checks the AI's answers against what a human said was correct.
      </p>
      <button className="btn-primary" onClick={handleRun} disabled={running}>
        Run the tests
      </button>

      {running && <p className="eval-progress">{progressText}</p>}

      {latest && !running && (
        <div className="eval-result">
          <div className="eval-score">
            {latest.score} / {latest.total} calls fully correct
          </div>
          <p className={`eval-compare eval-compare--${compareTone(latest, previousRun)}`}>
            {compareText(latest, previousRun)}
          </p>

          <table className="eval-table">
            <thead>
              <tr>
                <th>Check</th>
                <th>Pass mark</th>
              </tr>
            </thead>
            <tbody>
              {CHECKED_FIELDS.map((f) => (
                <tr key={f.field} className={f.mustBePerfect ? 'eval-row--emergency' : ''}>
                  <td>
                    {f.label}
                    {f.mustBePerfect && <span className="must-be-perfect"> — must be perfect</span>}
                  </td>
                  <td>
                    {latest.perField[f.field]}/{latest.total}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {emergency !== undefined && emergency < emergencyTotal && (
            <p className="eval-emergency-warning">
              This one has to be right every time. Something is wrong.
            </p>
          )}

          <div className="eval-failures">
            <div className="eval-failures-title">What failed</div>
            {latest.failures.length === 0 ? (
              <p>Everything passed.</p>
            ) : (
              <ul>
                {latest.failures.map((f, i) => (
                  <li key={i}>
                    {f.call} — {fieldLabel(f.field)}: expected {formatValue(f.expected)}, got{' '}
                    {formatValue(f.got)}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      <div className="eval-history">
        <div className="eval-history-header">
          <div className="eval-history-title">History</div>
          {runs.length > 1 && (
            <Sparkline scores={runs.slice(0, 10).map((r) => r.score).reverse()} />
          )}
        </div>
        {runs.length === 0 && <p className="empty-state">No runs yet.</p>}
        <ul className="eval-history-list">
          {runs.map((run) => (
            <li key={run.id} className="eval-history-row">
              <div className="eval-history-main">
                <span className="eval-history-date">{new Date(run.timestamp).toLocaleString()}</span>
                <span className="eval-history-score">
                  {run.score}/{run.total}
                </span>
              </div>
              {run.id === runs[0]?.id ? (
                <input
                  className="eval-history-note-input"
                  type="text"
                  placeholder="What did you change before this run?"
                  value={run.note}
                  onChange={(e) => handleNoteChange(run.id, e.target.value)}
                />
              ) : (
                run.note && <p className="eval-history-note">{run.note}</p>
              )}
            </li>
          ))}
        </ul>
        {runs.length > 0 && (
          <button className="btn-link" onClick={handleClearHistory}>
            Clear history
          </button>
        )}
      </div>
    </div>
  )
}

function compareTone(latest, previous) {
  if (!previous) return 'neutral'
  if (latest.score > previous.score) return 'good'
  if (latest.score < previous.score) return 'bad'
  return 'neutral'
}

function compareText(latest, previous) {
  if (!previous) return 'First run — nothing to compare to yet.'
  if (latest.score > previous.score) return `Better than last time — was ${previous.score}/${previous.total}`
  if (latest.score < previous.score) return `Worse than last time — was ${previous.score}/${previous.total}`
  return 'Same as last time'
}
