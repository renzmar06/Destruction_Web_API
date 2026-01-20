import React, { useState } from 'react';
import { base44 } from "@/api/base44Client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CreditCard, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function StripePaymentModal({ invoice, isOpen, onClose, onSuccess }) {
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState(invoice?.balance_due || invoice?.total_amount || 0);

  const handlePayment = async (e) => {
    e.preventDefault();
    setProcessing(true);
    setError(null);

    try {
      // Check if running in iframe (preview mode)
      if (window.self !== window.top) {
        setError('Payments must be made from the published app, not from preview mode. Please open the app in a new tab.');
        setProcessing(false);
        return;
      }

      // Create Stripe checkout session
      const { data } = await base44.functions.invoke('createStripeCheckout', {
        invoiceId: invoice.id,
        amount: paymentAmount
      });

      if (data.url) {
        // Redirect to Stripe checkout
        window.location.href = data.url;
      } else {
        throw new Error('Failed to create checkout session');
      }
    } catch (err) {
      console.error('Payment error:', err);
      setError(err.message || 'Payment failed. Please try again.');
      setProcessing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Make Payment - {invoice?.invoice_number}
          </DialogTitle>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {success ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="py-8 text-center"
            >
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Payment Successful!</h3>
              <p className="text-slate-600">Your payment has been processed.</p>
            </motion.div>
          ) : (
            <motion.form
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onSubmit={handlePayment}
              className="space-y-4"
            >
              {/* Amount */}
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-slate-600">Invoice Total</span>
                  <span className="font-semibold text-slate-900">
                    ${invoice?.total_amount?.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold text-slate-900">Amount Due</span>
                  <span className="text-2xl font-bold text-green-600">
                    ${(invoice?.balance_due || invoice?.total_amount || 0).toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Payment Amount */}
              <div className="space-y-2">
                <Label htmlFor="amount">Payment Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  max={invoice?.balance_due || invoice?.total_amount}
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(parseFloat(e.target.value))}
                  required
                />
                <p className="text-xs text-slate-500">
                  You can make a partial payment if needed
                </p>
              </div>

              {/* Stripe Note */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-900 font-medium mb-2">
                  🔒 Secure Payment with Stripe
                </p>
                <p className="text-xs text-blue-800">
                  You'll be redirected to Stripe's secure checkout page. Your payment information is encrypted and never stored on our servers.
                </p>
                <p className="text-xs text-blue-700 mt-2 font-medium">
                  Test Mode: Use card 4242 4242 4242 4242
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              {/* Submit Button */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={processing}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={processing}
                  className="flex-1 bg-green-600 hover:bg-green-700 gap-2"
                >
                  {processing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      Pay ${paymentAmount.toFixed(2)}
                    </>
                  )}
                </Button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}