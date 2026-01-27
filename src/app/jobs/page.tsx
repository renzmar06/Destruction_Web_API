"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, CheckCircle, Briefcase } from "lucide-react";
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { fetchEstimates } from '@/redux/slices/estimatesSlice';
import { fetchCustomers } from '@/redux/slices/customersSlice';
import { fetchJobs, createJob, updateJob, deleteJob, type Job } from '@/redux/slices/jobsSlice';

/* Job Components */
import JobList from "@/components/jobs/JobList";
import JobDetailsSection from "@/components/jobs/JobDetailsSection";
import SchedulingSection from "@/components/jobs/SchedulingSection";
import DestructionDetailsSection from "@/components/jobs/DestructionDetailsSection";
import JobStatusSection from "@/components/jobs/JobStatusSection";
import LinkedRecordsSection from "@/components/jobs/LinkedRecordsSection";
import JobMaterialsSection from "@/components/jobs/JobMaterialsSection";
import JobsView from "@/components/portal/JobsView";

/* ======================================================
   TYPES
====================================================== */

interface Estimate {
  _id?: string;
  estimate_number: string;
  customer_id: string;
  customer_name: string;
  total_amount: number;
  estimate_status: string;
  primary_service_location_id?: string;
  destruction_type?: string;
  memo_on_statement?: string;
  what_is_included?: string;
}

interface Customer {
  _id: string;
  legal_company_name?: string;
  requires_affidavit?: boolean;
  special_handling_notes?: string;
  user_id?: string;
}

/* ======================================================
   PAGE
====================================================== */

export default function JobsPage() {
  const dispatch = useAppDispatch();
  const { estimates, loading: estimatesLoading } = useAppSelector(state => state.estimates);
  const { customers, loading: customersLoading } = useAppSelector(state => state.customers);
  const { jobs, loading: jobsLoading } = useAppSelector(state => state.jobs);
  
  /* UI State */
  const [showForm, setShowForm] = useState(false);
  const [showEstimateSelector, setShowEstimateSelector] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [selectedJobForView, setSelectedJobForView] = useState<Job | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  /* Load data */
  useEffect(() => {
    dispatch(fetchEstimates());
    dispatch(fetchCustomers());
    dispatch(fetchJobs());
  }, [dispatch]);

  const locations: unknown[] = [];
  const isLoading = estimatesLoading || customersLoading || jobsLoading;

  const acceptedEstimates = estimates.filter(
    (e) => e.estimate_status === "accepted"
  );

  const [formData, setFormData] = useState<Job>({
    job_id: "",
    job_name: "",
    customer_id: "",
    customer_name: "",
    estimate_id: "",
    estimate_number: "",
    job_location_id: "",
    scheduled_date: "",
    actual_start_date: "",
    actual_completion_date: "",
    destruction_method: "mechanical_destruction",
    destruction_description: "",
    requires_affidavit: false,
    special_handling_notes: "",
    materials: [],
    job_status: "scheduled",
  });

  /* ======================================================
     HELPERS
  ====================================================== */

  const showSuccessToast = (msg: string): void => {
    setSuccessMessage(msg);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  /* ======================================================
     ACTIONS
  ====================================================== */

  const handleAddNew = (): void => {
    if (acceptedEstimates.length === 0) {
      alert("No accepted estimates available.");
      return;
    }
    setEditingJob(null);
    setShowEstimateSelector(true);
  };

  const handleCreateFromEstimate = (estimate: Estimate): void => {
    const customer = customers.find((c) => c._id === estimate.customer_id);

    setFormData({
      job_id: "",
      job_name: `Job for ${estimate.customer_name || customer?.legal_company_name || "Customer"}`,
      customer_id: estimate.customer_id,
      customer_name: estimate.customer_name || customer?.legal_company_name || "",
      user_id: (customer as any)?.user_id,
      estimate_id: estimate._id || '',
      estimate_number: estimate.estimate_number,
      job_location_id: estimate.primary_service_location_id || "",
      scheduled_date: "",
      actual_start_date: "",
      actual_completion_date: "",
      destruction_method: "mechanical_destruction",
      destruction_description: estimate.memo_on_statement || "To be specified",
      requires_affidavit: customer?.requires_affidavit || false,
      special_handling_notes:
        estimate.what_is_included || customer?.special_handling_notes || "",
      materials: [],
      job_status: "scheduled",
    });

    setShowEstimateSelector(false);
    setShowForm(true);
  };

  const handleView = (job: Job): void => {
    setSelectedJobForView(job);
  };

  const handleEdit = (job: Job): void => {
    setEditingJob(job);
    setFormData(job);
    setShowForm(true);
  };

  const handleStatusChange = async (job: Job): Promise<void> => {
    const statusFlow = {
      'scheduled': 'in_progress',
      'in_progress': 'completed',
      'completed': 'completed' // Already completed
    };
    
    const nextStatus = statusFlow[job.job_status as keyof typeof statusFlow];
    
    if (nextStatus === job.job_status) {
      showSuccessToast(`Job is already ${job.job_status}.`);
      return;
    }
    
    try {
      const updatedJob = { ...job, job_status: nextStatus as 'scheduled' | 'in_progress' | 'completed' };
      await dispatch(updateJob({ id: job._id!, ...updatedJob })).unwrap();
      showSuccessToast(`Job status changed from ${job.job_status} to ${nextStatus}.`);
    } catch (error: unknown) {
      console.error('Status update error:', error);
      const errorMessage = error instanceof Error ? error.message : 
        (typeof error === 'object' && error !== null && 'message' in error) ? 
        (error as any).message : 'Failed to update status';
      alert(`Error updating status: ${errorMessage}`);
    }
  };

  const handleSave = async (): Promise<void> => {
    try {
      if (editingJob) {
        await dispatch(updateJob({ id: editingJob._id!, ...formData })).unwrap();
        showSuccessToast("Job updated successfully.");
      } else {
        await dispatch(createJob(formData)).unwrap();
        showSuccessToast("Job created successfully.");
      }
      setShowForm(false);
      setEditingJob(null);
    } catch (error: unknown) {
      console.error('Save error:', error);
      const errorMessage = error instanceof Error ? error.message : 
        (typeof error === 'object' && error !== null && 'message' in error) ? 
        (error as any).message : 'Failed to save job';
      alert(`Error: ${errorMessage}`);
    }
  };

  const handleDelete = async (jobId: string): Promise<void> => {
    if (confirm('Are you sure you want to delete this job?')) {
      try {
        await dispatch(deleteJob(jobId)).unwrap();
        showSuccessToast("Job deleted successfully.");
      } catch (error: unknown) {
        console.error('Delete error:', error);
        const errorMessage = error instanceof Error ? error.message : 
          (typeof error === 'object' && error !== null && 'message' in error) ? 
          (error as any).message : 'Failed to delete job';
        alert(`Error: ${errorMessage}`);
      }
    }
  };

  const handleCancel = (): void => {
    setShowForm(false);
    setShowEstimateSelector(false);
    setSelectedJobForView(null);
    setEditingJob(null);
  };

  const handleGenerateInvoice = async (job: Job): Promise<void> => {
    try {
      const response = await fetch('/api/invoices/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jobId: job._id,
          customerId: job.customer_id,
          estimateId: job.estimate_id
        }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        showSuccessToast('Invoice generated successfully!');
        // Remove the redirect - just show toast
      } else {
        alert('Failed to generate invoice: ' + result.message);
      }
    } catch (error: unknown) {
      console.error('Invoice generation error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate invoice';
      alert(`Error: ${errorMessage}`);
    }
  };

  const handleGenerateAffidavit = async (job: Job): Promise<void> => {
    try {
      const response = await fetch('/api/affidavits/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jobId: job._id,
          customerId: job.customer_id
        }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        showSuccessToast('Affidavit generated successfully!');
      } else {
        alert('Failed to generate affidavit: ' + result.message);
      }
    } catch (error: unknown) {
      console.error('Affidavit generation error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate affidavit';
      alert(`Error: ${errorMessage}`);
    }
  };

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
              <Briefcase className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Jobs</h1>
              <p className="text-slate-500 mt-1">
                Manage destruction projects and operations ({jobs.length} total)
              </p>
            </div>
          </div>

          {!showForm && !showEstimateSelector && (
            <button
              onClick={handleAddNew}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md flex items-center gap-2 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Create Job
            </button>
          )}
        </div>

        <AnimatePresence mode="wait">
          {selectedJobForView ? (
            <motion.div
              key="job-view"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <button
                onClick={() => setSelectedJobForView(null)}
                className="mb-4 px-4 py-2 text-slate-600 hover:text-slate-900 flex items-center gap-2"
              >
                ← Back to Jobs
              </button>
              <JobsView 
              
             
              />
            </motion.div>
          ) : showEstimateSelector ? (
            <motion.div
              key="selector"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-2xl border p-6"
            >
              <div className="flex justify-between mb-6">
                <h2 className="text-xl font-semibold">Select Accepted Estimate</h2>
                <button onClick={handleCancel} className="p-2 hover:bg-slate-100 rounded-md transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3">
                {acceptedEstimates.map((estimate) => (
                  <div
                    key={estimate._id}
                    onClick={() => handleCreateFromEstimate(estimate)}
                    className="p-4 border rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-semibold">{estimate.estimate_number}</p>
                        <p className="text-sm text-slate-600">{estimate.customer_name}</p>
                      </div>
                      <p className="text-lg font-bold text-green-600">${estimate.total_amount?.toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          ) : showForm ? (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6 pb-32"
            >
              {/* Form Header with Cancel */}
              <div className="bg-white rounded-2xl border p-6 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">
                    {editingJob ? "Edit Job" : "Create Job"}
                  </h2>
                  <p className="text-sm text-slate-500 mt-1">
                    {editingJob ? "Update job information" : "Create a new job from estimate"}
                  </p>
                </div>
                <button onClick={handleCancel} className="p-2 hover:bg-slate-100 rounded-md transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <JobDetailsSection
                data={formData}
                onChange={setFormData}
                locations={locations}
                errors={{}}
                isReadOnly={false}
              />

              <SchedulingSection
                data={formData}
                onChange={setFormData}
                errors={{}}
                isReadOnly={false}
              />

              <DestructionDetailsSection
                data={formData}
                onChange={setFormData}
                errors={{}}
                isReadOnly={false}
              />

              <JobStatusSection
                data={formData}
                onChange={setFormData}
                canChangeStatus={!!editingJob}
              />

              <JobMaterialsSection 
                jobId={editingJob?._id || 'new'} 
                jobData={formData}
                onJobUpdate={() => dispatch(fetchJobs())}
                onMaterialsChange={(materials: any) => setFormData(prev => ({ ...prev, materials }))}
                isReadOnly={false} 
              />

              {editingJob && (
                <LinkedRecordsSection job={formData} />
              )}

              <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg">
                <div className="max-w-7xl mx-auto px-10 py-4 flex justify-between">
                  <button onClick={handleCancel} className="px-4 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors">
                    Cancel
                  </button>
                  <div className="flex gap-3">
                    <button
                      onClick={handleSave}
                      className="bg-green-600 hover:bg-green-700 text-white px-8 py-2 rounded-md transition-colors"
                    >
                      {editingJob ? "Save & Close" : "Create Job"}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <JobList
              jobs={jobs}
              customers={Array.isArray(customers) ? customers : []}
              isLoading={isLoading}
              onView={handleView}
              onEdit={handleEdit}
              onStatusChange={handleStatusChange}
              onDelete={handleDelete}
              onGenerateInvoice={handleGenerateInvoice}
              onGenerateAffidavit={handleGenerateAffidavit}
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
              className="fixed bottom-8 right-8 bg-emerald-600 text-white px-6 py-4 rounded-2xl shadow-2xl flex gap-3"
            >
              <CheckCircle className="w-5 h-5" />
              {successMessage}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
