import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const html = readFileSync(resolve(__dirname, '../../index.html'), 'utf8');
const netlify = readFileSync(resolve(__dirname, '../../../netlify.toml'), 'utf8');
const csp = /Content-Security-Policy = "([^"]+)"/.exec(netlify)[1];

describe('Content Security Policy', () => {
  it('allows exactly the inline scripts in index.html, by hash', () => {
    const inline = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(
      (m) => `'sha256-${createHash('sha256').update(m[1]).digest('base64')}'`,
    );
    expect(inline).toHaveLength(1);
    const allowed = csp.match(/'sha256-[^']+'/g);
    expect(allowed).toEqual(inline);
  });

  it('blocks framing, plugins and inline scripts in general', () => {
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).toContain("object-src 'none'");
    expect(csp).not.toMatch(/script-src[^;]*'unsafe-inline'/);
    expect(csp).not.toMatch(/script-src[^;]*'unsafe-eval'/);
  });

  it('lets the contact form post only to this site', () => {
    expect(csp).toContain("form-action 'self'");
    expect(csp).toContain("connect-src 'self'");
  });
});
