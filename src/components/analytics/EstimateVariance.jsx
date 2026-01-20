import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle } from "lucide-react";

export default function EstimateVariance({ jobs, estimates, invoices }) {
  const variance = jobs
    .filter(job => job.job_status === 'completed' && job.estimate_id)
    .map(job => {
      const estimate = estimates.find(e => e.id === job.estimate_id);
      const jobInvoices = invoices.filter(inv => inv.job_id === job.id && (inv.invoice_status === 'finalized' || inv.invoice_status === 'paid'));
      
      const estimatedRevenue = estimate?.total_amount || 0;
      const actualRevenue = jobInvoices.reduce((sum, inv) => sum + (inv.total_amount || 0), 0);
      const varianceDollar = actualRevenue - estimatedRevenue;
      const variancePercent = estimatedRevenue > 0 ? (varianceDollar / estimatedRevenue * 100) : 0;

      return {
        jobId: job.job_id,
        jobName: job.job_name,
        estimatedRevenue,
        actualRevenue,
        varianceDollar,
        variancePercent,
        hasInvoices: jobInvoices.length > 0
      };
    })
    .filter(v => v.hasInvoices)
    .sort((a, b) => Math.abs(b.variancePercent) - Math.abs(a.variancePercent));

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <AlertTriangle className="w-5 h-5 text-slate-700" />
        <h2 className="text-xl font-semibold text-slate-900">Estimate vs Actual</h2>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50">
              <TableHead className="font-semibold">Job ID</TableHead>
              <TableHead className="font-semibold">Job Name</TableHead>
              <TableHead className="font-semibold text-right">Estimated</TableHead>
              <TableHead className="font-semibold text-right">Actual</TableHead>
              <TableHead className="font-semibold text-right">Variance ($)</TableHead>
              <TableHead className="font-semibold text-right">Variance (%)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {variance.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                  No completed jobs with estimates and invoices
                </TableCell>
              </TableRow>
            ) : (
              variance.map((item, idx) => {
                const isOverage = item.varianceDollar > 0;
                const isUnderage = item.varianceDollar < 0;
                
                return (
                  <TableRow 
                    key={idx} 
                    className={Math.abs(item.variancePercent) > 10 ? 'bg-amber-50' : ''}
                  >
                    <TableCell className="font-medium text-slate-900">{item.jobId}</TableCell>
                    <TableCell className="text-slate-700">{item.jobName}</TableCell>
                    <TableCell className="text-right text-slate-600">
                      ${item.estimatedRevenue.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right font-semibold text-slate-900">
                      ${item.actualRevenue.toFixed(2)}
                    </TableCell>
                    <TableCell className={`text-right font-semibold ${isOverage ? 'text-green-600' : isUnderage ? 'text-red-600' : 'text-slate-600'}`}>
                      {isOverage ? '+' : ''}{item.varianceDollar.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge className={
                        Math.abs(item.variancePercent) > 10 
                          ? 'bg-amber-100 text-amber-700' 
                          : 'bg-slate-100 text-slate-700'
                      }>
                        {isOverage ? '+' : ''}{item.variancePercent.toFixed(1)}%
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>

        {variance.some(v => Math.abs(v.variancePercent) > 10) && (
          <div className="p-4 bg-amber-50 border-t border-amber-200">
            <p className="text-sm text-amber-800">
              <strong>Note:</strong> Jobs highlighted in amber have variance exceeding 10%.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}