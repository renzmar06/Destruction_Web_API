import React from 'react';
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare } from "lucide-react";

export default function CustomerNotesSection({ data, onChange }) {
  const handleChange = (field, value) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="bg-white rounded-2xl border-2 border-slate-200 p-8 space-y-6 shadow-lg">
      <div className="flex items-center gap-3 pb-4 border-b-2 border-slate-200">
        <div className="p-2.5 bg-purple-100 rounded-xl">
          <MessageSquare className="w-5 h-5 text-purple-700" />
        </div>
        <h3 className="text-xl font-bold text-slate-900">Customer Notes</h3>
      </div>

      <div className="space-y-2">
        <Label htmlFor="customer_notes">Notes to Customer</Label>
        <Textarea
          id="customer_notes"
          value={data.customer_notes || ''}
          onChange={(e) => handleChange('customer_notes', e.target.value)}
          placeholder="These notes will appear on the estimate PDF sent to the customer..."
          className="resize-none min-h-32"
        />
        <p className="text-xs text-slate-500">This text will be visible to the customer on the estimate document.</p>
      </div>
    </div>
  );
}