import React from 'react';
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { DollarSign, Package } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";

export default function BillingPreferencesSection({ data, onChange }) {
  const handleChange = (field, value) => {
    onChange({ ...data, [field]: value });
  };

  const { data: services = [] } = useQuery({
    queryKey: ['services'],
    queryFn: () => base44.entities.Service.filter({ service_status: 'active' })
  });

  const handleServiceToggle = (serviceId, checked) => {
    const currentServices = data.default_services || [];
    const updated = checked
      ? [...currentServices, serviceId]
      : currentServices.filter(id => id !== serviceId);
    handleChange('default_services', updated);
  };

  return (
    <div className="bg-white rounded-2xl border-2 border-slate-200 p-8 space-y-6 shadow-lg">
      <div className="flex items-center justify-between pb-4 border-b-2 border-slate-200">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-100 rounded-xl">
            <DollarSign className="w-5 h-5 text-emerald-700" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900">Billing & Pricing Defaults</h3>
            <p className="text-sm text-slate-600 mt-1">Auto-populate new estimates</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-2">
          <Label htmlFor="default_pricing_unit">Default Pricing Unit</Label>
          <Select value={data.default_pricing_unit || ''} onValueChange={(value) => handleChange('default_pricing_unit', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select unit" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="per_case">Per Case</SelectItem>
              <SelectItem value="per_lb">Per LB</SelectItem>
              <SelectItem value="per_pallet">Per Pallet</SelectItem>
              <SelectItem value="per_load">Per Load</SelectItem>
              <SelectItem value="flat_fee">Flat Fee</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="payment_terms">Payment Terms</Label>
          <Select value={data.payment_terms || ''} onValueChange={(value) => handleChange('payment_terms', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select terms" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="cod">COD</SelectItem>
              <SelectItem value="net_15">Net 15</SelectItem>
              <SelectItem value="net_30">Net 30</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="transportation_default">Transportation Default</Label>
          <Select value={data.transportation_default || ''} onValueChange={(value) => handleChange('transportation_default', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select default" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="customer_delivers">Customer Delivers</SelectItem>
              <SelectItem value="company_pickup">Company Pickup</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="mb-3 block">Tax Status</Label>
          <div className="flex items-center gap-2">
            <Checkbox
              id="tax_exempt"
              checked={data.tax_exempt || false}
              onCheckedChange={(checked) => handleChange('tax_exempt', checked)}
            />
            <Label htmlFor="tax_exempt" className="text-sm font-normal cursor-pointer">
              Tax Exempt
            </Label>
          </div>
        </div>

        <div className="md:col-span-3 space-y-3">
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-slate-600" />
            <Label>Default Services (auto-added to new estimates)</Label>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 p-4 bg-slate-50 rounded-lg border border-slate-200 max-h-48 overflow-y-auto">
            {services.length === 0 ? (
              <p className="text-sm text-slate-500 col-span-full">No services available. Add services in Products & Services first.</p>
            ) : (
              services.map(service => (
                <div key={service.id} className="flex items-center gap-2">
                  <Checkbox
                    id={`service-${service.id}`}
                    checked={(data.default_services || []).includes(service.id)}
                    onCheckedChange={(checked) => handleServiceToggle(service.id, checked)}
                  />
                  <Label htmlFor={`service-${service.id}`} className="text-sm font-normal cursor-pointer">
                    {service.service_name}
                  </Label>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="md:col-span-3 space-y-2">
          <Label htmlFor="billing_notes">Billing Notes</Label>
          <Textarea
            id="billing_notes"
            value={data.billing_notes || ''}
            onChange={(e) => handleChange('billing_notes', e.target.value)}
            placeholder="Any special billing instructions or notes..."
            className="resize-none"
          />
        </div>
      </div>
    </div>
  );
}