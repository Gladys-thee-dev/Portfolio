import { useCallback, useEffect, useState } from 'react';

const KEY = 'theme';

function initialTheme() {
  const set = document.documentElement.getAttribute('data-bs-theme'); // set early by index.html
  if (set === 'light' || set === 'dark') return set;
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function useTheme() {
  const [theme, setTheme] = useState(initialTheme);
  useEffect(() => {
    document.documentElement.setAttribute('data-bs-theme', theme);
    try {
      localStorage.setItem(KEY, theme);
    } catch {
      // storage may be blocked; the theme still applies for this visit
    }
  }, [theme]);
  const toggle = useCallback(() => setTheme((t) => (t === 'dark' ? 'light' : 'dark')), []);
  return [theme, toggle];
}
