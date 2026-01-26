'use client';

import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface PaymentFormProps {
  invoice: any;
  onSuccess: () => void;
}

export default function StripePaymentForm({ invoice, onSuccess }: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (event: React.MouseEvent) => {
    event.preventDefault();
    console.log('*** PAYMENT BUTTON CLICKED ***');

    if (!stripe || !elements) {
      console.log('Stripe or elements not ready:', { stripe: !!stripe, elements: !!elements });
      return;
    }

    setProcessing(true);
    console.log('Starting payment process...');

    try {
      console.log('Creating payment intent for invoice:', invoice._id);
      // Create payment intent
      const response = await fetch('/api/payments/create-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoice_id: invoice._id })
      });

      const result = await response.json();
      console.log('Payment intent response:', result);
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to create payment intent');
      }

      const { client_secret } = result;
      console.log('Got client secret, confirming payment...');

      // Confirm payment
      const { error, paymentIntent } = await stripe.confirmCardPayment(client_secret, {
        payment_method: {
          card: elements.getElement(CardNumberElement)!,
          billing_details: {
            name: invoice.customer_name || 'Test Customer',
            email: invoice.customer_email || 'test@example.com',
            address: {
              line1: '123 Test Street',
              city: 'Test City',
              state: 'Test State',
              postal_code: '12345',
              country: 'US'
            }
          },
        }
      });

      console.log('Payment confirmation result:', { error, paymentIntent });

      if (error) {
        console.log('Payment error:', error);
        toast.error(error.message || 'Payment failed');
      } else if (paymentIntent.status === 'succeeded') {
        console.log('*** STRIPE PAYMENT SUCCEEDED ***');
        console.log('Payment Intent:', paymentIntent);
        
        toast.success('Payment successful!');
        
        // Immediately update invoice status
        try {
          console.log('Updating invoice status to paid...');
          const updateResponse = await fetch(`/api/invoices/${invoice._id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              invoice_status: 'paid',
              payment_date: new Date(),
              balance_due: 0
            })
          });
          const updateResult = await updateResponse.json();
          console.log('Invoice update result:', updateResult);
        } catch (error) {
          console.error('Failed to update invoice status:', error);
        }
        
        console.log('Calling onSuccess() now...');
        onSuccess();
        console.log('onSuccess() called successfully');
      }
    } catch (error) {
      console.log('Payment error caught:', error);
      toast.error('Payment failed. Please try again.');
    } finally {
      setProcessing(false);
      console.log('Payment process finished');
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Card Number
          </label>
          <div className="border border-slate-300 rounded-lg p-4 bg-white">
            <CardNumberElement
              options={{
                style: {
                  base: {
                    fontSize: '16px',
                    color: '#424770',
                    '::placeholder': { color: '#aab7c4' },
                  },
                },
              }}
            />
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Expiry Date
            </label>
            <div className="border border-slate-300 rounded-lg p-4 bg-white">
              <CardExpiryElement
                options={{
                  style: {
                    base: {
                      fontSize: '16px',
                      color: '#424770',
                      '::placeholder': { color: '#aab7c4' },
                    },
                  },
                }}
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              CVC
            </label>
            <div className="border border-slate-300 rounded-lg p-4 bg-white">
              <CardCvcElement
                options={{
                  style: {
                    base: {
                      fontSize: '16px',
                      color: '#424770',
                      '::placeholder': { color: '#aab7c4' },
                    },
                  },
                }}
              />
            </div>
          </div>
        </div>
      </div>
      
      <Button
        type="button"
        disabled={!stripe || processing}
        className="w-full bg-blue-600 hover:bg-blue-700 py-4 text-lg"
        onClick={handleSubmit}
      >
        {processing ? (
          <>
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
            Processing Payment...
          </>
        ) : (
          `Complete Payment - $${invoice.total_amount.toFixed(2)}`
        )}
      </Button>
    </div>
  );
}