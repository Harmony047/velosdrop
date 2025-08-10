// app/create-payment-intent/route.ts
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {}); // no explicit API version

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const amount = body?.amount;
    // In a real app, get driver ID from session/auth; for now we use body or fallback to 1
    const driverId = body?.driverId ?? 1;

    if (!amount || typeof amount !== "number" || Number.isNaN(amount) || amount <= 0) {
      return NextResponse.json({ error: "Invalid amount (must be positive number in cents)" }, { status: 400 });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: "usd",
      automatic_payment_methods: { enabled: true },
      metadata: {
        driverId: String(driverId),
      },
    });

    console.log("🔔 Created PaymentIntent:", paymentIntent.id);

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    }, { status: 200 });
  } catch (error) {
    console.error("❌ Payment Intent creation failed:", error);
    return NextResponse.json(
      { error: `Internal Server Error: ${error instanceof Error ? error.message : String(error)}` },
      { status: 500 }
    );
  }
}
