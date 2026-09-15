import 'server-only';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { formatUnits } from 'viem';
import { activeNetwork, env, getToken, txExplorerUrl } from '@/lib/config';
import { getProfileByUserId, resolveUsername } from '@/lib/users/service';
import { normalizeUsername } from '@/lib/users/username';
import { getWalletByUserId } from '@/lib/wallets/service';
import { getUsdcBalance } from '@/lib/celo/balance';
import { previewPayment, authorizePayment, confirmPayment, executeAuthorizedPayment, listPayments } from '@/lib/payments/engine';
import { listContacts } from '@/lib/contacts/service';
import { createRequest } from '@/lib/requests/service';

/**
 * MCP tool surface (§ integrations).
 *
 * The same PrivyPay agent, reachable from ChatGPT/Claude. Every tool runs server-side as the
 * authenticated user (resolved from the MCP token — never from tool arguments) and reuses the
 * existing services, so policy, authorization, idempotency and recipient resolution are shared
 * with the app. Money never moves in a single tool call: `create_payment_preview` drafts and
 * `confirm_payment` issues the policy-checked, single-use authorization — there is deliberately
 * no unrestricted `send_payment`. The LLM never sees a key and never signs; final settlement
 * still requires explicit human approval (§25, §31, §46).
 */

export interface ToolContext {
  /** Internal PrivyPay user id (from the verified MCP token). */
  userId: string;
}

export interface ToolDef {
  name: string;
  description: string;
  /** Whether the tool moves or commits money (surfaced to clients as a caution). */
  mutating: boolean;
  schema: z.ZodTypeAny;
  handler: (ctx: ToolContext, args: unknown) => Promise<unknown>;
}

function decimals(token = 'USDC'): number {
  return getToken(token, activeNetwork.network)?.decimals ?? 6;
}

/** Build one tool from a typed zod schema, validating args before the handler runs. */
function tool<T extends z.ZodTypeAny>(def: {
  name: string;
  description: string;
  mutating?: boolean;
  schema: T;
  handler: (ctx: ToolContext, args: z.infer<T>) => Promise<unknown>;
}): ToolDef {
  return {
    name: def.name,
    description: def.description,
    mutating: def.mutating ?? false,
    schema: def.schema,
    handler: (ctx, raw) => {
      const parsed = def.schema.safeParse(raw ?? {});
      if (!parsed.success) {
        throw new ToolError('invalid_arguments', parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; '));
      }
      return def.handler(ctx, parsed.data);
    },
  };
}

/** A tool-level error the MCP layer turns into a structured (non-crashing) tool result. */
export class ToolError extends Error {
  constructor(readonly code: string, message: string) {
    super(message);
    this.name = 'ToolError';
  }
}

export const TOOLS: ToolDef[] = [
  tool({
    name: 'get_profile',
    description: "Get the current PrivyPay user's username and display name.",
    schema: z.object({}),
    handler: async (ctx) => {
      const profile = await getProfileByUserId(ctx.userId);
      if (!profile) throw new ToolError('no_profile', 'This account has no profile yet.');
      return { username: '@' + profile.username, displayName: profile.displayName };
    },
  }),

  tool({
    name: 'get_balance',
    description: "Get the current user's USDC balance on Celo.",
    schema: z.object({}),
    handler: async (ctx) => {
      const wallet = await getWalletByUserId(ctx.userId);
      if (!wallet) throw new ToolError('no_wallet', 'No wallet is provisioned for this account yet.');
      const bal = await getUsdcBalance(wallet.address);
      return {
        balance: bal ? bal.formatted : '0',
        token: 'USDC',
        network: activeNetwork.name,
        address: wallet.address,
      };
    },
  }),

  tool({
    name: 'find_contact',
    description: 'Look up a PrivyPay user by @username. Reports whether they exist and are in your contacts.',
    schema: z.object({ username: z.string().min(1).describe('The @username to look up.') }),
    handler: async (ctx, args) => {
      const name = normalizeUsername(args.username);
      const resolved = await resolveUsername(name);
      if (!resolved) return { username: '@' + name, exists: false, inContacts: false };
      const contacts = await listContacts(ctx.userId);
      const inContacts = contacts.some((c) => c.username === resolved.profile.username);
      return { username: '@' + resolved.profile.username, displayName: resolved.profile.displayName, exists: true, inContacts };
    },
  }),

  tool({
    name: 'get_recent_transactions',
    description: "List the current user's recent payments, newest first.",
    schema: z.object({ limit: z.number().int().min(1).max(50).optional().describe('Max rows (default 10).') }),
    handler: async (ctx, args) => {
      const rows = await listPayments(ctx.userId, args.limit ?? 10);
      return { transactions: rows };
    },
  }),

  tool({
    name: 'get_payment_status',
    description: 'Get the status of a payment by id. Reflects the on-chain receipt (never claims success before confirmation).',
    schema: z.object({ paymentId: z.string().min(1) }),
    handler: async (ctx, args) => {
      const res = await confirmPayment({ paymentId: args.paymentId, userId: ctx.userId });
      if (!res.ok) throw new ToolError('not_found', res.error);
      const p = res.payment;
      return {
        paymentId: p.id,
        status: p.status,
        amount: formatUnits(BigInt(p.amount), decimals(p.token)),
        token: p.token,
        network: activeNetwork.name,
        txHash: p.txHash,
        explorerUrl: p.txHash ? txExplorerUrl(p.txHash) : null,
      };
    },
  }),

  tool({
    name: 'create_payment_preview',
    description:
      'Draft a USDC payment: validate it, resolve the recipient, and run policy — WITHOUT sending. Returns a paymentId to pass to confirm_payment. Nothing moves until the human approves.',
    mutating: true,
    schema: z.object({
      recipient: z.string().min(1).describe('A @username or 0x address.'),
      amount: z.string().min(1).describe('Decimal USDC amount, e.g. "20".'),
      memo: z.string().max(200).optional(),
      idempotencyKey: z.string().min(8).optional().describe('Supply a stable key to make retries safe.'),
    }),
    handler: async (ctx, args) => {
      const wallet = await getWalletByUserId(ctx.userId);
      if (!wallet) throw new ToolError('no_wallet', 'No wallet is provisioned for this account yet.');
      const res = await previewPayment({
        senderUserId: ctx.userId,
        senderWalletAddress: wallet.address,
        recipient: args.recipient,
        amount: args.amount,
        memo: args.memo,
        idempotencyKey: args.idempotencyKey ?? `mcp_${randomUUID()}`,
      });
      if (!res.ok) throw new ToolError('preview_failed', res.error);
      const { payment, recipientDisplay } = res.result;
      return {
        paymentId: payment.id,
        status: payment.status,
        recipient: recipientDisplay,
        amount: args.amount,
        token: payment.token,
        network: activeNetwork.name,
        next: 'Call confirm_payment with this paymentId, then the user approves in PrivyPay to sign and settle.',
      };
    },
  }),

  tool({
    name: 'confirm_payment',
    description:
      'Confirm a previewed payment: re-runs policy and issues a single-use authorization bound to this exact payment, then settles it. If the user has enabled agent payments (delegated their wallet), Privy signs and broadcasts server-side and this returns the on-chain status. Otherwise it returns awaiting_approval for the user to sign in PrivyPay. Never claims success without an on-chain receipt; never handles a key.',
    mutating: true,
    schema: z.object({ paymentId: z.string().min(1) }),
    handler: async (ctx, args) => {
      const wallet = await getWalletByUserId(ctx.userId);
      if (!wallet) throw new ToolError('no_wallet', 'No wallet is provisioned for this account yet.');
      const res = await authorizePayment({ paymentId: args.paymentId, userId: ctx.userId, senderWalletAddress: wallet.address });
      if (!res.ok) throw new ToolError('authorize_failed', res.error);

      // Settle server-side when the wallet is delegated; otherwise hand back for in-app approval.
      const exec = await executeAuthorizedPayment({ paymentId: args.paymentId, userId: ctx.userId, authorizationId: res.authorizationId });
      if (exec.ok) {
        return {
          paymentId: args.paymentId,
          status: exec.status, // PENDING until the receipt confirms — never a premature success
          txHash: exec.txHash,
          explorerUrl: txExplorerUrl(exec.txHash),
          poll: 'Use get_payment_status to confirm settlement (CONFIRMED).',
        };
      }
      return {
        paymentId: args.paymentId,
        status: 'awaiting_approval',
        reason: exec.code, // not_delegated | not_configured
        message:
          exec.code === 'not_delegated'
            ? 'Authorized by policy. Enable agent payments in PrivyPay (delegate your wallet) to let the agent settle, or approve this payment in the app to sign it.'
            : 'Authorized by policy. The user must approve this payment in PrivyPay to sign and broadcast it.',
        approveUrl: (env.NEXT_PUBLIC_SITE_URL ?? '') + '/app',
        poll: 'Use get_payment_status to watch for CONFIRMED.',
      };
    },
  }),

  tool({
    name: 'create_request',
    description: 'Create a payment request asking a @username to pay the current user. Non-custodial — no funds move.',
    mutating: true,
    schema: z.object({
      payer: z.string().min(1).describe('The @username being asked to pay.'),
      amount: z.string().min(1).describe('Decimal USDC amount.'),
      memo: z.string().max(200).optional(),
    }),
    handler: async (ctx, args) => {
      const res = await createRequest(ctx.userId, { payerUsername: args.payer, amount: args.amount, memo: args.memo });
      if (!res.ok) throw new ToolError('request_failed', res.error);
      return { request: res.request };
    },
  }),
];

export const TOOLS_BY_NAME: Map<string, ToolDef> = new Map(TOOLS.map((t) => [t.name, t]));
