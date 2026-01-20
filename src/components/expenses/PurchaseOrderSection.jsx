import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText } from "lucide-react";

export default function PurchaseOrderSection({ data, onChange, isReadOnly }) {
  const handleChange = (field, value) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
      <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
        <FileText className="w-5 h-5 text-slate-700" />
        <h3 className="font-semibold text-slate-900">Purchase Order Information</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="po_number">PO Number</Label>
          <Input
            id="po_number"
            value={data.po_number || ''}
            onChange={(e) => handleChange('po_number', e.target.value)}
            placeholder="PO-12345"
            disabled={isReadOnly}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="po_status">PO Status</Label>
          <Select
            value={data.po_status || 'draft'}
            onValueChange={(value) => handleChange('po_status', value)}
            disabled={isReadOnly}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="issued">Issued</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="vendor_invoice_number">Vendor Invoice Number</Label>
          <Input
            id="vendor_invoice_number"
            value={data.vendor_invoice_number || ''}
            onChange={(e) => handleChange('vendor_invoice_number', e.target.value)}
            placeholder="INV-67890"
            disabled={isReadOnly}
          />
        </div>
      </div>
    </div>
  );
}