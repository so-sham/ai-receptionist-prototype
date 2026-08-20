// Barrel for the state layer.
//
// Screens normally need only:
//   import { useConsole } from '../state'
//   import { visibleCalls, callCountLine } from '../state/selectors.js'
//
// Selectors are re-exported here too (as a namespace, to keep this barrel's
// surface readable), so `import { selectors } from '../state'` also works.

export { ConsoleProvider, useConsole, ConsoleContext } from './ConsoleStore.jsx';

export { default as useConsoleKeyboard, hasOverlayOpen } from './useConsoleKeyboard.js';
export { default as useToast, TOAST_DURATION_MS } from './useToast.js';
export { default as useRunTimer, RUN_TICK_MS } from './useRunTimer.js';

export {
  reducer,
  initialState,
  A as ACTIONS,
  TOAST_COPY,
  CURRENT_RUN_NUMBER,
  CURRENT_RUN_NOTE,
  EMPTY_RUN_NOTE,
} from './reducer.js';

export * as selectors from './selectors.js';
