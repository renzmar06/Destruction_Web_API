import React from 'react';
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Info } from "lucide-react";

export default function StatusNotesSection({ data, onChange }) {
  const handleChange = (field, value) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="bg-white rounded-2xl border-2 border-slate-200 p-8 space-y-6 shadow-lg">
      <div className="flex items-center justify-between pb-4 border-b-2 border-slate-200">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-red-100 rounded-xl">
            <Info className="w-5 h-5 text-red-700" />
          </div>
          <h3 className="text-xl font-bold text-slate-900">Status</h3>
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="customer_status">Customer Status</Label>
          <Select value={data.customer_status || 'active'} onValueChange={(value) => handleChange('customer_status', value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="on_hold">On Hold</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-slate-500">Archived customers cannot be used in new estimates</p>
        </div>
      </div>
    </div>
  );
}