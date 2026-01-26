"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, CheckCircle } from "lucide-react";
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import StripePaymentForm from "@/components/payments/StripePaymentForm";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface Invoice {
  _id: string;
  invoice_number: string;
  customer_name: string;
  customer_email: string;
  issue_date: string;
  due_date: string;
  invoice_status: string;
  total_amount: number;
  notes_to_customer?: string;
}

function InvoicePaymentContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const invoiceId = searchParams.get("id");

  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentCompleted, setPaymentCompleted] = useState(false);

  useEffect(() => {
    loadInvoice();
  }, [invoiceId]);

  const loadInvoice = async () => {
    if (!invoiceId) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/invoices/${invoiceId}?payment=true`);
      const result = await response.json();
      
      if (result.success) {
        setInvoice(result.data);
      } else {
        alert("Invoice not found");
      }
    } catch (error) {
      console.error("Failed to load invoice:", error);
      alert("Failed to load invoice");
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = async () => {
    console.log('=== PAYMENT SUCCESS CALLBACK TRIGGERED ===');
    console.log('Current paymentCompleted state before:', paymentCompleted);
    console.log('Current showPaymentForm state before:', showPaymentForm);
    
    setPaymentCompleted(true);
    setShowPaymentForm(false);
    
    // Refresh invoice data to get updated status
    setTimeout(async () => {
      console.log('Refreshing invoice data...');
      await loadInvoice();
    }, 1000);
    
    console.log('Setting paymentCompleted to TRUE');
    console.log('Setting showPaymentForm to FALSE');
    console.log('=== END PAYMENT SUCCESS CALLBACK ===');
  };

  console.log('=== MAIN RENDER ===');
  console.log('Loading state:', loading);
  console.log('Invoice exists:', !!invoice);
  console.log('Payment completed:', paymentCompleted);
  console.log('Show payment form:', showPaymentForm);
  
  if (loading) {
    console.log('*** SHOWING LOADING STATE ***');
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-500">Loading invoice...</p>
        </div>
      </div>
    );
  }

  if (!invoice) {
    console.log('*** NO INVOICE FOUND ***');
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-6">
            <p className="text-slate-500">Invoice not found</p>
            <Button onClick={() => router.push("/")} className="mt-4">
              Go Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  console.log('=== RENDER DEBUG ===');
  console.log('Current paymentCompleted state:', paymentCompleted);
  console.log('Current invoice status:', invoice?.invoice_status);
  console.log('Current showPaymentForm state:', showPaymentForm);
  console.log('Should show success?', paymentCompleted || invoice?.invoice_status === 'paid');
  console.log('=== END RENDER DEBUG ===');

  if (paymentCompleted || invoice?.invoice_status === 'paid') {
    console.log('*** SHOWING SUCCESS MESSAGE ***');
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-12 max-w-md w-full text-center">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8">
            <CheckCircle className="w-16 h-16 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-green-600 mb-4">Thank You!</h1>
          <p className="text-xl text-slate-700 mb-6">Payment Completed Successfully</p>
          <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-8">
            <p className="text-sm text-green-700 mb-2">Invoice Number</p>
            <p className="text-xl font-bold text-green-800 mb-4">#{invoice.invoice_number}</p>
            <p className="text-sm text-green-700 mb-2">Amount Paid</p>
            <p className="text-3xl font-bold text-green-800">${invoice.total_amount.toFixed(2)}</p>
          </div>
          <Button 
            onClick={() => window.close()} 
            className="bg-green-600 hover:bg-green-700 text-white px-12 py-4 text-lg rounded-xl"
          >
            OK
          </Button>
        </div>
      </div>
    );
  }

  console.log('*** SHOWING MAIN PAYMENT PAGE ***');
  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Invoice Payment</CardTitle>
            <p className="text-slate-600">Invoice #{invoice.invoice_number}</p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Invoice Details */}
            <div className="bg-slate-50 rounded-lg p-4">
              <h3 className="font-semibold mb-3">Invoice Details</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-slate-600">Customer:</span>
                  <p className="font-medium">{invoice.customer_name}</p>
                </div>
                <div>
                  <span className="text-slate-600">Issue Date:</span>
                  <p className="font-medium">{new Date(invoice.issue_date).toLocaleDateString()}</p>
                </div>
                <div>
                  <span className="text-slate-600">Due Date:</span>
                  <p className="font-medium">{new Date(invoice.due_date).toLocaleDateString()}</p>
                </div>
                <div>
                  <span className="text-slate-600">Status:</span>
                  <p className="font-medium capitalize">{invoice.invoice_status}</p>
                </div>
              </div>
            </div>

            {/* Amount Due */}
            <div className="text-center py-6 bg-green-50 rounded-lg">
              <p className="text-slate-600 mb-2">Amount Due</p>
              <p className="text-4xl font-bold text-green-600">
                ${invoice.total_amount?.toFixed(2) || '0.00'}
              </p>
            </div>

            {/* Notes */}
            {invoice.notes_to_customer && (
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-semibold mb-2">Notes</h4>
                <p className="text-sm text-slate-700">{invoice.notes_to_customer}</p>
              </div>
            )}

            {/* Payment Form or Button */}
            {showPaymentForm ? (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <h3 className="text-xl font-semibold text-slate-800">Enter Payment Details</h3>
                  <p className="text-slate-600 mt-1">Secure payment processing</p>
                </div>
                
                <div className="bg-slate-50 rounded-xl p-6 space-y-4">
                  <Elements stripe={stripePromise}>
                    <StripePaymentForm 
                      invoice={invoice} 
                      onSuccess={handlePaymentSuccess}
                    />
                  </Elements>
                </div>
                
                <Button 
                  variant="outline" 
                  onClick={() => setShowPaymentForm(false)}
                  className="w-full mt-4"
                >
                  Cancel
                </Button>
              </div>
            ) : (
              <div className="text-center pt-4">
                <Button 
                  onClick={() => setShowPaymentForm(true)}
                  size="lg"
                  className="bg-green-600 hover:bg-green-700 text-white px-8 py-3"
                >
                  <CreditCard className="w-5 h-5 mr-2" />
                  Pay Now - ${invoice.total_amount?.toFixed(2) || '0.00'}
                </Button>
                <p className="text-xs text-slate-500 mt-2">
                  Secure payment processing powered by Stripe
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function InvoicePaymentPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <InvoicePaymentContent />
    </Suspense>
  );
}