import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AuthProvider } from "@/components/auth/AuthProvider";
import "./globals.css";

// The design references these families by name in its inline styles; next/font hands them
// over as CSS variables, which the generated stylesheet and screens resolve against.
const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

// Public site origin for absolute metadata URLs; localhost fallback in development.
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

const title = "PrivyPay — Your payment agent, wherever you work";
const description =
  "Send, request and manage stablecoin payments through a single intelligent payment layer connected to the tools you already use. Built on Celo.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  applicationName: "PrivyPay",
  title,
  description,
  // The marketing page is meant to be indexed; the /styleguide route opts out on its own.
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    siteName: "PrivyPay",
    title,
    description,
    url: siteUrl,
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // Matches the off-white page ground (§94) so mobile browser chrome blends in.
  themeColor: "#F6F7F9",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geist.variable} ${geistMono.variable}`}>
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
