"use client";

import React, { useMemo, useState, useEffect } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/redux/store';
import { fetchVendors } from '@/redux/slices/vendorsSlice';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DollarSign,
  Search,
  Download,
  CheckCircle,
  Clock,
  Calendar,
  X,
  Plus,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { toast } from 'sonner';

/* --------------------------------------------------
   STATIC CONFIG
-------------------------------------------------- */

const paymentStatusConfig: Record<string, any> = {
  pending: {
    label: "Pending",
    icon: Clock,
    className: "bg-amber-100 text-amber-700",
  },
  scheduled: {
    label: "Scheduled",
    icon: Calendar,
    className: "bg-blue-100 text-blue-700",
  },
  paid: {
    label: "Paid",
    icon: CheckCircle,
    className: "bg-green-100 text-green-700",
  },
};

export default function PaymentsPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { vendors } = useSelector((state: RootState) => state.vendors);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [vendorPayments, setVendorPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    vendor_name: '',
    payment_amount: '',
    payment_date: new Date().toISOString().split('T')[0],
    payment_method: '',
    reference_number: '',
    notes: ''
  });

  useEffect(() => {
    dispatch(fetchVendors());
    fetchVendorPayments();
  }, [dispatch]);

  const fetchVendorPayments = async () => {
    try {
      const response = await fetch('/api/vendor-payments');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      if (result.success) {
        setVendorPayments(result.data);
      } else {
        console.error('API error:', result.message);
        setVendorPayments([]);
      }
    } catch (error) {
      console.error('Error fetching vendor payments:', error);
      setVendorPayments([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredExpenses = useMemo(() => {
    return vendorPayments.filter((payment) => {
      const matchesSearch =
        payment.payment_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.vendor_name.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || payment.payment_status === statusFilter;

      let matchesDate = true;
      if (dateFilter === "this_week") {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        matchesDate = new Date(payment.payment_date) >= weekAgo;
      }

      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [vendorPayments, searchTerm, statusFilter, dateFilter]);

  const totals = useMemo(() => {
    const pending = filteredExpenses
      .filter((e) => e.payment_status !== "sent" && e.payment_status !== "cleared")
      .reduce((sum, e) => sum + e.payment_amount, 0);

    const paid = filteredExpenses
      .filter((e) => e.payment_status === "sent" || e.payment_status === "cleared")
      .reduce((sum, e) => sum + e.payment_amount, 0);

    return { pending, paid, total: pending + paid };
  }, [filteredExpenses]);

  const handleMarkAsPaid = async (paymentId: string) => {
    try {
      const response = await fetch(`/api/vendor-payments/${paymentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payment_status: 'cleared' })
      });
      
      const result = await response.json();
      if (result.success) {
        toast.success("Payment marked as cleared successfully.");
        fetchVendorPayments();
      }
    } catch (error) {
      toast.error("Failed to update payment status.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/vendor-payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const result = await response.json();
      if (result.success) {
        toast.success("Vendor payment created successfully.");
        setIsDialogOpen(false);
        setFormData({
          vendor_name: '',
          payment_amount: '',
          payment_date: new Date().toISOString().split('T')[0],
          payment_method: '',
          reference_number: '',
          notes: ''
        });
        fetchVendorPayments();
      }
    } catch (error) {
      toast.error("Failed to create vendor payment.");
    }
  };

  const hasFilters = statusFilter !== "all" || dateFilter !== "all";

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-slate-900 rounded-2xl">
              <DollarSign className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                Vendor Payments
              </h1>
              <p className="text-slate-500 mt-1">
                Track and manage vendor payments
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <Button 
              onClick={() => setIsDialogOpen(true)}
              className="h-12 px-6 bg-blue-600 hover:bg-blue-700 gap-2"
            >
              <Plus className="w-5 h-5" />
              Add Payment
            </Button>

            <Button className="h-12 px-6 bg-slate-900 hover:bg-slate-800 gap-2">
              <Download className="w-5 h-5" />
              Export Report
            </Button>
          </div>
        </div>

        {/* Summary */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <SummaryCard title="Pending Payments" value={totals.pending} color="amber" />
          <SummaryCard title="Paid This Period" value={totals.paid} color="green" />
          <SummaryCard title="Total" value={totals.total} />
        </div>

        {/* Filters */}
        <div className="bg-white border rounded-2xl">
          <div className="p-6 space-y-4 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                className="pl-10 h-12 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Search payments..."
                value={searchTerm}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex gap-3 flex-wrap">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Payment Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                </SelectContent>
              </Select>

              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Date Filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Dates</SelectItem>
                  <SelectItem value="this_week">This Week</SelectItem>
                </SelectContent>
              </Select>

              {hasFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setStatusFilter("all");
                    setDateFilter("all");
                  }}
                >
                  <X className="w-4 h-4 mr-1" /> Clear Filters
                </Button>
              )}
            </div>
          </div>

          {/* Table */}
          {loading ? (
            <div className="p-8 text-center">
              <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
              <p className="text-slate-600">Loading payments...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vendor</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Method</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reference</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>

                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredExpenses.map((payment) => {
                    const StatusIcon =
                      paymentStatusConfig[payment.payment_status]?.icon || Clock;
                    return (
                      <motion.tr key={payment._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{payment.payment_number}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{payment.vendor_name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${payment.payment_amount.toFixed(2)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {format(new Date(payment.payment_date), "MMM d, yyyy")}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge className={paymentStatusConfig[payment.payment_status]?.className || "bg-slate-100 text-slate-700"}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {paymentStatusConfig[payment.payment_status]?.label || payment.payment_status}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">
                          {payment.payment_method.replace('_', ' ') || "-"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {payment.reference_number || "-"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          {payment.payment_status !== "cleared" && (
                            <Button
                              size="sm"
                              onClick={() => handleMarkAsPaid(payment._id)}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              Mark Cleared
                            </Button>
                          )}
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Add Payment Modal */}
        {isDialogOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h2 className="text-lg font-semibold mb-4">Record Vendor Payment</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Vendor</label>
                  <Select value={formData.vendor_name} onValueChange={(value) => setFormData(prev => ({ ...prev, vendor_name: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select vendor" />
                    </SelectTrigger>
                    <SelectContent>
                      {vendors.map(vendor => (
                        <SelectItem key={vendor._id} value={vendor.vendor_name}>
                          {vendor.vendor_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Payment Amount</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.payment_amount}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, payment_amount: e.target.value }))}
                    placeholder="0.00"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Payment Date</label>
                  <input
                    type="date"
                    value={formData.payment_date}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, payment_date: e.target.value }))}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                  <Select value={formData.payment_method} onValueChange={(value) => setFormData(prev => ({ ...prev, payment_method: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                      <SelectItem value="check">Check</SelectItem>
                      <SelectItem value="ach">ACH</SelectItem>
                      <SelectItem value="wire">Wire Transfer</SelectItem>
                      <SelectItem value="cash">Cash</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Reference Number (Optional)</label>
                  <input
                    value={formData.reference_number}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, reference_number: e.target.value }))}
                    placeholder="Transaction reference"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Additional notes"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex gap-3">
                  <Button type="button" onClick={() => setIsDialogOpen(false)} className="flex-1 bg-gray-500 hover:bg-gray-600">
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1">
                    Record Payment
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* --------------------------------------------------
   SMALL COMPONENT
-------------------------------------------------- */

function SummaryCard({ title, value, color = "slate" }: any) {
  return (
    <div className="bg-white border rounded-2xl p-6">
      <p className="text-sm text-slate-600 mb-1">{title}</p>
      <p className={`text-3xl font-bold text-${color}-600`}>
        ${value.toFixed(2)}
      </p>
    </div>
  );
}
