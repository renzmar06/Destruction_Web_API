'use client';
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Calendar, DollarSign, Receipt, CheckCircle, Clock, XCircle } from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";

const statusConfig = {
  succeeded: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100', label: 'Completed' },
  completed: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100', label: 'Completed' },
  pending: { icon: Clock, color: 'text-amber-600', bg: 'bg-amber-100', label: 'Pending' },
  failed: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-100', label: 'Failed' },
  canceled: { icon: XCircle, color: 'text-slate-600', bg: 'bg-slate-100', label: 'Cancelled' },
  cancelled: { icon: XCircle, color: 'text-slate-600', bg: 'bg-slate-100', label: 'Cancelled' }
};

export default function PaymentHistoryView({ customerId }) {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadPayments = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch('/api/customer-payments');
        const data = await response.json();
        
        if (data.success) {
          console.log(data);
          
          setPayments(data.payments || []);
        } else {
          setError(data.message || 'Failed to load payments');
        }
      } catch (err) {
        console.error('Failed to fetch payments:', err);
        setError('Failed to load payments');
      } finally {
        setLoading(false);
      }
    };

    loadPayments();
  }, [customerId]);

  if (loading) {
    return <div className="text-center py-12 text-slate-500">Loading payment history...</div>;
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="text-center py-12">
          <XCircle className="w-16 h-16 text-red-300 mx-auto mb-4" />
          <p className="text-red-700 font-medium">Error Loading Payments</p>
          <p className="text-sm text-red-600 mt-2">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (payments.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <CreditCard className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500">No payment history</p>
          <p className="text-sm text-slate-400 mt-2">Your payments will appear here</p>
        </CardContent>
      </Card>
    );
  }

  // Calculate total paid (succeeded/completed payments only)
  const totalPaid = payments
    .filter(p => p.status === 'succeeded' || p.status === 'completed')
    .reduce((sum, p) => sum + Number(p.amount ?? p.payment_amount ?? 0), 0);

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-700 mb-1">Total Paid (All Time)</p>
              <p className="text-3xl font-bold text-green-900">${totalPaid.toFixed(2)}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-green-700">{payments.length} payments</p>
              <p className="text-xs text-green-600 mt-1">Last 12 months</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment List */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-slate-900">Payment History</h3>
        {payments.map((payment) => {
          const config = statusConfig[payment.status] || statusConfig.pending;
          const StatusIcon = config.icon;
          const amount = Number(payment.amount ?? payment.payment_amount ?? 0);
          const currency = (payment.currency || 'usd').toUpperCase();
          const createdDate = payment.createdAt ? new Date(payment.createdAt) : null;
          const displayName = payment.customer_name || payment.payment_number || 'Payment';
          
          return (
            <motion.div
              key={payment._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-lg ${config.bg}`}>
                        <StatusIcon className={`w-5 h-5 ${config.color}`} />
                      </div>
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-semibold text-slate-900">
                            {displayName}
                          </h4>
                          <Badge className={`${config.bg} ${config.color}`}>
                            {config.label}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-slate-600">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>
                              {createdDate ? format(createdDate, 'MMM d, yyyy') : 'Date not recorded'}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-slate-500">•</span>
                            <span className="capitalize">{currency}</span>
                          </div>
                        </div>
                        {payment.stripe_payment_intent_id && (
                          <p className="text-xs text-slate-500 mt-2">
                            ID: {payment.stripe_payment_intent_id.substring(0, 20)}...
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-slate-900">
                        ${amount.toFixed(2)}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        {currency}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}