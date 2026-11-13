import { act } from '@testing-library/react';

/** Records what is observed, so tests can fire intersections by hand. */
export class MockIntersectionObserver {
  static instances = [];

  constructor(callback, options) {
    this.callback = callback;
    this.options = options;
    this.elements = new Set();
    MockIntersectionObserver.instances.push(this);
  }

  observe(el) {
    this.elements.add(el);
  }

  unobserve(el) {
    this.elements.delete(el);
  }

  disconnect() {
    this.elements.clear();
  }

  takeRecords() {
    return [];
  }
}

export function intersect(el, isIntersecting = true) {
  act(() => {
    for (const obs of MockIntersectionObserver.instances) {
      if (obs.elements.has(el)) obs.callback([{ target: el, isIntersecting }], obs);
    }
  });
}
