import type { CeloNetwork } from '@/lib/config';

/**
 * Wallet provider abstraction (§11–12).
 *
 * The rest of PrivyPay depends on this interface, never on a concrete provider, so the signer
 * (Privy at Stage 5) can be replaced without touching payment, agent or API code. The contract
 * is deliberately custody-agnostic: it exposes address, balance, prepare, sign and broadcast,
 * and nothing that would return or accept a raw private key. Keys live inside the provider's
 * secure custody (MPC / enclave) and never cross this boundary — not to the database, the
 * frontend, the AI, logs, or any of these method return values.
 *
 * These are contracts only; the concrete implementation lands in Stage 5.
 */

export interface Wallet {
  readonly walletId: string;
  readonly userId: string;
  readonly network: CeloNetwork;
  readonly address: string;
}

export interface Balance {
  readonly token: string;
  /** Smallest-unit amount as a decimal string (never a float). */
  readonly raw: string;
  readonly decimals: number;
  /** Human-readable amount as a decimal string. */
  readonly formatted: string;
}

export interface TransactionInput {
  readonly walletId: string;
  readonly to: string;
  readonly token: string;
  /** Amount in the token's smallest unit, as a decimal string. */
  readonly amount: string;
  /** Optional Celo fee-currency address to pay gas in an ERC-20 such as USDC (§14). */
  readonly feeCurrency?: string;
}

export interface PreparedTransaction {
  readonly walletId: string;
  readonly to: string;
  readonly network: CeloNetwork;
  /** Opaque, provider-specific prepared payload. Contains no secret material. */
  readonly payload: unknown;
  readonly estimatedFee?: string;
}

export interface SignedTransaction {
  readonly walletId: string;
  /** Raw signed transaction ready to broadcast. Never a private key. */
  readonly rawTransaction: string;
}

export interface WalletProvider {
  createWallet(userId: string, network: CeloNetwork): Promise<Wallet>;
  getAddress(walletId: string): Promise<string>;
  getBalance(walletId: string, token: string): Promise<Balance>;
  prepareTransaction(input: TransactionInput): Promise<PreparedTransaction>;
  signTransaction(transaction: PreparedTransaction): Promise<SignedTransaction>;
  broadcastTransaction(transaction: SignedTransaction): Promise<string>;
}
