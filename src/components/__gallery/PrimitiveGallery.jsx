import { useState } from 'react'
import {
  Button,
  Pill,
  StatusGlyph,
  ConfidenceDots,
  MetricCard,
  Card,
  CardHeader,
  SectionHead,
  TableShell,
  TableHeader,
  TableRow,
  Drawer,
  Modal,
  Toggle,
  ProgressBar,
  InlineBanner,
  Toast,
  Chip,
  Tabs,
  FactGrid,
  EmptyState,
  ErrorState,
  SkeletonTable,
} from '../index.js'

const sectionStyle = {
  marginBottom: '48px',
}

const rowStyle = {
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: '16px',
  marginBottom: '16px',
}

const labelStyle = {
  fontFamily: 'var(--font-mono)',
  fontSize: '11px',
  color: 'var(--ink-faint)',
  marginBottom: '8px',
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
}

function Section({ title, children }) {
  return (
    <section style={sectionStyle}>
      <h2 className="t-h1" style={{ marginBottom: '16px' }}>
        {title}
      </h2>
      {children}
    </section>
  )
}

function Row({ label, children }) {
  return (
    <div style={{ marginBottom: '20px' }}>
      {label ? <div style={labelStyle}>{label}</div> : null}
      <div style={rowStyle}>{children}</div>
    </div>
  )
}

export default function PrimitiveGallery() {
  const [toggleOn, setToggleOn] = useState(true)
  const [toggleOff, setToggleOff] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [toastMsg, setToastMsg] = useState(null)
  const [activeTab, setActiveTab] = useState('held')
  const [selectedRow, setSelectedRow] = useState(1)
  const [chips, setChips] = useState(['Emergencies', 'Oral surgery', 'Sedation cases'])

  const flash = (msg) => {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(null), 2600)
  }

  const removeChip = (label) => {
    setChips((prev) => prev.filter((c) => c !== label))
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px' }}>
      <h1 className="t-display" style={{ marginBottom: '8px' }}>
        Primitive Gallery
      </h1>
      <p className="t-body" style={{ color: 'var(--ink-muted)', marginBottom: '40px' }}>
        Visual QA scaffold for every component in src/components. Dev-only -- not part of the
        production app.
      </p>

      <Section title="Button">
        <Row label="Primary / lg + sm">
          <Button variant="primary" size="lg">
            Approve
          </Button>
          <Button variant="primary" size="sm">
            Approve
          </Button>
        </Row>
        <Row label="Secondary / lg + sm">
          <Button variant="secondary" size="lg">
            Change something
          </Button>
          <Button variant="secondary" size="sm">
            Change something
          </Button>
        </Row>
        <Row label="Quiet / lg + sm">
          <Button variant="quiet" size="lg">
            Open the call →
          </Button>
          <Button variant="quiet" size="sm">
            Cancel
          </Button>
        </Row>
        <Row label="Disabled">
          <Button variant="primary" disabled>
            Approve
          </Button>
          <Button variant="secondary" disabled>
            Change something
          </Button>
        </Row>
      </Section>

      <Section title="Pill">
        <Row label="Tones">
          <Pill tone="settled" glyph="✓">
            Booked
          </Pill>
          <Pill tone="pending" glyph="◐">
            Held
          </Pill>
          <Pill tone="attention" glyph="!">
            Not booked
          </Pill>
          <Pill tone="neutral">New patient exam</Pill>
        </Row>
      </Section>

      <Section title="Status Glyph">
        <Row label="Kinds">
          <StatusGlyph kind="attention" />
          <StatusGlyph kind="pending" />
          <StatusGlyph kind="settled" />
          <StatusGlyph kind="neutral" />
          <StatusGlyph kind="attention" label="Possible emergency" />
        </Row>
      </Section>

      <Section title="Confidence Dots">
        <Row label="0 through 5 filled">
          <ConfidenceDots filled={0} title="not detected" />
          <ConfidenceDots filled={1} title="20% confidence" />
          <ConfidenceDots filled={2} title="40% confidence" />
          <ConfidenceDots filled={3} title="60% confidence" />
          <ConfidenceDots filled={4} title="80% confidence" />
          <ConfidenceDots filled={5} title="100% confidence" />
        </Row>
      </Section>

      <Section title="Metric Card">
        <Row>
          <div style={{ width: '260px' }}>
            <MetricCard label="Calls answered" value="47" note="↑ 6 vs average Thursday" />
          </div>
          <div style={{ width: '260px' }}>
            <MetricCard label="Handled by the agent" value="31" note="66% end to end" />
          </div>
          <div style={{ width: '260px' }}>
            <MetricCard
              label="Opportunities found"
              value="9"
              note="3 need you"
              linkLabel="See them →"
              onClick={() => flash('Navigate to Calls · Opportunities only')}
            />
          </div>
          <div style={{ width: '260px' }}>
            <MetricCard
              label="Value at risk"
              value="$12,400"
              valueFont="sans"
              note="4 unreturned"
              noteAttention
              linkLabel="See the four calls →"
              onClick={() => flash('Navigate to Calls · Value at risk')}
            />
          </div>
        </Row>
      </Section>

      <Section title="Card, CardHeader, SectionHead">
        <Row>
          <div style={{ width: '420px' }}>
            <Card>
              <CardHeader
                title="Needs you"
                action={
                  <Button variant="quiet" size="sm">
                    See all
                  </Button>
                }
              />
              <p className="t-body">Card body content sits below the header.</p>
            </Card>
          </div>
          <div style={{ width: '420px' }}>
            <Card>
              <SectionHead>What happened</SectionHead>
              <p className="t-body" style={{ marginTop: '16px' }}>
                Plain prose describing the call goes here.
              </p>
            </Card>
          </div>
        </Row>
      </Section>

      <Section title="Data Table">
        <TableShell>
          <TableHeader cols="32px 1fr 120px 100px">
            <div />
            <div>Caller</div>
            <div>Time</div>
            <div style={{ textAlign: 'right' }}>Value</div>
          </TableHeader>
          {[1, 2, 3].map((i) => (
            <TableRow
              key={i}
              cols="32px 1fr 120px 100px"
              selected={selectedRow === i}
              onClick={() => setSelectedRow(i)}
            >
              <StatusGlyph kind={i === 1 ? 'attention' : 'settled'} />
              <div className="t-body-strong">Sample caller {i}</div>
              <div className="t-mono">8:4{i}pm</div>
              <div className="t-mono-lg" style={{ textAlign: 'right' }}>
                $1,{i}00
              </div>
            </TableRow>
          ))}
        </TableShell>
      </Section>

      <Section title="Drawer & Modal">
        <Row>
          <Button variant="primary" onClick={() => setDrawerOpen(true)}>
            Open drawer
          </Button>
          <Button variant="secondary" onClick={() => setModalOpen(true)}>
            Open modal
          </Button>
        </Row>
        <Drawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          width="560px"
          header={
            <div>
              <div className="t-h2">Marcus Webb</div>
              <div className="t-mono" style={{ color: 'var(--ink-muted)' }}>
                8:42pm · 3m 12s · emergency
              </div>
            </div>
          }
          footer={
            <>
              <Button variant="secondary">Add to quality set</Button>
              <Button variant="primary" style={{ marginLeft: 'auto' }}>
                Call back
              </Button>
            </>
          }
        >
          <InlineBanner tone="attention" glyph="!">
            Possible emergency — escalated
          </InlineBanner>
          <p className="t-body" style={{ marginTop: '16px' }}>
            Drawer body content scrolls here while the header and footer stay put.
          </p>
        </Drawer>
        <Modal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          title="What are you changing?"
          footer={
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
          }
        >
          <p className="t-small" style={{ color: 'var(--ink-muted)' }}>
            Recorded against this call.
          </p>
        </Modal>
      </Section>

      <Section title="Toggle">
        <Row label="On / Off / Read-only">
          <Toggle checked={toggleOn} onChange={setToggleOn} label="Write notes to the chart" />
          <Toggle checked={toggleOff} onChange={setToggleOff} label="Create new patients" />
          <Toggle
            checked
            readOnly
            label="Double-booking"
            onBlocked={() => flash('Fixed — the agent can never double-book')}
          />
        </Row>
      </Section>

      <Section title="Progress Bar">
        <Row>
          <div style={{ width: '320px' }}>
            <ProgressBar value={12} />
          </div>
          <div style={{ width: '320px' }}>
            <ProgressBar value={58} />
          </div>
          <div style={{ width: '320px' }}>
            <ProgressBar value={100} />
          </div>
        </Row>
      </Section>

      <Section title="Inline Banner">
        <Row>
          <InlineBanner tone="settled" glyph="✓">
            All safety checks passed
          </InlineBanner>
        </Row>
        <Row>
          <InlineBanner tone="pending" glyph="◐">
            Low confidence on treatment type
          </InlineBanner>
        </Row>
        <Row>
          <InlineBanner tone="attention" glyph="!">
            Possible emergency — escalated
          </InlineBanner>
        </Row>
      </Section>

      <Section title="Toast">
        <Row>
          <Button variant="secondary" onClick={() => flash('Added. The quality set now has 25 calls.')}>
            Trigger toast
          </Button>
        </Row>
        <Toast message={toastMsg} />
      </Section>

      <Section title="Chip">
        <Row label="Filter chips">
          <Chip variant="filter" onRemove={() => {}}>
            Held
          </Chip>
          <Chip variant="filter" onRemove={() => {}}>
            Emergency
          </Chip>
        </Row>
        <Row label="Never-book chips">
          {chips.map((label) => (
            <Chip key={label} variant="never-book" onRemove={() => removeChip(label)}>
              {label}
            </Chip>
          ))}
          <Chip variant="add" onClick={() => setChips((prev) => [...prev, `Item ${prev.length + 1}`])}>
            Add
          </Chip>
        </Row>
      </Section>

      <Section title="Tabs">
        <Tabs
          tabs={[
            { key: 'held', label: 'Held slots', count: 3 },
            { key: 'review', label: 'Needs review', count: 2 },
          ]}
          activeKey={activeTab}
          onChange={setActiveTab}
        />
      </Section>

      <Section title="Fact Grid">
        <FactGrid
          facts={[
            { label: 'Caller', value: 'New to the practice' },
            { label: 'Worth', value: '$4,200', mono: true },
            { label: 'Insurance', value: 'Cigna ••••3806 · accepted', mono: true },
            { label: 'Heard at', value: '7:15pm, after hours' },
          ]}
        />
      </Section>

      <Section title="Empty / Error State">
        <Row>
          <div style={{ width: '420px', border: '1px solid var(--line)', borderRadius: '10px' }}>
            <EmptyState
              message="Nothing needs you. The agent handled all 47 calls."
              action={{ label: 'See all calls', onClick: () => {} }}
            />
          </div>
          <div style={{ width: '420px', border: '1px solid var(--line)', borderRadius: '10px' }}>
            <ErrorState
              message="We couldn't load your calls. Check your connection and try again."
              onRetry={() => {}}
            />
          </div>
        </Row>
      </Section>

      <Section title="Skeleton">
        <SkeletonTable rows={4} cols="32px 1fr 120px 100px" />
      </Section>
    </div>
  )
}
