'use client';

import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { PrivyProvider, usePrivy, useCreateWallet } from '@privy-io/react-auth';
import { celo, celoSepolia } from 'viem/chains';
import { color } from '@/lib/design/tokens';

/**
 * Authentication provider (§8).
 *
 * Wraps the app in Privy for real email + passkey sign-in. Two invariants shape this file:
 *
 * 1. **Graceful when unconfigured.** Until `NEXT_PUBLIC_PRIVY_APP_ID` is set, the app must
 *    still build and run — the marketing landing and styleguide can't depend on a secret. So
 *    when there is no app id we render children directly and expose `configured: false`;
 *    `PrivyProvider` is only mounted when an id exists.
 * 2. **`usePrivy()` only runs inside `PrivyProvider`.** Consumers read {@link useAuth}, which
 *    reads a context this file always provides, so a component never calls `usePrivy()`
 *    outside the provider (which would throw).
 *
 * Embedded-wallet creation is deliberately left off here; Stage 5 turns it on. This stage is
 * auth, session and protected routes only.
 */

const PRIVY_APP_ID = process.env.NEXT_PUBLIC_PRIVY_APP_ID ?? '';

export interface AuthUser {
  /** Privy DID, e.g. did:privy:… — the stable user id the backend keys on. */
  id: string;
  email?: string;
}

export interface AuthState {
  /** Whether Privy is configured for this deployment. */
  configured: boolean;
  /** Wait for this before trusting `authenticated` / `user`. */
  ready: boolean;
  authenticated: boolean;
  user: AuthUser | null;
  login: () => void;
  logout: () => Promise<void>;
  /** Access token for authenticating API calls (Bearer). Null when signed out. */
  getAccessToken: () => Promise<string | null>;
  /** The provisioned Celo embedded wallet address (from Privy, client-side), or null. */
  walletAddress: string | null;
  /** Ensure an embedded wallet exists, creating one if needed; returns its address. */
  ensureWallet: () => Promise<string | null>;
}

const unconfigured: AuthState = {
  configured: false,
  ready: true,
  authenticated: false,
  user: null,
  login: () => {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[auth] NEXT_PUBLIC_PRIVY_APP_ID is not set — sign-in is unavailable.');
    }
  },
  logout: async () => {},
  getAccessToken: async () => null,
  walletAddress: null,
  ensureWallet: async () => null,
};

const AuthContext = createContext<AuthState>(unconfigured);

/** Read the current auth state. Always safe — never calls `usePrivy()` directly. */
export function useAuth(): AuthState {
  return useContext(AuthContext);
}

/** Bridges Privy's hook into our stable AuthState shape. Only rendered inside PrivyProvider. */
function PrivyBridge({ children }: { children: ReactNode }) {
  const privy = usePrivy();
  const { createWallet } = useCreateWallet();
  const value = useMemo<AuthState>(() => {
    const account = privy.user?.email?.address ?? undefined;
    const walletAddress = privy.user?.wallet?.address ?? null;
    return {
      configured: true,
      ready: privy.ready,
      authenticated: privy.authenticated,
      user: privy.user ? { id: privy.user.id, email: account } : null,
      login: () => privy.login(),
      logout: () => privy.logout(),
      getAccessToken: () => privy.getAccessToken(),
      walletAddress,
      ensureWallet: async () => {
        if (walletAddress) return walletAddress;
        try {
          const w = await createWallet();
          return w?.address ?? null;
        } catch (e) {
          // Most commonly "already has a wallet" — read it back from the user object.
          console.error('[wallet] createWallet failed:', e);
          return privy.user?.wallet?.address ?? null;
        }
      },
    };
  }, [privy, createWallet]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  if (!PRIVY_APP_ID) {
    return <AuthContext.Provider value={unconfigured}>{children}</AuthContext.Provider>;
  }

  return (
    <PrivyProvider
      appId={PRIVY_APP_ID}
      config={{
        // Email + passkey only (§8) — no external wallet connection (§10).
        loginMethods: ['email', 'passkey'],
        appearance: {
          theme: 'light',
          accentColor: color.primary,
          landingHeader: 'Sign in to PrivyPay',
        },
        // Provision a Celo (EVM) embedded wallet automatically for users who don't have one,
        // with no seed phrase or connect-wallet step (§10). Keys stay in Privy's secure
        // custody and never reach us (§11).
        embeddedWallets: { ethereum: { createOnLogin: 'users-without-wallets' } },
        // Celo is the only settlement network; testnet is the default until launch.
        defaultChain: celoSepolia,
        supportedChains: [celoSepolia, celo],
      }}
    >
      <PrivyBridge>{children}</PrivyBridge>
    </PrivyProvider>
  );
}
