import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { connectDB } from '@/lib/mongodb';
import Invoice from '@/models/Invoice';
import Payment from '@/models/Payment';
import { getUserFromRequest } from '@/lib/auth';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_dummy_key_for_build', {
  apiVersion: '2025-12-15.clover',
});

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const { userId } = getUserFromRequest(request);
    const { invoice_id } = await request.json();

    if (!userId) {
      return NextResponse.json({ 
        success: false, 
        message: 'Authentication required' 
      }, { status: 401 });
    }

    // Get invoice details
    const invoice = await Invoice.findById(invoice_id);
    if (!invoice) {
      return NextResponse.json({ 
        success: false, 
        message: 'Invoice not found' 
      }, { status: 404 });
    }

    // Check if invoice is already paid
    if (invoice.invoice_status === 'paid') {
      return NextResponse.json({ 
        success: false, 
        message: 'Invoice is already paid' 
      }, { status: 400 });
    }

    // Check if payment intent already exists for this invoice
    const existingPayment = await Payment.findOne({ 
      invoice_id: invoice_id,
      stripe_payment_intent_id: { $exists: true },
      status: { $ne: 'failed' }
    });
    
    if (existingPayment) {
      // Return existing payment intent
      try {
        const existingIntent = await stripe.paymentIntents.retrieve(existingPayment.stripe_payment_intent_id);
        return NextResponse.json({
          success: true,
          client_secret: existingIntent.client_secret,
          payment_intent_id: existingIntent.id
        });
      } catch (error) {
        // If Stripe payment intent doesn't exist, delete the record and create new one
        await Payment.findByIdAndDelete(existingPayment._id);
      }
    }

    // Create Stripe Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(invoice.total_amount * 100), // Convert to cents
      currency: 'usd',
      description: `Payment for Invoice ${invoice.invoice_number} - Test Transaction`,
      statement_descriptor: 'TEST PAYMENT',
      metadata: {
        invoice_id: invoice_id,
        user_id: userId,
        invoice_number: invoice.invoice_number,
        test_mode: 'true'
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    // Save payment record (with unique identifier to avoid duplicate key error)
    const paymentRecord = {
      user_id: userId,
      invoice_id: invoice_id,
      stripe_payment_intent_id: paymentIntent.id,
      amount: invoice.total_amount,
      customer_email: invoice.customer_email,
      customer_name: invoice.customer_name,
      status: 'pending',
      payment_method: 'stripe',
      // Use stripe payment intent ID as unique identifier instead of payment_number
      payment_number: `STRIPE-${paymentIntent.id}`
    };
    
    const payment = new Payment(paymentRecord);

    await payment.save();

    // Update invoice with payment intent ID
    await Invoice.findByIdAndUpdate(invoice_id, {
      stripe_payment_intent_id: paymentIntent.id
    });

    return NextResponse.json({
      success: true,
      client_secret: paymentIntent.client_secret,
      payment_intent_id: paymentIntent.id
    });

  } catch (error) {
    console.error('Error creating payment intent:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to create payment intent' 
    }, { status: 500 });
  }
}