import { createRequire } from 'node:module';
import { describe, expect, it } from 'vitest';
import { usedIcons } from '../../scripts/build-icons.mjs';

const codepoints = createRequire(import.meta.url)('bootstrap-icons/font/bootstrap-icons.json');

describe('icon subset', () => {
  it('finds the icons used in components and db.json', () => {
    const names = usedIcons();
    for (const n of ['github', 'linkedin', 'moon-stars', 'sun', 'send', 'award']) expect(names).toContain(n);
  });

  it('only uses icons that exist in Bootstrap Icons (a typo would render a blank box)', () => {
    const missing = usedIcons().filter((n) => !(n in codepoints));
    expect(missing).toEqual([]);
  });
});
