"use client";

import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "@/components/ui/button";
import { Plus, CheckCircle, Receipt, AlertCircle, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { AppDispatch, RootState } from "@/redux/store";
import { fetchExpenses, createExpense, updateExpense, deleteExpense, Expense } from "@/redux/slices/expensesSlice";

/* Components (UI ONLY – unchanged) */
import ExpenseList from "@/components/expenses/ExpenseList";
import VendorSelector from "@/components/expenses/VendorSelector";
import JobLinkageSection from "@/components/expenses/JobLinkageSection";
import PurchaseOrderSection from "@/components/expenses/PurchaseOrderSection";
import AttachmentsSection from "@/components/expenses/AttachmentsSection";
import ExpenseStatusSection from "@/components/expenses/ExpenseStatusSection";
import ExpenseDetailsSection from "@/components/expenses/ExpenseDetailsSection";
import PaymentSection from "@/components/payments/PaymentSection";

/* ----------------------------------------------------
   TYPES
---------------------------------------------------- */
type ExpenseStatus = "draft" | "submitted" | "approved" | "archived";
type ExpenseType = "transport" | "packaging" | "equipment" | "labor" | "materials" | "utilities" | "other";
type PaymentStatus = "not_ready" | "pending" | "paid";
type PaymentMethod = "bank_transfer" | "check" | "cash" | "credit_card" | "other";

interface FormData {
  expense_id: string;
  expense_type: ExpenseType | "";
  vendor_name: string;
  expense_date: string;
  amount: number;
  description: string;
  expense_status: ExpenseStatus;
  payment_status: PaymentStatus;
  payment_date: string;
  payment_method: PaymentMethod | "";
}

/* ----------------------------------------------------
   PAGE
---------------------------------------------------- */
export default function ExpensesPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { expenses, loading } = useSelector((state: RootState) => state.expenses);
  
  const [showForm, setShowForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [jobs, setJobs] = useState([]);

  const [formData, setFormData] = useState<FormData>({
    expense_id: "",
    expense_type: "",
    vendor_name: "",
    expense_date: "",
    amount: 0,
    description: "",
    expense_status: "draft",
    payment_status: "not_ready",
    payment_date: "",
    payment_method: "",
  });

  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [submittingApproval, setSubmittingApproval] = useState(false);

  useEffect(() => {
    dispatch(fetchExpenses());
    fetchJobs();
  }, [dispatch]);

  const fetchJobs = async () => {
    try {
      const response = await fetch('/api/jobs');
      const result = await response.json();
      if (result.success) {
        setJobs(result.data);
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
    }
  };

  /* ----------------------------------------------------
     HANDLERS (DYNAMIC)
  ---------------------------------------------------- */
  const handleAddNew = () => {
    setEditingExpense(null);
    setFormData({
      expense_id: "",
      expense_type: "",
      vendor_name: "",
      expense_date: "",
      amount: 0,
      description: "",
      expense_status: "draft",
      payment_status: "not_ready",
      payment_date: "",
      payment_method: "",
    });
    setShowForm(true);
  };

  const handleView = (expense: Expense) => {
    setEditingExpense(expense);
    setFormData({ 
      ...expense,
      payment_date: expense.payment_date || "",
      payment_method: expense.payment_method || ""
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    // Basic validation
    if (!formData.vendor_name || !formData.expense_type || !formData.expense_date || !formData.description) {
      alert('Please fill in all required fields: Vendor, Expense Type, Date, and Description');
      return;
    }

    try {
      const expenseData: Partial<Expense> = {
        ...formData,
        expense_status: 'draft',
        expense_type: formData.expense_type || undefined,
        payment_method: formData.payment_method || undefined
      };
      
      if (editingExpense) {
        // Update existing expense
        await dispatch(updateExpense({ id: editingExpense._id!, data: expenseData })).unwrap();
        setSuccessMessage("Expense updated successfully.");
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
        setShowForm(false); // Return to list after updating
      } else {
        // Create new expense and return to list
        await dispatch(createExpense(expenseData)).unwrap();
        setSuccessMessage("Expense created successfully.");
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
        setShowForm(false); // Return to list after creating
      }
    } catch (error) {
      console.error('Error saving expense:', error);
    }
  };

  const handleSubmitForApproval = async () => {
    setSubmittingApproval(true);
    try {
      if (editingExpense) {
        const response = await fetch(`/api/expenses/${editingExpense._id}/send-approval`, {
          method: 'POST'
        });
        const result = await response.json();
        
        if (result.success) {
          setFormData(prev => ({ ...prev, expense_status: 'submitted' }));
          setSuccessMessage("Expense submitted for approval and email sent to vendor.");
          setShowSuccess(true);
          setTimeout(() => setShowSuccess(false), 3000);
          setShowForm(false); // Return to list
        } else {
          alert(result.message || 'Failed to submit for approval');
        }
      }
    } catch (error) {
      console.error('Error submitting expense:', error);
      alert('Failed to submit for approval');
    } finally {
      setSubmittingApproval(false);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingExpense(null);
  };

  const handleApprove = async (expense: Expense) => {
    try {
      await dispatch(updateExpense({ 
        id: expense._id!, 
        data: { expense_status: 'approved' } 
      })).unwrap();
    } catch (error) {
      console.error('Error approving expense:', error);
    }
  };

  const handleArchive = async (expense: Expense) => {
    try {
      await dispatch(updateExpense({ 
        id: expense._id!, 
        data: { expense_status: 'archived' } 
      })).unwrap();
    } catch (error) {
      console.error('Error archiving expense:', error);
    }
  };

  const isReadOnly =
    formData.expense_status === "approved" ||
    formData.expense_status === "archived";

  /* ----------------------------------------------------
     RENDER
  ---------------------------------------------------- */
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-slate-900 rounded-2xl">
              <Receipt className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Expenses</h1>
              <p className="text-slate-500 mt-1">
                Track expenses and purchase orders
              </p>
            </div>
          </div>

          {!showForm && (
            <Button
              onClick={handleAddNew}
              className="h-12 px-6 bg-green-600 hover:bg-green-700 gap-2"
            >
              <Plus className="w-5 h-5" />
              Add Expense
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
              className="space-y-6 pb-32"
            >
              {/* Sticky Header */}
              <div className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-sm -mx-4 px-10">
                <div className="py-4 flex items-center justify-between">
                  <div>
                    <div className="text-xs uppercase text-slate-500 mb-1">
                      Expense
                    </div>
                    <div className="text-xl font-bold">
                      {formData.expense_id || "New Expense"}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-xs text-slate-500 mb-1">Amount</div>
                      <div className="text-2xl font-bold">
                        ${formData.amount.toFixed(2)}
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={handleCancel}
                      className="h-8 w-8"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {isReadOnly && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 mt-1" />
                  <p className="text-sm text-amber-700">
                    This expense is read-only.
                  </p>
                </div>
              )}

              {/* Sections (UI only) */}
              <div className="bg-white rounded-lg border-2 border-blue-100 shadow-md">
                <div className="px-6 py-4 border-b bg-gradient-to-r from-blue-50 to-white">
                  <h3 className="text-base font-bold uppercase">
                    Expense Details
                  </h3>
                </div>
                <div className="p-6 space-y-6">
                  <VendorSelector
                    data={formData}
                    onChange={setFormData}
                    errors={{}}
                    isReadOnly={isReadOnly}
                  />

                  <ExpenseDetailsSection
                    data={formData}
                    onChange={setFormData}
                    errors={{}}
                    isReadOnly={isReadOnly}
                  />

                  <ExpenseStatusSection
                    data={formData}
                    canSubmit={!isReadOnly}
                    canApprove={!isReadOnly}
                  />
                </div>
              </div>

              <details className="bg-white rounded-lg border shadow-sm" open>
                <summary className="px-6 py-4 cursor-pointer font-semibold uppercase text-slate-600">
                  Job Linkage & Purchase Order
                </summary>
                <div className="px-6 pb-6 space-y-6">
                  <JobLinkageSection
                    data={formData}
                    onChange={setFormData}
                    jobs={jobs}
                    isReadOnly={isReadOnly}
                  />
                  <PurchaseOrderSection
                    data={formData}
                    onChange={setFormData}
                    isReadOnly={isReadOnly}
                  />
                </div>
              </details>

              {editingExpense && (
                <AttachmentsSection expenseId={editingExpense._id} isReadOnly={isReadOnly} />
              )}

              {editingExpense && formData.expense_status === "approved" && (
                <PaymentSection
                  data={formData}
                  onChange={setFormData}
                  canMarkForPayment={false}
                  onMarkForPayment={() => {}}
                  onMarkAsPaid={() => {}}
                />
              )}

              {/* Action Bar */}
              <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-lg z-40">
                <div className="max-w-7xl mx-auto px-6 py-4">
                  <div className="flex items-center justify-end gap-3">
                    <Button 
                      variant="outline" 
                      onClick={handleCancel}
                      className="px-6 py-2 border-slate-300 text-slate-700 hover:bg-slate-50"
                    >
                      {editingExpense ? 'Cancel' : 'Close'}
                    </Button>
                    {!isReadOnly && (
                      <>
                        <Button
                          onClick={handleSave}
                          className="px-8 py-2 bg-slate-600 hover:bg-slate-700 text-white font-medium"
                        >
                          Save Draft
                        </Button>
                        {editingExpense && formData.expense_status === 'draft' && (
                          <Button
                            onClick={handleSubmitForApproval}
                            disabled={submittingApproval}
                            className="px-8 py-2 bg-green-600 hover:bg-green-700 text-white font-medium"
                          >
                            {submittingApproval ? (
                              <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                                Sending...
                              </>
                            ) : (
                              'Submit for Approval'
                            )}
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <ExpenseList
                expenses={expenses}
                onView={handleView}
                onApprove={handleApprove}
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
              <span className="font-medium">{successMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
