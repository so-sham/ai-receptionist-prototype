// Agent screen — README §5. Where the office manager decides what the agent
// may do when it answers the phone. Four blocks, top to bottom: booking
// mode, the per-appointment-type table, the capability table, and a 2x2
// grid of detail cards. Locked controls (the oral-surgery row, the
// double-booking limit, three of the fallback rules) render their fixed
// visual state here, but every click still just calls the normal action —
// the reducer already guards locked paths and fires the explanatory toast,
// so nothing in this screen re-implements that guard.

import BookingModeCards from './BookingModeCards.jsx';
import PerTypeTable from './PerTypeTable.jsx';
import CapabilityTable from './CapabilityTable.jsx';
import NeverBookCard from './NeverBookCard.jsx';
import EmergencyScriptCard from './EmergencyScriptCard.jsx';
import LimitsCard from './LimitsCard.jsx';
import FallbackRulesCard from './FallbackRulesCard.jsx';
import styles from './AgentScreen.module.css';

export default function AgentScreen() {
  return (
    <div>
      <h1 className="t-h1">Agent</h1>
      <p className={`t-small ${styles.subtitle}`}>
        What the agent is allowed to do when it answers the phone.
      </p>

      <BookingModeCards />
      <PerTypeTable />
      <CapabilityTable />

      <div className={styles.grid}>
        <NeverBookCard />
        <EmergencyScriptCard />
        <LimitsCard />
        <FallbackRulesCard />
      </div>
    </div>
  );
}
