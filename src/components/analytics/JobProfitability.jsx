import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Target } from "lucide-react";

export default function JobProfitability({ jobs, invoices, expenses, customers }) {
  const jobProfitability = jobs
    .filter(job => job.job_status === 'completed')
    .map(job => {
      const jobInvoices = invoices.filter(inv => inv.job_id === job.id && (inv.invoice_status === 'finalized' || inv.invoice_status === 'paid'));
      const jobExpenses = expenses.filter(exp => exp.job_id === job.id && exp.expense_status === 'approved');
      
      const revenue = jobInvoices.reduce((sum, inv) => sum + (inv.total_amount || 0), 0);
      const expenseTotal = jobExpenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);
      const profit = revenue - expenseTotal;
      const margin = revenue > 0 ? (profit / revenue * 100) : 0;

      const customer = customers.find(c => c.id === job.customer_id);

      return {
        jobId: job.job_id,
        jobName: job.job_name,
        customer: customer?.legal_company_name || 'Unknown',
        status: job.job_status,
        revenue,
        expenses: expenseTotal,
        profit,
        margin,
        hasInvoices: jobInvoices.length > 0
      };
    })
    .filter(j => j.hasInvoices)
    .sort((a, b) => b.profit - a.profit);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Target className="w-5 h-5 text-slate-700" />
        <h2 className="text-xl font-semibold text-slate-900">Job Profitability</h2>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50">
              <TableHead className="font-semibold">Job ID</TableHead>
              <TableHead className="font-semibold">Job Name</TableHead>
              <TableHead className="font-semibold">Customer</TableHead>
              <TableHead className="font-semibold text-right">Revenue</TableHead>
              <TableHead className="font-semibold text-right">Expenses</TableHead>
              <TableHead className="font-semibold text-right">Profit</TableHead>
              <TableHead className="font-semibold text-right">Margin %</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {jobProfitability.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-slate-500">
                  No completed jobs with invoices in selected date range
                </TableCell>
              </TableRow>
            ) : (
              jobProfitability.map((job, idx) => (
                <TableRow key={idx} className={job.profit < 0 ? 'bg-red-50' : ''}>
                  <TableCell className="font-medium text-slate-900">{job.jobId}</TableCell>
                  <TableCell className="text-slate-700">{job.jobName}</TableCell>
                  <TableCell className="text-slate-600">{job.customer}</TableCell>
                  <TableCell className="text-right font-semibold text-green-600">
                    ${job.revenue.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right font-semibold text-red-600">
                    ${job.expenses.toFixed(2)}
                  </TableCell>
                  <TableCell className={`text-right font-bold ${job.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ${job.profit.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge className={job.margin >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                      {job.margin.toFixed(1)}%
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {jobProfitability.some(j => j.profit < 0) && (
          <div className="p-4 bg-red-50 border-t border-red-200">
            <p className="text-sm text-red-800">
              <strong>Warning:</strong> Jobs highlighted in red have negative margins.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}