import React, { useRef, useState } from 'react';
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Palette, Upload, X, Image } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function BrandingSection({ data, onChange }) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleChange = (field, value) => {
    onChange({ ...data, [field]: value });
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      handleChange('company_logo_url', file_url);
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
    }
  };

  const removeLogo = () => {
    handleChange('company_logo_url', '');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-8 space-y-6">
      <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
        <div className="p-2.5 bg-violet-600 rounded-xl">
          <Palette className="w-5 h-5 text-white" />
        </div>
        <h2 className="text-lg font-semibold text-slate-900">Branding</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <Label className="text-sm font-medium text-slate-700">Company Logo</Label>
          
          {data.company_logo_url ? (
            <div className="relative group">
              <div className="w-full h-40 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden">
                <img 
                  src={data.company_logo_url} 
                  alt="Company logo" 
                  className="max-h-36 max-w-full object-contain"
                />
              </div>
              <button
                onClick={removeLogo}
                className="absolute top-2 right-2 p-1.5 bg-red-500 rounded-lg text-white opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="w-full h-40 bg-slate-50 rounded-xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center cursor-pointer hover:border-slate-400 hover:bg-slate-100 transition-all"
            >
              {uploading ? (
                <div className="flex flex-col items-center gap-2">
                  <div className="w-8 h-8 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm text-slate-500">Uploading...</span>
                </div>
              ) : (
                <>
                  <div className="p-3 bg-slate-200 rounded-xl mb-3">
                    <Image className="w-6 h-6 text-slate-500" />
                  </div>
                  <span className="text-sm font-medium text-slate-600">Click to upload logo</span>
                  <span className="text-xs text-slate-400 mt-1">PNG, JPG up to 5MB</span>
                </>
              )}
            </div>
          )}
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>

        <div className="space-y-3">
          <Label htmlFor="logo_placement" className="text-sm font-medium text-slate-700">
            Logo Placement on Documents
          </Label>
          <Select 
            value={data.logo_placement || 'header'} 
            onValueChange={(value) => handleChange('logo_placement', value)}
          >
            <SelectTrigger className="h-12 border-slate-200">
              <SelectValue placeholder="Select placement" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="header">Header</SelectItem>
              <SelectItem value="footer">Footer</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-slate-500">
            Choose where your logo appears on invoices and affidavits
          </p>
        </div>
      </div>
    </div>
  );
}