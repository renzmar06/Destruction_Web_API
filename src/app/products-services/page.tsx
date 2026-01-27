"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Package, CheckCircle, XCircle } from "lucide-react";
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/redux/store';
import { fetchServices, createService, updateService, deleteService } from '@/redux/slices/servicesSlice';
import ServiceList from "@/components/services/ServiceList";
import ServiceFormModal from "@/components/services/ServiceFormModal";

/* ---------------- TYPES ---------------- */
export type Service = {
  _id?: string;
  id?: string;
  service_name: string;
  item_type: string;
  service_category: string;
  description: string;
  pricing_unit: string;
  default_rate: number;
  packaging_type: string;
  estimated_cost_per_unit: number;
  expected_margin_percent: number;
  internal_notes: string;
  is_taxable: boolean;
  include_by_default_on_estimates: boolean;
  allow_price_override_on_invoice: boolean;
  service_status: "active" | "inactive";
  sku: string;
  image_url: string;
  i_sell_service: boolean;
  i_purchase_service: boolean;
  income_account: string;
  sales_tax_category: string;
};

/* ---------------- PAGE ---------------- */
export default function ProductsServicesPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { services, loading, error } = useSelector((state: RootState) => state.services);
  
  const [showForm, setShowForm] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [clearFilters, setClearFilters] = useState<(() => void) | null>(null);
  const [toast, setToast] = useState<{message: string; type: 'success' | 'error'} | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<Service>({
    service_name: "",
    item_type: "service",
    service_category: "",
    description: "",
    pricing_unit: "per_lb",
    default_rate: 0,
    packaging_type: "",
    estimated_cost_per_unit: 0,
    expected_margin_percent: 0,
    internal_notes: "",
    is_taxable: true,
    include_by_default_on_estimates: false,
    allow_price_override_on_invoice: true,
    service_status: "active",
    sku: "",
    image_url: "",
    i_sell_service: true,
    i_purchase_service: false,
    income_account: "services",
    sales_tax_category: "taxable_standard",
  });

  useEffect(() => {
    dispatch(fetchServices());
  }, [dispatch]);

  /* ---------------- HELPERS ---------------- */
  const showToast = (msg: string, isError = false) => {
    setToast({ message: msg, type: isError ? 'error' : 'success' });
    setTimeout(() => setToast(null), 3000);
  };

  const resetForm = () => {
    setFormData({
      service_name: "",
      item_type: "service",
      service_category: "",
      description: "",
      pricing_unit: "per_lb",
      default_rate: 0,
      packaging_type: "",
      estimated_cost_per_unit: 0,
      expected_margin_percent: 0,
      internal_notes: "",
      is_taxable: true,
      include_by_default_on_estimates: false,
      allow_price_override_on_invoice: true,
      service_status: "active",
      sku: "",
      image_url: "",
      i_sell_service: true,
      i_purchase_service: false,
      income_account: "services",
      sales_tax_category: "taxable_standard",
    });
    setErrors({});
  };

  /* ---------------- ACTIONS ---------------- */
  const handleAddNew = () => {
    resetForm();
    setEditingService(null);
    setShowForm(true);
  };

  const handleFormChange = (newFormData: Service) => {
    setFormData(newFormData);
    // Clear errors for fields that are being modified
    if (errors && Object.keys(errors).length > 0) {
      const newErrors = { ...errors };
      Object.keys(newFormData).forEach(key => {
        if (newFormData[key as keyof Service] !== formData[key as keyof Service]) {
          delete newErrors[key];
        }
      });
      setErrors(newErrors);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    // Required fields
    if (!formData.service_name?.trim()) {
      newErrors.service_name = "Service name is required";
    }
    if (!formData.service_category?.trim()) {
      newErrors.service_category = "Service category is required";
    }
    
    // Sales validation (when selling service)
    if (formData.i_sell_service) {
      if (!formData.pricing_unit?.trim()) {
        newErrors.pricing_unit = "Pricing unit is required when selling service";
      }
      if (!formData.income_account?.trim()) {
        newErrors.income_account = "Income account is required when selling service";
      }
      if (!formData.default_rate || formData.default_rate <= 0) {
        newErrors.default_rate = "Price/rate must be greater than 0";
      }
      if (formData.default_rate && formData.default_rate > 999999) {
        newErrors.default_rate = "Price/rate cannot exceed $999,999";
      }
    }
    
    // Numeric validations
    if (formData.estimated_cost_per_unit && formData.estimated_cost_per_unit < 0) {
      newErrors.estimated_cost_per_unit = "Cost cannot be negative";
    }
    if (formData.expected_margin_percent && (formData.expected_margin_percent < 0 || formData.expected_margin_percent > 100)) {
      newErrors.expected_margin_percent = "Margin must be between 0-100%";
    }
    
    // SKU validation (if provided)
    if (formData.sku && formData.sku.length > 50) {
      newErrors.sku = "SKU cannot exceed 50 characters";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      const firstError = Object.values(errors)[0];
      showToast(firstError, true);
      return;
    }

    setIsSaving(true);
    try {
      if (editingService?._id) {
        await dispatch(updateService({ id: editingService._id, data: formData })).unwrap();
        showToast("Service updated successfully.");
      } else {
        await dispatch(createService(formData)).unwrap();
        showToast("Service created successfully.");
        // Clear search filters when creating new service
        if (clearFilters) clearFilters();
      }
      
      // Close modal and reset form
      setShowForm(false);
      resetForm();
      setEditingService(null);
      
      // Refresh the services list
      dispatch(fetchServices());
    } catch (error: unknown) {
      console.error('Save error:', error);
      const errorMessage = error instanceof Error ? error.message : "Failed to save service.";
      showToast(errorMessage, true);
    } finally {
      setIsSaving(false);
    }
  };

  const handleView = (service: Service) => {
    console.log('Viewing service:', service);
    setEditingService(service);
    setFormData({
      ...service,
      // Ensure we have the correct ID field
      _id: service._id || service.id
    });
    setShowForm(true);
  };

  const handleDeactivate = async (service: Service) => {
    try {
      await dispatch(updateService({ id: service._id!, data: { service_status: "inactive" } })).unwrap();
      showToast("Service deactivated successfully.");
      // Refresh the services list
      dispatch(fetchServices());
    } catch (error) {
      showToast("Error deactivating service.", true);
    }
  };

  const handleReactivate = async (service: Service) => {
    try {
      await dispatch(updateService({ id: service._id!, data: { service_status: "active" } })).unwrap();
      showToast("Service reactivated successfully.");
      // Refresh the services list
      dispatch(fetchServices());
    } catch (error) {
      showToast("Error reactivating service.", true);
    }
  };

  const handleDelete = async () => {
    if (!editingService?._id) return;
    
    setIsDeleting(true);
    try {
      await dispatch(deleteService(editingService._id)).unwrap();
      showToast("Service deleted successfully.");
      
      // Close modal and reset form
      setShowForm(false);
      resetForm();
      setEditingService(null);
      
      // Refresh the services list
      dispatch(fetchServices());
    } catch (error) {
      showToast("Error deleting service.", true);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingService(null);
    resetForm();
  };

  /* ---------------- UI ---------------- */
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-slate-900 rounded-2xl">
              <Package className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                Products & Services
              </h1>
              <p className="text-slate-500 mt-1">
                Manage your service catalog and pricing
              </p>
            </div>
          </div>

          {!showForm && (
            <Button
              onClick={handleAddNew}
              className="h-12 px-6 bg-green-600 hover:bg-green-700 gap-2"
            >
              <Plus className="w-5 h-5" />
              Add Service
            </Button>
          )}
        </div>

        {/* Workspace */}
        <div className="bg-white rounded-lg border-2 border-blue-100 shadow-md">
          <div className="px-6 py-4 border-b bg-gradient-to-r from-blue-50 to-white">
            <h3 className="text-base font-bold uppercase">
              Service Catalog & Pricing
            </h3>
            <p className="text-xs text-slate-500">
              Manage your billable services and default rates
            </p>
          </div>

          <ServiceFormModal
            open={showForm}
            onOpenChange={(open: boolean) => !open && handleCancel()}
            formData={formData}
            onChange={handleFormChange}
            onSave={handleSave}
            onDelete={handleDelete}
            editingService={editingService}
            isSaving={isSaving}
            isDeleting={isDeleting}
            errors={errors}
            onShowToast={showToast}
          />

          <ServiceList
            services={services}
            onView={handleView}
            onDeactivate={handleDeactivate}
            onReactivate={handleReactivate}
            isLoading={loading}
            onClearFilters={setClearFilters}
          />
        </div>
      </div>
      
      {/* Custom Toast */}
      {toast && (
        <div className={`fixed bottom-4 right-4 z-50 p-4 rounded-lg shadow-lg flex items-center gap-2 animate-in slide-in-from-bottom-2 ${
          toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
        }`}>
          {toast.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
          {toast.message}
        </div>
      )}
    </div>
  );
}
