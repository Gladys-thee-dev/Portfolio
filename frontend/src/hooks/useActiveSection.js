import { useEffect, useState } from 'react';

// Scroll-spy for the navbar with one observer watching a thin band across the middle of
// the viewport: no scroll listener and no layout reads (getBoundingClientRect) per frame.
export function useActiveSection(ids) {
  const [active, setActive] = useState(null); // nothing is current while the hero is in view
  const key = ids.join('|');

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return undefined;
    const order = key.split('|');
    const visible = new Set();
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) visible.add(e.target.id);
          else visible.delete(e.target.id);
        }
        const first = order.find((id) => visible.has(id)); // O(sections), sections ~ 8
        setActive(first ?? null);
      },
      { rootMargin: '-45% 0px -50% 0px' },
    );
    for (const id of order) {
      const el = document.getElementById(id);
      if (el) obs.observe(el);
    }
    return () => obs.disconnect();
  }, [key]);

  return active;
}
