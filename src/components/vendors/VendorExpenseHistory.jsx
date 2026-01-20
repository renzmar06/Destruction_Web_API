import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, DollarSign, FileText, Briefcase } from "lucide-react";
import { format } from "date-fns";

const statusConfig = {
  draft: { label: 'Draft', className: 'bg-slate-100 text-slate-700' },
  submitted: { label: 'Submitted', className: 'bg-blue-100 text-blue-700' },
  approved: { label: 'Approved', className: 'bg-green-100 text-green-700' },
  archived: { label: 'Archived', className: 'bg-slate-100 text-slate-700' }
};

const paymentStatusConfig = {
  not_ready: { label: 'Not Ready', className: 'bg-slate-100 text-slate-700' },
  pending: { label: 'Pending', className: 'bg-amber-100 text-amber-700' },
  scheduled: { label: 'Scheduled', className: 'bg-blue-100 text-blue-700' },
  paid: { label: 'Paid', className: 'bg-green-100 text-green-700' }
};

export default function VendorExpenseHistory({ vendor, expenses }) {
  if (expenses.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500">No expenses recorded for this vendor</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900">Expense History</h3>
        <p className="text-sm text-slate-500">{expenses.length} total expenses</p>
      </div>

      {expenses.map((expense) => (
        <Card key={expense.id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h4 className="font-semibold text-slate-900">{expense.expense_id}</h4>
                  <Badge className={statusConfig[expense.expense_status]?.className}>
                    {statusConfig[expense.expense_status]?.label}
                  </Badge>
                  <Badge className={paymentStatusConfig[expense.payment_status]?.className}>
                    {paymentStatusConfig[expense.payment_status]?.label}
                  </Badge>
                </div>
                
                <p className="text-sm text-slate-600 mb-3">{expense.description}</p>
                
                <div className="flex items-center gap-4 text-sm text-slate-600">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>{format(new Date(expense.expense_date), 'MMM d, yyyy')}</span>
                  </div>
                  
                  {expense.expense_type && (
                    <div className="flex items-center gap-1">
                      <FileText className="w-4 h-4" />
                      <span className="capitalize">{expense.expense_type.replace(/_/g, ' ')}</span>
                    </div>
                  )}
                  
                  {expense.job_reference && (
                    <div className="flex items-center gap-1">
                      <Briefcase className="w-4 h-4" />
                      <span>{expense.job_reference}</span>
                    </div>
                  )}
                  
                  {expense.po_number && (
                    <div className="flex items-center gap-1">
                      <span className="text-xs bg-slate-100 px-2 py-1 rounded">
                        PO: {expense.po_number}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="text-right">
                <p className="text-2xl font-bold text-slate-900">
                  ${expense.amount?.toFixed(2)}
                </p>
                {expense.payment_date && (
                  <p className="text-xs text-slate-500 mt-1">
                    Paid: {format(new Date(expense.payment_date), 'MMM d, yyyy')}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}