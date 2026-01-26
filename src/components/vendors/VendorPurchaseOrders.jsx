import React, { useState, useEffect } from 'react';
import { Badge } from "@/components/ui/badge";
import { Package, Calendar } from 'lucide-react';
import { format } from 'date-fns';

export default function VendorPurchaseOrders({ vendor }) {
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPurchaseOrders();
  }, [vendor.vendor_name]);

  const fetchPurchaseOrders = async () => {
    try {
      const response = await fetch('/api/expenses');
      const result = await response.json();
      if (result.success) {
        const vendorExpenses = result.data.filter(e => 
          e.vendor_name === vendor.vendor_name && e.po_number
        );
        
        const grouped = vendorExpenses.reduce((acc, expense) => {
          const po = expense.po_number;
          if (!acc[po]) {
            acc[po] = {
              po_number: po,
              expenses: [],
              total: 0
            };
          }
          acc[po].expenses.push(expense);
          acc[po].total += expense.amount;
          return acc;
        }, {});
        
        setPurchaseOrders(Object.values(grouped));
      }
    } catch (error) {
      console.error('Error fetching purchase orders:', error);
      setPurchaseOrders([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-slate-200 rounded w-1/4"></div>
          <div className="h-20 bg-slate-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-slate-200">
      <div className="p-6 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <Package className="w-5 h-5 text-slate-600" />
          <h3 className="text-lg font-semibold text-slate-900">Purchase Orders</h3>
          <Badge variant="secondary">{purchaseOrders.length} POs</Badge>
        </div>
      </div>

      {purchaseOrders.length === 0 ? (
        <div className="p-6 text-center">
          <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500">No purchase orders for this vendor</p>
          <p className="text-sm text-slate-400 mt-2">POs will appear when expenses include PO numbers</p>
        </div>
      ) : (
        <div className="p-6 space-y-4">
          {purchaseOrders.map((po) => (
            <div key={po.po_number} className="border rounded-lg p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="font-semibold text-slate-900">PO #{po.po_number}</h4>
                  <p className="text-sm text-slate-600">{po.expenses.length} line items</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-slate-900">${po.total.toFixed(2)}</p>
                  <Badge className="bg-blue-100 text-blue-700">Active</Badge>
                </div>
              </div>
              
              <div className="space-y-2">
                {po.expenses.map((expense) => (
                  <div key={expense._id} className="flex justify-between items-center text-sm p-2 bg-slate-50 rounded">
                    <div>
                      <p className="font-medium">{expense.description}</p>
                      <p className="text-slate-500">{expense.expense_type} • {format(new Date(expense.expense_date), 'MMM d, yyyy')}</p>
                    </div>
                    <p className="font-semibold">${expense.amount.toFixed(2)}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}