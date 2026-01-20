import React from 'react';
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Settings } from "lucide-react";

export default function DefaultBehaviorSection({ data, onChange }) {
  const handleChange = (field, value) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
      <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
        <Settings className="w-5 h-5 text-slate-700" />
        <h3 className="font-semibold text-slate-900">Defaults & Usage</h3>
      </div>

      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <Checkbox
            id="is_taxable"
            checked={data.is_taxable || false}
            onCheckedChange={(checked) => handleChange('is_taxable', checked)}
          />
          <Label htmlFor="is_taxable" className="cursor-pointer">
            Taxable Service
          </Label>
        </div>

        <div className="flex items-center space-x-3">
          <Checkbox
            id="include_by_default_on_estimates"
            checked={data.include_by_default_on_estimates || false}
            onCheckedChange={(checked) => handleChange('include_by_default_on_estimates', checked)}
          />
          <Label htmlFor="include_by_default_on_estimates" className="cursor-pointer">
            Include by default on Estimates
          </Label>
        </div>

        <div className="flex items-center space-x-3">
          <Checkbox
            id="allow_price_override_on_invoice"
            checked={data.allow_price_override_on_invoice || false}
            onCheckedChange={(checked) => handleChange('allow_price_override_on_invoice', checked)}
          />
          <Label htmlFor="allow_price_override_on_invoice" className="cursor-pointer">
            Allow price override on Invoice
          </Label>
        </div>
      </div>
    </div>
  );
}