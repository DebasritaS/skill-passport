"use client"; 
// Must run on client because wallet adapters rely on browser APIs (window, extension)

import { useMemo } from "react";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-wallets";
import { clusterApiUrl } from "@solana/web3.js";

/**
 * WalletContextProvider
 *
 * Wraps the entire app with:
 * 1️⃣ Solana RPC connection
 * 2️⃣ Wallet adapter state management
 * 3️⃣ Wallet modal UI
 *
 * This enables wallet access anywhere in the app via useWallet().
 */
export default function WalletContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {

  // We use Devnet for development/testing
  const network = "devnet";

  // Memoize RPC endpoint so it is not recreated on every render
  const endpoint = useMemo(() => clusterApiUrl(network), []);

  // Register supported wallets (currently Phantom only)
  // useMemo prevents re-instantiation on every render
  const wallets = useMemo(
    () => [new PhantomWalletAdapter()],
    []
  );

  return (
    // Provides RPC connection to the entire React tree
    <ConnectionProvider endpoint={endpoint}>

      {/* Manages wallet connection state */}
      <WalletProvider wallets={wallets} autoConnect>

        {/* Provides wallet selection modal UI */}
        <WalletModalProvider>
          {children}
        </WalletModalProvider>

      </WalletProvider>
    </ConnectionProvider>
  );
}