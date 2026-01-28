// app/settings/company/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/redux/store';
import { fetchCompanyInfo, saveCompanyInfo } from '@/redux/slices/companyInfoSlice';
import { motion, AnimatePresence } from "framer-motion";
import { Pencil, Building2, CheckCircle,HelpCircle,X, TrendingUp,CreditCard, Landmark, FileText, ShoppingCart, Clock, SettingsIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// ────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────
interface CompanyFormData {
  legal_company_name: string;
  dba_name: string;
  ein: string;
  business_phone: string;
  business_email: string;
  website: string;
  street_address: string;
  city: string;
  state: string;
  zip_code: string;
  country: string;
  company_logo_url: string;
  logo_placement: "header" | "letterhead";
  authorized_signer_name: string;
  authorized_signer_title: string;
  signature_image_url: string;
}

type EditingSection =
  | "company_info"
  | "legal_info"
  | "customer_contact"
  | "logo"
  | null;

// ────────────────────────────────────────────────
// Main Component
// ────────────────────────────────────────────────
export default function CompanySettingsPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { companyInfo, loading } = useSelector((state: RootState) => state.companyInfo);

  const [formData, setFormData] = useState<CompanyFormData>({
    legal_company_name: "",
    dba_name: "",
    ein: "",
    business_phone: "",
    business_email: "",
    website: "",
    street_address: "",
    city: "",
    state: "",
    zip_code: "",
    country: "",
    company_logo_url: "",
    logo_placement: "header",
    authorized_signer_name: "",
    authorized_signer_title: "",
    signature_image_url: "",
  });

  const [pendingChanges, setPendingChanges] = useState<Partial<CompanyFormData>>({});
  const [editingSection, setEditingSection] = useState<EditingSection>(null);
  const [editFormData, setEditFormData] = useState<Partial<CompanyFormData>>({});
  const [errors, setErrors] = useState<Partial<Record<keyof CompanyFormData, string>>>({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [activeSection, setActiveSection] = useState('company');

  useEffect(() => {
    dispatch(fetchCompanyInfo());
  }, [dispatch]);

  useEffect(() => {
    if (companyInfo) {
      const mappedData: CompanyFormData = {
        legal_company_name: companyInfo.name || "",
        dba_name: "",
        ein: companyInfo.ein_ssn || "",
        business_phone: companyInfo.phone || "",
        business_email: companyInfo.email || "",
        website: companyInfo.website || "",
        street_address: companyInfo.address || "",
        city: companyInfo.city || "",
        state: companyInfo.state || "",
        zip_code: companyInfo.zip || "",
        country: "",
        company_logo_url: companyInfo.company_logo_url || "",
        logo_placement: "header",
        authorized_signer_name: "",
        authorized_signer_title: "",
        signature_image_url: "",
      };
      setFormData(mappedData);
      setPendingChanges({});
    }
  }, [companyInfo]);

  const navItems = [
      { id: 'company', label: 'Company', icon: Building2 },
      { id: 'usage', label: 'Usage', icon: TrendingUp },
      { id: 'payments', label: 'Payments', icon: CreditCard },
      { id: 'lending', label: 'Lending', icon: Landmark },
      { id: 'accounting', label: 'Accounting', icon: FileText },
      { id: 'sales', label: 'Sales', icon: ShoppingCart },
      { id: 'expenses', label: 'Expenses', icon: CreditCard },
      { id: 'time', label: 'Time', icon: Clock },
      { id: 'advanced', label: 'Advanced', icon: SettingsIcon }
    ];
  // ── Open edit dialog for a section ────────────────────────
  const handleEditSection = (
    section: EditingSection,
    fields: (keyof CompanyFormData)[],
  ) => {
    setEditingSection(section);
    const sectionData: Partial<CompanyFormData> = {};
    fields.forEach((field) => {
      if (field === 'logo_placement') {
        sectionData[field] = formData[field] || "header";
      } else {
        sectionData[field] = formData[field] || "";
      }
    });
    setEditFormData(sectionData);
  };

  // ── Save Changes in dialog: update preview only ───────────
  const handleSaveSection = () => {
    const newErrors: typeof errors = {};

    if (editingSection === "company_info" || editingSection === "legal_info") {
      if (!editFormData.legal_company_name?.trim()) {
        newErrors.legal_company_name = "Company name is required";
      }
      if (!editFormData.street_address?.trim()) {
        newErrors.street_address = "Street address is required";
      }
      if (!editFormData.city?.trim()) newErrors.city = "City is required";
      if (!editFormData.state?.trim()) newErrors.state = "State is required";
      if (!editFormData.zip_code?.trim()) {
        newErrors.zip_code = "ZIP is required";
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Update preview
    setFormData((prev) => ({ ...prev, ...editFormData }));

    // Accumulate changes for final save
    setPendingChanges((prev) => ({ ...prev, ...editFormData }));

    setEditingSection(null);
    setErrors({});
  };

  // ── Final save on "Done" click ────────────────────────────
  const handleFinalSave = async () => {
    if (Object.keys(pendingChanges).length === 0) {
      return;
    }

    const companyData = {
      name: formData.legal_company_name || "",
      address: formData.street_address || "",
      city: formData.city || "",
      state: formData.state || "",
      zip: formData.zip_code || "",
      email: formData.business_email || "",
      phone: formData.business_phone || "",
      website: formData.website || "",
      ein_ssn: formData.ein || "",
      company_logo_url: formData.company_logo_url || "",
    };

    try {
      await dispatch(saveCompanyInfo(companyData)).unwrap();
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2200);
      setPendingChanges({});

    } catch (error) {
      console.error('Error saving company settings:', error);
      // Optionally: show error message to user
    }
  };

  const handleCancelEdit = () => {
    setEditingSection(null);
    setEditFormData({});
    setErrors({});
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50/70 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-500">Loading company settings...</p>
        </div>
      </div>
    );
  }

  const hasPendingChanges = Object.keys(pendingChanges).length > 0;

  return (
    <div className="flex min-h-screen bg-slate-50 mt-5">
         <div className="w-64 bg-slate-100 border-r border-slate-200 flex-shrink-0">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold text-slate-900">Settings</h2>
                    <div className="flex gap-2">
                      <button className="p-1 hover:bg-slate-200 rounded">
                        <HelpCircle className="w-5 h-5 text-slate-600" />
                      </button>
                      <button className="p-1 hover:bg-slate-200 rounded">
                        <X className="w-5 h-5 text-slate-600" />
                      </button>
                    </div>
                  </div>
                  <nav className="space-y-1">
                    {navItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.id}
                          onClick={() => setActiveSection(item.id)}
                          className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-left transition-colors ${
                            activeSection === item.id
                              ? 'bg-white text-slate-900 font-medium shadow-sm'
                              : 'text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                          <span className="text-sm">{item.label}</span>
                        </button>
                      );
                    })}
                  </nav>
                </div>
              </div>
      
      <div className="flex-1 overflow-y-auto">
        {/* Header */}
      
        {/* Logo Section */}
        <div className="mb-12 flex flex-col items-center">
          <div className="group relative">
            {formData.company_logo_url ? (
              <img
                src={formData.company_logo_url}
                alt="Company Logo"
                className="h-28 w-28 rounded-xl object-contain ring-1 ring-slate-200"
              />
            ) : (
              <div className="flex h-28 w-28 items-center justify-center rounded-xl bg-slate-100 text-slate-400 ring-1 ring-slate-200">
                <Building2 size={48} />
              </div>
            )}

            <button
              onClick={() => handleEditSection("logo", ["company_logo_url"])}
              className="absolute -bottom-2 -right-2 rounded-full bg-white p-2 shadow-md ring-1 ring-slate-200 transition hover:bg-slate-50"
            >
              <Pencil size={16} className="text-slate-600" />
            </button>
          </div>
          <p className="mt-3 text-sm text-slate-500">
            Click pencil to change logo
          </p>
        </div>

        {/* COMPANY INFO CARD */}
        <div className="mb-8 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-6 py-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Company Info
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                This info may be connected to the Business Network or used for billing purposes.
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 text-blue-600 hover:bg-blue-50 hover:text-blue-700"
              onClick={() =>
                handleEditSection("company_info", [
                  "legal_company_name",
                  "street_address",
                  "city",
                  "state",
                  "zip_code",
                  "business_email",
                  "business_phone",
                  "website",
                ])
              }
            >
              <Pencil size={14} />
              Edit
            </Button>
          </div>

          <div className="divide-y divide-slate-100">
            <div className="flex justify-between px-6 py-4">
              <span className="text-slate-600">Legal Business Name</span>
              <span className="font-medium text-slate-900">
                {formData.legal_company_name || "—"}
              </span>
            </div>
            <div className="flex justify-between px-6 py-4">
              <span className="text-slate-600">Address</span>
              <div className="text-right">
                <div className="font-medium text-slate-900">
                  {formData.street_address || "—"}
                </div>
                <div className="text-slate-700">
                  {formData.city && `${formData.city}, `}
                  {formData.state} {formData.zip_code}
                </div>
              </div>
            </div>
            <div className="flex justify-between px-6 py-4">
              <span className="text-slate-600">Email</span>
              <span className="font-medium text-slate-900">
                {formData.business_email || "—"}
              </span>
            </div>
            <div className="flex justify-between px-6 py-4">
              <span className="text-slate-600">Phone</span>
              <span className="font-medium text-slate-900">
                {formData.business_phone || "—"}
              </span>
            </div>
            <div className="flex justify-between px-6 py-4">
              <span className="text-slate-600">Website</span>
              <a
                href={formData.website}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-blue-600 hover:underline"
              >
                {formData.website || "—"}
              </a>
            </div>
          </div>
        </div>

        {/* LEGAL INFO CARD */}
        <div className="mb-8 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-6 py-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Legal Info
              </h2>
              <p className="mt-1 text-sm text-slate-500">
              This is the info your business uses for tax purposes.
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 text-blue-600 hover:bg-blue-50 hover:text-blue-700"
              onClick={() =>
                handleEditSection("legal_info", [
                  "legal_company_name",
                  "ein",
                  "street_address",
                  "city",
                  "state",
                  "zip_code",
                ])
              }
            >
              <Pencil size={14} />
              Edit
            </Button>
          </div>

          <div className="divide-y divide-slate-100">
            <div className="flex justify-between px-6 py-4">
              <span className="text-slate-600">Legal Business Name</span>
              <span className="font-medium text-slate-900">
                {formData.legal_company_name || "—"}
              </span>
            </div>
            <div className="flex justify-between px-6 py-4">
              <span className="text-slate-600">EIN / Tax ID</span>
              <span className="font-medium text-slate-900">
                {formData.ein ? `•••-••${formData.ein.slice(-4)}` : "—"}
              </span>
            </div>
            <div className="flex justify-between px-6 py-4">
              <span className="text-slate-600">Legal Address</span>
              <div className="text-right">
                <div className="font-medium text-slate-900">
                  {formData.street_address || "—"}
                </div>
                <div className="text-slate-700">
                  {formData.city && `${formData.city}, `}
                  {formData.state} {formData.zip_code}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CUSTOMER CONTACT INFO CARD */}
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-6 py-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Customer Contact Info
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                This is how customers get in touch with you.
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 text-blue-600 hover:bg-blue-50 hover:text-blue-700"
              onClick={() =>
                handleEditSection("customer_contact", ["business_email"])
              }
            >
              <Pencil size={14} />
              Edit
            </Button>
          </div>

          <div className="divide-y divide-slate-100">
            <div className="flex justify-between px-6 py-4">
              <span className="text-slate-600">Customer Email</span>
              <span className="font-medium text-slate-900">
                {formData.business_email || "—"}
              </span>
            </div>
            <div className="flex justify-between px-6 py-4">
              <span className="text-slate-600">Customer Mailing Address</span>
              <span className="text-slate-500">Not set</span>
            </div>
          </div>
        </div>

        {/* Floating Success Toast */}
        <AnimatePresence>
          {showSuccess && (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              className="fixed bottom-8 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-lg bg-emerald-600 px-6 py-3.5 text-white shadow-2xl"
            >
              <CheckCircle size={20} />
              <span className="font-medium">Company settings saved successfully</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Edit Dialog */}
        <Dialog
          open={!!editingSection}
          onOpenChange={(open) => !open && handleCancelEdit()}
        >
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-xl">
                Edit{" "}
                {editingSection
                  ?.replace("_", " ")
                  .replace(/\b\w/g, (l) => l.toUpperCase())}
              </DialogTitle>
            </DialogHeader>

            <div className="mt-6 space-y-5">
              {editingSection === "logo" && (
                <div className="space-y-2">
                  <Label>Company Logo URL</Label>
                  <Input
                    value={editFormData.company_logo_url || ""}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        company_logo_url: e.target.value,
                      })
                    }
                    placeholder="https://..."
                  />
                  <p className="text-xs text-slate-500">
                    Use a square or wide logo with transparent background for best results.
                  </p>
                </div>
              )}

              {editingSection === "company_info" && (
                <>
                  <div className="space-y-2">
                    <Label>Company Name *</Label>
                    <Input
                      value={editFormData.legal_company_name || ""}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          legal_company_name: e.target.value,
                        })
                      }
                    />
                    {errors.legal_company_name && (
                      <p className="text-sm text-red-600">{errors.legal_company_name}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Street Address *</Label>
                    <Input
                      value={editFormData.street_address || ""}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          street_address: e.target.value,
                        })
                      }
                    />
                    {errors.street_address && (
                      <p className="text-sm text-red-600">{errors.street_address}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>City</Label>
                      <Input
                        value={editFormData.city || ""}
                        onChange={(e) =>
                          setEditFormData({
                            ...editFormData,
                            city: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>State</Label>
                      <Input
                        value={editFormData.state || ""}
                        onChange={(e) =>
                          setEditFormData({
                            ...editFormData,
                            state: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>ZIP</Label>
                      <Input
                        value={editFormData.zip_code || ""}
                        onChange={(e) =>
                          setEditFormData({
                            ...editFormData,
                            zip_code: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Business Email</Label>
                    <Input
                      type="email"
                      value={editFormData.business_email || ""}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          business_email: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Business Phone</Label>
                    <Input
                      value={editFormData.business_phone || ""}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          business_phone: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Website</Label>
                    <Input
                      value={editFormData.website || ""}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          website: e.target.value,
                        })
                      }
                      placeholder="https://..."
                    />
                  </div>
                </>
              )}

              {editingSection === "legal_info" && (
                <>
                  <div className="space-y-2">
                    <Label>Legal Business Name *</Label>
                    <Input
                      value={editFormData.legal_company_name || ""}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          legal_company_name: e.target.value,
                        })
                      }
                    />
                    {errors.legal_company_name && (
                      <p className="text-sm text-red-600">{errors.legal_company_name}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>EIN</Label>
                    <Input
                      value={editFormData.ein || ""}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          ein: e.target.value,
                        })
                      }
                      placeholder="12-3456789"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Legal Address</Label>
                    <Input
                      value={editFormData.street_address || ""}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          street_address: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>City</Label>
                      <Input
                        value={editFormData.city || ""}
                        onChange={(e) =>
                          setEditFormData({
                            ...editFormData,
                            city: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>State</Label>
                      <Input
                        value={editFormData.state || ""}
                        onChange={(e) =>
                          setEditFormData({
                            ...editFormData,
                            state: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>ZIP</Label>
                      <Input
                        value={editFormData.zip_code || ""}
                        onChange={(e) =>
                          setEditFormData({
                            ...editFormData,
                            zip_code: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                </>
              )}

              {editingSection === "customer_contact" && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label className="text-base">Customer-facing Email</Label>
                    <p className="text-sm text-slate-500">
                      This email appears on invoices, estimates, and other customer documents.
                    </p>
                    <Input
                      type="email"
                      value={editFormData.business_email || ""}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          business_email: e.target.value,
                        })
                      }
                      placeholder="hello@yourcompany.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-base">Customer Address</Label>
                    <p className="text-sm text-slate-500">
                      The mailing address customers can send payments to. Shown on sales forms.
                    </p>
                    <Select>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select address" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Address">Address</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-8 flex justify-end gap-3">
              <Button variant="outline" onClick={handleCancelEdit}>
                Cancel
              </Button>
              <Button onClick={handleSaveSection}>Save Changes</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Done Button - Sticky */}
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-4">
         
          <Button
            className={`px-7 py-6 rounded-md shadow-lg font-medium ${
              hasPendingChanges
                ? "bg-green-600 hover:bg-green-700"
                : "bg-gray-500 hover:bg-gray-600"
            } text-white transition-colors`}
            onClick={handleFinalSave}
            disabled={loading}
          >
            {loading ? "Saving..." : hasPendingChanges ? "Save & Done" : "Done"}
          </Button>
        </div>
      </div>
    </div>
  );
}