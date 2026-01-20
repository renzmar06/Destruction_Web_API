import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp } from "lucide-react";

export default function RevenueBreakdown({ invoices, customers, jobs }) {
  const [activeTab, setActiveTab] = useState('customer');

  // Revenue by Customer
  const revenueByCustomer = customers.map(customer => {
    const customerInvoices = invoices.filter(inv => inv.customer_id === customer.id);
    const total = customerInvoices.reduce((sum, inv) => sum + (inv.total_amount || 0), 0);
    return {
      name: customer.legal_company_name,
      total,
      count: customerInvoices.length
    };
  }).filter(c => c.total > 0).sort((a, b) => b.total - a.total);

  // Revenue by Job
  const revenueByJob = jobs.map(job => {
    const jobInvoices = invoices.filter(inv => inv.job_id === job.id);
    const total = jobInvoices.reduce((sum, inv) => sum + (inv.total_amount || 0), 0);
    return {
      name: `${job.job_id} - ${job.job_name}`,
      total,
      count: jobInvoices.length
    };
  }).filter(j => j.total > 0).sort((a, b) => b.total - a.total);

  // Revenue by Pricing Unit
  const pricingUnits = {
    per_case: { label: 'Per Case', total: 0, count: 0 },
    per_lb: { label: 'Per LB', total: 0, count: 0 },
    per_pallet: { label: 'Per Pallet', total: 0, count: 0 },
    per_load: { label: 'Per Load', total: 0, count: 0 },
    flat_fee: { label: 'Flat Fee', total: 0, count: 0 }
  };

  // This would ideally come from line items, but we'll aggregate from jobs
  invoices.forEach(invoice => {
    const job = jobs.find(j => j.id === invoice.job_id);
    if (job) {
      // Simplified - in real implementation, would check line items
      const unit = 'flat_fee'; // Default
      if (pricingUnits[unit]) {
        pricingUnits[unit].total += invoice.total_amount || 0;
        pricingUnits[unit].count += 1;
      }
    }
  });

  const revenueByUnit = Object.values(pricingUnits).filter(u => u.total > 0).sort((a, b) => b.total - a.total);

  const totalRevenue = invoices.reduce((sum, inv) => sum + (inv.total_amount || 0), 0);

  const renderTable = (data) => (
    <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50">
            <TableHead className="font-semibold">Name</TableHead>
            <TableHead className="font-semibold text-center">Count</TableHead>
            <TableHead className="font-semibold text-right">Revenue</TableHead>
            <TableHead className="font-semibold text-right">% of Total</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-8 text-slate-500">
                No data for selected filters
              </TableCell>
            </TableRow>
          ) : (
            data.map((item, idx) => {
              const percentage = totalRevenue > 0 ? (item.total / totalRevenue * 100).toFixed(1) : 0;
              return (
                <TableRow key={idx}>
                  <TableCell className="font-medium text-slate-900">{item.name || item.label}</TableCell>
                  <TableCell className="text-center text-slate-600">{item.count}</TableCell>
                  <TableCell className="text-right font-semibold text-slate-900">
                    ${item.total.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right text-slate-600">{percentage}%</TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <TrendingUp className="w-5 h-5 text-slate-700" />
        <h2 className="text-xl font-semibold text-slate-900">Revenue Breakdown</h2>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="customer">By Customer</TabsTrigger>
          <TabsTrigger value="job">By Job</TabsTrigger>
          <TabsTrigger value="unit">By Pricing Unit</TabsTrigger>
        </TabsList>

        <TabsContent value="customer" className="mt-4">
          {renderTable(revenueByCustomer)}
        </TabsContent>

        <TabsContent value="job" className="mt-4">
          {renderTable(revenueByJob)}
        </TabsContent>

        <TabsContent value="unit" className="mt-4">
          {renderTable(revenueByUnit)}
        </TabsContent>
      </Tabs>
    </div>
  );
}