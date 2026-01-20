import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FileCheck } from "lucide-react";

export default function AssumptionsSection({ data, onChange, isReadOnly }) {
  const handleChange = (field, value) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
      <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
        <FileCheck className="w-5 h-5 text-slate-700" />
        <h3 className="font-semibold text-slate-900">Estimate Assumptions</h3>
      </div>

      {isReadOnly && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800">
          <strong>Note:</strong> Assumptions are locked once the estimate is sent.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="estimated_volume_weight">Estimated Volume / Weight</Label>
          <Input
            id="estimated_volume_weight"
            value={data.estimated_volume_weight || ''}
            onChange={(e) => handleChange('estimated_volume_weight', e.target.value)}
            placeholder="e.g., 10,000 cases"
            disabled={isReadOnly}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="allowed_variance">Allowed Variance (%)</Label>
          <Input
            id="allowed_variance"
            type="number"
            min="0"
            max="100"
            step="0.1"
            value={data.allowed_variance || ''}
            onChange={(e) => handleChange('allowed_variance', parseFloat(e.target.value))}
            placeholder="e.g., 10"
            disabled={isReadOnly}
          />
        </div>

        <div className="md:col-span-2 space-y-2">
          <Label htmlFor="what_is_included">What Is Included</Label>
          <Textarea
            id="what_is_included"
            value={data.what_is_included || ''}
            onChange={(e) => handleChange('what_is_included', e.target.value)}
            placeholder="Services and items included in this estimate..."
            className="resize-none"
            rows={4}
            disabled={isReadOnly}
          />
        </div>

        <div className="md:col-span-2 space-y-2">
          <Label htmlFor="what_is_excluded">What Is Excluded</Label>
          <Textarea
            id="what_is_excluded"
            value={data.what_is_excluded || ''}
            onChange={(e) => handleChange('what_is_excluded', e.target.value)}
            placeholder="Services and items NOT included in this estimate..."
            className="resize-none"
            rows={4}
            disabled={isReadOnly}
          />
        </div>
      </div>
    </div>
  );
}