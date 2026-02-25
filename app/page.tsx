"use client"; // Required because we use hooks (useState, useWallet) on client side

import { useState } from "react";
import ClientOnly from "./ClientOnly";

// Solana core utilities
import {
  Keypair,
  SystemProgram,
  PublicKey,
  Connection,
  Transaction,
  clusterApiUrl,
} from "@solana/web3.js";

// SPL Token instructions (for minting NFT manually)
import {
  createInitializeMintInstruction,
  getMinimumBalanceForRentExemptMint,
  MINT_SIZE,
  createAssociatedTokenAccountInstruction,
  createMintToInstruction,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
} from "@solana/spl-token";

// Memo program (used to store proof on-chain)
import { createMemoInstruction } from "@solana/spl-memo";

// Wallet adapter hooks + UI
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

export default function Home() {

  // Access connected wallet
  const { publicKey, sendTransaction } = useWallet();

  // UI states
  const [loading, setLoading] = useState(false);
  const [tx, setTx] = useState<string | null>(null);

  // Form states
  const [skill, setSkill] = useState("");
  const [link, setLink] = useState("");
  const [desc, setDesc] = useState("");

  // Main function triggered when user clicks "Submit Proof"
  const sendProof = async () => {

    // Prevent execution if wallet not connected
    if (!publicKey) {
      alert("Connect wallet first");
      return;
    }

    // Basic validation
    if (!skill || !link) {
      alert("Please fill skill and proof link");
      return;
    }

    try {
      setLoading(true);

      // Connect to Solana Devnet
      const connection = new Connection(clusterApiUrl("devnet"));

      // ==========================================================
      // 1️⃣ STORE SKILL PROOF ON-CHAIN USING MEMO PROGRAM
      // ==========================================================

      // Format structured text
      const memoText = `Skill: ${skill}
Proof: ${link}
Desc: ${desc}`;

      // Create transaction containing Memo instruction
      const memoTx = new Transaction().add(
        createMemoInstruction(memoText, [publicKey])
      );

      memoTx.feePayer = publicKey;

      // Fetch latest blockhash
      const latestBlockhash = await connection.getLatestBlockhash();
      memoTx.recentBlockhash = latestBlockhash.blockhash;

      // Send transaction via wallet
      const signature = await sendTransaction(memoTx, connection);

      // Confirm transaction
      await connection.confirmTransaction({
        signature,
        ...latestBlockhash,
      });

      // ==========================================================
      // 2️⃣ MANUAL NFT MINT (SPL TOKEN)
      // ==========================================================

      // Generate new mint account (NFT = unique mint)
      const mintKeypair = Keypair.generate();

      // Calculate rent required for mint account
      const lamports =
        await getMinimumBalanceForRentExemptMint(connection);

      const mintTx = new Transaction();

      // 1️⃣ Create mint account
      mintTx.add(
        SystemProgram.createAccount({
          fromPubkey: publicKey,
          newAccountPubkey: mintKeypair.publicKey,
          space: MINT_SIZE,
          lamports,
          programId: TOKEN_PROGRAM_ID,
        })
      );

      // 2️⃣ Initialize mint (decimals = 0 → NFT)
      mintTx.add(
        createInitializeMintInstruction(
          mintKeypair.publicKey,
          0, // NFT has 0 decimals
          publicKey, // mint authority
          publicKey  // freeze authority
        )
      );

      // 3️⃣ Derive Associated Token Account (ATA)
      const associatedTokenAddress =
        PublicKey.findProgramAddressSync(
          [
            publicKey.toBuffer(),
            TOKEN_PROGRAM_ID.toBuffer(),
            mintKeypair.publicKey.toBuffer(),
          ],
          ASSOCIATED_TOKEN_PROGRAM_ID
        )[0];

      // Create ATA
      mintTx.add(
        createAssociatedTokenAccountInstruction(
          publicKey,
          associatedTokenAddress,
          publicKey,
          mintKeypair.publicKey
        )
      );

      // 4️⃣ Mint exactly 1 token → makes it NFT
      mintTx.add(
        createMintToInstruction(
          mintKeypair.publicKey,
          associatedTokenAddress,
          publicKey,
          1
        )
      );

      mintTx.feePayer = publicKey;
      mintTx.recentBlockhash =
        (await connection.getLatestBlockhash()).blockhash;

      // Sign with mint keypair (since it's newly created)
      mintTx.partialSign(mintKeypair);

      const mintSignature = await sendTransaction(mintTx, connection);
      await connection.confirmTransaction(mintSignature);

      console.log("NFT Minted:", mintKeypair.publicKey.toBase58());

      setTx(signature);
      alert("Skill stored and NFT minted successfully!");

    } catch (err) {
      console.error(err);
      alert("Transaction failed — check console");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-4 max-w-md text-center">

        <h1 className="text-3xl font-bold">
          Skill Passport (Solana)
        </h1>

        {/* Input Form */}
        <div className="flex flex-col gap-3 w-full max-w-md">

          <input
            type="text"
            placeholder="Skill (e.g. React, Solidity)"
            value={skill}
            onChange={(e) => setSkill(e.target.value)}
            className="border p-2 rounded text-black"
          />

          <input
            type="text"
            placeholder="Proof link (GitHub / demo)"
            value={link}
            onChange={(e) => setLink(e.target.value)}
            className="border p-2 rounded text-black"
          />

          <textarea
            placeholder="Short description"
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            className="border p-2 rounded text-black"
          />
        </div>

        {/* Wallet Button */}
        <ClientOnly>
          <WalletMultiButton />
        </ClientOnly>

        {/* Submit Button */}
        <button
          onClick={sendProof}
          disabled={loading}
          className="px-6 py-3 bg-purple-600 text-white rounded-lg"
        >
          {loading ? "Processing Transaction..." : "Submit Proof On-Chain"}
        </button>

        {/* Navigate to profile */}
        <a
          href="/profile"
          className="text-purple-600 underline mt-4"
        >
          View My Skill Passport →
        </a>

        {/* Show explorer link */}
        {tx && (
          <a
            className="text-blue-500 underline"
            href={`https://explorer.solana.com/tx/${tx}?cluster=devnet`}
            target="_blank"
            rel="noopener noreferrer"
          >
            View Transaction
          </a>
        )}
      </div>
    </main>
  );
}


