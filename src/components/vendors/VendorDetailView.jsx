import React, { useState } from 'react';
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Building2, 
  Mail, 
  Phone, 
  MapPin, 
  X,
  FileText,
  DollarSign,
  TrendingUp,
  Package
} from "lucide-react";
import VendorExpenseHistory from "./VendorExpenseHistory";
import VendorPurchaseOrders from "./VendorPurchaseOrders";
import VendorJobAssociations from "./VendorJobAssociations";
import VendorPerformanceReport from "./VendorPerformanceReport";

export default function VendorDetailView({ vendor, onClose, onEdit }) {
  const [activeTab, setActiveTab] = useState('expenses');

  const { data: expenses = [] } = useQuery({
    queryKey: ['vendorExpenses', vendor.id],
    queryFn: () => base44.entities.Expense.filter({ vendor_id: vendor.id }, '-expense_date')
  });

  const { data: allExpenses = [] } = useQuery({
    queryKey: ['expenses'],
    queryFn: () => base44.entities.Expense.list()
  });

  const { data: jobs = [] } = useQuery({
    queryKey: ['jobs'],
    queryFn: () => base44.entities.Job.list()
  });

  // Calculate stats
  const totalSpent = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  const paidAmount = expenses.filter(e => e.payment_status === 'paid').reduce((sum, e) => sum + (e.amount || 0), 0);
  const pendingAmount = expenses.filter(e => ['pending', 'scheduled'].includes(e.payment_status)).reduce((sum, e) => sum + (e.amount || 0), 0);
  const poCount = expenses.filter(e => e.po_number).length;

  const statusConfig = {
    active: { label: 'Active', class: 'bg-green-100 text-green-700' },
    archived: { label: 'Archived', class: 'bg-slate-100 text-slate-700' }
  };

  const config = statusConfig[vendor.vendor_status] || statusConfig.active;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sticky Record Header */}
      <div className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="w-5 h-5" />
              </Button>
              <div>
                <div className="text-xs uppercase text-slate-500 font-medium mb-1">Vendor</div>
                <div className="text-xl font-bold text-slate-900">
                  {vendor.vendor_name}
                </div>
              </div>
              <Badge className={config.class}>
                {config.label}
              </Badge>
            </div>
            <div className="flex gap-3">
              <Button 
                variant="outline"
                onClick={() => {
                  onEdit(vendor);
                  onClose();
                }}
                className="border-slate-300"
              >
                Edit
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Vendor Snapshot Panel */}
        <div className="grid grid-cols-3 gap-6 mb-6">
          {/* Contact Info */}
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-5">
            <h4 className="text-xs font-semibold uppercase text-slate-600 mb-3">Contact Information</h4>
            <div className="space-y-2 text-sm">
              {vendor.contact_person && (
                <div className="flex items-start gap-2">
                  <Building2 className="w-4 h-4 text-slate-400 mt-0.5" />
                  <span className="text-slate-700">{vendor.contact_person}</span>
                </div>
              )}
              {vendor.email && (
                <div className="flex items-start gap-2">
                  <Mail className="w-4 h-4 text-slate-400 mt-0.5" />
                  <a href={`mailto:${vendor.email}`} className="text-blue-600 hover:underline">
                    {vendor.email}
                  </a>
                </div>
              )}
              {vendor.phone && (
                <div className="flex items-start gap-2">
                  <Phone className="w-4 h-4 text-slate-400 mt-0.5" />
                  <span className="text-slate-700">{vendor.phone}</span>
                </div>
              )}
              {vendor.address && (
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-slate-400 mt-0.5" />
                  <span className="text-slate-700 text-xs">{vendor.address}</span>
                </div>
              )}
            </div>
          </div>

          {/* Business Details */}
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-5">
            <h4 className="text-xs font-semibold uppercase text-slate-600 mb-3">Business Details</h4>
            <div className="space-y-2 text-sm">
              <div>
                <div className="text-xs text-slate-500">Category</div>
                <div className="font-medium text-slate-900">
                  {vendor.vendor_category?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Not Set'}
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-500">Payment Terms</div>
                <div className="font-medium text-slate-900">
                  {vendor.payment_terms?.replace(/_/g, ' ').toUpperCase() || 'Not Set'}
                </div>
              </div>
              {vendor.tax_id && (
                <div>
                  <div className="text-xs text-slate-500">Tax ID</div>
                  <div className="font-medium text-slate-900">{vendor.tax_id}</div>
                </div>
              )}
            </div>
          </div>

          {/* Financial Summary */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border-2 border-blue-200 shadow-sm p-5">
            <h4 className="text-xs font-semibold uppercase text-slate-600 mb-3">Financial Summary</h4>
            <div className="space-y-3">
              <div>
                <div className="text-xs text-slate-500 mb-1">Total Spent</div>
                <div className="text-2xl font-bold text-slate-900">${totalSpent.toFixed(2)}</div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <div className="text-slate-500">Paid</div>
                  <div className="font-semibold text-green-600">${paidAmount.toFixed(2)}</div>
                </div>
                <div>
                  <div className="text-slate-500">Pending</div>
                  <div className="font-semibold text-amber-600">${pendingAmount.toFixed(2)}</div>
                </div>
              </div>
              <div className="text-xs text-slate-600">
                {expenses.length} transactions • {poCount} POs
              </div>
            </div>
          </div>
        </div>

        {/* Tab-Based Workflow */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="bg-white border border-slate-200 p-1 h-auto">
            <TabsTrigger value="expenses" className="px-4 py-2">
              <FileText className="w-4 h-4 mr-2" />
              Expenses
            </TabsTrigger>
            <TabsTrigger value="purchase-orders" className="px-4 py-2">
              <Package className="w-4 h-4 mr-2" />
              Purchase Orders
            </TabsTrigger>
            <TabsTrigger value="jobs" className="px-4 py-2">
              <DollarSign className="w-4 h-4 mr-2" />
              Job Associations
            </TabsTrigger>
            <TabsTrigger value="performance" className="px-4 py-2">
              <TrendingUp className="w-4 h-4 mr-2" />
              Performance Report
            </TabsTrigger>
          </TabsList>

          <TabsContent value="expenses" className="mt-0">
            <VendorExpenseHistory vendor={vendor} expenses={expenses} />
          </TabsContent>

          <TabsContent value="purchase-orders" className="mt-0">
            <VendorPurchaseOrders vendor={vendor} expenses={expenses} />
          </TabsContent>

          <TabsContent value="jobs" className="mt-0">
            <VendorJobAssociations vendor={vendor} expenses={expenses} jobs={jobs} />
          </TabsContent>

          <TabsContent value="performance" className="mt-0">
            <VendorPerformanceReport vendor={vendor} expenses={allExpenses} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}