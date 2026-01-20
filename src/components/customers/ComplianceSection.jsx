import React from 'react';
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { ShieldCheck } from "lucide-react";

export default function ComplianceSection({ data, onChange }) {
  const handleChange = (field, value) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="bg-white rounded-2xl border-2 border-slate-200 p-8 space-y-6 shadow-lg">
      <div className="flex items-center justify-between pb-4 border-b-2 border-slate-200">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-100 rounded-xl">
            <ShieldCheck className="w-5 h-5 text-amber-700" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900">Destruction & Compliance Defaults</h3>
            <p className="text-sm text-slate-600 mt-1">Auto-flow into estimates, jobs, and affidavits</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Checkbox
            id="requires_certificate"
            checked={data.requires_certificate || false}
            onCheckedChange={(checked) => handleChange('requires_certificate', checked)}
          />
          <Label htmlFor="requires_certificate" className="text-sm font-normal cursor-pointer">
            Requires Certificate of Destruction
          </Label>
        </div>

        <div className="flex items-center gap-2">
          <Checkbox
            id="requires_affidavit"
            checked={data.requires_affidavit || false}
            onCheckedChange={(checked) => handleChange('requires_affidavit', checked)}
          />
          <Label htmlFor="requires_affidavit" className="text-sm font-normal cursor-pointer">
            Requires Affidavit
          </Label>
        </div>

        <div className="flex items-center gap-2">
          <Checkbox
            id="requires_photo_video_proof"
            checked={data.requires_photo_video_proof || false}
            onCheckedChange={(checked) => handleChange('requires_photo_video_proof', checked)}
          />
          <Label htmlFor="requires_photo_video_proof" className="text-sm font-normal cursor-pointer">
            Requires Photo / Video Proof
          </Label>
        </div>

        <div className="flex items-center gap-2">
          <Checkbox
            id="witness_required"
            checked={data.witness_required || false}
            onCheckedChange={(checked) => handleChange('witness_required', checked)}
          />
          <Label htmlFor="witness_required" className="text-sm font-normal cursor-pointer">
            Witness Required
          </Label>
        </div>

        <div className="flex items-center gap-2">
          <Checkbox
            id="scrap_resale_allowed"
            checked={data.scrap_resale_allowed || false}
            onCheckedChange={(checked) => handleChange('scrap_resale_allowed', checked)}
          />
          <Label htmlFor="scrap_resale_allowed" className="text-sm font-normal cursor-pointer">
            Scrap Resale Allowed
          </Label>
        </div>

        <div className="space-y-2">
          <Label htmlFor="special_handling_notes">Special Handling Notes</Label>
          <Textarea
            id="special_handling_notes"
            value={data.special_handling_notes || ''}
            onChange={(e) => handleChange('special_handling_notes', e.target.value)}
            placeholder="Any special handling requirements or instructions..."
            className="resize-none"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="insurance_compliance_notes">Insurance / Compliance Notes</Label>
          <Textarea
            id="insurance_compliance_notes"
            value={data.insurance_compliance_notes || ''}
            onChange={(e) => handleChange('insurance_compliance_notes', e.target.value)}
            placeholder="Insurance requirements, compliance documentation, etc..."
            className="resize-none"
          />
        </div>
      </div>
    </div>
  );
}