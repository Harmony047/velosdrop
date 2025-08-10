import { createClient } from '@libsql/client/web';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const turso = createClient({
    url: process.env.TURSO_CONNECTION_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN!,
  });

  try {
    // Test connection
    const test = await turso.execute("SELECT 1");
    
    // Check tables
    const tables = await turso.execute(
      "SELECT name FROM sqlite_master WHERE type='table'"
    );
    
    // Verify driver data
    const drivers = await turso.execute(
      "SELECT id, balance FROM drivers LIMIT 5"
    );

    res.status(200).json({
      connection: test.rows[0] ? "✅ Successful" : "❌ Failed",
      tables: tables.rows.map(t => t.name),
      sampleDrivers: drivers.rows
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Connection failed',
      details: error instanceof Error ? error.message : String(error)
    });
  }
}