import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package, Calendar, DollarSign, CheckCircle, Clock, XCircle } from "lucide-react";
import { format } from "date-fns";

const poStatusConfig = {
  draft: { label: 'Draft', icon: Clock, className: 'bg-slate-100 text-slate-700' },
  issued: { label: 'Issued', icon: CheckCircle, className: 'bg-blue-100 text-blue-700' },
  completed: { label: 'Completed', icon: CheckCircle, className: 'bg-green-100 text-green-700' }
};

export default function VendorPurchaseOrders({ vendor, expenses }) {
  // Group expenses by PO number
  const purchaseOrders = expenses
    .filter(e => e.po_number)
    .reduce((acc, expense) => {
      const po = expense.po_number;
      if (!acc[po]) {
        acc[po] = {
          po_number: po,
          po_status: expense.po_status || 'issued',
          expenses: [],
          total: 0
        };
      }
      acc[po].expenses.push(expense);
      acc[po].total += expense.amount || 0;
      return acc;
    }, {});

  const poList = Object.values(purchaseOrders);

  if (poList.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <Package className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500">No purchase orders for this vendor</p>
          <p className="text-sm text-slate-400 mt-2">POs will appear when expenses are created with PO numbers</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900">Purchase Orders</h3>
        <p className="text-sm text-slate-500">{poList.length} active POs</p>
      </div>

      {poList.map((po) => {
        const config = poStatusConfig[po.po_status] || poStatusConfig.issued;
        const Icon = config.icon;
        
        return (
          <Card key={po.po_number} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Package className="w-5 h-5 text-blue-700" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900">PO #{po.po_number}</h4>
                    <p className="text-sm text-slate-600">{po.expenses.length} line items</p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge className={config.className}>
                    <Icon className="w-3 h-3 mr-1" />
                    {config.label}
                  </Badge>
                  <p className="text-2xl font-bold text-slate-900 mt-2">
                    ${po.total.toFixed(2)}
                  </p>
                </div>
              </div>

              {/* PO Line Items */}
              <div className="space-y-2 border-t pt-4">
                {po.expenses.map((expense) => (
                  <div key={expense.id} className="flex items-center justify-between text-sm p-3 bg-slate-50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-slate-900">{expense.description}</p>
                      <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {format(new Date(expense.expense_date), 'MMM d, yyyy')}
                        </span>
                        <span className="capitalize">{expense.expense_type?.replace(/_/g, ' ')}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-slate-900">${expense.amount?.toFixed(2)}</p>
                      <Badge variant="outline" className="text-xs mt-1">
                        {expense.payment_status === 'paid' ? 'Paid' : 'Pending'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}