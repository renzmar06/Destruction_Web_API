import React, { useRef, useState } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FileText, X, PenTool } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function LegalSettingsSection({ data, onChange, errors }) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleChange = (field, value) => {
    onChange({ ...data, [field]: value });
  };

  const handleSignatureUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      handleChange('signature_image_url', file_url);
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
    }
  };

  const removeSignature = () => {
    handleChange('signature_image_url', '');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-8 space-y-6">
      <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
        <div className="p-2.5 bg-amber-500 rounded-xl">
          <FileText className="w-5 h-5 text-white" />
        </div>
        <h2 className="text-lg font-semibold text-slate-900">Legal & Document Settings</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="authorized_signer_name" className="text-sm font-medium text-slate-700">
            Authorized Signer Name <span className="text-red-500">*</span>
          </Label>
          <Input
            id="authorized_signer_name"
            value={data.authorized_signer_name || ''}
            onChange={(e) => handleChange('authorized_signer_name', e.target.value)}
            placeholder="John Smith"
            className={`h-12 border-slate-200 focus:border-slate-400 focus:ring-slate-400 ${errors.authorized_signer_name ? 'border-red-400' : ''}`}
          />
          {errors.authorized_signer_name && <p className="text-xs text-red-500">{errors.authorized_signer_name}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="authorized_signer_title" className="text-sm font-medium text-slate-700">
            Authorized Signer Title <span className="text-red-500">*</span>
          </Label>
          <Input
            id="authorized_signer_title"
            value={data.authorized_signer_title || ''}
            onChange={(e) => handleChange('authorized_signer_title', e.target.value)}
            placeholder="Operations Manager"
            className={`h-12 border-slate-200 focus:border-slate-400 focus:ring-slate-400 ${errors.authorized_signer_title ? 'border-red-400' : ''}`}
          />
          {errors.authorized_signer_title && <p className="text-xs text-red-500">{errors.authorized_signer_title}</p>}
        </div>

        <div className="space-y-3">
          <Label className="text-sm font-medium text-slate-700">Signature Image</Label>
          
          {data.signature_image_url ? (
            <div className="relative group">
              <div className="w-full h-24 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-center overflow-hidden">
                <img 
                  src={data.signature_image_url} 
                  alt="Signature" 
                  className="max-h-20 max-w-full object-contain"
                />
              </div>
              <button
                onClick={removeSignature}
                className="absolute top-2 right-2 p-1.5 bg-red-500 rounded-lg text-white opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="w-full h-24 bg-slate-50 rounded-xl border-2 border-dashed border-slate-300 flex items-center justify-center cursor-pointer hover:border-slate-400 hover:bg-slate-100 transition-all"
            >
              {uploading ? (
                <div className="w-6 h-6 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
              ) : (
                <div className="flex items-center gap-2 text-slate-500">
                  <PenTool className="w-5 h-5" />
                  <span className="text-sm">Upload signature</span>
                </div>
              )}
            </div>
          )}
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleSignatureUpload}
            className="hidden"
          />
        </div>

        <div className="md:col-span-2 space-y-2">
          <Label htmlFor="default_invoice_footer" className="text-sm font-medium text-slate-700">
            Default Invoice Footer Text
          </Label>
          <Textarea
            id="default_invoice_footer"
            value={data.default_invoice_footer || ''}
            onChange={(e) => handleChange('default_invoice_footer', e.target.value)}
            placeholder="Payment terms, thank you message, or other footer information..."
            className="min-h-24 border-slate-200 focus:border-slate-400 focus:ring-slate-400 resize-none"
          />
        </div>

        <div className="md:col-span-2 space-y-2">
          <Label htmlFor="default_affidavit_language" className="text-sm font-medium text-slate-700">
            Default Affidavit Language
          </Label>
          <Textarea
            id="default_affidavit_language"
            value={data.default_affidavit_language || ''}
            onChange={(e) => handleChange('default_affidavit_language', e.target.value)}
            placeholder="This certifies that {{CompanyName}} has destroyed materials for {{CustomerName}} on {{Date}}..."
            className="min-h-32 border-slate-200 focus:border-slate-400 focus:ring-slate-400 resize-none"
          />
          <p className="text-xs text-slate-500">
            Supported variables: {'{{CompanyName}}'}, {'{{CustomerName}}'}, {'{{JobID}}'}, {'{{InvoiceNumber}}'}, {'{{Date}}'}
          </p>
        </div>
      </div>
    </div>
  );
}