"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/redux/store';
import { fetchEstimates, createEstimate, updateEstimate, deleteEstimate } from '@/redux/slices/estimatesSlice';
import { fetchCustomers } from '@/redux/slices/customersSlice';
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle } from "lucide-react";
import { useSearchParams } from "next/navigation";

/* UI Components */
import EstimateList from "@/components/estimates/EstimateList";
import EstimateHeader from "@/components/estimates/EstimateHeader";
import LineItemsSection from "@/components/estimates/LineItemsSection";
import OperationalChargesSection from "@/components/estimates/OperationalChargesSection";
import EstimateSummary from "@/components/estimates/EstimateSummary";
import CustomerNotesSection from "@/components/estimates/CustomerNotesSection";
import AssumptionsSection from "@/components/estimates/AssumptionsSection";
import EstimatesView from "@/components/portal/EstimatesView";

/* ======================================================
   TYPES
====================================================== */

interface Estimate {
  _id?: string;
  id?: string;
  estimate_number: string;
  customer_id: string;
  customer_name: string;
  estimate_status: "cancelled" | "sent" | "draft" | "accepted" | "expired";
  estimate_date: string;
  valid_until_date: string;
  destruction_type: string;
  primary_service_location_id: string;
  job_reference: string;
  internal_notes: string;
  estimated_volume_weight: string;
  allowed_variance: number;
  what_is_included: string;
  what_is_excluded: string;
  note_to_customer: string;
  memo_on_statement: string;
  subtotal: number;
  discount_amount: number;
  discount_type: "fixed" | "percentage";
  discount_value: number;
  taxable_subtotal: number;
  tax_amount: number;
  tax_rate: number;
  shipping_amount: number;
  total_amount: number;
}

interface Customer {
  _id?: string;
  id?: string;
  display_name?: string;
  legal_company_name?: string;
}

/* ======================================================
   PAGE
====================================================== */

function EstimatesPageContent(): React.JSX.Element {
  const dispatch = useDispatch<AppDispatch>();
  const { estimates, loading } = useSelector((state: RootState) => state.estimates);
  const { customers } = useSelector((state: RootState) => state.customers);
  const searchParams = useSearchParams();

  const [showForm, setShowForm] = useState(false);
  const [editingEstimate, setEditingEstimate] = useState<Estimate | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [selectedEstimateForView, setSelectedEstimateForView] = useState<Estimate | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [lineItemsTotal, setLineItemsTotal] = useState(0);
  const [chargesTotal, setChargesTotal] = useState(0);
  const [unsavedLineItems, setUnsavedLineItems] = useState([]);
  const [unsavedCharges, setUnsavedCharges] = useState([]);

  const locations: unknown[] = [];

  useEffect(() => {
    dispatch(fetchEstimates());
    dispatch(fetchCustomers());
  }, [dispatch]);

  const [formData, setFormData] = useState<Estimate>({
    estimate_number: "",
    customer_id: "",
    customer_name: "",
    estimate_status: "draft",
    estimate_date: new Date().toISOString().split("T")[0],
    valid_until_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // 30 days from now
    destruction_type: "",
    primary_service_location_id: "",
    job_reference: "",
    internal_notes: "",
    estimated_volume_weight: "",
    allowed_variance: 0,
    what_is_included: "",
    what_is_excluded: "",
    note_to_customer: "",
    memo_on_statement: "",
    subtotal: 0,
    discount_amount: 0,
    discount_type: "percentage",
    discount_value: 0,
    taxable_subtotal: 0,
    tax_amount: 0,
    tax_rate: 0,
    shipping_amount: 0,
    total_amount: 0,
  });

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    // Required fields
    if (!formData.customer_id?.trim()) {
      newErrors.customer_id = "Customer is required";
    }
    if (!formData.estimate_date?.trim()) {
      newErrors.estimate_date = "Estimate date is required";
    }
    if (!formData.valid_until_date?.trim()) {
      newErrors.valid_until_date = "Expiration date is required";
    }
    
    // Date validations
    if (formData.estimate_date?.trim()) {
      const estimateDate = new Date(formData.estimate_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (estimateDate > today) {
        newErrors.estimate_date = "Estimate date cannot be in the future";
      }
    }
    
    if (formData.valid_until_date?.trim() && formData.estimate_date?.trim()) {
      const validUntil = new Date(formData.valid_until_date);
      const estimateDate = new Date(formData.estimate_date);
      if (validUntil <= estimateDate) {
        newErrors.valid_until_date = "Expiration date must be after estimate date";
      }
    }
    
    // Numeric validations
    if (formData.allowed_variance < 0 || formData.allowed_variance > 100) {
      newErrors.allowed_variance = "Allowed variance must be between 0 and 100";
    }
    if (formData.tax_rate < 0 || formData.tax_rate > 100) {
      newErrors.tax_rate = "Tax rate must be between 0 and 100";
    }
    if (formData.discount_value < 0) {
      newErrors.discount_value = "Discount value cannot be negative";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFormDataChange = (newData: Estimate) => {
    setFormData(newData);
    // Clear errors for fields that have been filled
    const newErrors = { ...errors };
    Object.keys(newData).forEach(key => {
      if (newData[key as keyof Estimate] && newErrors[key]) {
        delete newErrors[key];
      }
    });
    setErrors(newErrors);
  };

  /* ======================================================
     HELPERS
  ====================================================== */

  const showToast = (message: string, isError = false): void => {
    setSuccessMessage(message);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  /* ======================================================
     ACTIONS
  ====================================================== */

  const handleAddNew = (): void => {
    const customerId = searchParams.get("customer_id");
    setEditingEstimate(null);
    setShowForm(true);

    if (customerId) {
      const customer = customers.find((c) => c._id === customerId || c.id === customerId);
      if (customer) {
        setFormData((prev) => ({
          ...prev,
          customer_id: customerId,
          customer_name:
            customer.legal_company_name || customer.display_name || "",
        }));
      }
    }
  }; 

  const handleCancel = (): void => {
    setShowForm(false);
    setEditingEstimate(null);
    setUnsavedLineItems([]);
    setUnsavedCharges([]);
    setErrors({});
  };

  const handleDelete = async (estimateId: string): Promise<void> => {
    try {
      await dispatch(deleteEstimate(estimateId)).unwrap();
      showToast("Estimate deleted successfully.");
      if (editingEstimate?.id === estimateId || editingEstimate?._id === estimateId) {
        setShowForm(false);
        setEditingEstimate(null);
      }
    } catch (error) {
      console.error('Failed to delete estimate:', error);
      showToast('Failed to delete estimate. Please try again.', true);
    }
  };

  const handleSave = async (): Promise<void> => {
    if (!validateForm()) {
      showToast('Please fix the validation errors before saving.', true);
      return;
    }

    try {
      if (editingEstimate?.id || editingEstimate?._id) {
        // Phase 2: Update existing estimate with line items and charges
        const estimateData = {
          ...formData,
          line_items: unsavedLineItems,
          operational_charges: unsavedCharges
        };
        
        const estimateId = (editingEstimate._id || editingEstimate.id) as string;
        await dispatch(updateEstimate({ id: estimateId, estimate: estimateData as Partial<Estimate> })).unwrap();
        showToast("Estimate updated successfully.");
        setShowForm(false);
        setEditingEstimate(null);
        setUnsavedLineItems([]);
        setUnsavedCharges([]);
        setErrors({});
      } else {
        // Phase 1: Create estimate with basic details only
        const basicEstimateData = {
          ...formData,
          // Don't include line items and charges in initial creation
        };
        
        const result = await dispatch(createEstimate(basicEstimateData as Partial<Estimate>)).unwrap();
        setEditingEstimate(result);
        showToast("Estimate created successfully. You can now add line items and charges.");
      }
    } catch (error) {
      console.error('Failed to save estimate:', error);
      showToast('Failed to save estimate. Please try again.', true);
    }
  };

  /* ======================================================
     UI
  ====================================================== */

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
      <div className="max-w-7xl mx-auto px-4 py-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Estimates</h1>
          {!showForm && (
            <button
              onClick={handleAddNew}
              className="h-10 px-6 bg-green-600 hover:bg-green-700 text-white rounded"
            >
              Create estimate
            </button>
          )}
        </div>

        <AnimatePresence mode="wait">
          {selectedEstimateForView ? (
            <motion.div
              key="estimate-view"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <button
                onClick={() => setSelectedEstimateForView(null)}
                className="mb-4 px-4 py-2 text-slate-600 hover:text-slate-900 flex items-center gap-2"
              >
                ← Back to Estimates
              </button>
              <EstimatesView 
                customerId={selectedEstimateForView.customer_id}
                selectedEstimate={selectedEstimateForView}
                onBack={() => setSelectedEstimateForView(null)}
              />
            </motion.div>
          ) : showForm ? (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <EstimateHeader
                data={formData}
                onChange={handleFormDataChange}
                customers={customers}
                locations={locations}
                errors={errors}
                isReadOnly={false}
              />

              {/* Always show basic sections */}
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-6">
                  <CustomerNotesSection
                    data={formData}
                    onChange={handleFormDataChange}
                  />
                  <AssumptionsSection
                    data={formData}
                    onChange={handleFormDataChange}
                    isReadOnly={false}
                  />
                </div>

                <EstimateSummary
                  data={formData}
                  onChange={handleFormDataChange}
                  lineItemsTotal={lineItemsTotal}
                  chargesTotal={chargesTotal}
                />
              </div>

              {/* Only show line items and charges AFTER estimate is created */}
              {editingEstimate && (
                <>
                  <LineItemsSection
                    estimateId={(editingEstimate._id || editingEstimate.id) as string}
                    onTotalChange={setLineItemsTotal}
                    isReadOnly={false}
                    estimateStatus={formData.estimate_status}
                    customerId={formData.customer_id}
                    unsavedLineItems={unsavedLineItems}
                    onUnsavedLineItemsChange={setUnsavedLineItems}
                  />

                  <OperationalChargesSection
                    estimateId={(editingEstimate._id || editingEstimate.id) as string}
                    onTotalChange={setChargesTotal}
                    isReadOnly={false}
                    unsavedCharges={unsavedCharges}
                    onUnsavedChargesChange={setUnsavedCharges}
                  />
                </>
              )}

              <div className="flex justify-end gap-3">
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 border rounded"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded"
                >
                  {editingEstimate ? "Update Estimate" : "Create Estimate"}
                </button>
                {editingEstimate && (
                  <button
                    onClick={() => {
                      setShowForm(false);
                      setEditingEstimate(null);
                      setUnsavedLineItems([]);
                      setUnsavedCharges([]);
                      setErrors({});
                    }}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
                  >
                    Done
                  </button>
                )}
              </div>
            </motion.div>
          ) : (
            <EstimateList
              estimates={estimates}
              customers={customers}
              isLoading={loading}
              onShowToast={showToast}
              onView={(estimate: Estimate) => {
                setSelectedEstimateForView(estimate);
              }}
              onEdit={(estimate: Estimate) => {
                setEditingEstimate(estimate);
                // Convert MongoDB _id to id and format dates for HTML inputs
                const estimateData = {
                  ...estimate,
                  id: estimate._id || estimate.id,
                  estimate_date: estimate.estimate_date ? new Date(estimate.estimate_date).toISOString().split('T')[0] : '',
                  valid_until_date: estimate.valid_until_date ? new Date(estimate.valid_until_date).toISOString().split('T')[0] : ''
                };
                setFormData(estimateData);
                // Load existing line items and charges
                setUnsavedLineItems((estimate as any).line_items || []);
                setUnsavedCharges((estimate as any).operational_charges || []);
                setShowForm(true);
              }}
              onDelete={handleDelete}
              onSend={() => {}}
              onAccept={() => {}}
              onConvert={() => {}}
            />
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
              <span className="font-medium">{successMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function EstimatesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 flex items-center justify-center"><div className="text-center"><div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" /><p className="text-slate-500">Loading...</p></div></div>}>
      <EstimatesPageContent />
    </Suspense>
  );
}
