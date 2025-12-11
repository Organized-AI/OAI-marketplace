import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/**',
        'dist/**',
        '**/*.d.ts',
        '**/*.test.ts',
        '**/tests/**',
      ],
    },
    include: ['packages/**/*.test.ts', 'packages/**/tests/**/*.test.ts'],
    exclude: ['node_modules', 'dist', '.next'],
  },
  resolve: {
    alias: {
      '@organized-ai/credentials': path.resolve(__dirname, 'packages/credentials/src'),
      '@organized-ai/phase-0': path.resolve(__dirname, 'packages/phase-0/src'),
      '@organized-ai/stack-builder': path.resolve(__dirname, 'packages/stack-builder/src'),
      '@organized-ai/shared': path.resolve(__dirname, 'packages/shared/src'),
    },
  },
});
