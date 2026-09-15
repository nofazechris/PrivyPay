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
      // `server-only` throws when imported outside a server build; stub it so server modules can
      // be unit-tested for their pure logic. The real guard still applies in `next build`.
      'server-only': fileURLToPath(new URL('./src/test/server-only-stub.ts', import.meta.url)),
    },
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
    globals: false,
  },
});
