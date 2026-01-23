import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Truck, Plus } from "lucide-react";
import Link from 'next/link';
import { fetchVendors } from '@/redux/slices/vendorsSlice';

export default function VendorSelector({ data, onChange, errors, isReadOnly }) {
  const dispatch = useDispatch();
  const { vendors } = useSelector((state) => state.vendors);
  const [manualEntry, setManualEntry] = useState(false);

  useEffect(() => {
    dispatch(fetchVendors());
  }, [dispatch]);

  const activeVendors = vendors.filter(v => v.vendor_status === 'active');

  const handleVendorSelect = (vendorId) => {
    if (vendorId === 'manual') {
      setManualEntry(true);
      onChange({ ...data, vendor_id: null, vendor_name: '' });
    } else {
      const vendor = activeVendors.find(v => v._id === vendorId);
      if (vendor) {
        onChange({
          ...data,
          vendor_id: vendor._id,
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
        <Link href="/vendors">
          <Button variant="outline" size="sm" className="gap-2">
            <Plus className="w-4 h-4" />
            Add Vendor
          </Button>
        </Link>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="vendor_select">
            Select Vendor <span className="text-red-500">*</span>
          </Label>
          {!manualEntry ? (
            <Select
              value={data.vendor_id || ''}
              onValueChange={handleVendorSelect}
            >
              <SelectTrigger className={errors.vendor_name ? 'border-red-400' : ''}>
                <SelectValue placeholder="Choose from vendor directory" />
              </SelectTrigger>
              <SelectContent>
                {activeVendors.map((vendor) => (
                  <SelectItem key={vendor._id} value={vendor._id}>
                    {vendor.vendor_name}
                  </SelectItem>
                ))}
                <SelectItem value="manual">+ Enter manually</SelectItem>
              </SelectContent>
            </Select>
          ) : (
            <div className="flex gap-2">
              <Input
                value={data.vendor_name || ''}
                onChange={(e) => handleManualChange(e.target.value)}
                placeholder="Enter vendor name"
                className={errors.vendor_name ? 'border-red-400' : ''}
              />
              <Button
                variant="outline"
                onClick={() => {
                  setManualEntry(false);
                  onChange({ ...data, vendor_id: null, vendor_name: '' });
                }}
              >
                Cancel
              </Button>
            </div>
          )}
          {errors.vendor_name && <p className="text-xs text-red-500">{errors.vendor_name}</p>}
        </div>

        {data.vendor_id && !manualEntry && activeVendors.find(v => v._id === data.vendor_id) && (
          <div className="bg-slate-50 rounded-lg p-3 text-sm">
            <p className="text-slate-600">
              <strong>Contact:</strong> {activeVendors.find(v => v._id === data.vendor_id)?.email}
            </p>
            {activeVendors.find(v => v._id === data.vendor_id)?.payment_terms && (
              <p className="text-slate-600">
                <strong>Payment Terms:</strong> {activeVendors.find(v => v._id === data.vendor_id)?.payment_terms.replace('_', ' ').toUpperCase()}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}