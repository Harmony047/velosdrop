// pages/api/stripe-webhook.ts
import { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import { createClient } from '@libsql/client';

// initialize stripe WITHOUT specifying an API version
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// validate envs early
if (!process.env.TURSO_CONNECTION_URL || !process.env.TURSO_AUTH_TOKEN) {
  throw new Error('Missing Turso database credentials');
}
if (!process.env.STRIPE_WEBHOOK_SECRET) {
  throw new Error('Missing STRIPE_WEBHOOK_SECRET');
}

const turso = createClient({
  url: process.env.TURSO_CONNECTION_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

// Keep Next.js from parsing body (we need raw body for signature)
export const config = {
  api: {
    bodyParser: false,
  },
};

// helper to read raw buffer from Next.js request
async function buffer(readable: NextApiRequest) {
  const chunks: Buffer[] = [];
  for await (const chunk of readable as any) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  let event: Stripe.Event;

  try {
    const buf = await buffer(req);
    const sig = req.headers['stripe-signature'] as string | undefined;
    if (!sig) {
      console.error('Missing stripe-signature header');
      return res.status(400).send('Missing stripe-signature header');
    }

    event = stripe.webhooks.constructEvent(buf, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return res
      .status(400)
      .send(`Webhook Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
  }

  try {
    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      const metadata = paymentIntent.metadata ?? {};
      const rawDriverId = metadata.driverId ?? metadata.driver_id; // support driverId or driver_id
      const driverId = rawDriverId ? Number(rawDriverId) : null;
      const amount = paymentIntent.amount ?? 0;

      console.log('PaymentIntent:', paymentIntent.id);
      console.log('Metadata:', metadata);

      if (!driverId || Number.isNaN(driverId)) {
        // Log and acknowledge the webhook to avoid retries.
        console.error('No valid driverId in metadata for PaymentIntent:', paymentIntent.id, metadata);
        return res.status(200).json({ received: true, warning: 'Missing or invalid driverId in metadata' });
      }

      // Update DB inside a transaction/batch
      try {
        await turso.batch([
          {
            sql: 'UPDATE drivers SET balance = balance + ? WHERE id = ?',
            args: [amount, driverId],
          },
          {
            sql: `INSERT INTO driver_transactions 
                    (driver_id, amount, payment_intent_id, status, created_at) 
                    VALUES (?, ?, ?, ?, ?)`,
            args: [
              driverId,
              amount,
              paymentIntent.id,
              'completed',
              new Date().toISOString(),
            ],
          },
        ]);

        console.log(`Updated balance for driver ${driverId} by ${amount} cents (PaymentIntent ${paymentIntent.id})`);
      } catch (dbErr) {
        console.error('Database operation failed:', dbErr);
        // respond 500 so Stripe retries (optional). If you prefer to ack anyway, return 200 instead.
        return res.status(500).json({ error: 'Database operation failed' });
      }
    }

    // Acknowledge receipt
    return res.status(200).json({ received: true });
  } catch (err) {
    console.error('Unhandled error processing webhook:', err);
    return res.status(500).json({ error: 'Webhook handling failed' });
  }
}
