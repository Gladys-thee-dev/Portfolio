/** Tailwind sits alongside Bootstrap: every Tailwind class carries the `tw-` prefix and
 * Tailwind's reset (preflight) is off, so the two never fight over the same class names
 * or base styles. Bootstrap handles layout and components; Tailwind handles small
 * one-off utilities. */
export default {
  prefix: 'tw-',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: ['selector', '[data-bs-theme="dark"]'],
  corePlugins: { preflight: false },
  theme: { extend: {} },
  plugins: [],
};
