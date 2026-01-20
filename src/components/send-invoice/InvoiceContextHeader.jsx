import React from 'react';
import { Badge } from "@/components/ui/badge";
import { FileText, Building2, Hash, DollarSign, Calendar } from "lucide-react";
import { format } from "date-fns";

const statusConfig = {
  draft: { label: 'Draft', className: 'bg-slate-100 text-slate-700 border-slate-200' },
  sent: { label: 'Sent', className: 'bg-blue-100 text-blue-700 border-blue-200' },
  finalized: { label: 'Finalized', className: 'bg-purple-100 text-purple-700 border-purple-200' },
  paid: { label: 'Paid', className: 'bg-green-100 text-green-700 border-green-200' }
};

export default function InvoiceContextHeader({ invoice }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-slate-900 text-lg">Invoice Context</h3>
        <Badge className={`${statusConfig[invoice.invoice_status]?.className} text-base px-4 py-1`}>
          {statusConfig[invoice.invoice_status]?.label}
        </Badge>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
        <div>
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
            <Hash className="w-4 h-4" />
            <span>Invoice Number</span>
          </div>
          <p className="font-semibold text-slate-900">{invoice.invoice_number}</p>
        </div>

        <div>
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
            <Building2 className="w-4 h-4" />
            <span>Customer</span>
          </div>
          <p className="font-semibold text-slate-900">{invoice.customer_name}</p>
        </div>

        <div>
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
            <FileText className="w-4 h-4" />
            <span>Job Reference</span>
          </div>
          <p className="font-semibold text-slate-900">{invoice.job_reference}</p>
        </div>

        <div>
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
            <DollarSign className="w-4 h-4" />
            <span>Total Amount</span>
          </div>
          <p className="font-semibold text-slate-900">${invoice.total_amount?.toFixed(2) || '0.00'}</p>
        </div>

        <div>
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
            <Calendar className="w-4 h-4" />
            <span>Due Date</span>
          </div>
          <p className="font-semibold text-slate-900">
            {invoice.due_date ? format(new Date(invoice.due_date), 'MMM d, yyyy') : 'N/A'}
          </p>
        </div>
      </div>
    </div>
  );
}