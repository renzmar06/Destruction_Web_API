import React from 'react';
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Calendar, DollarSign, Receipt } from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";

const paymentMethodIcons = {
  cash: CreditCard,
  check: Receipt,
  credit_card: CreditCard,
  ach: CreditCard,
  wire_transfer: CreditCard
};

export default function PaymentHistoryView({ customerId }) {
  const { data: invoices = [], isLoading } = useQuery({
    queryKey: ['customerPaymentHistory', customerId],
    queryFn: () => base44.entities.Invoice.filter({ customer_id: customerId }, '-paid_date')
  });

  // Filter paid invoices
  const payments = invoices.filter(inv => inv.amount_paid > 0);

  if (isLoading) {
    return <div className="text-center py-12 text-slate-500">Loading payment history...</div>;
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

  // Calculate total paid
  const totalPaid = payments.reduce((sum, inv) => sum + (inv.amount_paid || 0), 0);

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
          const Icon = paymentMethodIcons[payment.payment_method] || CreditCard;
          return (
            <motion.div
              key={payment.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-green-100 rounded-lg">
                        <Icon className="w-5 h-5 text-green-700" />
                      </div>
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-semibold text-slate-900">{payment.invoice_number}</h4>
                          <Badge className="bg-green-100 text-green-700">Paid</Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-slate-600">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>
                              {payment.paid_date 
                                ? format(new Date(payment.paid_date), 'MMM d, yyyy')
                                : payment.last_payment_date
                                  ? format(new Date(payment.last_payment_date), 'MMM d, yyyy')
                                  : 'Date not recorded'}
                            </span>
                          </div>
                          {payment.payment_method && (
                            <div className="flex items-center gap-1">
                              <span className="capitalize">
                                {payment.payment_method.replace(/_/g, ' ')}
                              </span>
                            </div>
                          )}
                        </div>
                        {payment.amount_paid < payment.total_amount && (
                          <p className="text-xs text-amber-600 mt-2">
                            Partial payment: ${payment.amount_paid.toFixed(2)} of ${payment.total_amount.toFixed(2)}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-green-600">
                        ${payment.amount_paid.toFixed(2)}
                      </p>
                      {payment.balance_due > 0 && (
                        <p className="text-xs text-slate-500 mt-1">
                          Balance: ${payment.balance_due.toFixed(2)}
                        </p>
                      )}
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