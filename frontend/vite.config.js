import { readFileSync } from 'node:fs';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// `vite preview` sends the same Content-Security-Policy as Netlify, so the browser
// audit (scripts/audit.mjs) catches anything the policy would block in production.
const csp = /Content-Security-Policy = "([^"]+)"/.exec(readFileSync(new URL('../netlify.toml', import.meta.url), 'utf8'))[1];

export default defineConfig({
  plugins: [react()],
  // db.json lives one level up (the repo root), so the dev server may read it.
  server: { port: 5173, fs: { allow: ['..'] } },
  preview: { port: 4173, headers: { 'Content-Security-Policy': csp } },
  build: {
    target: 'es2022',
    cssCodeSplit: false,
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.js',
    css: false,
  },
});
