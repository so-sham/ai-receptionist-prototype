// "What it says in an emergency" — README §5d. The configured script,
// verbatim, in a bordered block. No real script editor is specced, so "Edit
// wording" just gives a toast.

import { Card, Button } from '../../components';
import { EMERGENCY_SCRIPT } from '../../data';
import { useConsole } from '../../state';

import styles from './EmergencyScriptCard.module.css';

export default function EmergencyScriptCard() {
  const { toast } = useConsole();

  return (
    <Card>
      <h2 className={`t-h2 ${styles.title}`}>What it says in an emergency</h2>
      <p className={`t-small ${styles.copy}`}>
        Read out word for word, then the call is escalated. The agent never judges how serious it
        is.
      </p>
      <div className={`t-body ${styles.script}`}>“{EMERGENCY_SCRIPT}”</div>
      <Button
        variant="quiet"
        className={styles.edit}
        onClick={() => toast('Editing not available in this preview.')}
      >
        Edit wording
      </Button>
    </Card>
  );
}
