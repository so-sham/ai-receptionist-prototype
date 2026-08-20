// The shell's breakpoint hook.
//
// The three breakpoints come from the handoff README's layout-shell table and
// are reproduced verbatim from the prototype's own derivation:
//
//   narrow  vw < 900     phone   — top bar + fixed bottom nav, stacked content
//   mid     900–1239     tablet  — 68px icon rail, denser tracks
//   wide    vw >= 1240   desktop — the design target, 232px sidebar
//   xwide   vw >= 1680   wider content max-width / wider drawer
//
// The console store also tracks `viewportWidth` (selectors.breakpoint reads it),
// so screens that already hold state can use either. Layout components use this
// hook so the shell stays independent of the store's render timing.

import { useEffect, useState } from 'react';

const SSR_WIDTH = 1440;

const read = () => (typeof window === 'undefined' ? SSR_WIDTH : window.innerWidth);

export function viewportFlags(vw) {
  return {
    vw,
    narrow: vw < 900,
    mid: vw >= 900 && vw < 1240,
    wide: vw >= 1240,
    xwide: vw >= 1680,
  };
}

export default function useViewport() {
  const [vw, setVw] = useState(read);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    // No rAF/debounce: React bails out of a re-render when the width is
    // unchanged, and rAF-throttling would stall the update in a background tab.
    const onResize = () => setVw(window.innerWidth);

    // Sync once on mount: the first render used the SSR fallback under SSR, and
    // the width may have changed between module load and mount.
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return viewportFlags(vw);
}

export { useViewport };
