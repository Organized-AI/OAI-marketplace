import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/**',
        'dist/**',
        '**/*.d.ts',
        '**/*.test.ts',
        '**/*.test.tsx',
        '**/tests/**',
      ],
    },
    include: [
      'packages/**/*.test.ts',
      'packages/**/tests/**/*.test.ts',
      '__tests__/**/*.test.ts',
      '__tests__/**/*.test.tsx',
    ],
    exclude: ['node_modules', 'dist', '.next'],
    // Use jsdom for React component tests
    environment: 'jsdom',
    setupFiles: ['__tests__/setup.ts'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname),
      '@organized-ai/credentials': path.resolve(__dirname, 'packages/credentials/src'),
      '@organized-ai/phase-0': path.resolve(__dirname, 'packages/phase-0/src'),
      '@organized-ai/stack-builder': path.resolve(__dirname, 'packages/stack-builder/src'),
      '@organized-ai/shared': path.resolve(__dirname, 'packages/shared/src'),
    },
  },
});
