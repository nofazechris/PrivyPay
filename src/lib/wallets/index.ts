export type {
  Wallet,
  Balance,
  TransactionInput,
  PreparedTransaction,
  SignedTransaction,
  WalletProvider,
} from './provider';
// Note: the server-only wallet service (getWalletByUserId, syncWallet) is imported directly
// from '@/lib/wallets/service' by server code — it is deliberately not re-exported here so this
// barrel stays safe to import for its types from anywhere.
