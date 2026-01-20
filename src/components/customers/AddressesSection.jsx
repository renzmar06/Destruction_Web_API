import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { MapPin } from "lucide-react";

export default function AddressesSection({ data, onChange }) {
  const handleChange = (field, value) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
      <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
        <MapPin className="w-5 h-5 text-slate-700" />
        <h3 className="font-semibold text-slate-900">Addresses</h3>
      </div>

      <div className="space-y-4">
        <h4 className="font-medium text-slate-900">Billing address</h4>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="billing_street_1">Street address 1</Label>
            <Input
              id="billing_street_1"
              value={data.billing_street_1 || ''}
              onChange={(e) => handleChange('billing_street_1', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="billing_street_2">Street address 2</Label>
            <Input
              id="billing_street_2"
              value={data.billing_street_2 || ''}
              onChange={(e) => handleChange('billing_street_2', e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="billing_city">City</Label>
            <Input
              id="billing_city"
              value={data.billing_city || ''}
              onChange={(e) => handleChange('billing_city', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="billing_state">State</Label>
            <Input
              id="billing_state"
              value={data.billing_state || ''}
              onChange={(e) => handleChange('billing_state', e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="billing_zip">ZIP code</Label>
            <Input
              id="billing_zip"
              value={data.billing_zip || ''}
              onChange={(e) => handleChange('billing_zip', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="billing_country">Country</Label>
            <Input
              id="billing_country"
              value={data.billing_country || 'USA'}
              onChange={(e) => handleChange('billing_country', e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-slate-100">
        <h4 className="font-medium text-slate-900 mb-3">Shipping address</h4>

        <div className="flex items-center gap-2 mb-4">
          <Checkbox
            id="shipping_same_as_billing"
            checked={data.shipping_same_as_billing ?? true}
            onCheckedChange={(checked) => handleChange('shipping_same_as_billing', checked)}
          />
          <Label htmlFor="shipping_same_as_billing" className="text-sm font-medium cursor-pointer">
            Same as billing address
          </Label>
        </div>

        {!data.shipping_same_as_billing && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="shipping_street_1">Street address 1</Label>
                <Input
                  id="shipping_street_1"
                  value={data.shipping_street_1 || ''}
                  onChange={(e) => handleChange('shipping_street_1', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="shipping_street_2">Street address 2</Label>
                <Input
                  id="shipping_street_2"
                  value={data.shipping_street_2 || ''}
                  onChange={(e) => handleChange('shipping_street_2', e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="shipping_city">City</Label>
                <Input
                  id="shipping_city"
                  value={data.shipping_city || ''}
                  onChange={(e) => handleChange('shipping_city', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="shipping_state">State</Label>
                <Input
                  id="shipping_state"
                  value={data.shipping_state || ''}
                  onChange={(e) => handleChange('shipping_state', e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="shipping_zip">ZIP code</Label>
                <Input
                  id="shipping_zip"
                  value={data.shipping_zip || ''}
                  onChange={(e) => handleChange('shipping_zip', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="shipping_country">Country</Label>
                <Input
                  id="shipping_country"
                  value={data.shipping_country || 'USA'}
                  onChange={(e) => handleChange('shipping_country', e.target.value)}
                />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}