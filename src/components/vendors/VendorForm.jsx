import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building2, User, Mail, Phone, MapPin, CreditCard, Tag } from "lucide-react";

const categoryLabels = {
  transportation: 'Transportation',
  disposal_processing: 'Disposal/Processing',
  equipment_rental: 'Equipment Rental',
  utilities: 'Utilities',
  fuel: 'Fuel',
  storage: 'Storage',
  other: 'Other'
};

export default function VendorForm({ data, onChange, errors }) {
  const handleChange = (field, value) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="space-y-6">
      {/* Basic Information */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <Building2 className="w-5 h-5 text-slate-700" />
          <h3 className="font-semibold text-slate-900">Basic Information</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="vendor_name">
              Vendor Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="vendor_name"
              value={data.vendor_name || ''}
              onChange={(e) => handleChange('vendor_name', e.target.value)}
              placeholder="Enter vendor legal name"
              className={errors.vendor_name ? 'border-red-500' : ''}
            />
            {errors.vendor_name && (
              <p className="text-sm text-red-600">{errors.vendor_name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact_person">Contact Person</Label>
            <Input
              id="contact_person"
              value={data.contact_person || ''}
              onChange={(e) => handleChange('contact_person', e.target.value)}
              placeholder="Primary contact name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">
              Email <span className="text-red-500">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              value={data.email || ''}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="vendor@example.com"
              className={errors.email ? 'border-red-500' : ''}
            />
            {errors.email && (
              <p className="text-sm text-red-600">{errors.email}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">
              Phone <span className="text-red-500">*</span>
            </Label>
            <Input
              id="phone"
              value={data.phone || ''}
              onChange={(e) => handleChange('phone', e.target.value)}
              placeholder="(555) 123-4567"
              className={errors.phone ? 'border-red-500' : ''}
            />
            {errors.phone && (
              <p className="text-sm text-red-600">{errors.phone}</p>
            )}
          </div>

          <div className="md:col-span-2 space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              value={data.address || ''}
              onChange={(e) => handleChange('address', e.target.value)}
              placeholder="Street address, city, state, ZIP"
            />
          </div>
        </div>
      </div>

      {/* Business Details */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <CreditCard className="w-5 h-5 text-slate-700" />
          <h3 className="font-semibold text-slate-900">Business Details</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="vendor_category">Vendor Category</Label>
            <Select
              value={data.vendor_category || ''}
              onValueChange={(value) => handleChange('vendor_category', value)}
            >
              <SelectTrigger id="vendor_category">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(categoryLabels).map(([key, label]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="payment_terms">Payment Terms</Label>
            <Select
              value={data.payment_terms || ''}
              onValueChange={(value) => handleChange('payment_terms', value)}
            >
              <SelectTrigger id="payment_terms">
                <SelectValue placeholder="Select terms" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="net_15">NET 15</SelectItem>
                <SelectItem value="net_30">NET 30</SelectItem>
                <SelectItem value="net_45">NET 45</SelectItem>
                <SelectItem value="net_60">NET 60</SelectItem>
                <SelectItem value="cod">COD</SelectItem>
                <SelectItem value="prepaid">Prepaid</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tax_id">Tax ID / EIN</Label>
            <Input
              id="tax_id"
              value={data.tax_id || ''}
              onChange={(e) => handleChange('tax_id', e.target.value)}
              placeholder="XX-XXXXXXX"
            />
          </div>
        </div>
      </div>

      {/* Notes */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <Tag className="w-5 h-5 text-slate-700" />
          <h3 className="font-semibold text-slate-900">Internal Notes</h3>
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            value={data.notes || ''}
            onChange={(e) => handleChange('notes', e.target.value)}
            placeholder="Internal notes about this vendor..."
            className="resize-none min-h-24"
            rows={4}
          />
        </div>
      </div>
    </div>
  );
}