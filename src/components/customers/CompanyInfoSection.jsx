import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building2 } from "lucide-react";

export default function CompanyInfoSection({ data, onChange, errors }) {
  const handleChange = (field, value) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="bg-white rounded-2xl border-2 border-slate-200 p-8 space-y-6 shadow-lg">
      <div className="flex items-center justify-between pb-4 border-b-2 border-slate-200">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-100 rounded-xl">
            <Building2 className="w-5 h-5 text-blue-700" />
          </div>
          <h3 className="text-xl font-bold text-slate-900">Company Identity</h3>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="legal_company_name">
            Legal Company Name <span className="text-red-500">*</span>
          </Label>
          <Input
            id="legal_company_name"
            value={data.legal_company_name || ''}
            onChange={(e) => handleChange('legal_company_name', e.target.value)}
            placeholder="Enter company name"
            className={errors.legal_company_name ? 'border-red-400' : ''}
          />
          {errors.legal_company_name && <p className="text-xs text-red-500">{errors.legal_company_name}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="dba_name">DBA / Trade Name</Label>
          <Input
            id="dba_name"
            value={data.dba_name || ''}
            onChange={(e) => handleChange('dba_name', e.target.value)}
            placeholder="Enter DBA or trade name"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="company_type">
            Company Type <span className="text-red-500">*</span>
          </Label>
          <Select value={data.company_type || ''} onValueChange={(value) => handleChange('company_type', value)}>
            <SelectTrigger className={errors.company_type ? 'border-red-400' : ''}>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="brand">Brand</SelectItem>
              <SelectItem value="distributor">Distributor</SelectItem>
              <SelectItem value="retailer">Retailer</SelectItem>
              <SelectItem value="broker">Broker</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
          {errors.company_type && <p className="text-xs text-red-500">{errors.company_type}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="industry">Industry</Label>
          <Input
            id="industry"
            value={data.industry || ''}
            onChange={(e) => handleChange('industry', e.target.value)}
            placeholder="e.g., Food & Beverage"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="website">Website</Label>
          <Input
            id="website"
            value={data.website || ''}
            onChange={(e) => handleChange('website', e.target.value)}
            placeholder="https://www.company.com"
          />
        </div>
      </div>
    </div>
  );
}