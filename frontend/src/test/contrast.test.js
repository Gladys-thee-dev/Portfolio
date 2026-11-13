// WCAG 2.2 contrast for the palette, read straight from index.css so the test and the
// stylesheet cannot drift apart. AA requires 4.5:1 for body text and 3:1 for large text
// and UI components. https://www.w3.org/TR/WCAG22/#contrast-minimum
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const css = readFileSync(resolve(__dirname, '../index.css'), 'utf8');

function tokens(selector) {
  const start = css.indexOf(selector);
  const block = css.slice(start, css.indexOf('}', start));
  return Object.fromEntries([...block.matchAll(/--([\w-]+):\s*(#[0-9a-f]{6})\b/gi)].map((m) => [m[1], m[2]]));
}

function luminance(hex) {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const lin = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

export function contrast(a, b) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

const THEMES = { light: tokens("[data-bs-theme='light']"), dark: tokens("[data-bs-theme='dark']") };

describe('contrast helper', () => {
  it('matches known reference values', () => {
    expect(contrast('#000000', '#ffffff')).toBeCloseTo(21, 5);
    expect(contrast('#777777', '#ffffff')).toBeCloseTo(4.48, 2);
  });
});

describe.each(Object.entries(THEMES))('%s theme', (_name, t) => {
  it('defines every token the tests check', () => {
    for (const k of ['bg', 'surface', 'surface-2', 'ink', 'ink-2', 'royal', 'royal-ink', 'gold', 'gold-soft']) expect(t[k], k).toBeDefined();
  });

  it.each([
    ['ink', 'bg'],
    ['ink', 'surface'],
    ['ink', 'surface-2'],
    ['ink-2', 'bg'],
    ['ink-2', 'surface'],
    ['ink-2', 'surface-2'],
    ['royal', 'bg'],
    ['royal', 'surface'],
    ['royal-ink', 'royal'],
    ['gold', 'surface'],
    ['gold', 'gold-soft'], // .badge-soft
  ])('%s on %s meets AA for body text (4.5:1)', (fg, bg) => {
    expect(contrast(t[fg], t[bg])).toBeGreaterThanOrEqual(4.5);
  });
});

describe('hero (always dark)', () => {
  it.each([
    ['#e9ecf8', '#070b19'],
    ['#b9c0dc', '#0f1640'],
    ['#c4bfff', '#1a1257'],
    ['#ffffff', '#3b33c4'], // primary button text
  ])('%s on %s meets AA', (fg, bg) => {
    expect(contrast(fg, bg)).toBeGreaterThanOrEqual(4.5);
  });
});
