import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

/**
 * Test foundation. Node environment — Stage 0 tests cover pure logic (config, the payment
 * state machine, intent validation), which need no DOM. A jsdom environment is added when we
 * start testing React components.
 */
export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
    globals: false,
  },
});
