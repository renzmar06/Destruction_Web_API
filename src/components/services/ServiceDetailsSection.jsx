import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Package } from "lucide-react";

const categoryLabels = {
  recycling: 'Recycling',
  shredding: 'Shredding',
  data_destruction: 'Data Destruction',
  beverage_destruction: 'Beverage Destruction',
  liquid_processing: 'Liquid Processing',
  packaging_destruction: 'Packaging Destruction',
  transportation: 'Transportation',
  certificate_affidavit: 'Certificate / Affidavit',
  storage: 'Storage',
  other: 'Other'
};

export default function ServiceDetailsSection({ data, onChange, errors }) {
  const handleChange = (field, value) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
      <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
        <Package className="w-5 h-5 text-slate-700" />
        <h3 className="font-semibold text-slate-900">Service Details</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="service_name">
            Service Name <span className="text-red-500">*</span>
          </Label>
          <Input
            id="service_name"
            value={data.service_name || ''}
            onChange={(e) => handleChange('service_name', e.target.value)}
            placeholder="e.g., Beverage Destruction - Standard"
            className={errors.service_name ? 'border-red-400' : ''}
          />
          {errors.service_name && <p className="text-xs text-red-500">{errors.service_name}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="service_category">
            Service Category <span className="text-red-500">*</span>
          </Label>
          <Select
            value={data.service_category || ''}
            onValueChange={(value) => handleChange('service_category', value)}
          >
            <SelectTrigger className={errors.service_category ? 'border-red-400' : ''}>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(categoryLabels).map(([key, label]) => (
                <SelectItem key={key} value={key}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.service_category && <p className="text-xs text-red-500">{errors.service_category}</p>}
        </div>

        <div className="md:col-span-2 space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={data.description || ''}
            onChange={(e) => handleChange('description', e.target.value)}
            placeholder="Describe this service..."
            className="resize-none"
            rows={3}
          />
        </div>
      </div>
    </div>
  );
}