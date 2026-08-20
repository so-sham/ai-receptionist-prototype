import { useState } from 'react'
import { TREATMENT_TYPES } from '../lib/decide.js'
import { EXTRACTION_PROMPT } from '../lib/extract.js'

const TREATMENT_LABELS = {
  hygiene: 'Hygiene',
  restorative: 'Restorative',
  endodontic: 'Endodontic',
  ortho: 'Orthodontics',
  implant: 'Implants',
  emergency: 'Emergency',
  unspecified: 'Unspecified',
}

const BOOKING_MODES = [
  { value: 'book', label: 'Book it', hint: 'writes to the diary straight away' },
  { value: 'ask', label: 'Ask first', hint: 'holds the slot, a person confirms' },
  { value: 'message', label: 'Just take a message', hint: 'never touches the diary' },
]

export default function SettingsScreen({ settings, onChange, prompt, onPromptChange }) {
  const [draft, setDraft] = useState(prompt)
  const dirty = draft !== prompt

  function setBookingMode(value) {
    onChange({ ...settings, bookingMode: value })
  }

  function setSystemCanBook(value) {
    onChange({ ...settings, systemCanBook: value })
  }

  function toggleNeverBook(type) {
    const has = settings.neverBook.includes(type)
    const neverBook = has
      ? settings.neverBook.filter((t) => t !== type)
      : [...settings.neverBook, type]
    onChange({ ...settings, neverBook })
  }

  return (
    <div className="settings-screen">
      <section className="setting-group">
        <div className="setting-question">When someone wants an appointment, what should the AI do?</div>
        <div className="setting-options">
          {BOOKING_MODES.map((mode) => (
            <label key={mode.value} className="radio-row">
              <input
                type="radio"
                name="bookingMode"
                checked={settings.bookingMode === mode.value}
                onChange={() => setBookingMode(mode.value)}
              />
              <span>
                <strong>{mode.label}</strong> — {mode.hint}
              </span>
            </label>
          ))}
        </div>
      </section>

      <section className="setting-group">
        <div className="setting-question">Can this clinic's computer system accept bookings from us?</div>
        <div className="setting-options">
          <label className="radio-row">
            <input
              type="radio"
              name="systemCanBook"
              checked={settings.systemCanBook === true}
              onChange={() => setSystemCanBook(true)}
            />
            <span>Yes</span>
          </label>
          <label className="radio-row">
            <input
              type="radio"
              name="systemCanBook"
              checked={settings.systemCanBook === false}
              onChange={() => setSystemCanBook(false)}
            />
            <span>No</span>
          </label>
        </div>
        <p className="setting-hint">
          Some clinics run software we can only read, not write to. When that's the case the AI
          must never say "you're booked".
        </p>
      </section>

      <section className="setting-group">
        <div className="setting-question">Which appointments should the AI never book?</div>
        <div className="setting-options setting-options--grid">
          {TREATMENT_TYPES.map((type) => (
            <label key={type} className="checkbox-row">
              <input
                type="checkbox"
                checked={settings.neverBook.includes(type)}
                onChange={() => toggleNeverBook(type)}
              />
              <span>{TREATMENT_LABELS[type]}</span>
            </label>
          ))}
        </div>
        <p className="setting-hint">
          This beats the setting above. Even on "Book it", these are never booked.
        </p>
      </section>

      <details className="prompt-editor">
        <summary>Edit the AI's instructions</summary>
        <textarea value={draft} onChange={(e) => setDraft(e.target.value)} rows={14} />
        <div className="prompt-editor-actions">
          <button
            className="btn-link"
            disabled={!dirty}
            onClick={() => onPromptChange(draft)}
          >
            Save
          </button>
          <button
            className="btn-link"
            onClick={() => {
              setDraft(EXTRACTION_PROMPT)
              onPromptChange(EXTRACTION_PROMPT)
            }}
          >
            Reset to default
          </button>
        </div>
        <p className="setting-hint">
          Change this, then run the tests, and see whether the score went up or down. (This
          build simulates the AI's answers rather than calling a live model, so this text
          won't change the score — wire up a real API key to make it live.)
        </p>
      </details>
    </div>
  )
}
