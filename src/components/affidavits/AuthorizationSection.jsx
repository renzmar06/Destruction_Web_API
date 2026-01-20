import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PenTool } from "lucide-react";

export default function AuthorizationSection({ data }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
      <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
        <PenTool className="w-5 h-5 text-slate-700" />
        <h3 className="font-semibold text-slate-900">Authorization</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Authorized Signer Name</Label>
          <Input value={data.authorized_signer_name || ''} disabled className="bg-slate-50" />
        </div>

        <div className="space-y-2">
          <Label>Authorized Signer Title</Label>
          <Input value={data.authorized_signer_title || ''} disabled className="bg-slate-50" />
        </div>

        <div className="space-y-2">
          <Label>Date Issued</Label>
          <Input
            type="date"
            value={data.date_issued || ''}
            disabled
            className="bg-slate-50"
          />
        </div>

        <div className="space-y-2">
          <Label>Place of Issuance</Label>
          <Input value={data.place_of_issuance || ''} disabled className="bg-slate-50" />
        </div>

        {data.signature_image_url && (
          <div className="md:col-span-2 space-y-2">
            <Label>Signature</Label>
            <div className="bg-slate-50 rounded-lg border border-slate-200 p-4 flex items-center justify-center">
              <img
                src={data.signature_image_url}
                alt="Authorized signature"
                className="max-h-20 object-contain"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}