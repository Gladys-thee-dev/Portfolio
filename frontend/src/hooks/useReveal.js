import { useEffect, useRef } from 'react';

// One IntersectionObserver shared by every revealed element. N scroll listeners would
// each run on every scroll event: O(N) work per frame on the main thread. With a single
// observer the browser reports only the elements that cross the threshold, and each one
// is unobserved after it appears, so the observer's work shrinks to zero.
let shared = null;

function observer() {
  if (!shared) {
    shared = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible'); // direct DOM write: no React re-render
            shared.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -48px 0px' },
    );
  }
  return shared;
}

export function useReveal() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduce || typeof IntersectionObserver === 'undefined') {
      el.classList.add('is-visible');
      return undefined;
    }
    const obs = observer();
    obs.observe(el);
    return () => obs.unobserve(el);
  }, []);
  return ref;
}
