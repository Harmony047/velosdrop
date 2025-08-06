import { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import { createClient } from '@libsql/client/web';

// Initialize Stripe without API version (uses latest)
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// Verify environment variables
if (!process.env.TURSO_CONNECTION_URL || !process.env.TURSO_AUTH_TOKEN) {
  throw new Error('Missing Turso database credentials');
}

const turso = createClient({
  url: process.env.TURSO_CONNECTION_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

export const config = {
  api: {
    bodyParser: false, // Required for webhooks
  },
};

async function buffer(readable: NextApiRequest) {
  const chunks = [];
  for await (const chunk of readable) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  const buf = await buffer(req);
  const sig = req.headers['stripe-signature'] as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      buf,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return res.status(400).send(`Webhook Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
  }

  // Handle successful payment
  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    
    console.log('PaymentIntent:', paymentIntent.id);
    console.log('Metadata:', paymentIntent.metadata);
    
    const driverId = paymentIntent.metadata.driverId;
    const amount = paymentIntent.amount; // Amount in cents
    
    if (!driverId) {
      console.error('No driverId in metadata');
      return res.status(400).json({ error: 'Missing driverId' });
    }

    try {
      // 1. Update driver balance
      await turso.execute({
        sql: 'UPDATE drivers SET balance = balance + ? WHERE id = ?',
        args: [amount, driverId]
      });

      // 2. Record transaction
      await turso.execute({
        sql: `INSERT INTO driver_transactions 
              (driver_id, amount, payment_intent_id, status, created_at) 
              VALUES (?, ?, ?, ?, ?)`,
        args: [
          driverId, 
          amount, 
          paymentIntent.id, 
          'completed', 
          new Date().toISOString()
        ]
      });

      console.log(`Updated balance for driver ${driverId} by $${amount/100}`);

    } catch (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database operation failed' });
    }
  }

  res.json({ received: true });
}