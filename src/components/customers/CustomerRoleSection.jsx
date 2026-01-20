import React from 'react';
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Briefcase } from "lucide-react";

export default function CustomerRoleSection({ data, onChange, errors }) {
  const handleChange = (field, value) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="bg-white rounded-2xl border-2 border-slate-200 p-8 space-y-6 shadow-lg">
      <div className="flex items-center justify-between pb-4 border-b-2 border-slate-200">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-purple-100 rounded-xl">
            <Briefcase className="w-5 h-5 text-purple-700" />
          </div>
          <h3 className="text-xl font-bold text-slate-900">Customer Role & Business Type</h3>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="customer_role">
            Customer Role <span className="text-red-500">*</span>
          </Label>
          <Select value={data.customer_role || ''} onValueChange={(value) => handleChange('customer_role', value)}>
            <SelectTrigger className={errors.customer_role ? 'border-red-400' : ''}>
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="brand_owner">Brand Owner</SelectItem>
              <SelectItem value="distributor">Distributor</SelectItem>
              <SelectItem value="co_packer">Co-Packer</SelectItem>
              <SelectItem value="retailer">Retailer</SelectItem>
              <SelectItem value="3pl_warehouse">3PL / Warehouse</SelectItem>
              <SelectItem value="broker">Broker</SelectItem>
            </SelectContent>
          </Select>
          {errors.customer_role && <p className="text-xs text-red-500">{errors.customer_role}</p>}
          <p className="text-xs text-slate-500">Drives estimate and job defaults</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="primary_product_type">Primary Product Type</Label>
          <Select value={data.primary_product_type || ''} onValueChange={(value) => handleChange('primary_product_type', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select product type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="alcoholic_beverages">Alcoholic Beverages</SelectItem>
              <SelectItem value="non_alcoholic_beverages">Non-Alcoholic Beverages</SelectItem>
              <SelectItem value="mixed">Mixed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}