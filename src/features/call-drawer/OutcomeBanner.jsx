// Section 2 of the drawer: the outcome banner.
//
// InlineBanner only knows the three semantic tones. `bannerKind` on a call can
// also be 'neutral' ("Not a patient call", "Nothing to act on"), which is
// deliberately colourless — the README's rule is that a screen with no problems
// is monochrome. That fourth case is styled here rather than pushed into the
// primitive, so the shared component keeps its three-tone contract.

import { InlineBanner } from '../../components';
import styles from './OutcomeBanner.module.css';

// Glyph per kind, from the prototype's OUT map. Never colour alone.
const GLYPH = { attention: '!', pending: '◐', settled: '✓', neutral: '·' };

export default function OutcomeBanner({ call }) {
  const kind = call.bannerKind;
  const neutral = kind === 'neutral';

  return (
    <InlineBanner
      // 'neutral' is not one of InlineBanner's three tones, so it resolves to
      // no tone class and the local one below supplies the colours instead.
      tone={kind}
      glyph={GLYPH[kind] || '·'}
      className={neutral ? styles.neutral : undefined}
    >
      {call.banner}
    </InlineBanner>
  );
}
