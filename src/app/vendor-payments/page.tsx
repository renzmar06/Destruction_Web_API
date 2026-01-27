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
  sent: {
    label: "Sent",
    icon: CheckCircle,
    className: "bg-green-100 text-green-700",
  },
  cleared: {
    label: "Cleared",
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
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isExporting, setIsExporting] = useState(false);

  const [formData, setFormData] = useState({
    vendor_name: '',
    payment_amount: '',
    payment_date: new Date().toISOString().split('T')[0],
    payment_method: '',
    reference_number: '',
    notes: ''
  });

  const hasFilters = statusFilter !== "all" || dateFilter !== "all";

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

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    // Required fields
    if (!formData.vendor_name?.trim()) {
      newErrors.vendor_name = "Vendor is required";
    }
    if (!formData.payment_amount?.trim()) {
      newErrors.payment_amount = "Payment amount is required";
    }
    if (!formData.payment_date?.trim()) {
      newErrors.payment_date = "Payment date is required";
    }
    if (!formData.payment_method?.trim()) {
      newErrors.payment_method = "Payment method is required";
    }
    
    // Amount validation
    if (formData.payment_amount?.trim()) {
      const amount = parseFloat(formData.payment_amount);
      if (isNaN(amount) || amount <= 0) {
        newErrors.payment_amount = "Payment amount must be greater than 0";
      }
    }
    
    // Date validation
    if (formData.payment_date?.trim()) {
      const paymentDate = new Date(formData.payment_date);
      const today = new Date();
      today.setHours(23, 59, 59, 999); // Allow today's date
      if (paymentDate > today) {
        newErrors.payment_date = "Payment date cannot be in the future";
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFormDataChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field if it has been filled
    if (value && errors[field]) {
      const newErrors = { ...errors };
      delete newErrors[field];
      setErrors(newErrors);
    }
  };
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
    
    if (!validateForm()) {
      toast.error('Please fix the validation errors before saving.');
      return;
    }

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
        setErrors({});
        fetchVendorPayments();
      } else {
        toast.error(result.message || 'Failed to create vendor payment.');
      }
    } catch (error) {
      toast.error("Failed to create vendor payment.");
    }
  };

  const handleExportReport = async () => {
    setIsExporting(true);
    try {
      const response = await fetch('/api/vendor-payments/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filters: { statusFilter, dateFilter, searchTerm },
          data: filteredExpenses
        })
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `vendor-payments-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        toast.success('Report exported successfully.');
      } else {
        toast.error('Failed to export report.');
      }
    } catch (error) {
      toast.error('Error exporting report.');
    } finally {
      setIsExporting(false);
    }
  };

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

            <Button 
              onClick={handleExportReport}
              disabled={isExporting}
              className="h-12 px-6 bg-slate-900 hover:bg-slate-800 gap-2"
            >
              <Download className="w-5 h-5" />
              {isExporting ? 'Exporting...' : 'Export Report'}
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
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="cleared">Cleared</SelectItem>
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Vendor <span className="text-red-500">*</span></label>
                  <Select value={formData.vendor_name} onValueChange={(value) => handleFormDataChange('vendor_name', value)}>
                    <SelectTrigger className={errors.vendor_name ? 'border-red-400' : ''}>
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
                  {errors.vendor_name && <p className="text-xs text-red-500 mt-1">{errors.vendor_name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Payment Amount <span className="text-red-500">*</span></label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.payment_amount}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFormDataChange('payment_amount', e.target.value)}
                    placeholder="0.00"
                    className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.payment_amount ? 'border-red-400' : ''}`}
                  />
                  {errors.payment_amount && <p className="text-xs text-red-500 mt-1">{errors.payment_amount}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Payment Date <span className="text-red-500">*</span></label>
                  <input
                    type="date"
                    value={formData.payment_date}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFormDataChange('payment_date', e.target.value)}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.payment_date ? 'border-red-400' : ''}`}
                  />
                  {errors.payment_date && <p className="text-xs text-red-500 mt-1">{errors.payment_date}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method <span className="text-red-500">*</span></label>
                  <Select value={formData.payment_method} onValueChange={(value) => handleFormDataChange('payment_method', value)}>
                    <SelectTrigger className={errors.payment_method ? 'border-red-400' : ''}>
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
                  {errors.payment_method && <p className="text-xs text-red-500 mt-1">{errors.payment_method}</p>}
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
                  <Button type="button" onClick={() => {
                    setIsDialogOpen(false);
                    setErrors({});
                  }} className="flex-1 bg-gray-500 hover:bg-gray-600">
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
