import React from 'react';
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FileText } from "lucide-react";

export default function NotesAttachmentsSection({ data, onChange }) {
  const handleChange = (field, value) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="bg-white rounded-2xl border-2 border-slate-200 p-8 space-y-6 shadow-lg">
      <div className="flex items-center justify-between pb-4 border-b-2 border-slate-200">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-slate-100 rounded-xl">
            <FileText className="w-5 h-5 text-slate-700" />
          </div>
          <h3 className="text-xl font-bold text-slate-900">Notes & Attachments</h3>
        </div>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="internal_notes">Internal Notes (not customer-facing)</Label>
          <Textarea
            id="internal_notes"
            value={data.internal_notes || ''}
            onChange={(e) => handleChange('internal_notes', e.target.value)}
            placeholder="Internal notes, reminders, history..."
            className="resize-none h-32"
          />
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <p className="text-sm text-blue-800">
            <strong>Coming Soon:</strong> Attach contracts, MSAs, insurance certificates, and other documents.
          </p>
        </div>
      </div>
    </div>
  );
}