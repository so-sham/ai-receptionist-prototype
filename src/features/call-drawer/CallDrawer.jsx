// The call drawer's mount point.
//
// Phase-4 stub: it reads `openCallId` from the store and renders the Drawer
// primitive with placeholder contents. A later phase replaces this file's
// internals with the real drawer. Its contract with the shell must not change:
// a DEFAULT-exported component with NO required props, reading everything from
// useConsole() — so ConsoleLayout.jsx never has to be touched again.

import { Drawer } from '../../components';
import { useConsole } from '../../state';
import { callById } from '../../state/selectors.js';

// README layout table: 560px at the design target, 600px at >=1680,
// 440px on tablet, a full-screen sheet on mobile.
function drawerWidth(vw) {
  if (vw < 900) return '100vw';
  if (vw < 1240) return '440px';
  return vw >= 1680 ? '600px' : '560px';
}

export default function CallDrawer() {
  const { state, closeDrawer } = useConsole();
  const call = state.openCallId === null ? null : callById(state.openCallId);

  return (
    <Drawer
      open={Boolean(call)}
      onClose={closeDrawer}
      width={drawerWidth(state.viewportWidth)}
      header={
        call ? (
          <div>
            <div className="t-h2">{call.caller}</div>
            <div className="t-small" style={{ color: 'var(--ink-muted)' }}>
              {call.about}
            </div>
          </div>
        ) : null
      }
    >
      {call ? (
        <p className="t-small" style={{ color: 'var(--ink-muted)' }}>
          Call detail — coming in a later phase.
        </p>
      ) : null}
    </Drawer>
  );
}
