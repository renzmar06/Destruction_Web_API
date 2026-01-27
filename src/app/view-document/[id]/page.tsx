"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { FileCheck, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ViewDocumentPage() {
  const params = useParams();
  const documentId = params.id as string;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(false);
  }, []);

  const handleDownload = () => {
    window.open(`/api/view-document/${documentId}`, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-4 bg-blue-100 rounded-full">
              <FileCheck className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Document Viewer</h1>
              <p className="text-slate-600">Document ID: {documentId}</p>
            </div>
          </div>

          <div className="flex gap-4 mb-6">
            <Button onClick={handleDownload} className="gap-2">
              <Download className="w-4 h-4" />
              Download Document
            </Button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <iframe
            src={`/api/view-document/${documentId}`}
            className="w-full h-[800px] border-0"
            title="Document Viewer"
          />
        </div>
      </div>
    </div>
  );
}