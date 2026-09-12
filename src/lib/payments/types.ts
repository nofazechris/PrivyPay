import type { CeloNetwork } from '@/lib/config';
import type { PaymentStatus } from './state';

/**
 * Payment record (§18–20).
 *
 * The primary identifier is an internal PrivyPay id (`pay_…`), never the blockchain hash
 * (§19): the hash is optional and separate, present only once broadcast. Amounts are decimal
 * strings, never floats. `idempotencyKey` (§20) makes execution safe to retry — the same key
 * resolves to the same payment rather than a second transfer.
 *
 * Contract only; persistence and the engine land in Stage 8.
 */
export interface Payment {
  readonly id: string; // pay_… (internal UUID/ULID), not the tx hash
  readonly senderUserId: string;
  readonly recipientUserId?: string;
  readonly recipientAddress: string;
  readonly amount: string; // token smallest-unit decimal string
  readonly token: string;
  readonly network: CeloNetwork;
  readonly chainId: number;
  readonly status: PaymentStatus;
  readonly txHash?: string;
  readonly fee?: string;
  readonly idempotencyKey: string;
  readonly createdAt: Date;
  readonly authorizedAt?: Date;
  readonly broadcastAt?: Date;
  readonly confirmedAt?: Date;
  readonly failedAt?: Date;
}

/** A validated instruction to move funds, before it becomes a Payment (§16). */
export interface PaymentIntent {
  readonly senderUserId: string;
  readonly recipient: string; // @username or address, pre-resolution
  readonly amount: string;
  readonly token: string;
  readonly memo?: string;
}
