"use client";

import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, CheckCircle, FileCheck, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AppDispatch, RootState } from "@/redux/store";
import { fetchAffidavits, createAffidavit, updateAffidavit, Affidavit } from "@/redux/slices/affidavitsSlice";
import { fetchJobs } from "@/redux/slices/jobsSlice";

import AffidavitList from "@/components/affidavits/AffidavitList";
import AffidavitContextHeader from "@/components/affidavits/AffidavitContextHeader";
import AffidavitDetailsSection from "@/components/affidavits/AffidavitDetailsSection";
import MediaReferencesSection from "@/components/affidavits/MediaReferencesSection";
import AuthorizationSection from "@/components/affidavits/AuthorizationSection";

type MediaItem = {
  id: string;
  [key: string]: unknown;
};

export default function AffidavitsPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { affidavits, loading } = useSelector((state: RootState) => state.affidavits);
  const { jobs } = useSelector((state: RootState) => state.jobs);
  const [jobMedia] = useState<MediaItem[]>([]);

  const [showForm, setShowForm] = useState(false);
  const [showJobSelector, setShowJobSelector] = useState(false);
  const [editingAffidavit, setEditingAffidavit] = useState<Affidavit | null>(null);

  const [formData, setFormData] = useState<Affidavit>({
    affidavit_number: "",
    affidavit_status: "pending",
    job_id: "",
    job_reference: "",
    customer_name: "",
    service_provider_name: "",
    service_provider_ein: "",
    service_provider_address: "",
    job_location: "",
    job_completion_date: "",
    destruction_method: "",
    description_of_materials: "",
    description_of_process: ""
  });
  const [selectedMediaIds, setSelectedMediaIds] = useState<string[]>([]);
  const [attachedDocuments, setAttachedDocuments] = useState<{
    document_id: string;
    file_name: string;
    file_path: string;
    file_type: string;
    upload_date: Date;
  }[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    dispatch(fetchAffidavits());
    dispatch(fetchJobs());
  }, [dispatch]);

  const showToast = (msg: string) => {
    setSuccessMessage(msg);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.service_provider_name?.trim()) {
      newErrors.service_provider_name = "Service provider name is required";
    }
    if (!formData.description_of_materials?.trim()) {
      newErrors.description_of_materials = "Description of materials is required";
    }
    if (!formData.description_of_process?.trim()) {
      newErrors.description_of_process = "Description of process is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddNew = () => {
    setShowJobSelector(true);
  };

  const handleCreateFromJob = (job: any) => {
    setFormData({
      affidavit_number: "",
      affidavit_status: "pending",
      job_id: job._id || job.id,
      job_reference: job.job_id,
      customer_name: job.customer_name || "",
      job_location: job.job_location || "",
      service_provider_name: "",
      service_provider_ein: "",
      service_provider_address: "",
      job_completion_date: "",
      destruction_method: "",
      description_of_materials: "",
      description_of_process: ""
    });
    setEditingAffidavit(null);
    setSelectedMediaIds([]);
    setAttachedDocuments([]);
    setShowJobSelector(false);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      const dataToSave = {
        ...formData,
        attached_documents: attachedDocuments
      };

      if (editingAffidavit) {
        await dispatch(updateAffidavit({ 
          id: editingAffidavit._id || editingAffidavit.id!, 
          data: dataToSave 
        })).unwrap();
        showToast("Affidavit updated successfully.");
      } else {
        await dispatch(createAffidavit(dataToSave)).unwrap();
        showToast("Affidavit created successfully.");
      }

      setShowForm(false);
      setEditingAffidavit(null);
      setFormData({
        affidavit_number: "",
        affidavit_status: "pending",
        job_id: "",
        job_reference: "",
        customer_name: "",
        service_provider_name: "",
        service_provider_ein: "",
        service_provider_address: "",
        job_location: "",
        job_completion_date: "",
        destruction_method: "",
        description_of_materials: "",
        description_of_process: ""
      });
      setAttachedDocuments([]);
    } catch (error: any) {
      const errorMessage = error?.message || 'Unknown error occurred';
      alert('Failed to save affidavit: ' + errorMessage);
    }
  };

  const handleView = async (affidavit: Affidavit) => {
    try {
      const response = await fetch(`/api/affidavits/${affidavit._id || affidavit.id}`);
      const result = await response.json();
      
      if (result.success) {
        const data = result.data;
        setEditingAffidavit(data);
        setFormData({
          affidavit_number: data.affidavit_number || "",
          affidavit_status: data.affidavit_status || "pending",
          job_id: data.job_id || "",
          job_reference: data.job_reference || "",
          customer_name: data.customer_name || "",
          service_provider_name: data.service_provider_name || "",
          service_provider_ein: data.service_provider_ein || "",
          service_provider_address: data.service_provider_address || "",
          job_location: data.job_location || "",
          job_completion_date: data.job_completion_date || "",
          destruction_method: data.destruction_method || "",
          description_of_materials: data.description_of_materials || "",
          description_of_process: data.description_of_process || ""
        });
        setAttachedDocuments(data.attached_documents || []);
        setShowForm(true);
      } else {
        alert('Failed to load affidavit data');
      }
    } catch (error) {
      console.error('Error loading affidavit:', error);
      alert('Failed to load affidavit data');
    }
  };

  const handleIssue = async (affidavit: Affidavit) => {
    if (!confirm("Issue this affidavit? This will generate the certificate.")) return;

    try {
      await dispatch(updateAffidavit({
        id: affidavit._id || affidavit.id!,
        data: { 
          affidavit_status: "issued",
          date_issued: new Date().toISOString()
        }
      })).unwrap();
      showToast("Affidavit issued successfully.");
    } catch (error: any) {
      const errorMessage = error?.message || 'Unknown error occurred';
      alert('Failed to issue affidavit: ' + errorMessage);
    }
  };

  const handleRevoke = async (affidavit: Affidavit) => {
    if (!confirm("Revoke this affidavit? This action cannot be undone.")) return;

    try {
      await dispatch(updateAffidavit({
        id: affidavit._id || affidavit.id!,
        data: { affidavit_status: "revoked" }
      })).unwrap();
      showToast("Affidavit revoked successfully.");
    } catch (error: any) {
      const errorMessage = error?.message || 'Unknown error occurred';
      alert('Failed to revoke affidavit: ' + errorMessage);
    }
  };

  const handleLock = async (affidavit: Affidavit) => {
    if (!confirm("Lock this affidavit?")) return;

    try {
      await dispatch(updateAffidavit({
        id: affidavit._id || affidavit.id!,
        data: { affidavit_status: "locked" }
      })).unwrap();
      showToast("Affidavit locked successfully.");
    } catch (error: any) {
      const errorMessage = error?.message || 'Unknown error occurred';
      alert('Failed to lock affidavit: ' + errorMessage);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setShowJobSelector(false);
    setEditingAffidavit(null);
    setFormData({
      affidavit_number: "",
      affidavit_status: "pending",
      job_id: "",
      job_reference: "",
      customer_name: "",
      service_provider_name: "",
      service_provider_ein: "",
      service_provider_address: "",
      job_location: "",
      job_completion_date: "",
      destruction_method: "",
      description_of_materials: "",
      description_of_process: ""
    });
    setSelectedMediaIds([]);
    setAttachedDocuments([]);
    setErrors({});
  };

  const handleDocumentAttach = (document: any, removeId?: string) => {
    if (removeId) {
      setAttachedDocuments(prev => prev.filter(doc => doc.document_id !== removeId));
    } else if (document) {
      setAttachedDocuments(prev => [...prev, document]);
    }
  };

  const isReadOnly =
    formData.affidavit_status === "issued" ||
    formData.affidavit_status === "locked";

  const eligibleJobs = jobs.filter(
    (j: any) => j.job_status === "completed"
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-slate-900 rounded-2xl">
              <FileCheck className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                Affidavits / Certificates of Destruction
              </h1>
              <p className="text-slate-500 mt-1">
                Generate legal proof of destruction
              </p>
            </div>
          </div>

          {!showForm && !showJobSelector && (
            <Button
              onClick={handleAddNew}
              className="h-12 px-6 bg-green-600 hover:bg-green-700 gap-2"
            >
              <Plus className="w-5 h-5" />
              Create Affidavit
            </Button>
          )}
        </div>

        <AnimatePresence mode="wait">
          {/* Job Selector */}
          {showJobSelector ? (
            <motion.div
              key="selector"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-2xl border p-6"
            >
              <div className="flex justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold">Select Completed Job</h2>
                  <p className="text-sm text-slate-500">
                    Choose from completed jobs to create affidavit
                  </p>
                </div>
                <Button variant="ghost" size="icon" onClick={handleCancel}>
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {eligibleJobs.length === 0 ? (
                <div className="text-center py-12">
                  <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-600 font-medium">
                    No completed jobs available.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {eligibleJobs.map((job: any) => (
                    <div
                      key={job._id || job.id}
                      onClick={() => handleCreateFromJob(job)}
                      className="p-4 border rounded-lg hover:bg-blue-50 cursor-pointer"
                    >
                      <p className="font-semibold">{job.job_id}</p>
                      <p className="text-sm text-slate-600">{job.job_name}</p>
                      <p className="text-sm text-slate-500">{job.customer_name}</p>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          ) : showForm ? (
            /* FORM */
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6 pb-32"
            >
              {/* Header */}
              <div className="sticky top-0 bg-white border-b shadow-sm p-4 z-30">
                <div className="flex justify-between">
                  <div>
                    <div className="text-xs uppercase text-slate-500">
                      Affidavit
                    </div>
                    <div className="text-xl font-bold">
                      {formData.affidavit_number || "New Affidavit"}
                    </div>
                  </div>
                  <div className="text-sm">
                    Status:{" "}
                    <span className="font-medium">
                      {formData.affidavit_status || "Draft"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg border shadow-md">
                <div className="p-6">
                  <AffidavitDetailsSection
                    data={formData}
                    onChange={setFormData}
                    isReadOnly={isReadOnly}
                  />
                </div>
              </div>

              <details className="bg-white rounded-lg border">
                <summary className="px-6 py-4 cursor-pointer font-semibold">
                  Media References
                </summary>
                <div className="px-6 pb-6">
                  <MediaReferencesSection
                    media={jobMedia}
                    selectedMediaIds={selectedMediaIds}
                    onSelectionChange={setSelectedMediaIds}
                    isReadOnly={isReadOnly}
                    attachedDocuments={attachedDocuments}
                    onDocumentAttach={handleDocumentAttach}
                  />
                </div>
              </details>

              <div className="bg-white rounded-lg border p-6">
                <AuthorizationSection data={formData} />
              </div>

              {/* Actions */}
              <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg">
                <div className="max-w-7xl mx-auto px-10 py-4 flex justify-between">
                  <Button variant="ghost" onClick={handleCancel}>
                    Close
                  </Button>

                  {!isReadOnly && (
                    <Button
                      onClick={handleSave}
                      className="bg-green-600 hover:bg-green-700 px-8"
                    >
                      Save Affidavit
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          ) : (
            /* LIST */
            <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <AffidavitList
                affidavits={affidavits}
                onView={handleView}
                onIssue={handleIssue}
                onLock={handleLock}
                onRevoke={handleRevoke}
                isLoading={loading}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Toast */}
        <AnimatePresence>
          {showSuccess && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="fixed bottom-8 right-8 bg-emerald-600 text-white px-6 py-4 rounded-2xl shadow-xl flex items-center gap-3"
            >
              <CheckCircle className="w-5 h-5" />
              <span>{successMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}