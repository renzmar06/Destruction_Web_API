import React from 'react';
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FileText } from "lucide-react";

export default function InvoiceNotesSection({ data, onChange, isReadOnly }) {
  const handleChange = (value) => {
    onChange({ ...data, notes_to_customer: value });
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
      <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
        <FileText className="w-5 h-5 text-slate-700" />
        <h3 className="font-semibold text-slate-900">Invoice Notes</h3>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes_to_customer">Notes to Customer</Label>
        <Textarea
          id="notes_to_customer"
          value={data.notes_to_customer || ''}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="Add any notes that will appear on the invoice PDF (payment terms, thank you message, etc.)"
          className="resize-none min-h-32"
          rows={5}
          disabled={isReadOnly}
        />
        <p className="text-xs text-slate-500">
          These notes will be visible to the customer on the invoice document
        </p>
      </div>
    </div>
  );
}