# 🛂 Skill Passport – On-Chain Skill Verification (Solana)

A decentralized application that allows users to:

- ✅ Store skill proofs permanently on Solana Devnet
- 🧾 Record proof metadata using on-chain Memo transactions
- 🪙 Mint an NFT representing the verified skill
- 🔍 View and verify all submissions directly from the blockchain

Built using **Next.js App Router + Solana Web3.js + SPL Token Program**.

---

## 🚀 Live Concept

Skill Passport enables developers to create a verifiable, on-chain record of their skills.

Each submission:

1. Stores skill data on-chain using the SPL Memo Program
2. Mints a unique NFT to the user's wallet
3. Allows public verification via Solana Explorer

---

## 🧱 Tech Stack

- **Frontend**: Next.js 16 (App Router)
- **Styling**: TailwindCSS
- **Blockchain**: Solana Devnet
- **Wallet Integration**: Solana Wallet Adapter (Phantom)
- **NFT Minting**: SPL Token Program
- **RPC**: Solana Web3.js

---

## ⚙️ Architecture Overview

### 1️⃣ Wallet Integration
Global wallet context via `WalletProvider` enables Phantom connection across routes.

### 2️⃣ On-Chain Proof Storage
Skill data is written to Solana using:
- `createMemoInstruction`
- Confirmed via `connection.confirmTransaction`

### 3️⃣ NFT Minting (Manual SPL Flow)
NFT is minted manually using:

- `SystemProgram.createAccount`
- `createInitializeMintInstruction`
- `createAssociatedTokenAccountInstruction`
- `createMintToInstruction`

### 4️⃣ Profile Page Parsing
The `/profile` route:
- Fetches recent wallet transactions
- Parses Memo logs
- Displays structured skill cards
- Provides direct Solana Explorer verification links

---

## 🖥️ Running Locally

```bash
npm install
npm run dev