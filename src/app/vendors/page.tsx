"use client";

import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { Building2, Plus, X, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AppDispatch, RootState } from "@/redux/store";
import { fetchVendors, createVendor, updateVendor } from "@/redux/slices/vendorsSlice";

import VendorList from "@/components/vendors/VendorList";
import VendorForm from "@/components/vendors/VendorForm";
import VendorPaymentStats from "@/components/vendors/VendorPaymentStats";
import VendorDetailView from "@/components/vendors/VendorDetailView";
import VendorExpenseHistory from "@/components/vendors/VendorExpenseHistory";
import VendorJobAssociations from "@/components/vendors/VendorJobAssociations";
import VendorPerformanceReport from "@/components/vendors/VendorPerformanceReport";
import VendorPurchaseOrders from "@/components/vendors/VendorPurchaseOrders";

/* ---------------- TYPES ---------------- */
export type Vendor = {
  _id?: string;
  vendor_name: string;
  contact_person: string;
  email: string;
  phone: string;
  address: string;
  payment_terms: string;
  vendor_category: string;
  tax_id: string;
  notes: string;
  vendor_status: "active" | "archived";
  user_id?: string;
};

export type Expense = {
  id: string;
  vendorId: string;
  vendor_id: string;
  amount: number;
  description: string;
  expense_date: string;
  expense_status: 'draft' | 'submitted' | 'approved' | 'archived';
  payment_status: 'not_ready' | 'pending' | 'scheduled' | 'paid';
  expense_type?: string;
  po_number?: string;
  po_status?: 'draft' | 'issued' | 'completed';
  job_id?: string;
  job_reference?: string;
  payment_date?: string;
};

/* ---------------- PAGE ---------------- */
export default function VendorsPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { vendors, loading, error } = useSelector((state: RootState) => state.vendors);
  
  // Mock expenses data for demonstration
  const [expenses] = useState<Expense[]>([
    {
      id: '1',
      vendorId: 'vendor1',
      vendor_id: 'vendor1',
      amount: 1500.00,
      description: 'Transportation services',
      expense_date: '2024-01-15',
      expense_status: 'approved',
      payment_status: 'paid',
      expense_type: 'transportation',
      po_number: 'PO-2024-001'
    },
    {
      id: '2', 
      vendorId: 'vendor1',
      vendor_id: 'vendor1',
      amount: 850.00,
      description: 'Equipment rental',
      expense_date: '2024-01-20',
      expense_status: 'approved', 
      payment_status: 'pending',
      expense_type: 'equipment_rental'
    }
  ]);

  const [showForm, setShowForm] = useState(false);
  const [showDetailView, setShowDetailView] = useState(false);

  const [viewingVendor, setViewingVendor] = useState<Vendor | null>(null);
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);

  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const [formData, setFormData] = useState<Vendor>({
    vendor_name: "",
    contact_person: "",
    email: "",
    phone: "",
    address: "",
    payment_terms: "net_30",
    vendor_category: "other",
    tax_id: "",
    notes: "",
    vendor_status: "active",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    dispatch(fetchVendors());
  }, [dispatch]);

  /* ---------------- HELPERS ---------------- */
  const resetForm = () => {
    setFormData({
      vendor_name: "",
      contact_person: "",
      email: "",
      phone: "",
      address: "",
      payment_terms: "net_30",
      vendor_category: "other",
      tax_id: "",
      notes: "",
      vendor_status: "active",
    });
  };

  const showToast = (message: string) => {
    setSuccessMessage(message);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.vendor_name.trim()) newErrors.vendor_name = "Vendor name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    if (!formData.phone.trim()) newErrors.phone = "Phone is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /* ---------------- ACTIONS ---------------- */
  const handleAddNew = () => {
    resetForm();
    setEditingVendor(null);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      if (editingVendor) {
        await dispatch(updateVendor({ id: editingVendor._id!, data: formData })).unwrap();
        showToast("Vendor updated successfully.");
      } else {
        await dispatch(createVendor(formData)).unwrap();
        showToast("Vendor created successfully.");
      }

      setShowForm(false);
      resetForm();
      setEditingVendor(null);
    } catch (error) {
      console.error('Save error:', error);
      alert('Failed to save vendor. Please try again.');
    }
  };

  const handleView = (vendor: Vendor) => {
    setViewingVendor(vendor);
    setShowDetailView(true);
  };

  const handleEdit = (vendor: Vendor) => {
    setEditingVendor(vendor);
    setFormData(vendor);
    setShowForm(true);
    setShowDetailView(false);
  };

  const handleArchive = async (vendor: Vendor) => {
    if (!confirm(`Archive ${vendor.vendor_name}?`)) return;

    try {
      await dispatch(updateVendor({ 
        id: vendor._id!, 
        data: { vendor_status: "archived" } 
      })).unwrap();
      showToast("Vendor archived successfully.");
    } catch (error) {
      console.error('Archive error:', error);
      alert('Failed to archive vendor. Please try again.');
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setShowDetailView(false);
    setViewingVendor(null);
    setEditingVendor(null);
    resetForm();
    setErrors({});
  };

  /* ---------------- DETAIL VIEW ---------------- */
  if (showDetailView && viewingVendor) {
    return (
      <VendorDetailView
        vendor={viewingVendor}
        expenses={expenses}
        onClose={() => {
          setShowDetailView(false);
          setViewingVendor(null);
        }}
        onEdit={handleEdit}
      />
    );
  }

  /* ---------------- UI ---------------- */
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-slate-900 rounded-2xl">
              <Building2 className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                Vendor Directory
              </h1>
              <p className="text-slate-500 mt-1">
                Manage vendors and track spending
              </p>
            </div>
          </div>

          {!showForm && (
            <Button
              onClick={handleAddNew}
              className="h-12 px-6 bg-slate-900 hover:bg-slate-800 gap-2"
            >
              <Plus className="w-5 h-5" />
              Add Vendor
            </Button>
          )}
        </div>

        {/* Form or List */}
        <AnimatePresence mode="wait">
          {showForm ? (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Form Header */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">
                    {editingVendor ? "Edit Vendor" : "New Vendor"}
                  </h2>
                  <p className="text-sm text-slate-500 mt-1">
                    {editingVendor
                      ? "Update vendor information"
                      : "Add a new vendor to your directory"}
                  </p>
                </div>
                <Button variant="ghost" size="icon" onClick={handleCancel}>
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Vendor Form */}
              <VendorForm
                data={formData}
                onChange={setFormData}
                errors={errors}
              />

              {editingVendor && (
                <VendorPaymentStats
                  vendorId={editingVendor._id!}
                  expenses={expenses}
                />
              )}

              {/* Actions */}
              <div className="flex justify-end gap-3 pb-8">
                <Button variant="outline" onClick={handleCancel} className="h-12 px-6">
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  className="h-12 px-6 bg-slate-900 hover:bg-slate-800"
                >
                  {editingVendor ? "Update Vendor" : "Create Vendor"}
                </Button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <VendorList
                vendors={vendors}
                expenses={expenses}
                onView={handleView}
                onArchive={handleArchive}
                isLoading={loading}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Success Toast */}
        <AnimatePresence>
          {showSuccess && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="fixed bottom-8 right-8 bg-emerald-600 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 z-50"
            >
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">
                {successMessage}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
