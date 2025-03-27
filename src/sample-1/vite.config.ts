/// <reference types="vite/client" />
/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

// https://vite.dev/config/
export default defineConfig({
  server: {
    port: 50190,
  },
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    // you might want to disable it, if you don't have tests that rely on CSS
    // since parsing CSS is slow
    css: true,
    coverage: {
      reporter: ['text', 'json-summary', 'json'],
      include: ['src'],
      exclude: ['dist', 'node_modules', 'src/main.ts', '**/*.d.ts', '**/*.stories.tsx', '**/index.ts', '**/I**.ts', '**/types/**.ts'],
      thresholds: {
        lines: 0,
        statements: 0,
        functions: 0,
        branches: 0,
      },
    },
  },
});
