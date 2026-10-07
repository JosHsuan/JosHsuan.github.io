import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTypescript from 'eslint-config-next/typescript';
export default defineConfig([
  ...nextVitals, ...nextTypescript,
  globalIgnores(['node_modules/**', '.runtime/**', 'dist/**', 'skills/vendor/**']),
  { rules: { '@next/next/no-html-link-for-pages': 'off' } },
  { files: ['scripts/*.cjs'], rules: { '@typescript-eslint/no-require-imports': 'off' } },
  { files: ['src/specimens/**', 'src/spatial-feedback/**', 'src/specimen.js', 'preview/**'], rules: { 'no-restricted-imports': ['error', { patterns: ['@theatre/*'] }] } },
]);
