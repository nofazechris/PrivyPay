/**
 * Test stub for the `server-only` package.
 *
 * `server-only` throws if imported outside a React Server Component / server build, which is
 * exactly what we want in the app but breaks unit tests that import server modules for their
 * pure logic. Vitest aliases `server-only` to this no-op so those modules can be tested; the
 * real guard still applies in `next build`.
 */
export {};
