import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { connectDB } from '@/lib/mongodb';
import Invoice from '@/models/Invoice';
import Payment from '@/models/Payment';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-12-15.clover',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature')!;

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    await connectDB();

    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentSuccess(paymentIntent);
        break;

      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object as Stripe.PaymentIntent;
        await handlePaymentFailure(failedPayment);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}

async function handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
  const { invoice_id } = paymentIntent.metadata;
  
  console.log('Processing payment success for invoice:', invoice_id);

  try {
    // Update payment record
    const paymentUpdate = await Payment.findOneAndUpdate(
      { stripe_payment_intent_id: paymentIntent.id },
      { 
        status: 'succeeded',
        payment_method: paymentIntent.payment_method_types[0]
      }
    );
    console.log('Payment record updated:', paymentUpdate);

    // Update invoice status
    const invoiceUpdate = await Invoice.findByIdAndUpdate(invoice_id, {
      invoice_status: 'paid',
      payment_date: new Date(),
      balance_due: 0
    }, { new: true });
    console.log('Invoice updated:', invoiceUpdate);

    console.log(`Payment succeeded for invoice ${invoice_id}`);
  } catch (error) {
    console.error('Error in handlePaymentSuccess:', error);
  }
}

async function handlePaymentFailure(paymentIntent: Stripe.PaymentIntent) {
  // Update payment record
  await Payment.findOneAndUpdate(
    { stripe_payment_intent_id: paymentIntent.id },
    { status: 'failed' }
  );

  console.log(`Payment failed for payment intent ${paymentIntent.id}`);
}