import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { User } from "lucide-react";

export default function ContactInfoSection({ data, onChange, errors }) {
  const handleChange = (field, value) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="bg-white rounded-2xl border-2 border-slate-200 p-8 space-y-6 shadow-lg">
      <div className="flex items-center justify-between pb-4 border-b-2 border-slate-200">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-green-100 rounded-xl">
            <User className="w-5 h-5 text-green-700" />
          </div>
          <h3 className="text-xl font-bold text-slate-900">Primary Contacts</h3>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="space-y-2">
          <Label htmlFor="primary_contact_name">
            Primary Contact Name <span className="text-red-500">*</span>
          </Label>
          <Input
            id="primary_contact_name"
            value={data.primary_contact_name || ''}
            onChange={(e) => handleChange('primary_contact_name', e.target.value)}
            placeholder="Contact name"
            className={errors.primary_contact_name ? 'border-red-400' : ''}
          />
          {errors.primary_contact_name && <p className="text-xs text-red-500">{errors.primary_contact_name}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="primary_phone">
            Phone Number <span className="text-red-500">*</span>
          </Label>
          <Input
            id="primary_phone"
            value={data.primary_phone || ''}
            onChange={(e) => handleChange('primary_phone', e.target.value)}
            placeholder="(555) 123-4567"
            className={errors.primary_phone ? 'border-red-400' : ''}
          />
          {errors.primary_phone && <p className="text-xs text-red-500">{errors.primary_phone}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="primary_email">
            Email Address <span className="text-red-500">*</span>
          </Label>
          <Input
            id="primary_email"
            type="email"
            value={data.primary_email || ''}
            onChange={(e) => handleChange('primary_email', e.target.value)}
            placeholder="contact@company.com"
            className={errors.primary_email ? 'border-red-400' : ''}
          />
          {errors.primary_email && <p className="text-xs text-red-500">{errors.primary_email}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="primary_mobile">Mobile (for SMS)</Label>
          <Input
            id="primary_mobile"
            value={data.primary_mobile || ''}
            onChange={(e) => handleChange('primary_mobile', e.target.value)}
            placeholder="(555) 123-4567"
          />
        </div>
      </div>

      <div className="pt-4 border-t border-slate-100">
        <div className="flex items-center gap-2 mb-4">
          <Checkbox
            id="billing_same"
            checked={data.billing_same_as_primary || false}
            onCheckedChange={(checked) => handleChange('billing_same_as_primary', checked)}
          />
          <Label htmlFor="billing_same" className="text-sm font-medium cursor-pointer">
            Billing contact is same as primary contact
          </Label>
        </div>

        {!data.billing_same_as_primary && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="space-y-2">
              <Label htmlFor="billing_contact_name">Billing Contact Name</Label>
              <Input
                id="billing_contact_name"
                value={data.billing_contact_name || ''}
                onChange={(e) => handleChange('billing_contact_name', e.target.value)}
                placeholder="Billing contact"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="billing_phone">Billing Phone</Label>
              <Input
                id="billing_phone"
                value={data.billing_phone || ''}
                onChange={(e) => handleChange('billing_phone', e.target.value)}
                placeholder="(555) 123-4567"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="billing_email">Billing Email</Label>
              <Input
                id="billing_email"
                type="email"
                value={data.billing_email || ''}
                onChange={(e) => handleChange('billing_email', e.target.value)}
                placeholder="billing@company.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="billing_mobile">Billing Mobile (for SMS)</Label>
              <Input
                id="billing_mobile"
                value={data.billing_mobile || ''}
                onChange={(e) => handleChange('billing_mobile', e.target.value)}
                placeholder="(555) 123-4567"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}