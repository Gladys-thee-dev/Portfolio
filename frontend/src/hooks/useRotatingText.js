import { useEffect, useRef } from 'react';

// Cycles the hero phrase by writing textContent to one <span>. Each step is O(1) DOM work
// and causes no React re-render. Screen readers get the full list from a visually hidden
// element instead (see Hero), and users who prefer reduced motion see the first phrase.
export function useRotatingText(phrases, intervalMs = 2600) {
  const ref = useRef(null);
  const key = phrases.join('|');
  useEffect(() => {
    const el = ref.current;
    const list = key.split('|');
    if (!el || list.length < 2) return undefined;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return undefined;
    let i = 0;
    const id = setInterval(() => {
      i = (i + 1) % list.length;
      el.classList.remove('is-swapping');
      void el.offsetWidth; // restart the CSS animation
      el.textContent = list[i];
      el.classList.add('is-swapping');
    }, intervalMs);
    return () => clearInterval(id);
  }, [key, intervalMs]);
  return ref;
}
