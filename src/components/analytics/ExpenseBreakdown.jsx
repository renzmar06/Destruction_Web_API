import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingDown } from "lucide-react";

const expenseTypeLabels = {
  transportation: 'Transportation',
  disposal_processing: 'Disposal / Processing',
  equipment_rental: 'Equipment Rental',
  labor: 'Labor',
  utilities: 'Utilities',
  fuel: 'Fuel',
  storage: 'Storage',
  other: 'Other'
};

export default function ExpenseBreakdown({ expenses, jobs }) {
  const [activeTab, setActiveTab] = useState('type');

  // Expenses by Type
  const expensesByType = Object.entries(expenseTypeLabels).map(([key, label]) => {
    const typeExpenses = expenses.filter(exp => exp.expense_type === key);
    const total = typeExpenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);
    return {
      name: label,
      total,
      count: typeExpenses.length
    };
  }).filter(e => e.total > 0).sort((a, b) => b.total - a.total);

  // Expenses by Vendor
  const vendorMap = {};
  expenses.forEach(exp => {
    const vendor = exp.vendor_name || 'Unknown';
    if (!vendorMap[vendor]) {
      vendorMap[vendor] = { name: vendor, total: 0, count: 0 };
    }
    vendorMap[vendor].total += exp.amount || 0;
    vendorMap[vendor].count += 1;
  });
  const expensesByVendor = Object.values(vendorMap).sort((a, b) => b.total - a.total);

  // Expenses by Job
  const jobMap = {};
  const unlinkedExpenses = { name: 'Unlinked (General Overhead)', total: 0, count: 0, isUnlinked: true };

  expenses.forEach(exp => {
    if (exp.job_id) {
      const job = jobs.find(j => j.id === exp.job_id);
      const jobName = job ? `${job.job_id} - ${job.job_name}` : 'Unknown Job';
      if (!jobMap[exp.job_id]) {
        jobMap[exp.job_id] = { name: jobName, total: 0, count: 0 };
      }
      jobMap[exp.job_id].total += exp.amount || 0;
      jobMap[exp.job_id].count += 1;
    } else {
      unlinkedExpenses.total += exp.amount || 0;
      unlinkedExpenses.count += 1;
    }
  });

  const expensesByJob = [...Object.values(jobMap), unlinkedExpenses]
    .filter(j => j.total > 0)
    .sort((a, b) => b.total - a.total);

  const totalExpenses = expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);

  const renderTable = (data) => (
    <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50">
            <TableHead className="font-semibold">Name</TableHead>
            <TableHead className="font-semibold text-center">Count</TableHead>
            <TableHead className="font-semibold text-right">Amount</TableHead>
            <TableHead className="font-semibold text-right">% of Total</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-8 text-slate-500">
                No expenses for selected filters
              </TableCell>
            </TableRow>
          ) : (
            data.map((item, idx) => {
              const percentage = totalExpenses > 0 ? (item.total / totalExpenses * 100).toFixed(1) : 0;
              return (
                <TableRow key={idx} className={item.isUnlinked ? 'bg-amber-50' : ''}>
                  <TableCell className="font-medium text-slate-900">
                    {item.name}
                    {item.isUnlinked && (
                      <span className="ml-2 text-xs text-amber-600">(Overhead)</span>
                    )}
                  </TableCell>
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
        <TrendingDown className="w-5 h-5 text-slate-700" />
        <h2 className="text-xl font-semibold text-slate-900">Expense Breakdown</h2>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="type">By Type</TabsTrigger>
          <TabsTrigger value="vendor">By Vendor</TabsTrigger>
          <TabsTrigger value="job">By Job</TabsTrigger>
        </TabsList>

        <TabsContent value="type" className="mt-4">
          {renderTable(expensesByType)}
        </TabsContent>

        <TabsContent value="vendor" className="mt-4">
          {renderTable(expensesByVendor)}
        </TabsContent>

        <TabsContent value="job" className="mt-4">
          {renderTable(expensesByJob)}
        </TabsContent>
      </Tabs>
    </div>
  );
}