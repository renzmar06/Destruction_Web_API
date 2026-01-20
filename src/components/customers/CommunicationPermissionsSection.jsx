import React from 'react';
import { MessageSquare, Shield, Mail, Info } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export default function CommunicationPermissionsSection({ data, onChange }) {
  const handleChange = (field, value) => {
    onChange({ ...data, [field]: value });
  };

  const hasEmail = data.email?.trim();

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
      <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
        <MessageSquare className="w-5 h-5 text-slate-700" />
        <h3 className="font-semibold text-slate-900">Communication permissions</h3>
      </div>

      {!hasEmail ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <Shield className="w-12 h-12 text-slate-400 mb-4" />
          <h4 className="font-medium text-slate-900 mb-2">Enter an email to record customer consent.</h4>
          <p className="text-sm text-slate-600 max-w-xl">
            If the customer has opted in to receive email marketing communications, acknowledge it here once you've added an email.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-slate-600" />
              <Label>Email marketing</Label>
              <Info className="w-4 h-4 text-slate-400" />
            </div>
            <Select value={data.email || ''} onValueChange={(value) => handleChange('email', value)}>
              <SelectTrigger className="max-w-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={data.email}>{data.email}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <div className="flex items-start gap-2">
              <Checkbox
                id="email_marketing_consent"
                checked={data.email_marketing_consent || false}
                onCheckedChange={(checked) => handleChange('email_marketing_consent', checked)}
                className="mt-0.5"
              />
              <Label htmlFor="email_marketing_consent" className="font-normal cursor-pointer">
                This person gave me permission to email them marketing.
              </Label>
            </div>
            
            <p className="text-xs text-slate-600 ml-6">
              This person will not receive a confirmation email from Intuit. Since you're adding this recipient manually, they won't have an opt-in date in your records, so be extra sure you have permission first.{' '}
              <a href="#" className="text-blue-600 hover:text-blue-700">
                Learn about email marketing consent
              </a>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}