import { describe, it, expect } from 'vitest';
import { parseEnv } from './env';

describe('env parsing', () => {
  it('treats a present-but-empty value as unset, not malformed', () => {
    // This is the shape of a .env copied from .env.example with blanks left in.
    const env = parseEnv({
      DATABASE_URL: '',
      AUTH_SECRET: '',
      CELO_RPC_URL: '',
      PRIVY_APP_ID: 'app_123',
    });
    expect(env.DATABASE_URL).toBeUndefined();
    expect(env.AUTH_SECRET).toBeUndefined();
    expect(env.PRIVY_APP_ID).toBe('app_123');
  });

  it('applies defaults when keys are absent', () => {
    const env = parseEnv({});
    expect(env.APP_ENV).toBe('local');
    expect(env.CELO_NETWORK).toBe('sepolia');
    expect(env.AI_PROVIDER).toBe('openai');
  });

  it('rejects a present, non-empty, actually-invalid value', () => {
    expect(() => parseEnv({ DATABASE_URL: 'not-a-url' })).toThrow(/Invalid environment configuration/);
    expect(() => parseEnv({ CELO_NETWORK: 'bitcoin' })).toThrow();
  });

  it('accepts a valid URL', () => {
    const env = parseEnv({ DATABASE_URL: 'postgres://user:pass@host:5432/db' });
    expect(env.DATABASE_URL).toBe('postgres://user:pass@host:5432/db');
  });
});
