import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FileText } from "lucide-react";

export default function AffidavitDetailsSection({ data, onChange, isReadOnly, errors = {} }) {
  const handleChange = (field, value) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
      <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
        <FileText className="w-5 h-5 text-slate-700" />
        <h3 className="font-semibold text-slate-900">Affidavit Details</h3>
      </div>

      {isReadOnly && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 text-sm text-purple-800">
          <strong>Status: {data.affidavit_status === 'locked' ? 'Locked' : 'Issued'}</strong> - All fields are locked and cannot be edited.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Service Provider Legal Name {!isReadOnly && <span className="text-red-500">*</span>}</Label>
          <Input 
            value={data.service_provider_name || ''} 
            onChange={(e) => handleChange('service_provider_name', e.target.value)}
            disabled={isReadOnly} 
            className={`${isReadOnly ? "bg-slate-50" : ""} ${errors.service_provider_name ? "border-red-500" : ""}`}
          />
          {errors.service_provider_name && (
            <p className="text-sm text-red-600">{errors.service_provider_name}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Service Provider EIN {!isReadOnly && <span className="text-red-500">*</span>}</Label>
          <Input 
            value={data.service_provider_ein || ''} 
            onChange={(e) => handleChange('service_provider_ein', e.target.value)}
            disabled={isReadOnly} 
            className={`${isReadOnly ? "bg-slate-50" : ""} ${errors.service_provider_ein ? "border-red-500" : ""}`}
            placeholder="XX-XXXXXXX"
          />
          {errors.service_provider_ein && (
            <p className="text-sm text-red-600">{errors.service_provider_ein}</p>
          )}
        </div>

        <div className="md:col-span-2 space-y-2">
          <Label>Service Provider Address {!isReadOnly && <span className="text-red-500">*</span>}</Label>
          <Input 
            value={data.service_provider_address || ''} 
            onChange={(e) => handleChange('service_provider_address', e.target.value)}
            disabled={isReadOnly} 
            className={`${isReadOnly ? "bg-slate-50" : ""} ${errors.service_provider_address ? "border-red-500" : ""}`}
          />
          {errors.service_provider_address && (
            <p className="text-sm text-red-600">{errors.service_provider_address}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Customer Legal Name {!isReadOnly && <span className="text-red-500">*</span>}</Label>
          <Input 
            value={data.customer_name || ''} 
            onChange={(e) => handleChange('customer_name', e.target.value)}
            disabled={isReadOnly} 
            className={`${isReadOnly ? "bg-slate-50" : ""} ${errors.customer_name ? "border-red-500" : ""}`}
          />
          {errors.customer_name && (
            <p className="text-sm text-red-600">{errors.customer_name}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Job Location {!isReadOnly && <span className="text-red-500">*</span>}</Label>
          <Input 
            value={data.job_location || ''} 
            onChange={(e) => handleChange('job_location', e.target.value)}
            disabled={isReadOnly} 
            className={`${isReadOnly ? "bg-slate-50" : ""} ${errors.job_location ? "border-red-500" : ""}`}
          />
          {errors.job_location && (
            <p className="text-sm text-red-600">{errors.job_location}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Job Completion Date {!isReadOnly && <span className="text-red-500">*</span>}</Label>
          <Input
            type="date"
            value={data.job_completion_date || ''}
            onChange={(e) => handleChange('job_completion_date', e.target.value)}
            disabled={isReadOnly}
            className={`${isReadOnly ? "bg-slate-50" : ""} ${errors.job_completion_date ? "border-red-500" : ""}`}
          />
          {errors.job_completion_date && (
            <p className="text-sm text-red-600">{errors.job_completion_date}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Destruction Method {!isReadOnly && <span className="text-red-500">*</span>}</Label>
          <Input 
            value={data.destruction_method || ''} 
            onChange={(e) => handleChange('destruction_method', e.target.value)}
            disabled={isReadOnly} 
            className={`${isReadOnly ? "bg-slate-50" : ""} ${errors.destruction_method ? "border-red-500" : ""}`}
          />
          {errors.destruction_method && (
            <p className="text-sm text-red-600">{errors.destruction_method}</p>
          )}
        </div>

        <div className="md:col-span-2 space-y-2">
          <Label htmlFor="description_of_materials">
            Description of Destroyed Materials {!isReadOnly && <span className="text-red-500">*</span>}
          </Label>
          <Textarea
            id="description_of_materials"
            value={data.description_of_materials || ''}
            onChange={(e) => handleChange('description_of_materials', e.target.value)}
            placeholder="Describe the materials that were destroyed..."
            className={`resize-none min-h-24 ${errors.description_of_materials ? "border-red-500" : ""}`}
            rows={4}
            disabled={isReadOnly}
          />
          {errors.description_of_materials && (
            <p className="text-sm text-red-600">{errors.description_of_materials}</p>
          )}
        </div>

        <div className="md:col-span-2 space-y-2">
          <Label htmlFor="description_of_process">
            Description of Destruction Process {!isReadOnly && <span className="text-red-500">*</span>}
          </Label>
          <Textarea
            id="description_of_process"
            value={data.description_of_process || ''}
            onChange={(e) => handleChange('description_of_process', e.target.value)}
            placeholder="Describe how the destruction was carried out..."
            className={`resize-none min-h-24 ${errors.description_of_process ? "border-red-500" : ""}`}
            rows={4}
            disabled={isReadOnly}
          />
          {errors.description_of_process && (
            <p className="text-sm text-red-600">{errors.description_of_process}</p>
          )}
        </div>
      </div>
    </div>
  );
}