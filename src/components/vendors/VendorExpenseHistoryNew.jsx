import React, { useState, useEffect } from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from 'date-fns';
import { DollarSign, Calendar, FileText, Plus } from 'lucide-react';

export default function VendorExpenseHistory({ vendor }) {
  const [vendorExpenses, setVendorExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVendorExpenses();
  }, [vendor.vendor_name]);

  const fetchVendorExpenses = async () => {
    try {
      console.log('Fetching expenses for vendor:', vendor.vendor_name);
      // Fetch all expenses and filter by vendor name since we store vendor_name, not vendor_id
      const response = await fetch('/api/expenses');
      const result = await response.json();
      console.log('All expenses:', result.data);
      if (result.success) {
        // Filter expenses for this vendor by vendor_name
        const filtered = result.data.filter(expense => expense.vendor_name === vendor.vendor_name);
        console.log('Filtered expenses for vendor:', filtered);
        setVendorExpenses(filtered);
      }
    } catch (error) {
      console.error('Error fetching vendor expenses:', error);
      setVendorExpenses([]);
    } finally {
      setLoading(false);
    }
  };

  const statusConfig = {
    not_ready: { label: 'Not Ready', class: 'bg-slate-100 text-slate-700' },
    pending: { label: 'Pending', class: 'bg-amber-100 text-amber-700' },
    paid: { label: 'Paid', class: 'bg-green-100 text-green-700' }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-slate-200 rounded w-1/4"></div>
          <div className="space-y-2">
            <div className="h-4 bg-slate-200 rounded"></div>
            <div className="h-4 bg-slate-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-slate-200">
      <div className="p-6 border-b border-slate-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <DollarSign className="w-5 h-5 text-slate-600" />
            <h3 className="text-lg font-semibold text-slate-900">Expense History</h3>
            <Badge variant="secondary">{vendorExpenses.length} expenses</Badge>
          </div>
          <Button 
            onClick={() => window.location.href = '/expenses'}
            className="bg-blue-600 hover:bg-blue-700 gap-2"
            size="sm"
          >
            <Plus className="w-4 h-4" />
            Add Expense
          </Button>
        </div>
      </div>

      {vendorExpenses.length === 0 ? (
        <div className="p-6 text-center">
          <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 mb-4">No expenses recorded for this vendor yet.</p>
          <Button 
            onClick={() => window.location.href = '/expenses'}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Create First Expense
          </Button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expense #</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expense Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {vendorExpenses.map((expense) => (
                <tr key={expense._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{expense.expense_id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{expense.description}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${expense.amount.toFixed(2)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">{expense.expense_type}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      {format(new Date(expense.expense_date), 'MMM d, yyyy')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge className={statusConfig[expense.payment_status]?.class || 'bg-slate-100 text-slate-700'}>
                      {statusConfig[expense.payment_status]?.label || expense.payment_status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}