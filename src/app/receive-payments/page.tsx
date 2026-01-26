"use client";

import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { AppDispatch, RootState } from '@/redux/store';
import { fetchCustomers } from '@/redux/slices/customersSlice';
import { fetchInvoices } from '@/redux/slices/invoicesSlice';
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DollarSign, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/components/ui/use-toast";

export default function ReceivePaymentPage() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { customers, loading: customersLoading } = useSelector((state: RootState) => state.customers);
  const { invoices, loading: invoicesLoading } = useSelector((state: RootState) => state.invoices);
  const { toast } = useToast();
  
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("credit_card");
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentDate, setPaymentDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [referenceNumber, setReferenceNumber] = useState("");
  const [notes, setNotes] = useState("");
  const [selectedInvoices, setSelectedInvoices] = useState<Record<string, string>>(
    {}
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    dispatch(fetchCustomers());
    dispatch(fetchInvoices());
  }, [dispatch]);

  const unpaidInvoices = invoices.filter(
    (i) => i.customer_id === selectedCustomerId && i.invoice_status !== 'paid' && i.balance_due > 0
  );

  const totalSelected = Object.values(selectedInvoices).reduce(
    (sum, val) => sum + (parseFloat(val) || 0),
    0
  );

  const resetForm = () => {
    setSelectedCustomerId("");
    setPaymentAmount("");
    setSelectedInvoices({});
    setReferenceNumber("");
    setNotes("");
  };

  const handleAutoAllocate = () => {
    let remaining = parseFloat(paymentAmount) || 0;
    const allocation: Record<string, string> = {};

    for (const invoice of unpaidInvoices) {
      if (remaining <= 0) break;
      const amount = Math.min(remaining, invoice.balance_due);
      allocation[invoice._id!] = amount.toFixed(2);
      remaining -= amount;
    }

    setSelectedInvoices(allocation);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (totalSelected <= 0) return;

    setIsSubmitting(true);
    try {
      const allocations = Object.entries(selectedInvoices)
        .filter(([_, amount]) => parseFloat(amount) > 0)
        .map(([invoiceId, amount]) => ({
          invoice_id: invoiceId,
          amount_applied: parseFloat(amount)
        }));

      const customer = customers.find(c => c._id === selectedCustomerId);
      
      const response = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_id: selectedCustomerId,
          customer_name: customer?.legal_company_name || customer?.display_name || '',
          user_id: (customer as any)?.user_id,
          payment_date: paymentDate,
          payment_method: paymentMethod,
          payment_amount: parseFloat(paymentAmount),
          reference_number: referenceNumber,
          notes,
          allocations
        })
      });

      const result = await response.json();
      
      if (result.success) {
        toast({
          title: "Payment Recorded",
          description: "Payment has been successfully recorded and applied to invoices.",
        });
        
        // Show success state
        setTimeout(() => {
          router.push(`/payment-success?amount=${totalSelected.toFixed(2)}&type=manual`);
        }, 1000);
        
        resetForm();
        dispatch(fetchInvoices()); // Refresh invoices
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to record payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-green-600 rounded-2xl">
            <DollarSign className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Receive Payment
            </h1>
            <p className="text-slate-500 mt-1">
              Record customer payments and apply to invoices
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Customer */}
          <div className="bg-gradient-to-br from-white to-slate-50 border border-slate-200 rounded-xl p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-800">
                Select Customer
              </h3>
            </div>
            <Select
              value={selectedCustomerId}
              onValueChange={setSelectedCustomerId}
            >
              <SelectTrigger className="h-12 px-4 border-slate-300 focus:ring-2 focus:ring-green-500 text-base">
                <SelectValue placeholder="Choose a customer to receive payment from" />
              </SelectTrigger>
              <SelectContent>
                {customers.filter(c => c.customer_status === 'active').map((c) => (
                  <SelectItem key={c._id} value={c._id || ''} className="py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      {c.legal_company_name || c.display_name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Payment Details */}
          {selectedCustomerId && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-white to-slate-50 border border-slate-200 rounded-xl p-8 shadow-sm"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <DollarSign className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-800">
                  Payment Details
                </h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700">
                    Payment Date
                  </label>
                  <input
                    type="date"
                    value={paymentDate}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPaymentDate(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700">
                    Payment Method
                  </label>
                  <Select
                    value={paymentMethod}
                    onValueChange={setPaymentMethod}
                  >
                    <SelectTrigger className="h-12 px-4 border-slate-300 focus:ring-2 focus:ring-blue-500">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="credit_card">
                        💳 Credit Card
                      </SelectItem>
                      <SelectItem value="cash">💵 Cash</SelectItem>
                      <SelectItem value="check">📝 Check</SelectItem>
                      <SelectItem value="ach">🏦 ACH Transfer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700">
                    Payment Amount
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-500 font-medium">$</span>
                    <input
                      type="number"
                      step="0.01"
                      value={paymentAmount}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPaymentAmount(e.target.value)}
                      className="w-full pl-8 pr-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white text-lg font-medium"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700">
                    Reference Number
                  </label>
                  <input
                    value={referenceNumber}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setReferenceNumber(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
                    placeholder="Optional reference number"
                  />
                </div>

                <div className="md:col-span-2 space-y-2">
                  <label className="block text-sm font-semibold text-slate-700">
                    Notes
                  </label>
                  <textarea
                    rows={3}
                    value={notes}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNotes(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white resize-none"
                    placeholder="Add any additional notes about this payment..."
                  />
                </div>
              </div>
            </motion.div>
          )}

          {/* Invoices */}
          {selectedCustomerId && unpaidInvoices.length > 0 && (
            <div className="bg-white border rounded-lg p-6">
              <div className="flex justify-between mb-4">
                <h3 className="text-sm font-semibold uppercase">
                  Apply to Invoices
                </h3>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAutoAllocate}
                  disabled={!paymentAmount}
                >
                  Auto-Allocate
                </Button>
              </div>

              {unpaidInvoices.map((inv) => (
                <div
                  key={inv._id}
                  className="flex items-center justify-between border p-3 rounded mb-2"
                >
                  <div>
                    <p className="font-medium">{inv.invoice_number}</p>
                    <p className="text-sm text-slate-500">
                      Balance Due: ${inv.balance_due.toFixed(2)}
                    </p>
                  </div>
                  <input
                    className="w-32 text-right px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    type="number"
                    step="0.01"
                    value={selectedInvoices[inv._id!] || ""}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setSelectedInvoices({
                        ...selectedInvoices,
                        [inv._id!]: e.target.value,
                      })
                    }
                  />
                </div>
              ))}

              <div className="mt-4 flex justify-between font-semibold">
                <span>Total Applied</span>
                <span className="text-green-600 text-xl">
                  ${totalSelected.toFixed(2)}
                </span>
              </div>
            </div>
          )}

          {/* Actions */}
          {selectedCustomerId && unpaidInvoices.length > 0 && (
            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={resetForm}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={totalSelected <= 0 || isSubmitting}
                className="bg-green-600 hover:bg-green-700 flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Recording...
                  </>
                ) : (
                  "Record Payment"
                )}
              </Button>
            </div>
          )}
        </form>

        {/* Loading State */}
        {(customersLoading || invoicesLoading) && (
          <div className="bg-white border rounded-lg p-6">
            <div className="flex flex-col items-center justify-center p-8">
              <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4" />
              <p className="text-slate-600 font-medium">Loading customers and invoices...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
