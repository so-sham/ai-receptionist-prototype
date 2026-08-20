// Drives the quality check's simulated run.
//
// While runState is 'running', ticks once every ~260ms through the quality
// set (24 cases), then finishes. The interval is torn down on unmount and
// whenever runState leaves 'running' — cancelRun() therefore stops it with no
// extra bookkeeping.
//
// Mount this ONCE, wherever the Quality → Check screen lives.

import { useEffect, useRef } from 'react';
import { useConsole } from './ConsoleStore.jsx';

export const RUN_TICK_MS = 260;

export default function useRunTimer() {
  const { state, tickRun, finishRun } = useConsole();

  // The interval closure is created once per run; read the live index through
  // a ref rather than re-creating the interval on every tick.
  const indexRef = useRef(state.runIndex);
  indexRef.current = state.runIndex;

  const totalRef = useRef(state.qualitySetCount);
  totalRef.current = state.qualitySetCount;

  useEffect(() => {
    if (state.runState !== 'running') return undefined;

    const id = setInterval(() => {
      if (indexRef.current >= totalRef.current) finishRun();
      else tickRun();
    }, RUN_TICK_MS);

    return () => clearInterval(id);
  }, [state.runState, tickRun, finishRun]);

  return {
    runState: state.runState,
    runIndex: state.runIndex,
    total: state.qualitySetCount,
    tickMs: RUN_TICK_MS,
  };
}

export { useRunTimer };
