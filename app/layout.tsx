// Global wallet UI styles (required for wallet modal buttons)
import "@solana/wallet-adapter-react-ui/styles.css";

// Wrap app with wallet provider
import WalletContextProvider from "./wallet-provider";

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

// Load optimized Google fonts via Next.js font system
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Metadata for SEO / browser tab
export const metadata: Metadata = {
  title: "Skill Passport – On-Chain Proof of Skills",
  description:
    "A decentralized application that stores skill proofs and mints NFTs on Solana Devnet.",
};

/**
 * RootLayout
 *
 * This is the top-level layout in Next.js App Router.
 * It wraps the entire application.
 *
 * We inject:
 * - Global fonts
 * - Global CSS
 * - WalletContextProvider (for Solana integration)
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* All pages now have access to wallet context */}
        <WalletContextProvider>
          {children}
        </WalletContextProvider>
      </body>
    </html>
  );
}