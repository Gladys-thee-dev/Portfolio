import purgecss from '@fullhuman/postcss-purgecss';

// Production builds drop the Bootstrap rules this site never uses. PurgeCSS keeps a
// selector only if its class names appear in the files listed under `content`. Classes
// added at runtime by code (state classes, Bootstrap's own JS-free toggles) are
// safelisted below.
const purge = purgecss({
  content: ['./index.html', './src/**/*.{js,jsx}', '../db.json'],
  defaultExtractor: (content) => content.match(/[\w-/:%.]+(?<!:)/g) || [],
  safelist: {
    standard: ['show', 'active', 'collapse', 'collapsing', 'is-visible', 'is-dimmed', 'is-active', 'is-invalid', 'is-swapping', 'visually-hidden'],
    deep: [/^alert/, /^spinner/, /^invalid-feedback/, /^form-/, /^btn/],
    greedy: [/data-bs-theme/, /^bi/],
  },
  variables: false,
  keyframes: false,
});

export default {
  plugins: [
    (await import('tailwindcss')).default,
    (await import('autoprefixer')).default,
    ...(process.env.NODE_ENV === 'production' ? [purge] : []),
  ],
};
