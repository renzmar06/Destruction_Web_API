import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function CustomerInvoicesTab({ customer, invoices, onCreateInvoice }) {
  const statusConfig = {
    draft: { label: 'Draft', class: 'bg-slate-100 text-slate-700' },
    sent: { label: 'Sent', class: 'bg-blue-100 text-blue-700' },
    finalized: { label: 'Finalized', class: 'bg-orange-100 text-orange-700' },
    paid: { label: 'Paid', class: 'bg-green-100 text-green-700' },
    partially_paid: { label: 'Partial', class: 'bg-yellow-100 text-yellow-700' }
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
      <div className="p-6 border-b border-slate-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">Invoices</h3>
          <Button 
            onClick={onCreateInvoice}
            size="sm"
            className="bg-green-600 hover:bg-green-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Invoice
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50">
              <TableHead className="font-semibold">NUMBER</TableHead>
              <TableHead className="font-semibold">DATE</TableHead>
              <TableHead className="font-semibold">DUE DATE</TableHead>
              <TableHead className="font-semibold">STATUS</TableHead>
              <TableHead className="font-semibold text-right">AMOUNT</TableHead>
              <TableHead className="font-semibold text-right">BALANCE DUE</TableHead>
              <TableHead className="font-semibold text-right">ACTION</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12 text-slate-500">
                  No invoices yet. Create the first invoice for this customer.
                </TableCell>
              </TableRow>
            ) : (
              invoices.map((invoice) => {
                const config = statusConfig[invoice.invoice_status] || statusConfig.draft;
                const isOverdue = invoice.invoice_status !== 'paid' && new Date(invoice.due_date) < new Date();
                
                return (
                  <TableRow key={invoice.id} className="hover:bg-slate-50">
                    <TableCell className="font-medium text-slate-900">
                      {invoice.invoice_number}
                    </TableCell>
                    <TableCell className="text-slate-700">
                      {new Date(invoice.issue_date).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric', 
                        year: 'numeric' 
                      })}
                    </TableCell>
                    <TableCell className={isOverdue ? 'text-red-600 font-medium' : 'text-slate-700'}>
                      {new Date(invoice.due_date).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric', 
                        year: 'numeric' 
                      })}
                      {isOverdue && <span className="ml-2 text-xs">(OVERDUE)</span>}
                    </TableCell>
                    <TableCell>
                      <Badge className={config.class}>
                        {config.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-semibold text-slate-900">
                      ${invoice.total_amount?.toFixed(2) || '0.00'}
                    </TableCell>
                    <TableCell className="text-right font-semibold text-slate-900">
                      ${(invoice.balance_due || invoice.total_amount)?.toFixed(2) || '0.00'}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="link" size="sm" className="text-blue-600 h-auto p-0">
                        View / Edit
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