"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/redux/store';
import { fetchCustomers, createCustomer, updateCustomer } from '@/redux/slices/customersSlice';
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, CheckCircle, Users } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

/* UI */

/* Customer Components */
import CustomerList from "@/components/customers/CustomerList";
import CustomerDetailView from "@/components/customers/CustomerDetailView";
import NameContactSection from "@/components/customers/NameContactSection";
import CommunicationPermissionsSection from "@/components/customers/CommunicationPermissionsSection";
import AddressesSection from "@/components/customers/AddressesSection";
import PaymentsSection from "@/components/customers/PaymentsSection";
import AdditionalInfoSection from "@/components/customers/AdditionalInfoSection";
import NotesAttachmentsSection from "@/components/customers/NotesAttachmentsSection";
import CustomFieldsSection from "@/components/customers/CustomFieldsSection";
import ContactPersonsSection from "@/components/customers/ContactPersonsSection";
import ServiceLocationsSection from "@/components/customers/ServiceLocationsSection";

/* ======================================================
   TYPES
====================================================== */

interface Customer {
  _id?: string;
  id?: string;
  user_id?: string;
  title?: string;
  first_name?: string;
  middle_name?: string;
  last_name?: string;
  suffix?: string;
  legal_company_name?: string;
  display_name?: string;
  email?: string;
  password?: string;
  phone?: string;
  cc_email?: string;
  bcc_email?: string;
  mobile?: string;
  fax?: string;
  other_contact?: string;
  website?: string;
  print_on_check_name?: string;
  is_sub_customer?: boolean;
  email_marketing_consent?: boolean;
  billing_street_1?: string;
  billing_street_2?: string;
  billing_city?: string;
  billing_state?: string;
  billing_zip?: string;
  billing_country?: string;
  shipping_same_as_billing?: boolean;
  shipping_street_1?: string;
  shipping_street_2?: string;
  shipping_city?: string;
  shipping_state?: string;
  shipping_zip?: string;
  shipping_country?: string;
  primary_payment_method?: string;
  payment_terms?: string;
  delivery_method?: string;
  invoice_language?: string;
  credit_limit?: number;
  customer_type?: string;
  tax_exempt?: boolean;
  tax_rate_id?: string;
  opening_balance?: number;
  opening_balance_date?: string;
  customer_role?: string;
  primary_product_type?: string;
  requires_certificate?: boolean;
  requires_affidavit?: boolean;
  requires_photo_video_proof?: boolean;
  witness_required?: boolean;
  scrap_resale_allowed?: boolean;
  special_handling_notes?: string;
  internal_notes?: string;
  customer_status?: "active" | "on_hold" | "archived";
}

/* ======================================================
   PAGE
====================================================== */

function CustomersPageContent() {
  const dispatch = useDispatch<AppDispatch>();
  const { customers, loading } = useSelector((state: RootState) => state.customers);
  const router = useRouter();
  const searchParams = useSearchParams();

  /* UI State */
  const [showForm, setShowForm] = useState(false);
  const [showDetailView, setShowDetailView] = useState(false);
  const [viewingCustomer, setViewingCustomer] = useState<Customer | null>(null);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  /* UI-only data */
  const isLoading = loading;

  useEffect(() => {
    dispatch(fetchCustomers());
  }, [dispatch]);

  const [formData, setFormData] = useState<Customer>({
    title: "",
    first_name: "",
    middle_name: "",
    last_name: "",
    suffix: "",
    legal_company_name: "",
    display_name: "",
    email: "",
    password: "",
    phone: "",
    cc_email: "",
    bcc_email: "",
    mobile: "",
    fax: "",
    other_contact: "",
    website: "",
    print_on_check_name: "",
    is_sub_customer: false,
    email_marketing_consent: false,
    billing_street_1: "",
    billing_street_2: "",
    billing_city: "",
    billing_state: "",
    billing_zip: "",
    billing_country: "USA",
    shipping_same_as_billing: true,
    shipping_street_1: "",
    shipping_street_2: "",
    shipping_city: "",
    shipping_state: "",
    shipping_zip: "",
    shipping_country: "USA",
    primary_payment_method: "",
    payment_terms: "",
    delivery_method: "",
    invoice_language: "English",
    credit_limit: 0,
    customer_type: "",
    tax_exempt: false,
    tax_rate_id: "",
    opening_balance: 0,
    opening_balance_date: "",
    customer_role: "",
    primary_product_type: "",
    requires_certificate: false,
    requires_affidavit: false,
    requires_photo_video_proof: false,
    witness_required: false,
    scrap_resale_allowed: false,
    special_handling_notes: "",
    internal_notes: "",
    customer_status: "active",
  });

  /* ======================================================
     URL AUTO OPEN
  ====================================================== */

  useEffect(() => {
    const id = searchParams.get("customer_id");
    if (id && customers.length > 0) {
      const customer = customers.find((c) => c._id === id || c.id === id);
      if (customer && !showDetailView) {
        setViewingCustomer(customer);
        setShowDetailView(true);
      }
    }
  }, [searchParams, customers, showDetailView]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    // Required fields
    if (!formData.display_name?.trim()) {
      newErrors.display_name = "Customer display name is required";
    }
    if (!formData.password?.trim() && !editingCustomer) {
      newErrors.password = "Password is required for new customers";
    }
    
    // Email validation
    if (formData.email?.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        newErrors.email = "Please enter a valid email address";
      }
    }
    
    // CC/BCC email validation
    if (formData.cc_email?.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.cc_email)) {
        newErrors.cc_email = "Please enter a valid CC email address";
      }
    }
    if (formData.bcc_email?.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.bcc_email)) {
        newErrors.bcc_email = "Please enter a valid BCC email address";
      }
    }
    
    // Phone number validation (basic)
    if (formData.phone?.trim()) {
      const phoneRegex = /^[\d\s\-\(\)\+\.]+$/;
      if (!phoneRegex.test(formData.phone)) {
        newErrors.phone = "Please enter a valid phone number";
      }
    }
    if (formData.mobile?.trim()) {
      const phoneRegex = /^[\d\s\-\(\)\+\.]+$/;
      if (!phoneRegex.test(formData.mobile)) {
        newErrors.mobile = "Please enter a valid mobile number";
      }
    }
    
    // Website URL validation
    if (formData.website?.trim()) {
      try {
        new URL(formData.website);
      } catch {
        newErrors.website = "Please enter a valid website URL";
      }
    }
    
    // Password strength validation for new customers
    if (formData.password?.trim() && !editingCustomer) {
      if (formData.password.length < 6) {
        newErrors.password = "Password must be at least 6 characters long";
      }
    }
    
    // Credit limit validation
    if (formData.credit_limit && formData.credit_limit < 0) {
      newErrors.credit_limit = "Credit limit cannot be negative";
    }
    
    // Opening balance validation
    if (formData.opening_balance && isNaN(formData.opening_balance)) {
      newErrors.opening_balance = "Opening balance must be a valid number";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFormDataChange = (newData: Customer) => {
    setFormData(newData);
    // Clear errors for fields that have been filled
    const newErrors = { ...errors };
    Object.keys(newData).forEach(key => {
      if (newData[key as keyof Customer] && newErrors[key]) {
        delete newErrors[key];
      }
    });
    setErrors(newErrors);
  };

  /* ======================================================
     ACTIONS
  ====================================================== */

  const handleAddNew = (): void => {
    setEditingCustomer(null);
    setShowForm(true);
    setErrors({});
  };

  const handleView = (customer: Customer): void => {
    setViewingCustomer(customer);
    setShowDetailView(true);
  };

  const handleEdit = (customer: Customer): void => {
    setEditingCustomer(customer);
    setFormData(customer);
    setShowForm(true);
    setShowDetailView(false);
    setErrors({});
  };

  const handleSave = async (): Promise<void> => {
    if (!validateForm()) {
      setSuccessMessage("Please fix the validation errors before saving.");
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      return;
    }

    try {
      if (editingCustomer?._id) {
        await dispatch(updateCustomer({ id: editingCustomer._id, customer: formData })).unwrap();
        setSuccessMessage("Customer updated successfully.");
      } else {
        const result = await dispatch(createCustomer(formData)).unwrap();
        setEditingCustomer(result);
        setSuccessMessage("Customer and user account created successfully.");
      }
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      setShowForm(false);
      setErrors({});
    } catch (error) {
      console.error('Failed to save customer:', error);
      setSuccessMessage('Failed to save customer. Please check if email already exists.');
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }
  };

  const handleCancel = (): void => {
    setShowForm(false);
    setShowDetailView(false);
    setEditingCustomer(null);
    setViewingCustomer(null);
    setErrors({});
  };

  /* ======================================================
     NAVIGATION
  ====================================================== */

  const goTo = (path: string, id?: string): void => {
    const customerId = id || viewingCustomer?._id || viewingCustomer?.id;
    router.push(customerId ? `${path}?customer_id=${customerId}` : path);
  };

  /* ======================================================
     DETAIL VIEW
  ====================================================== */

  if (showDetailView && viewingCustomer) {
    return (
      <CustomerDetailView
        customer={viewingCustomer}
        onClose={() => setShowDetailView(false)}
        onEdit={handleEdit}
        onCreateInvoice={(c: Customer) => goTo("/invoices", c._id || c.id)}
        onCreateEstimate={(c: Customer) => goTo("/estimates", c._id || c.id)}
        onCreateJob={(c: Customer) => goTo("/jobs", c._id || c.id)}
        onReceivePayment={(c: Customer) => goTo("/receive-payment", c._id || c.id)}
      />
    );
  }

  /* ======================================================
     UI
  ====================================================== */

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-slate-900 rounded-2xl">
              <Users className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Customers</h1>
              <p className="text-slate-500 mt-1">
                Manage customer information and transactions
              </p>
            </div>
          </div>

          {!showForm && (
            <button onClick={handleAddNew} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md flex items-center gap-2 transition-colors">
              <Plus className="w-5 h-5" />
              New Customer
            </button>
          )}
        </div>

        <AnimatePresence mode="wait">
          {showForm ? (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6 pb-"
            >
              {/* Form Header with Close Button */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-slate-900">
                  {editingCustomer ? "Edit Customer" : "New Customer"}
                </h2>
                <button onClick={handleCancel} className="p-2 hover:bg-slate-100 rounded-md transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <NameContactSection data={formData} onChange={handleFormDataChange} errors={errors} />
              <CommunicationPermissionsSection data={formData} onChange={handleFormDataChange} />
              <AddressesSection data={formData} onChange={handleFormDataChange} />
              <PaymentsSection data={formData} onChange={handleFormDataChange} />
              <AdditionalInfoSection data={formData} onChange={handleFormDataChange} />
              <NotesAttachmentsSection data={formData} onChange={handleFormDataChange} />
              <CustomFieldsSection />

              {/* Fixed Footer with Buttons */}
              <div className="flex justify-end gap-3 mt-8">
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
                  {editingCustomer ? "Save" : "Create Customer"}
                </button>
              </div>
            </motion.div>
          ) : (
            <CustomerList
              customers={Array.isArray(customers) ? customers : []}
              isLoading={isLoading}
              onView={handleView}
              onArchive={() => {}}
              onCreateInvoice={(c: Customer) => goTo("/invoices", c._id || c.id)}
              onCreateEstimate={(c: Customer) => goTo("/estimates", c._id || c.id)}
              onCreateJob={(c: Customer) => goTo("/jobs", c._id || c.id)}
              onReceivePayment={(c: Customer) => goTo("/receive-payment", c._id || c.id)}
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

export default function CustomersPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center"><div className="text-center"><div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" /><p className="text-slate-500">Loading...</p></div></div>}>
      <CustomersPageContent />
    </Suspense>
  );
}
