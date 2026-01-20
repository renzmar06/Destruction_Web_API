import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { FileText } from "lucide-react";

const statusConfig = {
  draft: { label: 'Draft', className: 'bg-slate-100 text-slate-700 border-slate-200' },
  sent: { label: 'Sent', className: 'bg-blue-100 text-blue-700 border-blue-200' },
  finalized: { label: 'Finalized', className: 'bg-purple-100 text-purple-700 border-purple-200' },
  paid: { label: 'Paid', className: 'bg-green-100 text-green-700 border-green-200' }
};

export default function InvoiceHeader({ data, onChange, errors }) {
  const handleChange = (field, value) => {
    onChange({ ...data, [field]: value });
  };

  const isReadOnly = data.invoice_status === 'finalized' || data.invoice_status === 'paid';

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
      <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
        <FileText className="w-5 h-5 text-slate-700" />
        <h3 className="font-semibold text-slate-900">Invoice Details</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="invoice_number">Invoice Number</Label>
          <Input
            id="invoice_number"
            value={data.invoice_number || 'Auto-generated'}
            disabled
            className="bg-slate-50"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="invoice_status">Invoice Status</Label>
          <Badge className={`${statusConfig[data.invoice_status]?.className} text-base px-4 py-2 w-fit`}>
            {statusConfig[data.invoice_status]?.label}
          </Badge>
        </div>

        <div className="space-y-2">
          <Label htmlFor="customer_name">Customer</Label>
          <Input
            id="customer_name"
            value={data.customer_name || ''}
            disabled
            className="bg-slate-50"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="job_reference">Job Reference</Label>
          <Input
            id="job_reference"
            value={data.job_reference || ''}
            disabled
            className="bg-slate-50"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="issue_date">Issue Date</Label>
          <Input
            id="issue_date"
            type="date"
            value={data.issue_date || ''}
            disabled
            className="bg-slate-50"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="due_date">
            Due Date <span className="text-red-500">*</span>
          </Label>
          <Input
            id="due_date"
            type="date"
            value={data.due_date || ''}
            onChange={(e) => handleChange('due_date', e.target.value)}
            disabled={isReadOnly}
            className={errors.due_date ? 'border-red-400' : ''}
          />
          {errors.due_date && <p className="text-xs text-red-500">{errors.due_date}</p>}
        </div>
      </div>

      {isReadOnly && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 text-sm text-purple-800">
          <strong>Invoice {data.invoice_status === 'paid' ? 'Paid' : 'Finalized'}:</strong> All fields are locked and cannot be edited.
        </div>
      )}
    </div>
  );
}