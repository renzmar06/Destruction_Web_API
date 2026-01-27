"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileCheck, Mail, CheckCircle, Clock, Search, Send } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Verification {
  _id: string;
  document_id: string;
  verification_status: 'pending' | 'sent' | 'verified';
  affidavit_id?: {
    affidavit_number: string;
  };
  customer_email: string;
  createdAt: string;
  email_sent_date?: string;
  verified_date?: string;
}

export default function DocumentVerificationPage() {
  const [verifications, setVerifications] = useState<Verification[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [sendingEmail, setSendingEmail] = useState<string>("");
  const [documentId, setDocumentId] = useState<string>("");
  const [searchResult, setSearchResult] = useState<Verification | null>(null);
  const [showSuccess, setShowSuccess] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string>("");

  useEffect(() => {
    fetchVerifications();
  }, []);

  const fetchVerifications = async () => {
    try {
      const response = await fetch('/api/document-verification');
      const data = await response.json();
      if (data.success) {
        setVerifications(data.data);
      }
    } catch (error) {
      console.error('Error fetching verifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg: string) => {
    setSuccessMessage(msg);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleSearch = async () => {
    if (!documentId.trim()) return;

    try {
      const response = await fetch('/api/document-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ document_id: documentId })
      });
      
      const data = await response.json();
      if (data.success) {
        setSearchResult(data.data);
        showToast('Document found and verification record created');
        fetchVerifications();
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error('Error searching document:', error);
      alert('Failed to search document');
    }
  };

  const handleSendEmail = async (docId: string) => {
    setSendingEmail(docId);
    try {
      const response = await fetch('/api/document-verification/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ document_id: docId })
      });
      
      const data = await response.json();
      if (data.success) {
        showToast('Verification email sent successfully');
        fetchVerifications();
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error('Error sending email:', error);
      alert('Failed to send verification email');
    } finally {
      setSendingEmail("");
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'sent': return 'bg-blue-100 text-blue-800';
      case 'verified': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string): React.ReactElement => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'sent': return <Mail className="w-4 h-4" />;
      case 'verified': return <CheckCircle className="w-4 h-4" />;
      default: return <FileCheck className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-slate-900 rounded-2xl">
            <FileCheck className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Document Verification</h1>
            <p className="text-slate-500 mt-1">Manage document verification workflow</p>
          </div>
        </div>

        {/* Search Section */}
        <div className="bg-white rounded-2xl border p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Add Document for Verification</h2>
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="Enter Document ID (e.g., DOC-001)"
              value={documentId}
              onChange={(e) => setDocumentId(e.target.value)}
              className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Button onClick={handleSearch} className="px-6 gap-2">
              <Search className="w-4 h-4" />
              Search & Add
            </Button>
          </div>
        </div>

        {/* Verifications List */}
        <div className="bg-white rounded-2xl border">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold">Document Verifications</h2>
          </div>

          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-slate-500 mt-2">Loading verifications...</p>
            </div>
          ) : verifications.length === 0 ? (
            <div className="p-8 text-center">
              <FileCheck className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-600">No document verifications found</p>
            </div>
          ) : (
            <div className="divide-y">
              {verifications.map((verification) => (
                <div key={verification._id} className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-semibold text-lg">{verification.document_id}</span>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 ${getStatusColor(verification.verification_status)}`}>
                          {getStatusIcon(verification.verification_status)}
                          {verification.verification_status}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-slate-600">
                        <div>
                          <span className="font-medium">Affidavit:</span> {verification.affidavit_id?.affidavit_number}
                        </div>
                        <div>
                          <span className="font-medium">Customer:</span> {verification.customer_email}
                        </div>
                        <div>
                          <span className="font-medium">Created:</span> {new Date(verification.createdAt).toLocaleDateString()}
                        </div>
                      </div>

                      {verification.email_sent_date && (
                        <div className="text-sm text-slate-500 mt-2">
                          Email sent: {new Date(verification.email_sent_date).toLocaleString()}
                        </div>
                      )}

                      {verification.verified_date && (
                        <div className="text-sm text-green-600 mt-2">
                          Verified: {new Date(verification.verified_date).toLocaleString()}
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      {verification.verification_status === 'pending' && (
                        <Button
                          onClick={() => handleSendEmail(verification.document_id)}
                          disabled={sendingEmail === verification.document_id}
                          className="bg-blue-600 hover:bg-blue-700 gap-2"
                        >
                          {sendingEmail === verification.document_id ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          ) : (
                            <Send className="w-4 h-4" />
                          )}
                          {sendingEmail === verification.document_id ? 'Sending...' : 'Send Email'}
                        </Button>
                      )}
                      
                      {verification.verification_status === 'verified' && (
                        <div className="flex items-center gap-2 text-green-600">
                          <CheckCircle className="w-5 h-5" />
                          <span className="font-medium">Verified</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

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