"use client";

import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/redux/store';
import { fetchServiceRequests } from '@/redux/slices/customerRequestsSlice';
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { format, parseISO } from "date-fns";

/* Icons */
import {
  ClipboardList,
  AlertCircle,
  FileText,
  Briefcase,
  Clock,
  Search,
  Filter,
  List,
  CalendarDays,
  Phone,
  ChevronRight,
} from "lucide-react";

/* Components */
import CalendarView from "@/components/service-requests/CalendarView";

/* ======================================================
   TYPES
====================================================== */

type RequestStatus =
  | "pending"
  | "in_review"
  | "quoted"
  | "approved"
  | "in_progress"
  | "completed"
  | "cancelled";

type Urgency = "normal" | "expedited" | "urgent";

interface ServiceRequest {
  _id?: string;
  id?: string;
  requestNumber: string;
  serviceType: string;
  productType: string;
  preferredDate: string;
  createdAt: string;
  contactName: string;
  contactPhone: string;
  urgency: Urgency;
  status: RequestStatus;
  admin_notes?: string;
}

/* ======================================================
   CONFIG
====================================================== */

const statusConfig: Record<RequestStatus, { label: string; className: string }> =
  {
    pending: { label: "Pending Review", className: "bg-amber-100 text-amber-700" },
    in_review: { label: "In Review", className: "bg-blue-100 text-blue-700" },
    quoted: { label: "Quote Sent", className: "bg-purple-100 text-purple-700" },
    approved: { label: "Approved", className: "bg-green-100 text-green-700" },
    in_progress: { label: "In Progress", className: "bg-indigo-100 text-indigo-700" },
    completed: { label: "Completed", className: "bg-slate-100 text-slate-700" },
    cancelled: { label: "Cancelled", className: "bg-red-100 text-red-700" },
  };

const urgencyConfig: Record<Urgency, { label: string; className: string }> = {
  normal: { label: "Normal", className: "bg-slate-100 text-slate-700" },
  expedited: { label: "Expedited", className: "bg-blue-100 text-blue-700" },
  urgent: { label: "Urgent", className: "bg-red-100 text-red-700" },
};

/* ======================================================
   PAGE
====================================================== */

export default function ServiceRequestsPage() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { requests, loading } = useSelector((state: RootState) => state.customerRequests);

  const [selectedRequest, setSelectedRequest] =
    useState<ServiceRequest | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");

  const [statusFilter, setStatusFilter] =
    useState<"all" | RequestStatus>("all");
  const [urgencyFilter, setUrgencyFilter] =
    useState<"all" | Urgency>("all");
  const [customerSearch, setCustomerSearch] = useState("");
  const [createdFromDate, setCreatedFromDate] = useState("");
  const [createdToDate, setCreatedToDate] = useState("");
  const [preferredFromDate, setPreferredFromDate] = useState("");
  const [preferredToDate, setPreferredToDate] = useState("");

  useEffect(() => {
    dispatch(fetchServiceRequests());
  }, [dispatch]);

  /* ======================================================
     FILTER LOGIC
  ====================================================== */

  const filteredRequests = requests.filter((r) => {
    if (statusFilter !== "all" && r.status !== statusFilter) return false;
    if (urgencyFilter !== "all" && r.urgency !== urgencyFilter) return false;
    if (
      customerSearch &&
      !r.contactName?.toLowerCase().includes(customerSearch.toLowerCase())
    )
      return false;
    return true;
  });

  /* ======================================================
     DETAIL VIEW
  ====================================================== */

  if (selectedRequest) {
    const status = statusConfig[selectedRequest.status as keyof typeof statusConfig] || statusConfig.pending;

    return (
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <button onClick={() => setSelectedRequest(null)} className="px-4 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors">
            ← Back to Requests
          </button>

          <div className="mt-4 rounded-lg border bg-white shadow-sm">
            <div className="p-8 space-y-6">
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold">
                  Request #{selectedRequest.requestNumber}
                </h2>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${status.className}`}>{status.label}</span>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${urgencyConfig[selectedRequest.urgency].className}`}>
                  {urgencyConfig[selectedRequest.urgency].label}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="font-semibold">Contact Name</p>
                  <p>{selectedRequest.contactName}</p>
                </div>
                <div>
                  <p className="font-semibold">Preferred Date</p>
                  <p>
                    {selectedRequest.preferredDate ? format(
                      parseISO(selectedRequest.preferredDate),
                      "MMM d, yyyy"
                    ) : 'Not specified'}
                  </p>
                </div>
              </div>

              <div>
                <p className="font-semibold mb-1">Admin Notes</p>
                <textarea
                  value={adminNotes}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setAdminNotes(e.target.value)}
                  placeholder="Internal notes…"
                  className="w-full px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={4}
                />
              </div>

              <div className="flex gap-3">
                <button
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center gap-2 transition-colors"
                  onClick={() =>
                    router.push(
                      `/estimates?customer_id=${selectedRequest.contactName}`
                    )
                  }
                >
                  <FileText className="w-4 h-4" />
                  Create Estimate
                </button>
                <button
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md flex items-center gap-2 transition-colors"
                  onClick={() =>
                    router.push(
                      `/jobs?customer_id=${selectedRequest.contactName}`
                    )
                  }
                >
                  <Briefcase className="w-4 h-4" />
                  Create Job
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ======================================================
     LIST / CALENDAR VIEW
  ====================================================== */

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-600 rounded-2xl">
              <ClipboardList className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Service Requests</h1>
              <p className="text-slate-500">
                Review and respond to customer service requests
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              className={`px-4 py-2 text-sm rounded-lg flex items-center gap-2 transition-colors ${
                viewMode === "list" 
                  ? "bg-slate-900 text-white" 
                  : "border border-slate-200 hover:bg-slate-50 text-slate-700"
              }`}
              onClick={() => setViewMode("list")}
            >
              <List className="w-4 h-4" /> List
            </button>
            <button
              className={`px-4 py-2 text-sm rounded-lg flex items-center gap-2 transition-colors ${
                viewMode === "calendar" 
                  ? "bg-slate-900 text-white" 
                  : "border border-slate-200 hover:bg-slate-50 text-slate-700"
              }`}
              onClick={() => setViewMode("calendar")}
            >
              <CalendarDays className="w-4 h-4" /> Calendar
            </button>
          </div>
        </div>

        {/* SUMMARY STATS ROW */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-amber-700">Pending Review</p>
                <p className="text-3xl font-bold text-amber-900 mt-1">
                  {requests.filter(r => r.status === "pending").length}
                </p>
              </div>
              <div className="p-3 bg-amber-100 rounded-xl">
                <Clock className="w-6 h-6 text-amber-600" />
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700">In Review</p>
                <p className="text-3xl font-bold text-blue-900 mt-1">
                  {requests.filter(r => r.status === "in_review").length}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-xl">
                <AlertCircle className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-700">Total Requests</p>
                <p className="text-3xl font-bold text-slate-900 mt-1">{requests.length}</p>
              </div>
              <div className="p-3 bg-slate-100 rounded-xl">
                <ClipboardList className="w-6 h-6 text-slate-600" />
              </div>
            </div>
          </div>
        </div>

        {/* FILTERS SECTION */}
        {viewMode === "list" && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-8">
            <div className="flex items-center gap-2 mb-6">
              <Filter className="w-5 h-5 text-slate-600" />
              <h3 className="font-semibold text-slate-900">Filters</h3>
            </div>

            <div className="grid grid-cols-4 gap-6 mb-6">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">Customer Name</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Search customer..."
                    value={customerSearch}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCustomerSearch(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">Status</label>
                <select 
                  value={statusFilter} 
                  onChange={(e) => setStatusFilter(e.target.value as "all" | RequestStatus)}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Statuses</option>
                  {Object.entries(statusConfig).map(([k, v]) => (
                    <option key={k} value={k}>
                      {v.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">Urgency</label>
                <select 
                  value={urgencyFilter} 
                  onChange={(e) => setUrgencyFilter(e.target.value as "all" | Urgency)}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Urgency Levels</option>
                  {Object.entries(urgencyConfig).map(([k, v]) => (
                    <option key={k} value={k}>
                      {v.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-end">
                <button
                  className="w-full px-4 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg transition-colors font-medium"
                  onClick={() => {
                    setCustomerSearch("");
                    setStatusFilter("all");
                    setUrgencyFilter("all");
                    setCreatedFromDate("");
                    setCreatedToDate("");
                    setPreferredFromDate("");
                    setPreferredToDate("");
                  }}
                >
                  Clear All Filters
                </button>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-6">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">Created Date From</label>
                <input
                  type="date"
                  value={createdFromDate}
                  onChange={(e) => setCreatedFromDate(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">Created Date To</label>
                <input
                  type="date"
                  value={createdToDate}
                  onChange={(e) => setCreatedToDate(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">Preferred Date From</label>
                <input
                  type="date"
                  value={preferredFromDate}
                  onChange={(e) => setPreferredFromDate(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">Preferred Date To</label>
                <input
                  type="date"
                  value={preferredToDate}
                  onChange={(e) => setPreferredToDate(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        )}

        {/* LIST / CALENDAR */}
        {loading ? (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-12 text-center">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-500">Loading service requests...</p>
          </div>
        ) : viewMode === "calendar" ? (
          <CalendarView
            requests={filteredRequests}
            onSelectRequest={setSelectedRequest}
          />
        ) : (
          <div className="space-y-4">
            {filteredRequests.length === 0 ? (
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-12 text-center">
                <ClipboardList className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500 text-lg font-medium">No service requests found</p>
                <p className="text-slate-400 text-sm mt-1">Try adjusting your filters or check back later</p>
              </div>
            ) : (
              filteredRequests.map((r) => {
                const status = statusConfig[r.status as keyof typeof statusConfig] || statusConfig.pending;
                return (
                  <div
                    key={r._id || r.id}
                    className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer p-6"
                    onClick={() => setSelectedRequest(r)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-slate-900">
                            Request #{r.requestNumber}
                          </h3>
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${status.className}`}>
                            {status.label}
                          </span>
                        </div>
                        <p className="text-slate-700 font-medium mb-1">{r.contactName}</p>
                        <div className="flex items-center gap-4 text-sm text-slate-500">
                          <span>Preferred: {r.preferredDate ? format(parseISO(r.preferredDate), "MMM d, yyyy") : 'Not specified'}</span>
                          <span>Submitted: {format(parseISO(r.createdAt), "MMM d, yyyy")}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <div className="flex items-center gap-2 text-slate-700 mb-1">
                            <FileText className="w-4 h-4" />
                            <span className="font-medium">{r.serviceType}</span>
                          </div>
                          <div className="flex items-center gap-2 text-slate-500 text-sm">
                            <Phone className="w-4 h-4" />
                            <span>{r.contactPhone}</span>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-slate-400" />
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
}
