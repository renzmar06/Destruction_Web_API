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
  ChevronDown,
  FileText,
  Receipt,
  CreditCard,
  Briefcase,
  BarChart3,
  User,
  X
} from "lucide-react";
import { createPageUrl } from "../../utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import CustomerTransactionsTab from "./tabs/CustomerTransactionsTab";
import CustomerInvoicesTab from "./tabs/CustomerInvoicesTab";
import CustomerEstimatesTab from "./tabs/CustomerEstimatesTab";
import CustomerJobsTab from "./tabs/CustomerJobsTab";
import CustomerDetailsTab from "./tabs/CustomerDetailsTab";

export default function CustomerDetailView({ 
  customer, 
  onClose, 
  onEdit,
  onCreateInvoice,
  onCreateEstimate,
  onCreateJob,
  onReceivePayment 
}) {
  const [activeTab, setActiveTab] = useState('transactions');

  // Fetch related data
  const { data: invoices = [] } = useQuery({
    queryKey: ['customerInvoices', customer.id],
    queryFn: () => base44.entities.Invoice.filter({ customer_id: customer.id }, '-issue_date')
  });

  const { data: estimates = [] } = useQuery({
    queryKey: ['customerEstimates', customer.id],
    queryFn: () => base44.entities.Estimate.filter({ customer_id: customer.id }, '-estimate_date')
  });

  const { data: jobs = [] } = useQuery({
    queryKey: ['customerJobs', customer.id],
    queryFn: () => base44.entities.Job.filter({ customer_id: customer.id }, '-created_date')
  });

  const { data: locations = [] } = useQuery({
    queryKey: ['customerLocations', customer.id],
    queryFn: () => base44.entities.Location.filter({ customer_id: customer.id })
  });

  // Calculate financials
  const openBalance = invoices
    .filter(inv => inv.invoice_status !== 'paid')
    .reduce((sum, inv) => sum + ((inv.balance_due || inv.total_amount) || 0), 0);

  const overdueAmount = invoices
    .filter(inv => {
      const isUnpaid = inv.invoice_status !== 'paid';
      const isPastDue = new Date(inv.due_date) < new Date();
      return isUnpaid && isPastDue;
    })
    .reduce((sum, inv) => sum + ((inv.balance_due || inv.total_amount) || 0), 0);

  const statusConfig = {
    active: { label: 'Active', class: 'bg-green-100 text-green-700' },
    on_hold: { label: 'On Hold', class: 'bg-yellow-100 text-yellow-700' },
    archived: { label: 'Archived', class: 'bg-slate-100 text-slate-700' }
  };

  const config = statusConfig[customer.customer_status] || statusConfig.active;

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
                <div className="text-xs uppercase text-slate-500 font-medium mb-1">Customer</div>
                <div className="text-xl font-bold text-slate-900">
                  {customer.legal_company_name || customer.display_name}
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
                  onEdit(customer);
                  onClose();
                }}
                className="border-slate-300"
              >
                Edit
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button className="bg-green-600 hover:bg-green-700">
                    New Transaction
                    <ChevronDown className="w-4 h-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onCreateInvoice(customer)}>
                    <Receipt className="w-4 h-4 mr-2" />
                    New Invoice
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onCreateEstimate(customer)}>
                    <FileText className="w-4 h-4 mr-2" />
                    New Estimate
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onCreateJob(customer)}>
                    <Briefcase className="w-4 h-4 mr-2" />
                    New Job
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => {
                    window.location.href = createPageUrl('ReceivePayment') + `?customer_id=${customer.id}`;
                  }}>
                    <CreditCard className="w-4 h-4 mr-2" />
                    Receive Payment
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Customer Snapshot Panel */}
        <div className="grid grid-cols-3 gap-6 mb-6">
          {/* Contact Info */}
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-5">
            <h4 className="text-xs font-semibold uppercase text-slate-600 mb-3">Contact Information</h4>
            <div className="space-y-2 text-sm">
              {customer.email && (
                <div className="flex items-start gap-2">
                  <Mail className="w-4 h-4 text-slate-400 mt-0.5" />
                  <a href={`mailto:${customer.email}`} className="text-blue-600 hover:underline">
                    {customer.email}
                  </a>
                </div>
              )}
              {customer.phone && (
                <div className="flex items-start gap-2">
                  <Phone className="w-4 h-4 text-slate-400 mt-0.5" />
                  <span className="text-slate-700">{customer.phone}</span>
                </div>
              )}
              {customer.billing_street_1 && (
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-slate-400 mt-0.5" />
                  <div className="text-slate-700 text-xs">
                    {customer.billing_street_1}<br />
                    {customer.billing_city}, {customer.billing_state} {customer.billing_zip}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Locations */}
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-5">
            <h4 className="text-xs font-semibold uppercase text-slate-600 mb-3">Operational Locations</h4>
            <div className="space-y-2">
              {locations.length > 0 ? (
                locations.slice(0, 3).map(loc => (
                  <div key={loc.id} className="text-xs text-slate-700">
                    <div className="font-medium">{loc.location_name}</div>
                    <div className="text-slate-500">{loc.city}, {loc.state}</div>
                  </div>
                ))
              ) : (
                <div className="text-xs text-slate-500">No locations added</div>
              )}
              {locations.length > 3 && (
                <button className="text-xs text-blue-600 hover:underline">
                  View all {locations.length} locations
                </button>
              )}
            </div>
          </div>

          {/* Financial Summary */}
          <div className="bg-gradient-to-br from-blue-50 to-white rounded-lg border-2 border-blue-200 shadow-sm p-5">
            <h4 className="text-xs font-semibold uppercase text-slate-600 mb-3">Financial Summary</h4>
            <div className="space-y-3">
              <div>
                <div className="text-xs text-slate-500 mb-1">Open Balance</div>
                <div className="text-2xl font-bold text-slate-900">${openBalance.toFixed(2)}</div>
              </div>
              {overdueAmount > 0 && (
                <div>
                  <div className="text-xs text-slate-500 mb-1">Overdue</div>
                  <div className="text-lg font-bold text-red-600">${overdueAmount.toFixed(2)}</div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tab-Based Workflow */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="bg-white border border-slate-200 p-1 h-auto">
            <TabsTrigger value="transactions" className="px-4 py-2">
              Transactions
            </TabsTrigger>
            <TabsTrigger value="invoices" className="px-4 py-2">
              Invoices
            </TabsTrigger>
            <TabsTrigger value="estimates" className="px-4 py-2">
              Estimates
            </TabsTrigger>
            <TabsTrigger value="jobs" className="px-4 py-2">
              Jobs
            </TabsTrigger>
            <TabsTrigger value="details" className="px-4 py-2">
              Customer Details
            </TabsTrigger>
          </TabsList>

          <TabsContent value="transactions" className="mt-0">
            <CustomerTransactionsTab 
              customer={customer}
              invoices={invoices}
              estimates={estimates}
              jobs={jobs}
            />
          </TabsContent>

          <TabsContent value="invoices" className="mt-0">
            <CustomerInvoicesTab 
              customer={customer}
              invoices={invoices}
              onCreateInvoice={() => onCreateInvoice(customer)}
            />
          </TabsContent>

          <TabsContent value="estimates" className="mt-0">
            <CustomerEstimatesTab 
              customer={customer}
              estimates={estimates}
              onCreateEstimate={() => onCreateEstimate(customer)}
            />
          </TabsContent>

          <TabsContent value="jobs" className="mt-0">
            <CustomerJobsTab 
              customer={customer}
              jobs={jobs}
              onCreateJob={() => onCreateJob(customer)}
            />
          </TabsContent>

          <TabsContent value="details" className="mt-0">
            <CustomerDetailsTab 
              customer={customer}
              locations={locations}
              onSave={(data) => {
                onEdit(customer);
                onClose();
              }}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}