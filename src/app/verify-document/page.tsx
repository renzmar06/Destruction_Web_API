"use client";

import React, { useEffect, useState } from "react";
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Shield,
  Copy,
  Check,
} from "lucide-react";
import { format } from "date-fns";

/* ---------------- TYPES ---------------- */
type Affidavit = {
  affidavit_number: string;
  affidavit_status: "pending" | "issued" | "locked";
  customer_name?: string;
  job_reference?: string;
  job_location?: string;
  job_completion_date?: string;
  destruction_method?: string;
  issued_timestamp?: string;
  revoked?: boolean;
  revoked_timestamp?: string;
  revocation_reason?: string;
  document_hash?: string;
  service_provider_name?: string;
};

/* ---------------- PAGE ---------------- */
export default function VerifyDocumentPage() {
  const [documentNumber, setDocumentNumber] = useState("");
  const [searchInitiated, setSearchInitiated] = useState(false);
  const [copiedHash, setCopiedHash] = useState(false);

  /* STATIC MOCK DOCUMENT (replace later with API) */
  const [affidavit, setAffidavit] = useState<Affidavit | null>(null);

  /* URL PARAM SUPPORT */
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const doc = params.get("doc");
    if (doc) {
      setDocumentNumber(doc);
      setSearchInitiated(true);
      mockLookup(doc);
    }
  }, []);

  /* HASH GENERATOR (UNCHANGED LOGIC) */
  const generateHashLock = (data: any) => {
    const str = JSON.stringify(data);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16).toUpperCase().padStart(64, "0");
  };

  /* MOCK VERIFY (STATIC) */
  const mockLookup = (doc: string) => {
    if (doc.toUpperCase() === "AFF-1001") {
      const issued = new Date().toISOString();
      const hash = generateHashLock({
        doc_id: doc,
        issued,
        customer: "Acme Corp",
        job: "JOB-7788",
      });

      setAffidavit({
        affidavit_number: doc,
        affidavit_status: "issued",
        customer_name: "Acme Corp",
        job_reference: "JOB-7788",
        job_location: "Dallas, TX",
        job_completion_date: issued,
        destruction_method: "secure_shredding",
        issued_timestamp: issued,
        service_provider_name: "DestructionOps LLC",
        document_hash: hash,
      });
    } else {
      setAffidavit(null);
    }
  };

  const handleVerify = () => {
    if (!documentNumber.trim()) return;
    setSearchInitiated(true);
    mockLookup(documentNumber.trim());
  };

  const documentHash = affidavit
    ? generateHashLock({
        doc_id: affidavit.affidavit_number,
        issued: affidavit.issued_timestamp,
        customer: affidavit.customer_name,
        job: affidavit.job_reference,
      })
    : "";

  const storedHash = affidavit?.document_hash || documentHash;
  const hashMatched = documentHash === storedHash;

  const isValid =
    affidavit &&
    !affidavit.revoked &&
    (affidavit.affidavit_status === "issued" ||
      affidavit.affidavit_status === "locked");

  const copyHash = () => {
    navigator.clipboard.writeText(`SHA256:${storedHash}`);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b bg-slate-50">
        <div className="max-w-5xl mx-auto px-6 py-8">
          <div className="flex items-center gap-3 mb-3">
            <Shield className="w-8 h-8 text-slate-700" />
            <h1 className="text-2xl font-bold">Official Document Verification</h1>
          </div>
          <p className="text-sm text-slate-600">
            Verify the authenticity of a system-issued compliance document.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Search */}
        {!affidavit && (
          <div className="mb-8 border bg-slate-50 p-6">
            <label className="block text-sm font-semibold mb-2">
              Document Number
            </label>
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="AFF-1001"
                value={documentNumber}
                onChange={(e) => setDocumentNumber(e.target.value)}
                className="flex-1 px-4 py-2 border"
              />
              <button
                onClick={handleVerify}
                className="px-6 py-2 bg-slate-900 text-white"
              >
                Verify
              </button>
            </div>
          </div>
        )}

        {searchInitiated && (
          <>
            {affidavit ? (
              <>
                {/* STATUS */}
                <div
                  className={`border-l-4 p-4 mb-6 ${
                    isValid
                      ? "bg-green-50 border-green-600"
                      : "bg-red-50 border-red-600"
                  }`}
                >
                  <div className="flex gap-3">
                    {isValid ? (
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    ) : (
                      <XCircle className="w-6 h-6 text-red-600" />
                    )}
                    <div>
                      <p className="font-bold text-sm">
                        STATUS: {isValid ? "VALID" : "INVALID"}
                      </p>
                      <p className="text-sm text-slate-700">
                        Issued:{" "}
                        {format(
                          new Date(affidavit.issued_timestamp!),
                          "MMM d, yyyy HH:mm"
                        )}{" "}
                        UTC
                      </p>
                    </div>
                  </div>
                </div>

                {/* SUMMARY */}
                <div className="border mb-6">
                  <div className="bg-slate-100 px-4 py-3 font-bold">
                    Document Summary
                  </div>
                  <div className="p-6 text-sm space-y-2">
                    <p>
                      <strong>ID:</strong>{" "}
                      <span className="font-mono">
                        {affidavit.affidavit_number}
                      </span>
                    </p>
                    <p>
                      <strong>Customer:</strong> {affidavit.customer_name}
                    </p>
                    <p>
                      <strong>Job:</strong> {affidavit.job_reference}
                    </p>
                    <p>
                      <strong>Provider:</strong>{" "}
                      {affidavit.service_provider_name}
                    </p>
                  </div>
                </div>

                {/* HASH */}
                <div className="border mb-6">
                  <div className="bg-slate-100 px-4 py-3 font-bold">
                    Document Integrity
                  </div>
                  <div className="p-6">
                    <div className="flex justify-between mb-2">
                      <span className="text-xs font-semibold">Hash</span>
                      <button
                        onClick={copyHash}
                        className="text-xs flex items-center gap-1"
                      >
                        {copiedHash ? (
                          <Check className="w-3 h-3" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                        {copiedHash ? "Copied" : "Copy"}
                      </button>
                    </div>
                    <p className="font-mono text-xs bg-slate-50 p-3 break-all">
                      SHA256:{storedHash}
                    </p>
                    <p
                      className={`font-bold mt-2 ${
                        hashMatched ? "text-green-700" : "text-red-700"
                      }`}
                    >
                      {hashMatched ? "HASH MATCHED" : "HASH MISMATCH"}
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <div className="border border-red-600 bg-red-50 p-12 text-center">
                <XCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-red-900">
                  Document Not Found
                </h3>
                <p className="text-red-700 mt-2">
                  No document with number "{documentNumber}" exists.
                </p>
              </div>
            )}
          </>
        )}

        {/* Footer */}
        <div className="mt-12 pt-6 border-t text-xs text-slate-600 flex justify-between">
          <div>
            <p>Verification System v1.0</p>
            <p>{format(new Date(), "yyyy-MM-dd HH:mm:ss")} UTC</p>
          </div>
          <div className="text-right">
            <p>Public Verification</p>
            <p>{window.location.origin}/verify-document</p>
          </div>
        </div>
      </div>
    </div>
  );
}
