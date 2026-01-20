import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Receipt, Briefcase } from "lucide-react";

export default function CustomerTransactionsTab({ customer, invoices, estimates, jobs }) {
  // Combine all transactions
  const allTransactions = [
    ...invoices.map(inv => ({
      id: inv.id,
      type: 'invoice',
      number: inv.invoice_number,
      date: inv.issue_date,
      status: inv.invoice_status,
      amount: inv.total_amount,
      balance: inv.balance_due || inv.total_amount,
      record: inv
    })),
    ...estimates.map(est => ({
      id: est.id,
      type: 'estimate',
      number: est.estimate_number,
      date: est.estimate_date,
      status: est.estimate_status,
      amount: est.total_amount,
      balance: 0,
      record: est
    })),
    ...jobs.map(job => ({
      id: job.id,
      type: 'job',
      number: job.job_id,
      date: job.scheduled_date,
      status: job.job_status,
      amount: 0,
      balance: 0,
      record: job
    }))
  ].sort((a, b) => new Date(b.date) - new Date(a.date));

  const typeConfig = {
    invoice: { icon: Receipt, label: 'Invoice', color: 'bg-blue-100 text-blue-700' },
    estimate: { icon: FileText, label: 'Estimate', color: 'bg-purple-100 text-purple-700' },
    job: { icon: Briefcase, label: 'Job', color: 'bg-orange-100 text-orange-700' }
  };

  const statusConfig = {
    draft: 'bg-slate-100 text-slate-700',
    sent: 'bg-blue-100 text-blue-700',
    accepted: 'bg-green-100 text-green-700',
    finalized: 'bg-orange-100 text-orange-700',
    paid: 'bg-green-100 text-green-700',
    scheduled: 'bg-blue-100 text-blue-700',
    in_progress: 'bg-yellow-100 text-yellow-700',
    completed: 'bg-green-100 text-green-700'
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
      <div className="p-6 border-b border-slate-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">All Transactions</h3>
          <div className="text-sm text-slate-500">
            {allTransactions.length} total
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50">
              <TableHead className="font-semibold">TYPE</TableHead>
              <TableHead className="font-semibold">NUMBER</TableHead>
              <TableHead className="font-semibold">DATE</TableHead>
              <TableHead className="font-semibold">STATUS</TableHead>
              <TableHead className="font-semibold text-right">AMOUNT</TableHead>
              <TableHead className="font-semibold text-right">BALANCE</TableHead>
              <TableHead className="font-semibold text-right">ACTION</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {allTransactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12 text-slate-500">
                  No transactions yet for this customer.
                </TableCell>
              </TableRow>
            ) : (
              allTransactions.map((txn) => {
                const typeConf = typeConfig[txn.type];
                const Icon = typeConf.icon;
                
                return (
                  <TableRow key={`${txn.type}-${txn.id}`} className="hover:bg-slate-50">
                    <TableCell>
                      <Badge className={typeConf.color}>
                        <Icon className="w-3 h-3 mr-1" />
                        {typeConf.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium text-slate-900">
                      {txn.number}
                    </TableCell>
                    <TableCell className="text-slate-700">
                      {new Date(txn.date).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric', 
                        year: 'numeric' 
                      })}
                    </TableCell>
                    <TableCell>
                      <Badge className={statusConfig[txn.status] || 'bg-slate-100 text-slate-700'}>
                        {txn.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-semibold text-slate-900">
                      ${txn.amount?.toFixed(2) || '0.00'}
                    </TableCell>
                    <TableCell className="text-right font-semibold text-slate-900">
                      {txn.balance > 0 ? `$${txn.balance.toFixed(2)}` : '—'}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="link" size="sm" className="text-blue-600 h-auto p-0">
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}