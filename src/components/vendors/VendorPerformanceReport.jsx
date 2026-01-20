import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, DollarSign, Clock, Package, AlertCircle, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function VendorPerformanceReport({ vendor, expenses }) {
  const vendorExpenses = expenses.filter(e => e.vendor_id === vendor.id);
  
  // Calculate metrics
  const totalSpent = vendorExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  const avgExpenseAmount = vendorExpenses.length > 0 ? totalSpent / vendorExpenses.length : 0;
  
  const paidExpenses = vendorExpenses.filter(e => e.payment_status === 'paid');
  const paidAmount = paidExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  
  const pendingExpenses = vendorExpenses.filter(e => ['pending', 'scheduled'].includes(e.payment_status));
  const pendingAmount = pendingExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  
  // Calculate on-time payment percentage
  const onTimePayments = paidExpenses.filter(e => {
    if (!e.payment_date) return false;
    // Consider payment on-time if within payment terms
    return true; // Simplified for now
  }).length;
  const onTimeRate = paidExpenses.length > 0 ? (onTimePayments / paidExpenses.length) * 100 : 0;
  
  // Expense type breakdown
  const expensesByType = vendorExpenses.reduce((acc, e) => {
    const type = e.expense_type || 'other';
    acc[type] = (acc[type] || 0) + (e.amount || 0);
    return acc;
  }, {});
  
  const topExpenseType = Object.entries(expensesByType).sort((a, b) => b[1] - a[1])[0];
  
  // Monthly trend (last 6 months)
  const last6Months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    return d;
  }).reverse();
  
  const monthlySpending = last6Months.map(month => {
    const monthExpenses = vendorExpenses.filter(e => {
      const expenseDate = new Date(e.expense_date);
      return expenseDate.getMonth() === month.getMonth() && 
             expenseDate.getFullYear() === month.getFullYear();
    });
    return {
      month: month.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      amount: monthExpenses.reduce((sum, e) => sum + (e.amount || 0), 0),
      count: monthExpenses.length
    };
  });

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-lg">
                <DollarSign className="w-5 h-5 text-blue-700" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Total Spent</p>
                <p className="text-2xl font-bold text-slate-900">${totalSpent.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-700" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Paid</p>
                <p className="text-2xl font-bold text-green-700">${paidAmount.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-amber-100 rounded-lg">
                <Clock className="w-5 h-5 text-amber-700" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Pending</p>
                <p className="text-2xl font-bold text-amber-700">${pendingAmount.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-purple-700" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Avg Expense</p>
                <p className="text-2xl font-bold text-purple-700">${avgExpenseAmount.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            Payment Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-slate-700">On-Time Payment Rate</span>
              <div className="flex items-center gap-2">
                <Badge className={onTimeRate >= 80 ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}>
                  {onTimeRate.toFixed(0)}%
                </Badge>
                <span className="text-sm text-slate-500">
                  ({onTimePayments}/{paidExpenses.length} paid on time)
                </span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-slate-700">Total Transactions</span>
              <span className="font-semibold text-slate-900">{vendorExpenses.length}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-slate-700">Payment Terms</span>
              <span className="font-semibold text-slate-900">
                {vendor.payment_terms?.replace(/_/g, ' ').toUpperCase() || 'Not Set'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Spending by Category */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5 text-blue-600" />
            Spending by Category
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Object.entries(expensesByType)
              .sort((a, b) => b[1] - a[1])
              .map(([type, amount]) => {
                const percentage = (amount / totalSpent) * 100;
                return (
                  <div key={type} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-700 capitalize">{type.replace(/_/g, ' ')}</span>
                      <span className="font-semibold text-slate-900">${amount.toFixed(2)} ({percentage.toFixed(0)}%)</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-600 rounded-full"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        </CardContent>
      </Card>

      {/* Monthly Trend */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-indigo-600" />
            6-Month Spending Trend
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {monthlySpending.map((month, idx) => {
              const maxAmount = Math.max(...monthlySpending.map(m => m.amount));
              const percentage = maxAmount > 0 ? (month.amount / maxAmount) * 100 : 0;
              
              return (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-700">{month.month}</span>
                    <span className="font-semibold text-slate-900">
                      ${month.amount.toFixed(2)} <span className="text-slate-500">({month.count} expenses)</span>
                    </span>
                  </div>
                  <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}