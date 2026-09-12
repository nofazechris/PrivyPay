import AppGate from "./AppGate";

// The authenticated application. Guarded client-side by AppGate; data endpoints it will call
// in later stages are guarded server-side by getSessionUser.
export const metadata = { title: "PrivyPay — App", robots: { index: false } };

export default function AppPage() {
  return <AppGate />;
}
