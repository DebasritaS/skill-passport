"use client";   // Required because we use hooks


import ClientOnly from "../ClientOnly";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

import { useEffect, useState } from "react";
import { Connection, clusterApiUrl, PublicKey } from "@solana/web3.js";
import { useWallet } from "@solana/wallet-adapter-react";

export default function Profile() {
  const { publicKey } = useWallet();
  const [proofs, setProofs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch past transactions for connected wallet and parse memo logs
  useEffect(() => {
    if (!publicKey) return;

    const fetchProofs = async () => {
      setLoading(true);

      const connection = new Connection(clusterApiUrl("devnet"));

      const signatures = await connection.getSignaturesForAddress(
        new PublicKey(publicKey),
        { limit: 20 }
      );

      const txs = await Promise.all(
        signatures.map((sig) =>
          connection.getTransaction(sig.signature, {
            maxSupportedTransactionVersion: 0,
          })
        )
      );

     
      const parsed: any[] = [];

txs.forEach((tx, idx) => {
  if (!tx) return;

  const logs = tx.meta?.logMessages || [];

  logs.forEach((log) => {
    if (!log.includes("Memo (len")) return;

    // Extract text after Memo:
    const memoStart = log.indexOf('Memo (len');
    const firstQuote = log.indexOf('"', memoStart);
    const lastQuote = log.lastIndexOf('"');

    if (firstQuote === -1 || lastQuote === -1) return;

    let memo = log.slice(firstQuote + 1, lastQuote);

    // Convert escaped \n to real new lines
    memo = memo.replace(/\\n/g, "\n").trim();

    const lines = memo
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);

    const skill = lines.find((l) => l.startsWith("Skill:"))?.replace("Skill:", "").trim();
    const link = lines.find((l) => l.startsWith("Proof:"))?.replace("Proof:", "").trim();
    const desc = lines.find((l) => l.startsWith("Desc:"))?.replace("Desc:", "").trim();

   if (skill || link || desc) {
  parsed.push({
    skill,
    link,
    desc,
    signature: signatures[idx].signature,
  });
}
  });
});

setProofs(parsed);


      setLoading(false);
    };

    fetchProofs();
  }, [publicKey]);

  return (
    <main className="max-w-2xl mx-auto p-10">

      <h1 className="text-3xl font-bold mb-6">
         My On-Chain Skill Passport
      </h1>

      <div className="mb-6">
        <ClientOnly>
           <WalletMultiButton />
        </ClientOnly>
      </div>
      
      <h1 className="text-3xl font-bold mb-2"> 
             <p className="text-gray-500 mb-6">
                 Verifiable skills stored permanently on Solana
             </p>
       </h1>

      {!publicKey && <p>Connect wallet to view proofs</p>}
      {loading && <p>Loading proofs...</p>}

      {!loading && proofs.length === 0 && publicKey && (
  <div className="p-6 border rounded-lg text-center text-gray-500">
    No proofs yet. Submit your first skill on the home page 🚀
  </div>
)}

      <div className="flex flex-col gap-4">
        {proofs.map((p, i) => (
            <div key={i} className="border p-5 rounded-xl shadow-sm bg-white">

  <h2 className="text-xl font-semibold mb-1">
    {p.skill || "Untitled Skill"}
  </h2>

  {p.desc && (
    <p className="text-gray-600 mb-3">{p.desc}</p>
  )}

  {p.link && (
    <a
      className="text-blue-600 underline block mb-2"
      href={p.link}
      target="_blank"
    >
      🔗 View Proof
    </a>
  )}

  <a
    className="text-purple-600 text-sm"
    href={`https://explorer.solana.com/tx/${p.signature}?cluster=devnet`}
    target="_blank"
  >
    ✔ Verify On Chain
  </a>

</div>
))}
      </div>
    </main>
  );
}