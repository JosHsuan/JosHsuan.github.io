import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTypescript from 'eslint-config-next/typescript';

export default defineConfig([
  ...nextVitals,
  ...nextTypescript,
  globalIgnores(['.next/**', '.pages-workspace/**', 'pages-test-results/**', 'out/**', 'roles/**', 'next-env.d.ts', 'src/app/(entries)/**', 'playwright-report/**', 'test-results/**']),
  {
    files: ['src/**/*.{ts,tsx}'],
    ignores: ['src/motion/theatre/**', 'src/dev/**'],
    rules: {
      'no-restricted-imports': ['error', { patterns: ['@theatre/*', '@/motion/theatre/*'] }],
    },
  },
  {
    files: ['src/scenes/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': ['error', { patterns: ['next/*', '@/app/*', '@theatre/*'] }],
    },
  },
]);
