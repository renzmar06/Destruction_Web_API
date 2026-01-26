import React, { useState, useEffect } from 'react';
import { Badge } from "@/components/ui/badge";
import { TrendingUp, DollarSign, Clock, CheckCircle } from 'lucide-react';

export default function VendorPerformanceReport({ vendor }) {
  const [performance, setPerformance] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPerformanceData();
  }, [vendor.vendor_name]);

  const fetchPerformanceData = async () => {
    try {
      const response = await fetch('/api/expenses');
      const result = await response.json();
      
      if (result.success) {
        const expenses = result.data.filter(e => e.vendor_name === vendor.vendor_name);
        const totalExpenses = expenses.length;
        const paidExpenses = expenses.filter(e => e.payment_status === 'paid').length;
        const totalAmount = expenses.reduce((sum, e) => sum + e.amount, 0);
        const avgExpense = totalAmount / totalExpenses || 0;
        
        setPerformance({
          totalTransactions: totalExpenses,
          totalSpent: totalAmount,
          averageExpense: avgExpense,
          paidRate: totalExpenses > 0 ? (paidExpenses / totalExpenses) * 100 : 0,
          reliability: paidExpenses > totalExpenses * 0.8 ? 'Excellent' : 
                      paidExpenses > totalExpenses * 0.6 ? 'Good' : 'Needs Improvement'
        });
      }
    } catch (error) {
      console.error('Error fetching performance data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-slate-200 rounded w-1/4"></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="h-20 bg-slate-200 rounded"></div>
            <div className="h-20 bg-slate-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!performance) {
    return (
      <div className="bg-white rounded-lg border border-slate-200 p-6 text-center">
        <TrendingUp className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <p className="text-slate-500">No performance data available yet.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-slate-200">
      <div className="p-6 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <TrendingUp className="w-5 h-5 text-slate-600" />
          <h3 className="text-lg font-semibold text-slate-900">Performance Report</h3>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-slate-50 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <DollarSign className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase font-medium">Total Transactions</p>
                <p className="text-2xl font-bold text-slate-900">{performance.totalTransactions}</p>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase font-medium">Total Spent</p>
                <p className="text-2xl font-bold text-slate-900">${performance.totalSpent.toFixed(2)}</p>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-purple-100 rounded-lg">
                <TrendingUp className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase font-medium">Average Expense</p>
                <p className="text-2xl font-bold text-slate-900">${performance.averageExpense.toFixed(2)}</p>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-amber-100 rounded-lg">
                <CheckCircle className="w-4 h-4 text-amber-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase font-medium">Reliability</p>
                <Badge className={performance.reliability === 'Excellent' ? 'bg-green-100 text-green-700' : 
                                 performance.reliability === 'Good' ? 'bg-blue-100 text-blue-700' : 
                                 'bg-amber-100 text-amber-700'}>
                  {performance.reliability}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-slate-200">
          <h4 className="text-sm font-semibold text-slate-900 mb-4">Payment Performance</h4>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">Payment Rate</span>
              <div className="flex items-center gap-2">
                <div className="w-32 bg-slate-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full" 
                    style={{ width: `${performance.paidRate}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium text-slate-900">
                  {performance.paidRate.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}