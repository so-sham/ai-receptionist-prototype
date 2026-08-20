// "Add to quality set" — the loop that connects Calls to Quality.
//
// One click turns a real bad outcome into a permanent regression test, so the
// four field values are shown as editable selects rather than as a read-only
// confirmation: the operator is stating the RIGHT answer, which is often not
// the one the agent gave.
//
// The name is held in the store (`qualitySetName`) because the drawer pre-fills
// it when opening the modal. The four field values are local: nothing outside
// this modal reads them, and the reducer has no slot for them.

import { useEffect, useMemo, useState } from 'react';

import { Button, Modal } from '../../components';
import { CALLS } from '../../data/index.js';
import { useConsole } from '../../state';
import styles from './QualitySetModal.module.css';

const EMPTY = '—';

// How many fields the modal confirms (README: "four pre-filled field values").
const FIELD_COUNT = 4;

const SUBHEAD =
  'Confirm the right answer for each field. Every future check will include this call.';

/**
 * The options offered for one field, derived from every value that field takes
 * anywhere in the fixtures — so the dropdowns stay truthful to the label set
 * without a second hand-maintained list. The current value is always present.
 */
function optionsFor(label, current) {
  const seen = new Set();
  CALLS.forEach((c) => {
    c.confidenceFields.forEach((f) => {
      if (f.label === label && f.value !== EMPTY) seen.add(f.value);
    });
  });
  if (current !== EMPTY) seen.add(current);
  // "Not detected" stays selectable: sometimes the right answer is nothing.
  return [...seen].sort((a, b) => a.localeCompare(b)).concat(EMPTY);
}

export default function QualitySetModal({ call }) {
  const { state, closeQualitySetModal, setQualitySetName, saveToQualitySet } = useConsole();
  const open = state.qualitySetModalOpen;

  const fields = useMemo(
    () =>
      call.confidenceFields.slice(0, FIELD_COUNT).map((f) => ({
        label: f.label,
        options: optionsFor(f.label, f.value),
      })),
    [call]
  );

  const [values, setValues] = useState({});

  // Re-prime the selects every time the modal opens, and whenever it is open
  // against a different call — a stale edit must never ride along.
  useEffect(() => {
    if (!open) return;
    setValues(
      Object.fromEntries(
        call.confidenceFields.slice(0, FIELD_COUNT).map((f) => [f.label, f.value])
      )
    );
  }, [open, call]);

  return (
    <Modal
      open={open}
      onClose={closeQualitySetModal}
      width="480px"
      title="Add to quality set"
      footer={
        <>
          <Button variant="secondary" onClick={closeQualitySetModal}>
            Cancel
          </Button>
          {/* SAVE_TO_QUALITY_SET increments the count, closes the modal and
              raises the "Added. The quality set now has N calls." toast. */}
          <Button variant="primary" onClick={saveToQualitySet}>
            Save to quality set
          </Button>
        </>
      }
    >
      <p className={styles.subhead}>{SUBHEAD}</p>

      <div className={styles.fields}>
        {fields.map((field) => {
          const id = `qs-${field.label.replace(/\s+/g, '-').toLowerCase()}`;
          return (
            <div key={field.label} className={styles.fieldRow}>
              <label className={styles.fieldLabel} htmlFor={id}>
                {field.label}
              </label>
              <select
                id={id}
                className={styles.select}
                value={values[field.label] ?? ''}
                onChange={(e) =>
                  setValues((prev) => ({ ...prev, [field.label]: e.target.value }))
                }
              >
                {field.options.map((option) => (
                  <option key={option} value={option}>
                    {option === EMPTY ? '— not detected' : option}
                  </option>
                ))}
              </select>
            </div>
          );
        })}
      </div>

      <label className={styles.nameLabel} htmlFor="qs-name">
        Name this case
      </label>
      <input
        id="qs-name"
        className={styles.nameInput}
        value={state.qualitySetName}
        onChange={(e) => setQualitySetName(e.target.value)}
      />
    </Modal>
  );
}
