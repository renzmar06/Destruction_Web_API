import React, { useState, useEffect } from 'react';
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Building2, Mail, Phone, MapPin, Save, CheckCircle, Upload, DollarSign, Image as ImageIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ProfileView({ customer, user }) {
  const [isEditing, setIsEditing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [formData, setFormData] = useState({
    title: customer.title || '',
    first_name: customer.first_name || '',
    middle_name: customer.middle_name || '',
    last_name: customer.last_name || '',
    suffix: customer.suffix || '',
    legal_company_name: customer.legal_company_name || '',
    display_name: customer.display_name || '',
    email: customer.email || '',
    phone: customer.phone || '',
    mobile: customer.mobile || '',
    fax: customer.fax || '',
    website: customer.website || '',
    logo_url: customer.logo_url || '',
    billing_street_1: customer.billing_street_1 || '',
    billing_street_2: customer.billing_street_2 || '',
    billing_city: customer.billing_city || '',
    billing_state: customer.billing_state || '',
    billing_zip: customer.billing_zip || '',
    billing_country: customer.billing_country || 'USA',
    shipping_same_as_billing: customer.shipping_same_as_billing ?? true,
    shipping_street_1: customer.shipping_street_1 || '',
    shipping_street_2: customer.shipping_street_2 || '',
    shipping_city: customer.shipping_city || '',
    shipping_state: customer.shipping_state || '',
    shipping_zip: customer.shipping_zip || '',
    shipping_country: customer.shipping_country || 'USA',
    bank_account_holder: customer.bank_account_holder || '',
    bank_name: customer.bank_name || '',
    bank_routing_number: customer.bank_routing_number || '',
    bank_account_number: customer.bank_account_number || '',
    bank_account_type: customer.bank_account_type || 'checking'
  });

  const [uploading, setUploading] = useState(false);

  const queryClient = useQueryClient();

  useEffect(() => {
    setFormData({
      title: customer.title || '',
      first_name: customer.first_name || '',
      middle_name: customer.middle_name || '',
      last_name: customer.last_name || '',
      suffix: customer.suffix || '',
      legal_company_name: customer.legal_company_name || '',
      display_name: customer.display_name || '',
      email: customer.email || '',
      phone: customer.phone || '',
      mobile: customer.mobile || '',
      fax: customer.fax || '',
      website: customer.website || '',
      logo_url: customer.logo_url || '',
      billing_street_1: customer.billing_street_1 || '',
      billing_street_2: customer.billing_street_2 || '',
      billing_city: customer.billing_city || '',
      billing_state: customer.billing_state || '',
      billing_zip: customer.billing_zip || '',
      billing_country: customer.billing_country || 'USA',
      shipping_same_as_billing: customer.shipping_same_as_billing ?? true,
      shipping_street_1: customer.shipping_street_1 || '',
      shipping_street_2: customer.shipping_street_2 || '',
      shipping_city: customer.shipping_city || '',
      shipping_state: customer.shipping_state || '',
      shipping_zip: customer.shipping_zip || '',
      shipping_country: customer.shipping_country || 'USA',
      bank_account_holder: customer.bank_account_holder || '',
      bank_name: customer.bank_name || '',
      bank_routing_number: customer.bank_routing_number || '',
      bank_account_number: customer.bank_account_number || '',
      bank_account_type: customer.bank_account_type || 'checking'
    });
  }, [customer]);

  const updateProfileMutation = useMutation({
    mutationFn: (data) => base44.entities.Customer.update(customer.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      setIsEditing(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    updateProfileMutation.mutate(formData);
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const response = await base44.integrations.Core.UploadFile({ file });
      const fileUrl = response.file_url || response.data?.file_url;
      if (fileUrl) {
        setFormData({...formData, logo_url: fileUrl});
      } else {
        throw new Error('No file URL returned from upload');
      }
    } catch (error) {
      alert('Failed to upload logo: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      title: customer.title || '',
      first_name: customer.first_name || '',
      middle_name: customer.middle_name || '',
      last_name: customer.last_name || '',
      suffix: customer.suffix || '',
      legal_company_name: customer.legal_company_name || '',
      display_name: customer.display_name || '',
      email: customer.email || '',
      phone: customer.phone || '',
      mobile: customer.mobile || '',
      fax: customer.fax || '',
      website: customer.website || '',
      logo_url: customer.logo_url || '',
      billing_street_1: customer.billing_street_1 || '',
      billing_street_2: customer.billing_street_2 || '',
      billing_city: customer.billing_city || '',
      billing_state: customer.billing_state || '',
      billing_zip: customer.billing_zip || '',
      billing_country: customer.billing_country || 'USA',
      shipping_same_as_billing: customer.shipping_same_as_billing ?? true,
      shipping_street_1: customer.shipping_street_1 || '',
      shipping_street_2: customer.shipping_street_2 || '',
      shipping_city: customer.shipping_city || '',
      shipping_state: customer.shipping_state || '',
      shipping_zip: customer.shipping_zip || '',
      shipping_country: customer.shipping_country || 'USA',
      bank_account_holder: customer.bank_account_holder || '',
      bank_name: customer.bank_name || '',
      bank_routing_number: customer.bank_routing_number || '',
      bank_account_number: customer.bank_account_number || '',
      bank_account_type: customer.bank_account_type || 'checking'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">My Profile</h2>
          <p className="text-slate-600 mt-1">Manage your account information</p>
        </div>
        {!isEditing && (
          <Button onClick={() => setIsEditing(true)} className="gap-2">
            <User className="w-4 h-4" />
            Edit Profile
          </Button>
        )}
      </div>

      {/* Success Message */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3"
          >
            <CheckCircle className="w-5 h-5 text-green-600" />
            <p className="text-green-900 font-medium">Profile updated successfully!</p>
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Information */}
        <Card>
          <CardHeader className="bg-gradient-to-r from-blue-50 to-white border-b">
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5 text-blue-600" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="grid grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="Mr., Mrs., Dr."
                  disabled={!isEditing}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="first_name">First Name</Label>
                <Input
                  id="first_name"
                  value={formData.first_name}
                  onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                  disabled={!isEditing}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="middle_name">Middle Name</Label>
                <Input
                  id="middle_name"
                  value={formData.middle_name}
                  onChange={(e) => setFormData({...formData, middle_name: e.target.value})}
                  disabled={!isEditing}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last_name">Last Name</Label>
                <Input
                  id="last_name"
                  value={formData.last_name}
                  onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                  disabled={!isEditing}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Company Information */}
        <Card>
          <CardHeader className="bg-gradient-to-r from-indigo-50 to-white border-b">
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-indigo-600" />
              Company Information
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="legal_company_name">Legal Company Name</Label>
                <Input
                  id="legal_company_name"
                  value={formData.legal_company_name}
                  onChange={(e) => setFormData({...formData, legal_company_name: e.target.value})}
                  disabled={!isEditing}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="display_name">Display Name</Label>
                <Input
                  id="display_name"
                  value={formData.display_name}
                  onChange={(e) => setFormData({...formData, display_name: e.target.value})}
                  disabled={!isEditing}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData({...formData, website: e.target.value})}
                  placeholder="https://example.com"
                  disabled={!isEditing}
                />
              </div>
            </div>

            {/* Company Logo */}
            <div className="border-t pt-4 space-y-3">
              <Label>Company Logo</Label>
              {formData.logo_url && (
                <div className="flex items-center gap-4">
                  <img 
                    src={formData.logo_url} 
                    alt="Company Logo" 
                    className="h-20 w-20 object-contain border border-slate-200 rounded-lg p-2"
                  />
                  {isEditing && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setFormData({...formData, logo_url: ''})}
                    >
                      Remove
                    </Button>
                  )}
                </div>
              )}
              {isEditing && (
                <div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                    id="logo-upload"
                    disabled={uploading}
                  />
                  <label htmlFor="logo-upload">
                    <Button
                      type="button"
                      variant="outline"
                      asChild
                      disabled={uploading}
                    >
                      <span className="cursor-pointer gap-2">
                        <Upload className="w-4 h-4" />
                        {uploading ? 'Uploading...' : formData.logo_url ? 'Change Logo' : 'Upload Logo'}
                      </span>
                    </Button>
                  </label>
                  <p className="text-xs text-slate-500 mt-2">
                    Recommended: Square image, at least 200x200px
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader className="bg-gradient-to-r from-green-50 to-white border-b">
            <CardTitle className="flex items-center gap-2">
              <Phone className="w-5 h-5 text-green-600" />
              Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  disabled={!isEditing}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  disabled={!isEditing}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mobile">Mobile</Label>
                <Input
                  id="mobile"
                  type="tel"
                  value={formData.mobile}
                  onChange={(e) => setFormData({...formData, mobile: e.target.value})}
                  disabled={!isEditing}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fax">Fax</Label>
                <Input
                  id="fax"
                  type="tel"
                  value={formData.fax}
                  onChange={(e) => setFormData({...formData, fax: e.target.value})}
                  disabled={!isEditing}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Billing Address */}
        <Card>
          <CardHeader className="bg-gradient-to-r from-purple-50 to-white border-b">
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-purple-600" />
              Billing Address
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="billing_street_1">Street Address</Label>
              <Input
                id="billing_street_1"
                value={formData.billing_street_1}
                onChange={(e) => setFormData({...formData, billing_street_1: e.target.value})}
                disabled={!isEditing}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="billing_street_2">Street Address 2</Label>
              <Input
                id="billing_street_2"
                value={formData.billing_street_2}
                onChange={(e) => setFormData({...formData, billing_street_2: e.target.value})}
                placeholder="Apt, Suite, Unit, etc."
                disabled={!isEditing}
              />
            </div>
            <div className="grid grid-cols-4 gap-4">
              <div className="col-span-2 space-y-2">
                <Label htmlFor="billing_city">City</Label>
                <Input
                  id="billing_city"
                  value={formData.billing_city}
                  onChange={(e) => setFormData({...formData, billing_city: e.target.value})}
                  disabled={!isEditing}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="billing_state">State</Label>
                <Input
                  id="billing_state"
                  value={formData.billing_state}
                  onChange={(e) => setFormData({...formData, billing_state: e.target.value})}
                  disabled={!isEditing}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="billing_zip">ZIP Code</Label>
                <Input
                  id="billing_zip"
                  value={formData.billing_zip}
                  onChange={(e) => setFormData({...formData, billing_zip: e.target.value})}
                  disabled={!isEditing}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Financial Information */}
        <Card>
          <CardHeader className="bg-gradient-to-r from-emerald-50 to-white border-b">
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-emerald-600" />
              Financial Information
            </CardTitle>
            <p className="text-sm text-slate-600 mt-2">
              Provide your bank details to receive automatic payouts for completed invoices
            </p>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-blue-900">
                <strong>Secure Information:</strong> Your financial details are encrypted and only used for processing payouts.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bank_account_holder">Account Holder Name</Label>
                <Input
                  id="bank_account_holder"
                  value={formData.bank_account_holder}
                  onChange={(e) => setFormData({...formData, bank_account_holder: e.target.value})}
                  placeholder="Full name on account"
                  disabled={!isEditing}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bank_name">Bank Name</Label>
                <Input
                  id="bank_name"
                  value={formData.bank_name}
                  onChange={(e) => setFormData({...formData, bank_name: e.target.value})}
                  placeholder="e.g., Chase Bank"
                  disabled={!isEditing}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bank_routing_number">Routing Number</Label>
                <Input
                  id="bank_routing_number"
                  value={formData.bank_routing_number}
                  onChange={(e) => setFormData({...formData, bank_routing_number: e.target.value})}
                  placeholder="9 digits"
                  maxLength={9}
                  disabled={!isEditing}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bank_account_number">Account Number</Label>
                <Input
                  id="bank_account_number"
                  type={isEditing ? "text" : "password"}
                  value={formData.bank_account_number}
                  onChange={(e) => setFormData({...formData, bank_account_number: e.target.value})}
                  placeholder="Account number"
                  disabled={!isEditing}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bank_account_type">Account Type</Label>
                <select
                  id="bank_account_type"
                  value={formData.bank_account_type}
                  onChange={(e) => setFormData({...formData, bank_account_type: e.target.value})}
                  disabled={!isEditing}
                  className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm disabled:opacity-50"
                >
                  <option value="checking">Checking</option>
                  <option value="savings">Savings</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Shipping Address */}
        <Card>
          <CardHeader className="bg-gradient-to-r from-amber-50 to-white border-b">
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-amber-600" />
              Shipping Address
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <input
                type="checkbox"
                id="shipping_same_as_billing"
                checked={formData.shipping_same_as_billing}
                onChange={(e) => setFormData({...formData, shipping_same_as_billing: e.target.checked})}
                disabled={!isEditing}
                className="rounded"
              />
              <Label htmlFor="shipping_same_as_billing" className="cursor-pointer">
                Same as billing address
              </Label>
            </div>

            {!formData.shipping_same_as_billing && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="shipping_street_1">Street Address</Label>
                  <Input
                    id="shipping_street_1"
                    value={formData.shipping_street_1}
                    onChange={(e) => setFormData({...formData, shipping_street_1: e.target.value})}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="shipping_street_2">Street Address 2</Label>
                  <Input
                    id="shipping_street_2"
                    value={formData.shipping_street_2}
                    onChange={(e) => setFormData({...formData, shipping_street_2: e.target.value})}
                    placeholder="Apt, Suite, Unit, etc."
                    disabled={!isEditing}
                  />
                </div>
                <div className="grid grid-cols-4 gap-4">
                  <div className="col-span-2 space-y-2">
                    <Label htmlFor="shipping_city">City</Label>
                    <Input
                      id="shipping_city"
                      value={formData.shipping_city}
                      onChange={(e) => setFormData({...formData, shipping_city: e.target.value})}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="shipping_state">State</Label>
                    <Input
                      id="shipping_state"
                      value={formData.shipping_state}
                      onChange={(e) => setFormData({...formData, shipping_state: e.target.value})}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="shipping_zip">ZIP Code</Label>
                    <Input
                      id="shipping_zip"
                      value={formData.shipping_zip}
                      onChange={(e) => setFormData({...formData, shipping_zip: e.target.value})}
                      disabled={!isEditing}
                    />
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        {isEditing && (
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={updateProfileMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={updateProfileMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700 gap-2"
            >
              <Save className="w-4 h-4" />
              {updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        )}
      </form>
    </div>
  );
}