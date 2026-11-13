import { describe, expect, it } from 'vitest';
import { durationLabel, formatMonth, formatRange } from '../lib/format';
import { ALL, buildAreaIndex, countMatches, matcher } from '../lib/indexes';
import { encodeForm, validateMessage } from '../lib/validation';

const SAMPLE = {
  focusAreas: [{ id: 'a' }, { id: 'b' }],
  skills: [
    { id: 's1', areas: ['a'] },
    { id: 's2', areas: ['a', 'b'] },
  ],
  experience: [{ id: 'e1', areas: ['b'] }],
  projects: [{ id: 'p1', areas: ['a'] }],
};

describe('buildAreaIndex / matcher', () => {
  it('maps each area to the items tagged with it', () => {
    const index = buildAreaIndex(SAMPLE);
    expect(index.get('a').skills).toEqual(new Set(['s1', 's2']));
    expect(index.get('b').experience).toEqual(new Set(['e1']));
    expect(countMatches(index, 'a')).toEqual({ experience: 0, projects: 1 });
    expect(countMatches(index, ALL)).toBeNull();
  });

  it('matches everything for ALL and nothing for an unknown area', () => {
    const index = buildAreaIndex(SAMPLE);
    expect(matcher(index, ALL, 'skills')('anything')).toBe(true);
    expect(matcher(index, 'zzz', 'skills')('s1')).toBe(false);
    expect(matcher(index, 'b', 'skills')('s1')).toBe(false);
    expect(matcher(index, 'b', 'skills')('s2')).toBe(true);
  });

  it('rejects data that points at an undefined area', () => {
    expect(() => buildAreaIndex({ ...SAMPLE, projects: [{ id: 'p', areas: ['nope'] }] })).toThrow(/unknown focus area/);
  });

  it('builds in linear time: 20k tagged items index well under the frame budget', () => {
    const n = 20_000;
    const big = {
      focusAreas: Array.from({ length: 10 }, (_, i) => ({ id: `a${i}` })),
      skills: [],
      experience: Array.from({ length: n }, (_, i) => ({ id: `e${i}`, areas: [`a${i % 10}`, `a${(i + 3) % 10}`] })),
      projects: [],
    };
    const t0 = performance.now();
    const index = buildAreaIndex(big);
    const built = performance.now() - t0;
    const isMatch = matcher(index, 'a3', 'experience');
    const t1 = performance.now();
    let hits = 0;
    for (let i = 0; i < n; i++) if (isMatch(`e${i}`)) hits++;
    const scanned = performance.now() - t1;
    expect(hits).toBe(4000); // i % 10 == 3 or (i + 3) % 10 == 3
    // Generous bounds so slow CI machines don't flake; an O(n^2) version takes seconds.
    expect(built).toBeLessThan(250);
    expect(scanned).toBeLessThan(250);
  });
});

describe('format', () => {
  it('formats months and ranges', () => {
    expect(formatMonth('2025-01')).toBe('Jan 2025');
    expect(formatRange('2020-06', '2021-08')).toBe('Jun 2020 – Aug 2021');
    expect(formatRange('2025-01', null)).toBe('Jan 2025 – Present');
    expect(() => formatMonth('2025-13')).toThrow();
    expect(() => formatMonth('Jan 2025')).toThrow();
  });

  it('labels durations inclusively', () => {
    expect(durationLabel('2019-05', '2019-08')).toBe('4 mo');
    expect(durationLabel('2020-06', '2021-08')).toBe('1 yr 3 mo');
    expect(durationLabel('2023-01', '2024-12')).toBe('2 yr');
    expect(durationLabel('2025-01', null, new Date(2026, 10, 13))).toBe('1 yr 11 mo');
  });
});

describe('contact validation', () => {
  const ok = { name: 'Ada Lovelace', email: 'ada@example.com', company: '', message: 'We are hiring evaluators for math.' };

  it('accepts a complete message', () => {
    expect(validateMessage(ok)).toEqual({});
  });

  it.each([
    [{ name: '' }, 'name'],
    [{ name: 'A' }, 'name'],
    [{ email: '' }, 'email'],
    [{ email: 'not-an-email' }, 'email'],
    [{ message: 'too short' }, 'message'],
    [{ message: 'x'.repeat(4001) }, 'message'],
    [{ company: 'c'.repeat(121) }, 'company'],
  ])('flags %o', (patch, field) => {
    expect(Object.keys(validateMessage({ ...ok, ...patch }))).toEqual([field]);
  });

  it('encodes the body the way Netlify Forms expects', () => {
    const body = new URLSearchParams(encodeForm('contact', { name: '  Ada ', email: 'ada@example.com', note: 'a&b=c' }));
    expect(body.get('form-name')).toBe('contact');
    expect(body.get('name')).toBe('Ada');
    expect(body.get('note')).toBe('a&b=c');
  });
});
