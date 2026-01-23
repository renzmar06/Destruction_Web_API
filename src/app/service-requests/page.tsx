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
  ArrowLeft,
  User,
  MapPin,
  Package,
  Zap
} from "lucide-react";

/* Components */
import CalendarView from "@/components/service-requests/CalendarView";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";

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
  estimatedWeight?: string;
  preferredDate: string;
  createdAt: string;
  contactName: string;
  contactPhone: string;
  urgency?: Urgency;
  status: RequestStatus;
  user_id?: string;
  adminNotes?: string;
}

/* ======================================================
   CONFIG
====================================================== */

const statusConfig: Record<RequestStatus, { label: string; className: string; icon: any }> =
  {
    pending: { label: "Pending Review", className: "bg-amber-100 text-amber-700", icon: Clock },
    in_review: { label: "In Review", className: "bg-blue-100 text-blue-700", icon: AlertCircle },
    quoted: { label: "Quote Sent", className: "bg-purple-100 text-purple-700", icon: FileText },
    approved: { label: "Approved", className: "bg-green-100 text-green-700", icon: Briefcase },
    in_progress: { label: "In Progress", className: "bg-indigo-100 text-indigo-700", icon: Zap },
    completed: { label: "Completed", className: "bg-slate-100 text-slate-700", icon: ClipboardList },
    cancelled: { label: "Cancelled", className: "bg-red-100 text-red-700", icon: AlertCircle },
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
    const config = statusConfig[selectedRequest.status] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Button 
            variant="ghost" 
            onClick={() => setSelectedRequest(null)}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to All Requests
          </Button>

          <Card>
            <CardContent className="p-8 space-y-6">
              {/* Header */}
              <div className="flex items-start justify-between pb-6 border-b">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-2xl font-bold text-slate-900">
                      Request #{selectedRequest.requestNumber}
                    </h2>
                    <Badge className={config.className}>
                      <Icon className="w-3 h-3 mr-1" />
                      {config.label}
                    </Badge>
                    <Badge className={urgencyConfig[selectedRequest.urgency || 'normal']?.className}>
                      {urgencyConfig[selectedRequest.urgency || 'normal']?.label}
                    </Badge>
                  </div>
                  <p className="text-slate-600">{selectedRequest.contactName}</p>
                  <p className="text-sm text-slate-500">
                    Submitted: {selectedRequest.createdAt ? format(new Date(selectedRequest.createdAt), 'MMM d, yyyy h:mm a') : 'N/A'}
                  </p>
                </div>
              </div>

              {/* Request Details */}
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-700 mb-1">Service Type</p>
                    <p className="text-slate-900 capitalize">{selectedRequest.serviceType?.replace(/_/g, ' ')}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-700 mb-1">Product Type</p>
                    <p className="text-slate-900 capitalize">{selectedRequest.productType?.replace(/_/g, ' ')}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-700 mb-1">Estimated Weight</p>
                    <p className="text-slate-900">{selectedRequest.estimatedWeight || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-700 mb-1">Preferred Date</p>
                    <p className="text-slate-900">{selectedRequest.preferredDate ? format(new Date(selectedRequest.preferredDate), 'MMM d, yyyy') : 'Not specified'}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-700 mb-1">Contact</p>
                    <p className="text-slate-900">{selectedRequest.contactName}</p>
                    <p className="text-slate-600 text-sm">{selectedRequest.contactPhone}</p>
                  </div>
                </div>
              </div>

              {/* Admin Actions */}
              <div className="border-t pt-6 space-y-4">
                <h3 className="font-semibold text-slate-900">Admin Actions</h3>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Update Status</label>
                  <Select
                    value={selectedRequest.status}
                    onValueChange={(status) => {
                      setSelectedRequest({...selectedRequest, status: status as RequestStatus});
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending Review</SelectItem>
                      <SelectItem value="in_review">In Review</SelectItem>
                      <SelectItem value="quoted">Quote Sent</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Admin Notes (Internal)</label>
                  <textarea
                    value={adminNotes || ''}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Add internal notes about this request..."
                    rows={4}
                    className="flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                  />
                  <Button
                    onClick={async () => {
                      try {
                        const response = await fetch(`/api/customer-requests/${selectedRequest._id || selectedRequest.id}`, {
                          method: 'PUT',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ 
                            adminNotes, 
                            status: selectedRequest.status,
                            notifyCustomer: true 
                          })
                        });
                        
                        const data = await response.json();
                        
                        if (data.success) {
                          toast.success('Status updated and customer notified!');
                          setAdminNotes('');
                          setSelectedRequest(null);
                          dispatch(fetchServiceRequests());
                        } else {
                          toast.error('Failed to update status');
                        }
                      } catch (error) {
                        toast.error('Error occurred while updating status');
                      }
                    }}
                    disabled={!adminNotes}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 gap-2"
                    size="sm"
                  >
                    <FileText className="w-4 h-4" />
                    Save & Notify Customer
                  </Button>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={() => router.push(`/estimates?customer_id=${selectedRequest.contactName}`)}
                    className="bg-blue-600 hover:bg-blue-700 gap-2"
                  >
                    <FileText className="w-4 h-4" />
                    Create Estimate
                  </Button>
                  <Button
                    onClick={() => router.push(`/jobs?customer_id=${selectedRequest.contactName}`)}
                    className="bg-green-600 hover:bg-green-700 gap-2"
                  >
                    <Briefcase className="w-4 h-4" />
                    Create Job
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
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
                    key={r.id || r.requestNumber}
                    className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer p-6"
                    onClick={() => setSelectedRequest(r as ServiceRequest)}
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
                          <span>Preferred: {r.preferredDate ? format(new Date(r.preferredDate), "MMM d, yyyy") : 'Not specified'}</span>
                          <span>Submitted: {format(new Date(r.createdAt), "MMM d, yyyy")}</span>
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
      <Toaster />
    </div>
  );
}
