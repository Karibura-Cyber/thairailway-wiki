// ตั้งค่า Tailwind Play CDN ที่ใช้ร่วมกันทุกหน้า
// สีหลักได้แรงบันดาลใจจากสีแดงเลือดหมูและครีมของรถโดยสารรถไฟไทย
tailwind.config = {
  darkMode: 'media',
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Noto Sans Thai"', 'system-ui', 'sans-serif'],
        display: ['Prompt', '"Noto Sans Thai"', 'sans-serif'],
      },
      colors: {
        rail: {
          50: '#fdf3f3', 100: '#fbe5e5', 200: '#f6cfd0', 300: '#eea9ab', 400: '#e2777b',
          500: '#d14c52', 600: '#b8333a', 700: '#9a262d', 800: '#80232a', 900: '#6c2228', 950: '#3b0d11',
        },
        cream: {
          50: '#fdfaf4', 100: '#f8f1e3', 200: '#f0e2c4', 300: '#e6cd9c',
        },
      },
    },
  },
  plugins: [
    function ({ addComponents }) {
      addComponents({
        '.nav-link': {
          '@apply rounded-lg px-3 py-2 text-[15px] text-stone-700 hover:bg-cream-100 hover:text-stone-900 dark:text-stone-300 dark:hover:bg-stone-800 dark:hover:text-white': {},
        },
        '.nav-link-active': {
          '@apply bg-rail-50 font-semibold text-rail-700 dark:bg-rail-950 dark:text-rail-300': {},
        },
        '.container-page': { '@apply mx-auto max-w-6xl px-4': {} },
        '.h-page': {
          '@apply font-display text-3xl font-semibold leading-tight text-stone-900 sm:text-4xl dark:text-stone-50': {},
        },
        '.h-section': {
          '@apply font-display text-2xl font-semibold text-stone-900 sm:text-[1.7rem] dark:text-stone-50': {},
        },
        '.h-item': {
          '@apply font-display text-xl font-semibold text-stone-900 dark:text-stone-50': {},
        },
        '.lead': { '@apply text-lg text-stone-600 dark:text-stone-400': {} },
        '.prose-th p': { '@apply mt-4': {} },
        '.prose-th ul': { '@apply mt-4 list-disc space-y-1.5 pl-6': {} },
        '.prose-th a': { '@apply text-rail-700 underline decoration-rail-300 underline-offset-2 hover:decoration-rail-700 dark:text-rail-300': {} },
        '.card': {
          '@apply overflow-hidden rounded-2xl border border-stone-200 bg-white transition hover:-translate-y-0.5 hover:shadow-lg dark:border-stone-800 dark:bg-stone-900': {},
        },
        '.chip': {
          '@apply inline-flex items-center rounded-full border border-stone-300 bg-white px-3 py-1 text-sm text-stone-700 hover:border-rail-400 hover:text-rail-700 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-300 dark:hover:text-rail-300': {},
        },
        '.badge': {
          '@apply inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium': {},
        },
        '.badge-run': { '@apply bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300': {} },
        '.badge-show': { '@apply bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300': {} },
        '.badge-off': { '@apply bg-stone-200 text-stone-700 dark:bg-stone-800 dark:text-stone-300': {} },
        '.badge-new': { '@apply bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300': {} },
        '.facts': {
          '@apply grid grid-cols-[auto,1fr] gap-x-4 gap-y-2 rounded-2xl border border-stone-200 bg-cream-100/60 p-4 text-sm dark:border-stone-800 dark:bg-stone-900': {},
        },
        '.facts dt': { '@apply text-stone-500 dark:text-stone-400': {} },
        '.facts dd': { '@apply font-medium text-stone-800 dark:text-stone-200': {} },
        '.detail': {
          '@apply scroll-mt-24 rounded-3xl border border-stone-200 bg-white p-5 sm:p-8 dark:border-stone-800 dark:bg-stone-900/60': {},
        },
        '.callout': {
          '@apply rounded-2xl border-l-4 border-rail-600 bg-rail-50 p-4 text-[15px] dark:bg-rail-950/50': {},
        },
        '.to-top': {
          '@apply mt-6 inline-flex items-center gap-1 text-sm text-stone-500 hover:text-rail-700 dark:text-stone-400 dark:hover:text-rail-300': {},
        },
        '.crumb': { '@apply text-sm text-stone-500 dark:text-stone-400': {} },
        // ไม่ให้ตารางกว้าง ๆ ดันคอลัมน์ของ grid จนหน้าเลื่อนแนวนอนบนมือถือ
        '.grid > *': { minWidth: '0' },
        // ตารางเดินรถ (timetable.html)
        '.tt td': { '@apply px-3 py-2.5 align-top': {} },
        '.tt td b': { '@apply font-medium': {} },
        '.tt .tt-no': { '@apply font-display text-base font-semibold tabular-nums': {} },
        '.tt .tt-t': { '@apply font-medium tabular-nums': {} },
        '.tt .tt-m': { '@apply whitespace-nowrap text-stone-600 dark:text-stone-400': {} },
        '.tt .tt-m small': { '@apply block text-xs': {} },
        '.tt .tt-c': { '@apply mt-1 text-xs text-stone-500': {} },
        '.tt-stops': { '@apply mt-1': {} },
        '.tt-stops summary': { '@apply cursor-pointer text-xs text-rail-700 dark:text-rail-300': {} },
        '.tt-stops ol': { '@apply mt-2 max-h-72 space-y-0.5 overflow-y-auto rounded-lg bg-cream-100/70 p-2 text-xs dark:bg-stone-800': {} },
        '.tt-stops li': { '@apply flex justify-between gap-3': {} },
        '.tt-stops i': { '@apply not-italic tabular-nums text-stone-500': {} },
        // ตารางที่เรียบเรียงจากวิกิพีเดียในหน้ารุ่นรถ
        '.wk th': { '@apply bg-cream-100 text-xs font-medium text-stone-600 dark:bg-stone-800 dark:text-stone-300': {} },
        '.wk tr': { '@apply border-t border-stone-200 dark:border-stone-800': {} },
        '.tab-btn': {
          '@apply whitespace-nowrap rounded-xl px-4 py-2 text-sm font-medium text-stone-600 hover:bg-cream-100 dark:text-stone-300 dark:hover:bg-stone-800': {},
        },
        '.tab-btn[aria-selected="true"]': { '@apply bg-rail-700 text-white hover:bg-rail-700 dark:bg-rail-600 dark:text-white': {} },
      });
    },
  ],
};
