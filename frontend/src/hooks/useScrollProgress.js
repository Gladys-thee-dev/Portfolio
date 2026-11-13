import { useEffect, useRef } from 'react';

// Reading-progress bar. Scroll events can fire many times per frame, so the handler only
// schedules one requestAnimationFrame; the frame does O(1) work and writes the bar's
// transform straight to the DOM node. React never re-renders while scrolling.
export function useScrollProgress() {
  const ref = useRef(null);
  useEffect(() => {
    const bar = ref.current;
    if (!bar) return undefined;
    let frame = 0;
    const update = () => {
      frame = 0;
      const doc = document.documentElement;
      const max = doc.scrollHeight - doc.clientHeight;
      const p = max > 0 ? Math.min(1, Math.max(0, doc.scrollTop / max)) : 0;
      bar.style.transform = `scaleX(${p})`;
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);
  return ref;
}
