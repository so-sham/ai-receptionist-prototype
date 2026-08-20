// Section 8: "How the agent handled it".
//
// The ONLY AI-performance surface in the call view. It sits on --bg inside a
// hairline card so it reads as a separate register from the chart note above,
// and it is collapsed by default: the machine's self-report is the last thing a
// human should need. It must never restate Call highlights — everything here is
// about the agent's own certainty and timing, not about the patient.

import { Link } from 'react-router-dom';

import { ConfidenceDots } from '../../components';
import { useConsole } from '../../state';
import { agentSummaryLine, drawerLatencyStats } from '../../state/selectors.js';
import styles from './AgentPanel.module.css';

const EMPTY = '—';

export default function AgentPanel({ call }) {
  const { state, toggleAgentPanel } = useConsole();
  const open = state.agentPanelExpanded;
  const stats = drawerLatencyStats(call.id);
  const panelId = `agent-panel-${call.id}`;

  return (
    <section className={styles.card}>
      <button
        type="button"
        className={styles.summary}
        onClick={toggleAgentPanel}
        aria-expanded={open}
        aria-controls={panelId}
      >
        <span className={styles.summaryText}>
          <span className={styles.title}>How the agent handled it</span>
          <span className={styles.line}>{agentSummaryLine(call.id)}</span>
        </span>
        <span className={styles.chevron} aria-hidden="true">
          {open ? '▲' : '▼'}
        </span>
      </button>

      {open ? (
        <div id={panelId} className={styles.body}>
          <h4 className={styles.head}>How sure it was, field by field</h4>
          {call.confidenceFields.map((field) => (
            <div key={field.label} className={styles.fieldRow}>
              <div className={styles.fieldLabel}>{field.label}</div>
              <div
                className={[styles.fieldValue, field.value === EMPTY ? styles.faint : null]
                  .filter(Boolean)
                  .join(' ')}
              >
                {field.value}
              </div>
              <ConfidenceDots
                filled={field.filled}
                title={field.title}
                className={styles.dots}
              />
            </div>
          ))}

          <h4 className={[styles.head, styles.headSpaced].join(' ')}>On the line</h4>
          {stats.map((stat) => (
            <div key={stat.label} className={styles.statRow}>
              <div className={styles.statLabel}>{stat.label}</div>
              {/* Off-target values in --pending: provisional, not alarming. */}
              <div
                className={[styles.statValue, stat.ok ? null : styles.offTarget]
                  .filter(Boolean)
                  .join(' ')}
              >
                {stat.value}
              </div>
            </div>
          ))}

          <p className={styles.footer}>
            Practice-wide figures live under <Link to="/quality">Quality → Day to day</Link>.
          </p>
        </div>
      ) : null}
    </section>
  );
}
