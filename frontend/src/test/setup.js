import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';
import { MockIntersectionObserver } from './observers';

globalThis.IntersectionObserver = MockIntersectionObserver;
window.matchMedia = (query) => ({
  matches: false,
  media: query,
  onchange: null,
  addEventListener() {},
  removeEventListener() {},
  addListener() {},
  removeListener() {},
  dispatchEvent: () => false,
});
window.scrollTo = () => {};

afterEach(() => {
  cleanup();
  // Observer instances are kept: useReveal shares one observer for the whole module.
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  document.documentElement.removeAttribute('data-bs-theme');
  localStorage.clear();
});
