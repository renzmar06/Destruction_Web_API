import React from 'react';
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2 } from "lucide-react";

const destructionMethods = {
  mechanical_destruction: 'Mechanical Destruction',
  liquidization: 'Liquidization',
  fermentation: 'Fermentation',
  anaerobic_digestion: 'Anaerobic Digestion',
  hybrid_multi_step: 'Hybrid / Multi-Step'
};

export default function DestructionDetailsSection({ data, onChange, errors, isReadOnly }) {
  const handleChange = (field, value) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
      <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
        <Trash2 className="w-5 h-5 text-slate-700" />
        <h3 className="font-semibold text-slate-900">Destruction Details</h3>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="destruction_method">
            Destruction Method <span className="text-red-500">*</span>
          </Label>
          <Select 
            value={data.destruction_method || ''} 
            onValueChange={(value) => handleChange('destruction_method', value)}
            disabled={isReadOnly}
          >
            <SelectTrigger className={errors.destruction_method ? 'border-red-400' : ''}>
              <SelectValue placeholder="Select method" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(destructionMethods).map(([key, label]) => (
                <SelectItem key={key} value={key}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.destruction_method && <p className="text-xs text-red-500">{errors.destruction_method}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="destruction_description">
            Description of Destruction <span className="text-red-500">*</span>
          </Label>
          <Textarea
            id="destruction_description"
            value={data.destruction_description || ''}
            onChange={(e) => handleChange('destruction_description', e.target.value)}
            placeholder="Describe the destruction process in detail..."
            className={`resize-none min-h-32 ${errors.destruction_description ? 'border-red-400' : ''}`}
            disabled={isReadOnly}
          />
          {errors.destruction_description && <p className="text-xs text-red-500">{errors.destruction_description}</p>}
          {isReadOnly && (
            <p className="text-xs text-slate-500">Locked after job completion</p>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Checkbox
            id="requires_affidavit"
            checked={data.requires_affidavit || false}
            onCheckedChange={(checked) => handleChange('requires_affidavit', checked)}
            disabled={isReadOnly}
          />
          <Label htmlFor="requires_affidavit" className="text-sm font-normal cursor-pointer">
            Requires Affidavit / Certificate of Destruction
          </Label>
        </div>

        <div className="space-y-2">
          <Label htmlFor="special_handling_notes">Special Handling Notes</Label>
          <Textarea
            id="special_handling_notes"
            value={data.special_handling_notes || ''}
            onChange={(e) => handleChange('special_handling_notes', e.target.value)}
            placeholder="Any special handling requirements..."
            className="resize-none"
            rows={3}
            disabled={isReadOnly}
          />
        </div>
      </div>
    </div>
  );
}