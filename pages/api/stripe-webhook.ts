import { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import { createClient } from '@libsql/client/web';

// Initialize Stripe without API version
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export const config = {
  api: {
    bodyParser: false,
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
  const sig = req.headers['stripe-signature']!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      buf,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error('❌ Webhook signature verification failed:', err);
    return res.status(400).send(`Webhook Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
  }

  console.log('🔔 Webhook received:', event.type);

  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    
    console.log('💰 PaymentIntent:', paymentIntent.id);
    console.log('📝 Metadata:', paymentIntent.metadata);
    
    const driverId = paymentIntent.metadata.driverId;
    const amount = paymentIntent.amount;
    
    if (!driverId) {
      console.error('❌ No driverId in metadata');
      return res.status(400).json({ error: 'Missing driverId in metadata' });
    }

    const turso = createClient({
      url: process.env.TURSO_CONNECTION_URL!,
      authToken: process.env.TURSO_AUTH_TOKEN!,
    });

    try {
      // Test database connection
      const testResult = await turso.execute('SELECT 1 as test');
      if (testResult.rows[0].test !== 1) {
        throw new Error('Database connection test failed');
      }

      // Check driver exists
      const driverCheck = await turso.execute({
        sql: 'SELECT id FROM drivers WHERE id = ?',
        args: [driverId]
      });
      
      if (driverCheck.rows.length === 0) {
        throw new Error(`Driver with ID ${driverId} not found`);
      }

      await turso.execute('BEGIN TRANSACTION');

      // Update balance
      const updateResult = await turso.execute({
        sql: 'UPDATE drivers SET balance = balance + ? WHERE id = ?',
        args: [amount, driverId]
      });

      if (updateResult.rowsAffected !== 1) {
        throw new Error(`Failed to update balance for driver ${driverId}`);
      }

      // Record transaction
      const insertResult = await turso.execute({
        sql: `INSERT INTO driver_transactions 
              (driver_id, amount, payment_intent_id, status) 
              VALUES (?, ?, ?, ?)`,
        args: [driverId, amount, paymentIntent.id, 'completed']
      });

      if (insertResult.rowsAffected !== 1) {
        throw new Error(`Failed to insert transaction record`);
      }

      await turso.execute('COMMIT');

      console.log(`✅ Updated balance for driver ${driverId} by $${amount/100}`);
      console.log(`✅ Recorded transaction for payment ${paymentIntent.id}`);

      return res.status(200).json({ 
        received: true,
        message: `Payment processed for driver ${driverId}`
      });

    } catch (err) {
      await turso.execute('ROLLBACK');
      console.error('❌ Database transaction failed:', err);
      
      if (err instanceof Error) {
        console.error('❌ Error message:', err.message);
        console.error('❌ Stack trace:', err.stack);
      }
      
      return res.status(500).json({ 
        error: 'Database operation failed',
        details: err instanceof Error ? err.message : 'Unknown error'
      });
    }
  }

  return res.status(200).json({ received: true });
}