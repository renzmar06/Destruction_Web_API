import React from 'react';
import { Badge } from "@/components/ui/badge";
import { DollarSign, TrendingUp, Clock, CheckCircle } from "lucide-react";

export default function VendorPaymentStats({ vendorId, expenses }) {
  const vendorExpenses = expenses.filter(e => e.vendor_id === vendorId);
  
  const stats = {
    total: vendorExpenses.reduce((sum, e) => sum + (e.amount || 0), 0),
    paid: vendorExpenses
      .filter(e => e.payment_status === 'paid')
      .reduce((sum, e) => sum + (e.amount || 0), 0),
    pending: vendorExpenses
      .filter(e => e.payment_status === 'pending' || e.payment_status === 'scheduled')
      .reduce((sum, e) => sum + (e.amount || 0), 0),
    count: vendorExpenses.length
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
      <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
        <DollarSign className="w-5 h-5 text-slate-700" />
        <h3 className="font-semibold text-slate-900">Payment Statistics</h3>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-slate-50 rounded-lg">
          <div className="flex items-center gap-2 text-sm text-slate-600 mb-1">
            <TrendingUp className="w-4 h-4" />
            Total Spent
          </div>
          <p className="text-2xl font-bold text-slate-900">${stats.total.toFixed(2)}</p>
        </div>

        <div className="p-4 bg-green-50 rounded-lg">
          <div className="flex items-center gap-2 text-sm text-green-700 mb-1">
            <CheckCircle className="w-4 h-4" />
            Paid
          </div>
          <p className="text-2xl font-bold text-green-700">${stats.paid.toFixed(2)}</p>
        </div>

        <div className="p-4 bg-amber-50 rounded-lg">
          <div className="flex items-center gap-2 text-sm text-amber-700 mb-1">
            <Clock className="w-4 h-4" />
            Pending
          </div>
          <p className="text-2xl font-bold text-amber-700">${stats.pending.toFixed(2)}</p>
        </div>

        <div className="p-4 bg-blue-50 rounded-lg">
          <div className="flex items-center gap-2 text-sm text-blue-700 mb-1">
            <DollarSign className="w-4 h-4" />
            Transactions
          </div>
          <p className="text-2xl font-bold text-blue-700">{stats.count}</p>
        </div>
      </div>

      {stats.pending > 0 && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-sm text-amber-800">
            <strong>Note:</strong> ${stats.pending.toFixed(2)} in pending payments
          </p>
        </div>
      )}
    </div>
  );
}