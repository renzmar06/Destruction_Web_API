import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin } from "lucide-react";

export default function BusinessAddressSection({ data, onChange, errors }) {
  const handleChange = (field, value) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-8 space-y-6">
      <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
        <div className="p-2.5 bg-emerald-600 rounded-xl">
          <MapPin className="w-5 h-5 text-white" />
        </div>
        <h2 className="text-lg font-semibold text-slate-900">Business Address</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2 space-y-2">
          <Label htmlFor="street_address" className="text-sm font-medium text-slate-700">
            Street Address <span className="text-red-500">*</span>
          </Label>
          <Input
            id="street_address"
            value={data.street_address || ''}
            onChange={(e) => handleChange('street_address', e.target.value)}
            placeholder="123 Business Street, Suite 100"
            className={`h-12 border-slate-200 focus:border-slate-400 focus:ring-slate-400 ${errors.street_address ? 'border-red-400' : ''}`}
          />
          {errors.street_address && <p className="text-xs text-red-500">{errors.street_address}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="city" className="text-sm font-medium text-slate-700">
            City <span className="text-red-500">*</span>
          </Label>
          <Input
            id="city"
            value={data.city || ''}
            onChange={(e) => handleChange('city', e.target.value)}
            placeholder="City"
            className={`h-12 border-slate-200 focus:border-slate-400 focus:ring-slate-400 ${errors.city ? 'border-red-400' : ''}`}
          />
          {errors.city && <p className="text-xs text-red-500">{errors.city}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="state" className="text-sm font-medium text-slate-700">
            State / Province <span className="text-red-500">*</span>
          </Label>
          <Input
            id="state"
            value={data.state || ''}
            onChange={(e) => handleChange('state', e.target.value)}
            placeholder="State"
            className={`h-12 border-slate-200 focus:border-slate-400 focus:ring-slate-400 ${errors.state ? 'border-red-400' : ''}`}
          />
          {errors.state && <p className="text-xs text-red-500">{errors.state}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="zip_code" className="text-sm font-medium text-slate-700">
            ZIP / Postal Code <span className="text-red-500">*</span>
          </Label>
          <Input
            id="zip_code"
            value={data.zip_code || ''}
            onChange={(e) => handleChange('zip_code', e.target.value)}
            placeholder="12345"
            className={`h-12 border-slate-200 focus:border-slate-400 focus:ring-slate-400 ${errors.zip_code ? 'border-red-400' : ''}`}
          />
          {errors.zip_code && <p className="text-xs text-red-500">{errors.zip_code}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="country" className="text-sm font-medium text-slate-700">
            Country <span className="text-red-500">*</span>
          </Label>
          <Input
            id="country"
            value={data.country || 'USA'}
            onChange={(e) => handleChange('country', e.target.value)}
            placeholder="USA"
            className={`h-12 border-slate-200 focus:border-slate-400 focus:ring-slate-400 ${errors.country ? 'border-red-400' : ''}`}
          />
          {errors.country && <p className="text-xs text-red-500">{errors.country}</p>}
        </div>
      </div>
    </div>
  );
}