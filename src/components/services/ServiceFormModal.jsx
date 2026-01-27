import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { X, Upload, Image as ImageIcon, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import CustomSelectInput from "./CustomSelectInput";

export default function ServiceFormModal({ 
  open, 
  onOpenChange, 
  formData = {}, 
  onChange, 
  onSave,
  onDelete,
  errors = {},
  isSaving,
  isDeleting,
  editingService,
  onShowToast
}) {
  const [uploading, setUploading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success'); // 'success' or 'error'

  const showToastMessage = (message, type = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleChange = (field, value) => {
    onChange({ ...formData, [field]: value });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type and size
    if (!file.type.startsWith('image/')) {
      onShowToast('Please select an image file', 'error');
      return;
    }
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      onShowToast('Image size must be less than 5MB', 'error');
      return;
    }

    setUploading(true);
    try {
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: uploadFormData,
      });
      
      if (!response.ok) {
        throw new Error(`Upload failed: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        handleChange('image_url', result.url);
      } else {
        throw new Error(result.message || 'Upload failed');
      }
    } catch (error) {
      console.error('Failed to upload image:', error);
      showToastMessage(`Failed to upload image: ${error.message}`, 'error');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between pb-4 border-b">
          <DialogTitle className="text-xl font-semibold">
            {editingService ? 'Edit service' : 'Add a new service'}
          </DialogTitle>
          <button 
            onClick={() => onOpenChange(false)} 
            className="hover:bg-slate-100 rounded p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </DialogHeader>

        <div className="space-y-8 py-4">
          {/* Basic Info */}
          <div>
            <h3 className="text-lg font-bold mb-6 text-slate-900">Basic info</h3>
            <div className="flex gap-6">
              <div className="flex-1 space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="service_name" className="text-sm font-semibold text-slate-800">
                    Name<span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="service_name"
                    value={formData.service_name}
                    onChange={(e) => handleChange('service_name', e.target.value)}
                    className={`h-11 text-base ${errors.service_name ? 'border-red-400' : 'border-slate-300'}`}
                  />
                  {errors.service_name && (
                    <p className="text-xs text-red-500">{errors.service_name}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="item_type" className="text-sm font-semibold text-slate-800">Item type</Label>
                  <Select 
                    value={formData.item_type || 'service'} 
                    onValueChange={(value) => handleChange('item_type', value)}
                  >
                    <SelectTrigger className="h-11 text-base border-slate-300">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="service">Service</SelectItem>
                      <SelectItem value="adjustment">Adjustment/Charge</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sku" className="text-sm font-semibold text-slate-800">SKU</Label>
                  <Input
                    id="sku"
                    value={formData.sku}
                    onChange={(e) => handleChange('sku', e.target.value)}
                    className={`h-11 text-base ${errors.sku ? 'border-red-400' : 'border-slate-300'}`}
                    maxLength={50}
                  />
                  {errors.sku && (
                    <p className="text-xs text-red-500">{errors.sku}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="service_category" className="text-sm font-semibold text-slate-800">
                    Category<span className="text-red-500">*</span>
                  </Label>
                  <CustomSelectInput
                    value={formData.service_category}
                    onValueChange={(value) => handleChange('service_category', value)}
                    options={[
                      { value: 'beverage_destruction', label: 'Beverage Destruction' },
                      { value: 'liquid_processing', label: 'Liquid Processing' },
                      { value: 'packaging_destruction', label: 'Packaging Destruction' },
                      { value: 'transportation', label: 'Transportation' },
                      { value: 'certificate_affidavit', label: 'Certificate/Affidavit' },
                      { value: 'storage', label: 'Storage' },
                      { value: 'fuel_surcharge', label: 'Fuel Surcharge' },
                      { value: 'disposal_fee', label: 'Disposal Fee' },
                      { value: 'credit_discount', label: 'Credit/Discount' },
                      { value: 'other', label: 'Other' }
                    ]}
                    placeholder="Select category"
                    label="category"
                    className={`h-11 text-base ${errors.service_category ? 'border-red-400' : 'border-slate-300'}`}
                    required
                  />
                  {errors.service_category && (
                    <p className="text-xs text-red-500">{errors.service_category}</p>
                  )}
                </div>
              </div>

              <div className="w-48">
                <div className="border-2 border-dashed border-slate-300 rounded-lg h-48 flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer relative overflow-hidden">
                  {formData.image_url ? (
                    <img 
                      src={formData.image_url} 
                      alt="Service" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-center">
                      <ImageIcon className="w-12 h-12 text-slate-400 mx-auto mb-2" />
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    disabled={uploading}
                  />
                </div>
                <button 
                  type="button"
                  className="text-blue-600 text-sm mt-2 hover:text-blue-700 w-full disabled:opacity-50"
                  onClick={() => {
                    const fileInput = document.querySelector('input[type="file"]');
                    if (fileInput) fileInput.click();
                  }}
                  disabled={uploading}
                >
                  {uploading ? 'Uploading...' : formData.image_url ? 'Change image' : 'Add an image'}
                </button>
              </div>
            </div>
          </div>

          {/* Sales */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-bold mb-6 text-slate-900">Sales</h3>
            <div className="space-y-5">
              <div className="flex items-center gap-3">
                <Checkbox
                  id="i_sell_service"
                  checked={formData.i_sell_service}
                  onCheckedChange={(checked) => handleChange('i_sell_service', checked)}
                  className="w-5 h-5"
                />
                <Label htmlFor="i_sell_service" className="text-base font-medium text-slate-800 cursor-pointer">
                  I sell this service to my customers
                </Label>
              </div>

              {formData.i_sell_service && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-sm font-semibold text-slate-800">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleChange('description', e.target.value)}
                      rows={4}
                      placeholder="Service description for invoices and estimates"
                      className="text-base border-slate-300 resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="default_rate" className="text-sm font-semibold text-slate-800">
                        Price/rate<span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="default_rate"
                        type="number"
                        step="0.01"
                        value={formData.default_rate}
                        onChange={(e) => handleChange('default_rate', parseFloat(e.target.value) || 0)}
                        className={`h-11 text-base ${errors.default_rate ? 'border-red-400' : 'border-slate-300'}`}
                      />
                      {errors.default_rate && (
                        <p className="text-xs text-red-500">{errors.default_rate}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="income_account" className="text-sm font-semibold text-slate-800">
                        Income account<span className="text-red-500">*</span>
                      </Label>
                      <CustomSelectInput
                        value={formData.income_account}
                        onValueChange={(value) => handleChange('income_account', value)}
                        options={[
                          { value: 'services', label: 'Services' },
                          { value: 'product_sales', label: 'Product Sales' },
                          { value: 'other_income', label: 'Other Income' }
                        ]}
                        placeholder="Select account"
                        label="income account"
                        className={`h-11 text-base ${errors.income_account ? 'border-red-400' : 'border-slate-300'}`}
                        required
                      />
                      {errors.income_account && (
                        <p className="text-xs text-red-500">{errors.income_account}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="sales_tax_category" className="text-sm font-semibold text-slate-800">Sales tax category</Label>
                      <a href="#" className="text-xs text-blue-600 hover:text-blue-700 font-medium">
                        What`s a sales tax category?
                      </a>
                    </div>
                    <Select 
                      value={formData.sales_tax_category} 
                      onValueChange={(value) => handleChange('sales_tax_category', value)}
                    >
                      <SelectTrigger className="h-11 text-base border-slate-300">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="taxable_standard">Taxable—standard rate</SelectItem>
                        <SelectItem value="taxable_reduced">Taxable—reduced rate</SelectItem>
                        <SelectItem value="non_taxable">Non-taxable</SelectItem>
                        <SelectItem value="exempt">Tax exempt</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="pricing_unit" className="text-sm font-semibold text-slate-800">
                      Pricing unit<span className="text-red-500">*</span>
                    </Label>
                    <CustomSelectInput
                      value={formData.pricing_unit || ''}
                      onValueChange={(value) => handleChange('pricing_unit', value)}
                      options={[
                        { value: 'per_lb', label: 'Per Pound (lb)' },
                        { value: 'per_case', label: 'Per Case' },
                        { value: 'per_pallet', label: 'Per Pallet' },
                        { value: 'per_load', label: 'Per Load/Truckload' },
                        { value: 'by_packaging_type', label: 'By Packaging Type (Can/Bottle/Glass)' },
                        { value: 'flat_fee', label: 'Flat Fee' }
                      ]}
                      placeholder="Select pricing unit"
                      label="pricing unit"
                      className={`h-11 text-base ${errors.pricing_unit ? 'border-red-400' : 'border-slate-300'}`}
                      required
                    />
                    {errors.pricing_unit && (
                      <p className="text-xs text-red-500">{errors.pricing_unit}</p>
                    )}
                  </div>

                  {formData.pricing_unit === 'by_packaging_type' && (
                    <div className="space-y-2">
                      <Label htmlFor="packaging_type" className="text-sm font-semibold text-slate-800">Packaging type</Label>
                      <Select 
                        value={formData.packaging_type} 
                        onValueChange={(value) => handleChange('packaging_type', value)}
                      >
                        <SelectTrigger className="h-11 text-base border-slate-300">
                          <SelectValue placeholder="Select packaging type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="aluminum_cans">Aluminum Cans</SelectItem>
                          <SelectItem value="plastic_bottles">Plastic Bottles</SelectItem>
                          <SelectItem value="glass_bottles">Glass Bottles</SelectItem>
                          <SelectItem value="mixed_packaging">Mixed Packaging</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Purchasing */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-bold mb-6 text-slate-900">Purchasing</h3>
            <div className="flex items-center gap-3">
              <Checkbox
                id="i_purchase_service"
                checked={formData.i_purchase_service}
                onCheckedChange={(checked) => handleChange('i_purchase_service', checked)}
                className="w-5 h-5"
              />
              <Label htmlFor="i_purchase_service" className="text-base font-medium text-slate-800 cursor-pointer">
                I purchase this service from a vendor
              </Label>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between pt-4 border-t">
          <div>
            {editingService && (
              <Button 
                variant="destructive" 
                onClick={onDelete}
                disabled={isDeleting}
                className="h-11 px-6"
              >
                {isDeleting ? 'Deleting...' : 'Delete Service'}
              </Button>
            )}
          </div>
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isSaving || isDeleting}
              className="h-11 px-6"
            >
              Cancel
            </Button>
            <Button 
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (!isSaving && !isDeleting) {
                  onSave();
                }
              }}
              disabled={isSaving || isDeleting}
              className="h-11 px-8 bg-green-600 hover:bg-green-700 disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </div>
      </DialogContent>

      {/* Toast */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className={`fixed bottom-8 right-8 px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 z-50 ${
              toastType === 'success' 
                ? 'bg-emerald-600 text-white' 
                : 'bg-red-600 text-white'
            }`}
          >
            <CheckCircle className="w-5 h-5" />
            <span className="font-medium">{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </Dialog>
  );
}