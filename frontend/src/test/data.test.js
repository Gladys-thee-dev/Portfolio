// Guards on db.json, the single source of content. These run on every build (Netlify runs
// `npm test` first), so a content edit that breaks a rule never reaches the live site.
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import data from '../../../db.json';
import { formatMonth } from '../lib/format';
import { buildAreaIndex } from '../lib/indexes';

const raw = readFileSync(resolve(__dirname, '../../../db.json'), 'utf8');

// SHA-256 of each confidential client's name (lower case). Only the hashes are stored,
// so this public repository never contains the names it guards against.
const CONFIDENTIAL = new Set([
  '79a0a449e7756380307eb01e302d73c84d7e370ac5b9bbc7a315c72cb4c92a1f',
  'c2559a5389b7d65cf4fdd19bb4620fbf69c7857574a86f6e4bcee31f68986cac',
  '4c8668945791e8a722c15feb654cf11f86b4835f047aa875a839488970de69ab',
  'dfff30d188055f20aaa1610f29102805528465bbad91709ded764e8899f5ad2b',
]);
const sha256 = (s) => createHash('sha256').update(s).digest('hex');

describe('confidentiality and privacy', () => {
  it('never names the confidential clients', () => {
    const words = new Set(raw.toLowerCase().match(/[a-z]+/g)); // O(file size)
    const leaked = [...words].filter((w) => CONFIDENTIAL.has(sha256(w)));
    expect(leaked).toEqual([]);
  });

  it('contains no email address or phone number', () => {
    expect(raw).not.toMatch(/[\w.+-]+@[\w-]+\.[\w.]+/);
    // International (+254 7..., +1 787...) and North American (787-555-0100, (787) 555-0100) forms.
    expect(raw).not.toMatch(/\+\d{1,3}[\s-]?\d[\d\s-]{6,}\d/);
    expect(raw).not.toMatch(/\(?\b\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}\b/);
    expect(data.profile).not.toHaveProperty('email');
    expect(data.profile).not.toHaveProperty('phone');
  });
});

describe('structure', () => {
  it('has every section the page renders', () => {
    for (const key of ['profile', 'stats', 'focusAreas', 'skills', 'experience', 'projects', 'recognition', 'education', 'certifications']) {
      expect(data[key], key).toBeTruthy();
    }
    expect(data.profile.summary.length).toBeGreaterThan(0);
    expect(data.profile.rotating.length).toBeGreaterThan(1);
  });

  it('uses unique ids within each list', () => {
    for (const key of ['focusAreas', 'skills', 'experience', 'projects', 'recognition', 'education', 'certifications']) {
      const ids = data[key].map((x) => x.id);
      expect(new Set(ids).size, key).toBe(ids.length);
    }
  });

  it('references only focus areas that exist (the index builds without error)', () => {
    const index = buildAreaIndex(data);
    expect([...index.keys()]).toEqual(data.focusAreas.map((a) => a.id));
    for (const area of data.focusAreas) {
      const b = index.get(area.id);
      expect(b.skills.size + b.experience.size + b.projects.size, `${area.id} matches nothing`).toBeGreaterThan(0);
    }
  });

  it('has valid, ordered dates (most recent role first)', () => {
    for (const job of data.experience) {
      expect(() => formatMonth(job.start)).not.toThrow();
      if (job.end) {
        expect(() => formatMonth(job.end)).not.toThrow();
        expect(job.end >= job.start, job.id).toBe(true);
      }
      expect(job.highlights.length, job.id).toBeGreaterThan(0);
    }
    const starts = data.experience.map((j) => j.start);
    expect([...starts].sort().reverse()).toEqual(starts);
  });

  it('links projects and profiles to the right accounts over https', () => {
    for (const p of data.projects) expect(p.repo).toMatch(/^https:\/\/github\.com\/Gladys-thee-dev\/[\w.-]+$/);
    for (const l of data.profile.links) expect(l.url).toMatch(/^https:\/\//);
    expect(data.projects.map((p) => p.id)).toEqual(['quantprice', 'eval-studio']);
  });

  it('uses Bootstrap Icons class names for every icon', () => {
    const icons = raw.match(/"icon": "([^"]+)"/g).map((m) => m.split('"')[3]);
    for (const icon of icons) expect(icon).toMatch(/^bi-[a-z0-9-]+$/);
  });
});
