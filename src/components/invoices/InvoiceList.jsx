import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertCircle, ChevronDown, Copy, Send, Clock, CheckSquare, Share2, Repeat, Printer, FileText, XCircle, Trash2, Activity, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { format, differenceInDays } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import InvoicesView from '@/components/portal/InvoicesView';

const statusConfig = {
  draft: { label: 'Draft', className: 'bg-slate-100 text-slate-700 border-slate-200' },
  sent: { label: 'Sent', className: 'bg-blue-100 text-blue-700 border-blue-200' },
  finalized: { label: 'Finalized', className: 'bg-purple-100 text-purple-700 border-purple-200' },
  paid: { label: 'Paid', className: 'bg-green-100 text-green-700 border-green-200' }
};

export default function InvoiceList({ invoices, customers, onView, onSend, onFinalize, onMarkPaid, isLoading, onDuplicate, onSendReminder, onVoid, onDelete, sendingInvoice }) {
  const [selectedInvoices, setSelectedInvoices] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [showPortalView, setShowPortalView] = useState(false);
  const [selectedInvoiceForView, setSelectedInvoiceForView] = useState(null);
  const itemsPerPage = 10;

  const getCustomerName = (customerId) => {
    const customer = customers.find(c => c.id === customerId);
    return customer?.legal_company_name || 'Unknown';
  };

  const getDaysOverdue = (invoice) => {
    if (invoice.invoice_status === 'paid') return 0;
    if (!invoice.due_date) return 0;
    const days = differenceInDays(new Date(), new Date(invoice.due_date));
    return days > 0 ? days : 0;
  };

  const getStatusDisplay = (invoice) => {
    const daysOverdue = getDaysOverdue(invoice);
    if (daysOverdue > 0) {
      return {
        text: `Overdue ${daysOverdue} days`,
        subtext: 'Sent',
        color: 'text-orange-600',
        icon: true
      };
    }
    return {
      text: statusConfig[invoice.invoice_status]?.label || 'Draft',
      subtext: '',
      color: 'text-slate-600',
      icon: false
    };
  };

  const totalPages = Math.ceil(invoices.length / itemsPerPage);
  const paginatedInvoices = invoices.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedInvoices(paginatedInvoices.map(inv => inv.id));
    } else {
      setSelectedInvoices([]);
    }
  };

  const handleSelectInvoice = (invoiceId, checked) => {
    if (checked) {
      setSelectedInvoices([...selectedInvoices, invoiceId]);
    } else {
      setSelectedInvoices(selectedInvoices.filter(id => id !== invoiceId));
    }
  };

  const handleRowClick = (invoice) => {
    setSelectedInvoiceForView(invoice);
    setShowPortalView(true);
  };

  if (showPortalView) {
    return (
      <div className="space-y-4">
        <Button 
          variant="outline" 
          onClick={() => {
            setShowPortalView(false);
            setSelectedInvoiceForView(null);
          }}
          className="gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Invoice List
        </Button>
        <InvoicesView userId={selectedInvoiceForView?.user_id} />
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-white border-b border-slate-200">
              <TableHead className="w-12">
                <Checkbox
                  checked={selectedInvoices.length === paginatedInvoices.length && paginatedInvoices.length > 0}
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              <TableHead className="font-medium text-slate-700 uppercase text-xs">DATE</TableHead>
              <TableHead className="font-medium text-slate-700 uppercase text-xs">NO.</TableHead>
              <TableHead className="font-medium text-slate-700 uppercase text-xs">CUSTOMER / PROJECT</TableHead>
              <TableHead className="font-medium text-slate-700 uppercase text-xs text-right">AMOUNT</TableHead>
              <TableHead className="font-medium text-slate-700 uppercase text-xs">DUE DATE</TableHead>
              <TableHead className="font-medium text-slate-700 uppercase text-xs">
                <div className="flex items-center gap-1">
                  STATUS
                  <ChevronDown className="w-3 h-3" />
                </div>
              </TableHead>
              <TableHead className="font-medium text-slate-700 uppercase text-xs">ACTION</TableHead>
              <TableHead className="w-10"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array(5).fill(0).map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={9}>
                    <div className="h-4 bg-slate-100 rounded animate-pulse" />
                  </TableCell>
                </TableRow>
              ))
            ) : paginatedInvoices.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-12 text-slate-500">
                  No invoices yet. Create your first invoice to get started.
                </TableCell>
              </TableRow>
            ) : (
              paginatedInvoices.map((invoice) => {
                const statusDisplay = getStatusDisplay(invoice);
                const isSelected = selectedInvoices.includes(invoice.id);
                
                return (
                  <motion.tr
                    key={invoice.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="border-b border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer"
                    onClick={() => handleRowClick(invoice)}
                  >
                    <TableCell>
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={(checked) => handleSelectInvoice(invoice.id, checked)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </TableCell>
                    <TableCell className="text-sm text-slate-900">
                      {invoice.issue_date ? format(new Date(invoice.issue_date), 'M/d/yy') : '—'}
                    </TableCell>
                    <TableCell className="text-sm font-medium text-slate-900">
                      {invoice.invoice_number?.replace('INV-', '').slice(0, 4) || '—'}
                    </TableCell>
                    <TableCell className="text-sm text-slate-900">
                      {getCustomerName(invoice.customer_id)}
                    </TableCell>
                    <TableCell className="text-sm text-slate-900 text-right font-medium">
                      ${invoice.total_amount?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                    </TableCell>
                    <TableCell className="text-sm text-slate-900">
                      {invoice.due_date ? format(new Date(invoice.due_date), 'M/d/yy') : '—'}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {statusDisplay.icon && (
                          <AlertCircle className="w-4 h-4 text-orange-500" />
                        )}
                        <div>
                          <div className={`text-sm font-medium ${statusDisplay.color}`}>
                            {statusDisplay.text}
                          </div>
                          {statusDisplay.subtext && (
                            <div className="text-xs text-slate-500">{statusDisplay.subtext}</div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            variant="link" 
                            size="sm" 
                            className="h-auto p-0 text-blue-600 hover:text-blue-700"
                            onClick={(e) => e.stopPropagation()}
                          >
                            View/Edit | Receive payment
                            <ChevronDown className="w-3 h-3 ml-1" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-56">
                          <DropdownMenuItem onClick={() => onView(invoice)}>
                            View/Edit
                          </DropdownMenuItem>
                          
                          <DropdownMenuItem onClick={() => onDuplicate?.(invoice)}>
                            <Copy className="w-4 h-4 mr-2" />
                            Duplicate
                          </DropdownMenuItem>
                          
                          {(invoice.invoice_status === 'draft' || invoice.invoice_status === 'sent') && (
                            <DropdownMenuItem 
                              onClick={(e) => {
                                e.stopPropagation();
                                onSend(invoice);
                              }}
                              disabled={sendingInvoice === invoice.id}
                            >
                              <Send className="w-4 h-4 mr-2" />
                              Send
                            </DropdownMenuItem>
                          )}
                          
                          {invoice.invoice_status === 'sent' && (
                            <DropdownMenuItem onClick={() => onSendReminder?.(invoice)}>
                              <Clock className="w-4 h-4 mr-2" />
                              Send reminder
                            </DropdownMenuItem>
                          )}
                          
                          <DropdownMenuItem onClick={() => alert('Create task functionality coming soon')}>
                            <CheckSquare className="w-4 h-4 mr-2" />
                            Create task
                          </DropdownMenuItem>
                          
                          <DropdownMenuItem onClick={() => {
                            const url = window.location.origin + `/invoice/${invoice.id}`;
                            navigator.clipboard.writeText(url);
                            alert('Invoice link copied to clipboard');
                          }}>
                            <Share2 className="w-4 h-4 mr-2" />
                            Share invoice link
                          </DropdownMenuItem>
                          
                          <DropdownMenuItem onClick={() => alert('Make recurring payment functionality coming soon')}>
                            <Repeat className="w-4 h-4 mr-2" />
                            Make recurring payment
                          </DropdownMenuItem>
                          
                          <DropdownMenuItem onClick={() => window.print()}>
                            <Printer className="w-4 h-4 mr-2" />
                            Print
                          </DropdownMenuItem>
                          
                          <DropdownMenuItem onClick={() => alert('Print packing slip functionality coming soon')}>
                            <FileText className="w-4 h-4 mr-2" />
                            Print packing slip
                          </DropdownMenuItem>
                          
                          {invoice.invoice_status !== 'paid' && invoice.invoice_status !== 'void' && (
                            <DropdownMenuItem onClick={() => onVoid?.(invoice)} className="text-orange-600">
                              <XCircle className="w-4 h-4 mr-2" />
                              Void
                            </DropdownMenuItem>
                          )}
                          
                          <DropdownMenuItem onClick={() => onDelete?.(invoice)} className="text-red-600">
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                          
                          <DropdownMenuItem onClick={() => alert('View activity functionality coming soon')}>
                            <Activity className="w-4 h-4 mr-2" />
                            View activity
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                    <TableCell>
                      <button className="text-slate-400 hover:text-slate-600">⚙</button>
                    </TableCell>
                  </motion.tr>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-6 py-3 border-t border-slate-200 bg-slate-50">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
            className="text-sm text-slate-600 hover:text-slate-900"
          >
            First
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="text-sm text-slate-600 hover:text-slate-900"
          >
            Previous
          </Button>
        </div>
        
        <div className="text-sm text-slate-600">
          {(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, invoices.length)} of {invoices.length}
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="text-sm text-slate-600 hover:text-slate-900"
          >
            Next
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages}
            className="text-sm text-slate-600 hover:text-slate-900"
          >
            Last
          </Button>
        </div>
      </div>

      {/* Send Email Modal */}
      {sendingInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-sm w-full mx-4 text-center">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Sending Invoice</h3>
            <p className="text-slate-600">Please wait while we send your invoice...</p>
          </div>
        </div>
      )}
    </div>
  );
}