import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Briefcase, Building2, Hash, FileText } from "lucide-react";
import { format } from "date-fns";

export default function AffidavitContextHeader({ job, invoices }) {
  const totalAmount = invoices.reduce((sum, inv) => sum + (inv.total_amount || 0), 0);

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      <h3 className="font-semibold text-slate-900 text-lg mb-4">Context Summary</h3>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
        <div>
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
            <Hash className="w-4 h-4" />
            <span>Job ID</span>
          </div>
          <p className="font-semibold text-slate-900">{job.job_id}</p>
        </div>

        <div>
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
            <Briefcase className="w-4 h-4" />
            <span>Job Name</span>
          </div>
          <p className="font-semibold text-slate-900">{job.job_name}</p>
        </div>

        <div>
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
            <Building2 className="w-4 h-4" />
            <span>Customer</span>
          </div>
          <p className="font-semibold text-slate-900">{job.customer_name}</p>
        </div>

        <div>
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
            <span>Job Status</span>
          </div>
          <Badge className="bg-green-100 text-green-700 border-green-200">
            Completed
          </Badge>
        </div>
      </div>

      <div className="border-t border-slate-200 pt-4">
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-3">
          <FileText className="w-4 h-4" />
          <span className="font-medium">Linked Invoices ({invoices.length})</span>
        </div>
        <div className="space-y-2">
          {invoices.map(invoice => (
            <div key={invoice.id} className="flex items-center justify-between bg-slate-50 rounded-lg p-3">
              <div>
                <p className="font-medium text-slate-900">{invoice.invoice_number}</p>
                <p className="text-xs text-slate-500">
                  Issued: {invoice.issue_date ? format(new Date(invoice.issue_date), 'MMM d, yyyy') : 'N/A'}
                </p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-slate-900">${invoice.total_amount?.toFixed(2)}</p>
                <Badge className="bg-purple-100 text-purple-700 border-purple-200 text-xs">
                  {invoice.invoice_status}
                </Badge>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-3 pt-3 border-t border-slate-200 flex justify-between items-center">
          <span className="font-medium text-slate-700">Total Invoice Amount</span>
          <span className="text-xl font-bold text-slate-900">${totalAmount.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}