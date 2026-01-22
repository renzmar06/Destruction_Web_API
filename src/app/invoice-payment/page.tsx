"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard } from "lucide-react";

interface Invoice {
  _id: string;
  invoice_number: string;
  customer_name: string;
  issue_date: string;
  due_date: string;
  invoice_status: string;
  total_amount: number;
  notes_to_customer?: string;
}

export default function InvoicePaymentPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const invoiceId = searchParams.get("id");

  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);

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

  const handlePayNow = () => {
    alert("Payment processing will be implemented here (Stripe/PayPal integration)");
  };

  if (loading) {
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

            {/* Payment Button */}
            <div className="text-center pt-4">
              <Button 
                onClick={handlePayNow}
                size="lg"
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-3"
              >
                <CreditCard className="w-5 h-5 mr-2" />
                Pay Now - ${invoice.total_amount?.toFixed(2) || '0.00'}
              </Button>
              <p className="text-xs text-slate-500 mt-2">
                Secure payment processing
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}