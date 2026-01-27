"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle, FileCheck, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

function VerifyDocumentContent() {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState("");
  const [documentId, setDocumentId] = useState("");
  const [token, setToken] = useState("");

  useEffect(() => {
    const docParam = searchParams.get('doc');
    const tokenParam = searchParams.get('token');
    
    if (docParam) setDocumentId(docParam);
    if (tokenParam) setToken(tokenParam);
  }, [searchParams]);

  const handleVerify = async () => {
    if (!token || !documentId) {
      setError("Invalid verification link");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch('/api/document-verification/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, document_id: documentId })
      });
      
      const data = await response.json();
      if (data.success) {
        setVerified(true);
      } else {
        setError(data.message);
      }
    } catch (error) {
      console.error('Verification error:', error);
      setError('Failed to verify document');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full"
      >
        <div className="text-center">
          <div className="p-4 bg-blue-100 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
            <FileCheck className="w-10 h-10 text-blue-600" />
          </div>

          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            Document Verification
          </h1>
          
          {documentId && (
            <p className="text-slate-600 mb-6">
              Document ID: <span className="font-semibold">{documentId}</span>
            </p>
          )}

          {verified ? (
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className="text-center"
            >
              <div className="p-4 bg-green-100 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="text-xl font-semibold text-green-800 mb-2">
                Document Verified Successfully!
              </h2>
              <p className="text-green-600">
                This document has been verified and logged in our system.
              </p>
            </motion.div>
          ) : error ? (
            <div className="text-center">
              <div className="p-4 bg-red-100 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                <AlertCircle className="w-10 h-10 text-red-600" />
              </div>
              <h2 className="text-xl font-semibold text-red-800 mb-2">
                Verification Failed
              </h2>
              <p className="text-red-600 mb-4">{error}</p>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-slate-600 mb-6">
                Click the button below to verify this document and confirm its authenticity.
              </p>
              
              <Button
                onClick={handleVerify}
                disabled={loading || !token || !documentId}
                className="w-full bg-blue-600 hover:bg-blue-700 py-3"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Verifying...
                  </div>
                ) : (
                  "Verify Document"
                )}
              </Button>
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-slate-200">
            <p className="text-xs text-slate-500 text-center">
              This verification is provided by Destruction Services
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function VerifyDocumentPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    }>
      <VerifyDocumentContent />
    </Suspense>
  );
}