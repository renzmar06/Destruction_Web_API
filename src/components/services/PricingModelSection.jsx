import React, { useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DollarSign } from "lucide-react";

const pricingUnitLabels = {
  per_case: 'Per Case',
  per_lb: 'Per LB',
  per_pallet: 'Per Pallet',
  per_load: 'Per Load',
  by_packaging_type: 'By Packaging Type',
  flat_fee: 'Flat Fee'
};

const packagingTypeLabels = {
  aluminum_cans: 'Aluminum Cans',
  plastic_bottles: 'Plastic Bottles',
  glass_bottles: 'Glass Bottles',
  mixed_packaging: 'Mixed Packaging',
  other: 'Other'
};

export default function PricingModelSection({ data, onChange, errors }) {
  const handleChange = (field, value) => {
    onChange({ ...data, [field]: value });
  };

  const showPackagingType = data.pricing_unit === 'by_packaging_type';

  useEffect(() => {
    if (data.default_rate && data.estimated_cost_per_unit) {
      const margin = ((data.default_rate - data.estimated_cost_per_unit) / data.default_rate) * 100;
      handleChange('expected_margin_percent', Math.round(margin * 100) / 100);
    }
  }, [data.default_rate, data.estimated_cost_per_unit]);

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
      <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
        <DollarSign className="w-5 h-5 text-slate-700" />
        <h3 className="font-semibold text-slate-900">Pricing Model</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="pricing_unit">
            Pricing Unit <span className="text-red-500">*</span>
          </Label>
          <Select
            value={data.pricing_unit || ''}
            onValueChange={(value) => handleChange('pricing_unit', value)}
          >
            <SelectTrigger className={errors.pricing_unit ? 'border-red-400' : ''}>
              <SelectValue placeholder="Select unit" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(pricingUnitLabels).map(([key, label]) => (
                <SelectItem key={key} value={key}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.pricing_unit && <p className="text-xs text-red-500">{errors.pricing_unit}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="default_rate">
            Default Unit Price <span className="text-red-500">*</span>
          </Label>
          <Input
            id="default_rate"
            type="number"
            step="0.01"
            value={data.default_rate || ''}
            onChange={(e) => handleChange('default_rate', parseFloat(e.target.value) || 0)}
            placeholder="0.00"
            className={errors.default_rate ? 'border-red-400' : ''}
          />
          {errors.default_rate && <p className="text-xs text-red-500">{errors.default_rate}</p>}
        </div>

        {showPackagingType && (
          <div className="md:col-span-2 space-y-2">
            <Label htmlFor="packaging_type">Packaging Type</Label>
            <Select
              value={data.packaging_type || ''}
              onValueChange={(value) => handleChange('packaging_type', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select packaging type" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(packagingTypeLabels).map(([key, label]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
    </div>
  );
}