import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { TrendingUp } from "lucide-react";

export default function CostMarginSection({ data, onChange }) {
  const handleChange = (field, value) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
      <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
        <TrendingUp className="w-5 h-5 text-slate-700" />
        <h3 className="font-semibold text-slate-900">Internal Cost & Margin</h3>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800 mb-4">
        <strong>Note:</strong> Cost information is internal only and never customer-facing. Used for margin analytics.
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="estimated_cost_per_unit">Estimated Cost per Unit</Label>
          <Input
            id="estimated_cost_per_unit"
            type="number"
            step="0.01"
            value={data.estimated_cost_per_unit || ''}
            onChange={(e) => handleChange('estimated_cost_per_unit', parseFloat(e.target.value) || 0)}
            placeholder="0.00"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="expected_margin_percent">Expected Margin %</Label>
          <Input
            id="expected_margin_percent"
            type="number"
            step="0.01"
            value={data.expected_margin_percent || ''}
            disabled
            className="bg-slate-50"
            placeholder="Auto-calculated"
          />
        </div>

        <div className="md:col-span-2 space-y-2">
          <Label htmlFor="internal_notes">Internal Notes</Label>
          <Textarea
            id="internal_notes"
            value={data.internal_notes || ''}
            onChange={(e) => handleChange('internal_notes', e.target.value)}
            placeholder="Internal notes about costs, suppliers, etc..."
            className="resize-none"
            rows={3}
          />
        </div>
      </div>
    </div>
  );
}