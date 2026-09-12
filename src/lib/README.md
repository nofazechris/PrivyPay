# `src/lib` — module boundaries

PrivyPay is a modular single application (PRD §91: boundaries matter more than folder count).
Each concern is its own module with an explicit contract; the rest of the app depends on the
contract, never on a concrete implementation. This is what lets the wallet provider, AI
provider or RPC endpoint be swapped without touching feature code.

The core payment path is always:

> natural-language intent → **agent** → recipient resolution → payment **preview** →
> **policy** → **authorization** → **wallet** execution → **celo** settlement → receipt

## Modules present (Stage 0 — contracts + config)

| Module | Responsibility | PRD | Status |
| --- | --- | --- | --- |
| `config` | env, network registry, token registry, feature flags | §13, §15, §119, §121 | ✅ implemented |
| `wallets` | `WalletProvider` custody/signing abstraction | §11–12 | contract only |
| `payments` | payment state machine + `Payment` record | §16–20 | contract only |
| `agent` | structured intent schema + validation | §24–28 | contract only |
| `policy` | pre-execution policy engine | §30 | contract only |
| `authorization` | single-use, bound payment authorization | §31, §46 | contract only |
| `design` | design tokens (colours, radius, shadow, type) | §94–97 | ✅ implemented |

"Contract only" means types, interfaces and pure guards — no faked behavior, no blockchain, no
stubbed success. Implementations land in the stage that owns them.

## Modules reserved (folder created in its stage, not before)

| Module | Responsibility | PRD | Stage |
| --- | --- | --- | --- |
| `users` | accounts, profiles, username resolution | §9, §35 | 4 |
| `celo` | viem client, RPC failover, tx service, fee abstraction | §13–14 | 6 |
| `contacts` | username-first contacts | §73 | 11 |
| `requests` | payment requests | §38, §74 | 12 |
| `integrations` | connected-account linking (WhatsApp, etc.) | §55 | 17 |
| `mcp` | MCP tool surface (`create_payment_preview` → `confirm_payment`) | §47–51 | 14 |

They are documented here rather than created empty, to avoid scaffolding features before the
core payment loop works (PRD build rule).

## Security invariants (enforced as these modules are built)

- Private keys never cross the `wallets` boundary — not to the DB, frontend, AI, logs, or any
  return value (§11).
- The LLM never signs or holds a key; it only emits validated intents (§25).
- No payment executes without passing `policy` **and** consuming a bound `authorization` (§31).
- No payment is reported successful before on-chain confirmation (§86).
- Payment execution is idempotent (§20).
