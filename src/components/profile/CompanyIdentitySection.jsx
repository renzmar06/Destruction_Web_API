import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building2 } from "lucide-react";

export default function CompanyIdentitySection({ data, onChange, errors }) {
  const handleChange = (field, value) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-8 space-y-6">
      <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
        <div className="p-2.5 bg-slate-900 rounded-xl">
          <Building2 className="w-5 h-5 text-white" />
        </div>
        <h2 className="text-lg font-semibold text-slate-900">Company Information</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="legal_company_name" className="text-sm font-medium text-slate-700">
            Legal Company Name <span className="text-red-500">*</span>
          </Label>
          <Input
            id="legal_company_name"
            value={data.legal_company_name || ''}
            onChange={(e) => handleChange('legal_company_name', e.target.value)}
            placeholder="Enter legal company name"
            className={`h-12 border-slate-200 focus:border-slate-400 focus:ring-slate-400 ${errors.legal_company_name ? 'border-red-400' : ''}`}
          />
          {errors.legal_company_name && <p className="text-xs text-red-500">{errors.legal_company_name}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="dba_name" className="text-sm font-medium text-slate-700">
            DBA / Trade Name
          </Label>
          <Input
            id="dba_name"
            value={data.dba_name || ''}
            onChange={(e) => handleChange('dba_name', e.target.value)}
            placeholder="Enter DBA or trade name"
            className="h-12 border-slate-200 focus:border-slate-400 focus:ring-slate-400"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="ein" className="text-sm font-medium text-slate-700">
            EIN <span className="text-red-500">*</span>
          </Label>
          <Input
            id="ein"
            value={data.ein || ''}
            onChange={(e) => handleChange('ein', e.target.value)}
            placeholder="XX-XXXXXXX"
            className={`h-12 border-slate-200 focus:border-slate-400 focus:ring-slate-400 ${errors.ein ? 'border-red-400' : ''}`}
          />
          {errors.ein && <p className="text-xs text-red-500">{errors.ein}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="business_phone" className="text-sm font-medium text-slate-700">
            Business Phone <span className="text-red-500">*</span>
          </Label>
          <Input
            id="business_phone"
            value={data.business_phone || ''}
            onChange={(e) => handleChange('business_phone', e.target.value)}
            placeholder="(555) 123-4567"
            className={`h-12 border-slate-200 focus:border-slate-400 focus:ring-slate-400 ${errors.business_phone ? 'border-red-400' : ''}`}
          />
          {errors.business_phone && <p className="text-xs text-red-500">{errors.business_phone}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="business_email" className="text-sm font-medium text-slate-700">
            Business Email <span className="text-red-500">*</span>
          </Label>
          <Input
            id="business_email"
            type="email"
            value={data.business_email || ''}
            onChange={(e) => handleChange('business_email', e.target.value)}
            placeholder="contact@company.com"
            className={`h-12 border-slate-200 focus:border-slate-400 focus:ring-slate-400 ${errors.business_email ? 'border-red-400' : ''}`}
          />
          {errors.business_email && <p className="text-xs text-red-500">{errors.business_email}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="website" className="text-sm font-medium text-slate-700">
            Website
          </Label>
          <Input
            id="website"
            value={data.website || ''}
            onChange={(e) => handleChange('website', e.target.value)}
            placeholder="https://www.company.com"
            className="h-12 border-slate-200 focus:border-slate-400 focus:ring-slate-400"
          />
        </div>
      </div>
    </div>
  );
}