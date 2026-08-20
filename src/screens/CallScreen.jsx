import { useMemo, useState } from 'react'
import { CALLS } from '../data/calls.js'
import { extract } from '../lib/extract.js'
import { decide } from '../lib/decide.js'

const FIELD_LABELS = {
  is_opportunity: 'Real patient enquiry',
  intent: 'Kind of call',
  treatment: 'Treatment',
  caller_state: 'Ready to book?',
  reason_not_booked: "Why they haven't booked",
  is_emergency: 'Emergency',
  insurance_carrier: 'Insurance carrier',
  summary: 'Summary',
}

const ACTION_TINT = {
  booked: 'tint-good',
  needs_approval: 'tint-wait',
  escalate: 'tint-safety',
}

function displayValue(value) {
  if (value === true) return 'Yes'
  if (value === false) return 'No'
  if (value === null || value === undefined) return '—'
  return String(value)
}

export default function CallScreen({ settings }) {
  const [selectedId, setSelectedId] = useState(null)
  const [record, setRecord] = useState(null)
  const [status, setStatus] = useState('idle') // idle | loading | error
  const [error, setError] = useState(null)
  const [hoveredTurn, setHoveredTurn] = useState(null)

  const selectedCall = useMemo(() => CALLS.find((c) => c.id === selectedId) || null, [selectedId])
  const action = useMemo(() => (record ? decide(record, settings) : null), [record, settings])

  function selectCall(call) {
    setSelectedId(call.id)
    setRecord(null)
    setStatus('idle')
    setError(null)
    setHoveredTurn(null)
  }

  async function runExtraction() {
    if (!selectedCall) return
    setStatus('loading')
    setError(null)
    try {
      const result = await extract(selectedCall)
      setRecord(result)
      setStatus('idle')
    } catch (err) {
      setError('Something went wrong understanding that call. Try again.')
      setStatus('error')
    }
  }

  const lowConfidenceFields = record
    ? Object.entries(record.confidence || {}).filter(([, v]) => v < 0.75)
    : []

  return (
    <div className="call-screen">
      <section className="call-left">
        <ul className="call-list">
          {CALLS.map((call) => (
            <li key={call.id}>
              <button
                className={`call-list-item${call.id === selectedId ? ' call-list-item--selected' : ''}`}
                onClick={() => selectCall(call)}
              >
                {call.name}
              </button>
            </li>
          ))}
        </ul>

        {selectedCall && (
          <>
            <div className="transcript">
              {selectedCall.turns.map((turn, i) => (
                <div
                  key={i}
                  className={`transcript-line${hoveredTurn === i ? ' transcript-line--highlight' : ''}`}
                >
                  <span className="transcript-speaker">{turn.who}</span>
                  <span className="transcript-text">{turn.text}</span>
                </div>
              ))}
            </div>
            <button className="btn-primary" onClick={runExtraction} disabled={status === 'loading'}>
              {status === 'loading' ? 'Listening…' : 'See what the AI understood'}
            </button>
            {status === 'error' && <p className="error-text">{error}</p>}
          </>
        )}
      </section>

      <section className="call-right">
        {!selectedCall && <p className="empty-state">Pick a call and press the button.</p>}

        {selectedCall && !record && status !== 'error' && (
          <p className="empty-state">Pick a call and press the button.</p>
        )}

        {record && action && (
          <>
            <div className={`action-block ${ACTION_TINT[action.action] || 'tint-plain'}`}>
              <div className="action-headline">{action.headline}</div>
              <p className="action-why">{action.why}</p>
              <p className="action-says">&ldquo;{action.saysToCaller}&rdquo;</p>
            </div>

            <div className="record-block">
              <div className="record-title">What the AI understood</div>

              {lowConfidenceFields.length > 0 && (
                <p className="confidence-warning">
                  Not very sure about this one — a person should check.
                </p>
              )}

              <dl className="record-list">
                {Object.entries(FIELD_LABELS).map(([field, label]) => {
                  const hasEvidence =
                    record.evidence && (field === 'intent' || field === 'treatment') &&
                    record.evidence[field] !== null && record.evidence[field] !== undefined
                  const confidence = record.confidence && record.confidence[field]
                  return (
                    <div
                      key={field}
                      className={`record-row${hasEvidence ? ' record-row--hoverable' : ''}`}
                      onMouseEnter={() => hasEvidence && setHoveredTurn(record.evidence[field])}
                      onMouseLeave={() => hasEvidence && setHoveredTurn(null)}
                    >
                      <dt>{label}</dt>
                      <dd>
                        {displayValue(record[field])}
                        {confidence !== undefined && (
                          <span className="confidence-value">{confidence.toFixed(2)}</span>
                        )}
                      </dd>
                    </div>
                  )
                })}
              </dl>
            </div>
          </>
        )}
      </section>
    </div>
  )
}
