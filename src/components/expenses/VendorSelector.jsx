import React, { useState } from 'react';
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Truck, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../../utils";

export default function VendorSelector({ data, onChange, errors, isReadOnly }) {
  const [manualEntry, setManualEntry] = useState(false);

  const { data: vendors = [] } = useQuery({
    queryKey: ['vendors'],
    queryFn: () => base44.entities.Vendor.list('-created_date'),
  });

  const activeVendors = vendors.filter(v => v.vendor_status === 'active');

  const handleVendorSelect = (vendorId) => {
    if (vendorId === 'manual') {
      setManualEntry(true);
      onChange({ ...data, vendor_id: null, vendor_name: '' });
    } else {
      const vendor = activeVendors.find(v => v.id === vendorId);
      if (vendor) {
        onChange({
          ...data,
          vendor_id: vendor.id,
          vendor_name: vendor.vendor_name
        });
        setManualEntry(false);
      }
    }
  };

  const handleManualChange = (value) => {
    onChange({ ...data, vendor_id: null, vendor_name: value });
  };

  if (isReadOnly) {
    return (
      <div className="space-y-2">
        <Label>Vendor</Label>
        <Input value={data.vendor_name || ''} disabled className="bg-slate-50" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Truck className="w-5 h-5 text-slate-700" />
          <h3 className="font-semibold text-slate-900">Vendor Selection</h3>
        </div>
        <Link to={createPageUrl('Vendors')}>
          <Button variant="outline" size="sm" className="gap-2">
            <Plus className="w-4 h-4" />
            Add Vendor
          </Button>
        </Link>
      </div>

      <div className="space-y-4">
        {!manualEntry ? (
          <>
            <div className="space-y-2">
              <Label htmlFor="vendor_select">
                Select Vendor <span className="text-red-500">*</span>
              </Label>
              <Select
                value={data.vendor_id || ''}
                onValueChange={handleVendorSelect}
              >
                <SelectTrigger className={errors.vendor_name ? 'border-red-400' : ''}>
                  <SelectValue placeholder="Choose from vendor directory" />
                </SelectTrigger>
                <SelectContent>
                  {activeVendors.length === 0 ? (
                    <SelectItem value="none" disabled>No vendors available</SelectItem>
                  ) : (
                    activeVendors.map((vendor) => (
                      <SelectItem key={vendor.id} value={vendor.id}>
                        {vendor.vendor_name}
                      </SelectItem>
                    ))
                  )}
                  <SelectItem value="manual">Enter manually</SelectItem>
                </SelectContent>
              </Select>
              {errors.vendor_name && <p className="text-xs text-red-500">{errors.vendor_name}</p>}
            </div>

            {data.vendor_id && activeVendors.find(v => v.id === data.vendor_id) && (
              <div className="bg-slate-50 rounded-lg p-3 text-sm">
                <p className="text-slate-600">
                  <strong>Contact:</strong> {activeVendors.find(v => v.id === data.vendor_id)?.email}
                </p>
                {activeVendors.find(v => v.id === data.vendor_id)?.payment_terms && (
                  <p className="text-slate-600">
                    <strong>Payment Terms:</strong> {activeVendors.find(v => v.id === data.vendor_id)?.payment_terms.replace('_', ' ').toUpperCase()}
                  </p>
                )}
              </div>
            )}
          </>
        ) : (
          <>
            <div className="space-y-2">
              <Label htmlFor="vendor_name_manual">
                Vendor Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="vendor_name_manual"
                value={data.vendor_name || ''}
                onChange={(e) => handleManualChange(e.target.value)}
                placeholder="Enter vendor name"
                className={errors.vendor_name ? 'border-red-400' : ''}
              />
              {errors.vendor_name && <p className="text-xs text-red-500">{errors.vendor_name}</p>}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setManualEntry(false);
                onChange({ ...data, vendor_id: null, vendor_name: '' });
              }}
            >
              Back to vendor directory
            </Button>
          </>
        )}
      </div>
    </div>
  );
}