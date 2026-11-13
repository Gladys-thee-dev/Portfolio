// Browser audit of the production build:
//   npm run build && npm run preview   (serves dist/ on http://localhost:4173)
//   node scripts/audit.mjs [outDir]
//
// For desktop and mobile, in light and dark themes, it:
//  * runs axe-core (WCAG 2.2 A/AA rules) and fails on any violation;
//  * fails on any console error or Content-Security-Policy violation (the preview server
//    sends the production CSP);
//  * records what the page downloads (bytes over the wire, by type);
//  * saves full-page screenshots for review.
import { mkdirSync } from 'node:fs';
import AxeBuilder from '@axe-core/playwright';
import { chromium, devices } from 'playwright';

const URL_ = process.env.SITE_URL ?? 'http://localhost:4173/';
const OUT = process.argv[2] ?? 'audit';
mkdirSync(OUT, { recursive: true });

const VIEWPORTS = {
  desktop: { viewport: { width: 1440, height: 900 } },
  mobile: { ...devices['iPhone 13'] },
};

const browser = await chromium.launch();
let failures = 0;
try {
  for (const [vpName, vp] of Object.entries(VIEWPORTS)) {
    for (const theme of ['light', 'dark']) {
      const context = await browser.newContext({ ...vp, colorScheme: theme, reducedMotion: 'reduce' });
      const page = await context.newPage();
      await page.addInitScript(() => {
        window.__cspViolations = [];
        document.addEventListener('securitypolicyviolation', (e) =>
          window.__cspViolations.push(`${e.violatedDirective} blocked ${e.blockedURI || 'inline'}`),
        );
      });
      const bytes = {};
      const problems = [];
      page.on('console', (m) => m.type() === 'error' && problems.push(m.text()));
      page.on('pageerror', (e) => problems.push(String(e)));
      page.on('response', async (res) => {
        const type = res.request().resourceType();
        const len = Number(res.headers()['content-length'] ?? (await res.body().catch(() => Buffer.alloc(0))).length);
        bytes[type] = (bytes[type] ?? 0) + len;
      });
      await page.goto(URL_, { waitUntil: 'networkidle' });
      const csp = await page.evaluate(() => window.__cspViolations ?? []);
      for (const p of [...problems, ...csp]) {
        failures++;
        console.log(`[${vpName}/${theme}] console/CSP error: ${p}`);
      }
      const theme_ = await page.evaluate(() => document.documentElement.dataset.bsTheme);
      if (theme_ !== theme) throw new Error(`expected ${theme} theme, got ${theme_}`);

      const axe = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze();
      for (const v of axe.violations) {
        failures++;
        console.log(`[${vpName}/${theme}] ${v.id} (${v.impact}): ${v.help}`);
        for (const n of v.nodes.slice(0, 3)) console.log(`    ${n.target.join(' ')} :: ${n.failureSummary?.split('\n')[1] ?? ''}`);
      }
      const total = Object.values(bytes).reduce((a, b) => a + b, 0);
      console.log(
        `[${vpName}/${theme}] axe violations: ${axe.violations.length}; transferred ${(total / 1024).toFixed(0)} KiB`,
        Object.fromEntries(Object.entries(bytes).map(([k, v]) => [k, `${(v / 1024).toFixed(0)} KiB`])),
      );
      await page.screenshot({ path: `${OUT}/${vpName}-${theme}.png`, fullPage: true });
      await page.screenshot({ path: `${OUT}/${vpName}-${theme}-hero.png` });
      await context.close();
    }
  }
} finally {
  await browser.close();
}
if (failures) {
  console.error(`${failures} accessibility violation(s)`);
  process.exit(1);
}
console.log('audit passed');
