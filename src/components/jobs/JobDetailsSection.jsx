import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Briefcase } from "lucide-react";

export default function JobDetailsSection({ data, onChange, locations, errors, isReadOnly }) {
  const handleChange = (field, value) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 pb-2">
        <Briefcase className="w-5 h-5 text-slate-600" />
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">Job Details</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="job_id" className="text-xs font-semibold text-slate-700">Job ID</Label>
          <Input
            id="job_id"
            value={data.job_id || 'Auto-generated'}
            disabled
            className="bg-slate-100 border-slate-300 h-10"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="job_name" className="text-xs font-semibold text-slate-700">
            Job Name / Reference <span className="text-red-500">*</span>
          </Label>
          <Input
            id="job_name"
            value={data.job_name || ''}
            onChange={(e) => handleChange('job_name', e.target.value)}
            placeholder="Enter job name"
            disabled={isReadOnly}
            className={`h-10 border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 ${errors.job_name ? 'border-red-400' : ''}`}
          />
          {errors.job_name && <p className="text-xs text-red-500">{errors.job_name}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="customer_name" className="text-xs font-semibold text-slate-700">Customer</Label>
          <Input
            id="customer_name"
            value={data.customer_name || ''}
            disabled
            className="bg-slate-100 border-slate-300 h-10"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="estimate_number" className="text-xs font-semibold text-slate-700">Linked Estimate</Label>
          <Input
            id="estimate_number"
            value={data.estimate_number || 'N/A'}
            disabled
            className="bg-slate-100 border-slate-300 h-10"
          />
        </div>

        <div className="md:col-span-2 space-y-2">
          <Label htmlFor="job_location_id" className="text-xs font-semibold text-slate-700">Job Location</Label>
          <Select 
            value={data.job_location_id || ''} 
            onValueChange={(value) => handleChange('job_location_id', value)}
            disabled={isReadOnly}
          >
            <SelectTrigger className="h-10 border-slate-300">
              <SelectValue placeholder="Select location" />
            </SelectTrigger>
            <SelectContent>
              {locations.map(location => (
                <SelectItem key={location.id} value={location.id}>
                  {location.location_name} - {location.city}, {location.state}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}