// pages/api/driver/wallet.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@libsql/client";

if (!process.env.TURSO_CONNECTION_URL || !process.env.TURSO_AUTH_TOKEN) {
  throw new Error("Missing Turso database credentials");
}

const turso = createClient({
  url: process.env.TURSO_CONNECTION_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const driverId = Number(req.query.driverId ?? req.body?.driverId);
    if (!driverId || Number.isNaN(driverId)) {
      return res.status(400).json({ error: "driverId is required and must be a number" });
    }

    // Fetch balance and transactions in parallel
    const [balanceResult, txResult] = await Promise.all([
      turso.execute({
        sql: "SELECT balance FROM drivers WHERE id = ?",
        args: [driverId],
      }),
      turso.execute({
        sql: "SELECT * FROM driver_transactions WHERE driver_id = ? ORDER BY created_at DESC LIMIT 5",
        args: [driverId],
      }),
    ]);

    const balanceCents = (balanceResult.rows?.[0]?.balance ?? 0) as number;
    const transactions = txResult.rows ?? [];

    return res.status(200).json({
      balance: balanceCents,
      transactions,
    });
  } catch (err) {
    console.error("Wallet API error:", err);
    return res.status(500).json({ error: "Failed to fetch wallet data" });
  }
}
