import React, { useState, useMemo } from 'react';
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Receipt, Calendar, DollarSign, CreditCard, Download, Eye, Filter, X, CheckSquare, Square, Loader2, AlertCircle } from "lucide-react";
import { format, isAfter, parseISO } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import StripePaymentModal from "./StripePaymentModal";

const statusConfig = {
  draft: { label: 'Draft', className: 'bg-slate-100 text-slate-700' },
  sent: { label: 'Sent', className: 'bg-blue-100 text-blue-700' },
  finalized: { label: 'Due', className: 'bg-purple-100 text-purple-700' },
  paid: { label: 'Paid', className: 'bg-green-100 text-green-700' },
  overdue: { label: 'Overdue', className: 'bg-red-100 text-red-700' },
  partially_paid: { label: 'Partially Paid', className: 'bg-amber-100 text-amber-700' }
};

export default function InvoicesView({ customerId }) {
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedInvoices, setSelectedInvoices] = useState(new Set());
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('due_date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [searchTerm, setSearchTerm] = useState('');
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [downloadingBulk, setDownloadingBulk] = useState(false);
  const queryClient = useQueryClient();

  const getInvoiceStatus = (invoice) => {
    if (invoice.invoice_status === 'paid') return 'paid';
    if (invoice.invoice_status === 'partially_paid') return 'partially_paid';
    
    const today = new Date();
    const dueDate = parseISO(invoice.due_date);
    
    if (isAfter(today, dueDate) && invoice.balance_due > 0) {
      return 'overdue';
    }
    
    return invoice.invoice_status;
  };

  const { data: invoices = [], isLoading } = useQuery({
    queryKey: ['customerInvoices', customerId],
    queryFn: () => base44.entities.Invoice.filter({ customer_id: customerId }, '-created_date')
  });

  const { data: lineItems = [] } = useQuery({
    queryKey: ['invoiceLineItems', selectedInvoice?.id],
    queryFn: () => selectedInvoice ? base44.entities.InvoiceLineItem.filter({ invoice_id: selectedInvoice.id }, 'sort_order') : [],
    enabled: !!selectedInvoice
  });

  const { data: adjustments = [] } = useQuery({
    queryKey: ['invoiceAdjustments', selectedInvoice?.id],
    queryFn: () => selectedInvoice ? base44.entities.InvoiceAdjustment.filter({ invoice_id: selectedInvoice.id }, 'sort_order') : [],
    enabled: !!selectedInvoice
  });

  const paymentMutation = useMutation({
    mutationFn: async ({ invoiceId, amount }) => {
      const invoice = invoices.find(inv => inv.id === invoiceId);
      const newAmountPaid = (invoice.amount_paid || 0) + amount;
      const newBalance = invoice.total_amount - newAmountPaid;
      
      return base44.entities.Invoice.update(invoiceId, {
        amount_paid: newAmountPaid,
        balance_due: newBalance,
        invoice_status: newBalance <= 0 ? 'paid' : 'partially_paid',
        paid_date: newBalance <= 0 ? new Date().toISOString() : invoice.paid_date,
        last_payment_date: new Date().toISOString(),
        payment_method: 'credit_card'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customerInvoices', customerId] });
      setSelectedInvoice(null);
    }
  });

  const handlePaymentSuccess = (amount) => {
    paymentMutation.mutate({ invoiceId: selectedInvoice.id, amount });
  };

  const handleDownloadPdf = async (invoice) => {
    setDownloadingPdf(true);
    try {
      const response = await base44.functions.invoke('exportInvoicePDF', {
        invoiceId: invoice.id
      });
      
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${invoice.invoice_number}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    } catch (error) {
      alert('Failed to download PDF: ' + error.message);
    } finally {
      setDownloadingPdf(false);
    }
  };

  const handleBulkDownload = async () => {
    if (selectedInvoices.size === 0) return;
    
    setDownloadingBulk(true);
    try {
      for (const invoiceId of selectedInvoices) {
        const invoice = invoices.find(inv => inv.id === invoiceId);
        if (invoice) {
          await handleDownloadPdf(invoice);
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
      setSelectedInvoices(new Set());
    } catch (error) {
      alert('Failed to download invoices: ' + error.message);
    } finally {
      setDownloadingBulk(false);
    }
  };

  const handleBulkPayment = () => {
    if (selectedInvoices.size === 0) return;
    const firstInvoice = invoices.find(inv => selectedInvoices.has(inv.id));
    if (firstInvoice) {
      setSelectedInvoice(firstInvoice);
      setShowPaymentModal(true);
    }
  };

  const toggleSelectInvoice = (invoiceId) => {
    const newSelected = new Set(selectedInvoices);
    if (newSelected.has(invoiceId)) {
      newSelected.delete(invoiceId);
    } else {
      newSelected.add(invoiceId);
    }
    setSelectedInvoices(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedInvoices.size === filteredAndSortedInvoices.length) {
      setSelectedInvoices(new Set());
    } else {
      setSelectedInvoices(new Set(filteredAndSortedInvoices.map(inv => inv.id)));
    }
  };

  const filteredAndSortedInvoices = useMemo(() => {
    let result = invoices.map(invoice => ({
      ...invoice,
      displayStatus: getInvoiceStatus(invoice)
    }));

    // Search filter
    if (searchTerm) {
      result = result.filter(invoice => 
        invoice.invoice_number.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      result = result.filter(invoice => invoice.displayStatus === statusFilter);
    }

    // Sort
    result.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'due_date':
          comparison = new Date(a.due_date) - new Date(b.due_date);
          break;
        case 'amount':
          comparison = (a.total_amount || 0) - (b.total_amount || 0);
          break;
        case 'issue_date':
          comparison = new Date(a.issue_date) - new Date(b.issue_date);
          break;
        case 'invoice_number':
          comparison = a.invoice_number.localeCompare(b.invoice_number);
          break;
        default:
          comparison = 0;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [invoices, statusFilter, sortBy, sortOrder, searchTerm]);

  if (isLoading) {
    return <div className="text-center py-12 text-slate-500">Loading invoices...</div>;
  }

  if (selectedInvoice) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <Button variant="outline" onClick={() => setSelectedInvoice(null)}>
          ← Back to Invoices
        </Button>

        <Card>
          <CardHeader className="border-b bg-slate-50">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold text-slate-900">{selectedInvoice.invoice_number}</h3>
                <div className="flex items-center gap-4 mt-2 text-sm text-slate-600">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>Issued {format(new Date(selectedInvoice.issue_date), 'MMM d, yyyy')}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>Due {format(new Date(selectedInvoice.due_date), 'MMM d, yyyy')}</span>
                  </div>
                </div>
              </div>
              <Badge className={statusConfig[getInvoiceStatus(selectedInvoice)].className}>
                {statusConfig[getInvoiceStatus(selectedInvoice)].label}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="p-6 space-y-6">
            {/* Line Items */}
            <div>
              <h4 className="font-semibold text-slate-900 mb-3">Services</h4>
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="text-left p-3 font-semibold">Description</th>
                      <th className="text-right p-3 font-semibold">Qty</th>
                      <th className="text-right p-3 font-semibold">Rate</th>
                      <th className="text-right p-3 font-semibold">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lineItems.map((item) => (
                      <tr key={item.id} className="border-t border-slate-100">
                        <td className="p-3">{item.description}</td>
                        <td className="p-3 text-right">{item.actual_quantity}</td>
                        <td className="p-3 text-right">${item.unit_price?.toFixed(2)}</td>
                        <td className="p-3 text-right font-semibold">${item.line_total?.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Adjustments */}
            {adjustments.length > 0 && (
              <div>
                <h4 className="font-semibold text-slate-900 mb-3">Adjustments</h4>
                <div className="space-y-2">
                  {adjustments.map((adj) => (
                    <div key={adj.id} className="flex justify-between text-sm p-3 bg-slate-50 rounded-lg">
                      <span className="text-slate-700">{adj.description}</span>
                      <span className="font-semibold text-slate-900">${adj.amount?.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Summary */}
            <div className="space-y-2 border-t pt-4">
              <div className="flex justify-between text-slate-700">
                <span>Subtotal</span>
                <span>${selectedInvoice.subtotal?.toFixed(2)}</span>
              </div>
              {selectedInvoice.tax_amount > 0 && (
                <div className="flex justify-between text-slate-700">
                  <span>Tax ({selectedInvoice.tax_rate}%)</span>
                  <span>${selectedInvoice.tax_amount?.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between items-center border-t-2 border-slate-300 pt-3">
                <span className="text-xl font-bold text-slate-900">Amount Due</span>
                <span className="text-3xl font-bold text-slate-900">${selectedInvoice.total_amount?.toFixed(2)}</span>
              </div>
            </div>

            {/* Notes */}
            {selectedInvoice.notes_to_customer && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm font-medium text-blue-900 mb-2">Notes</p>
                <p className="text-sm text-blue-800 whitespace-pre-wrap">{selectedInvoice.notes_to_customer}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 justify-end">
              <Button 
                variant="outline" 
                className="gap-2"
                onClick={() => handleDownloadPdf(selectedInvoice)}
                disabled={downloadingPdf}
              >
                {downloadingPdf ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                Download PDF
              </Button>
              {(selectedInvoice.invoice_status === 'finalized' || selectedInvoice.invoice_status === 'sent' || selectedInvoice.displayStatus === 'overdue') && selectedInvoice.balance_due > 0 && (
                <Button 
                  onClick={() => setShowPaymentModal(true)} 
                  className="bg-green-600 hover:bg-green-700 gap-2"
                >
                  <CreditCard className="w-4 h-4" />
                  Make Payment
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <>
      <StripePaymentModal
        invoice={selectedInvoice}
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onSuccess={handlePaymentSuccess}
      />
      
      <div className="space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-slate-600">Total Invoices</div>
              <div className="text-2xl font-bold text-slate-900">{invoices.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-slate-600">Overdue</div>
              <div className="text-2xl font-bold text-red-600">
                {invoices.filter(inv => getInvoiceStatus(inv) === 'overdue').length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-slate-600">Total Due</div>
              <div className="text-2xl font-bold text-slate-900">
                ${invoices.reduce((sum, inv) => sum + (inv.balance_due || 0), 0).toFixed(2)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-slate-600">Total Paid</div>
              <div className="text-2xl font-bold text-green-600">
                ${invoices.reduce((sum, inv) => sum + (inv.amount_paid || 0), 0).toFixed(2)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search by invoice number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                  <SelectItem value="finalized">Due</SelectItem>
                  <SelectItem value="partially_paid">Partially Paid</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="due_date">Due Date</SelectItem>
                  <SelectItem value="issue_date">Issue Date</SelectItem>
                  <SelectItem value="amount">Amount</SelectItem>
                  <SelectItem value="invoice_number">Invoice #</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </Button>
              {(statusFilter !== 'all' || searchTerm) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setStatusFilter('all');
                    setSearchTerm('');
                  }}
                  className="gap-2"
                >
                  <X className="w-4 h-4" />
                  Clear
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Bulk Actions */}
        {selectedInvoices.size > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CheckSquare className="w-5 h-5 text-blue-600" />
                    <span className="font-medium text-blue-900">
                      {selectedInvoices.size} invoice{selectedInvoices.size > 1 ? 's' : ''} selected
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleBulkDownload}
                      disabled={downloadingBulk}
                      className="gap-2"
                    >
                      {downloadingBulk ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Download className="w-4 h-4" />
                      )}
                      Download All
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleBulkPayment}
                      className="bg-green-600 hover:bg-green-700 gap-2"
                    >
                      <CreditCard className="w-4 h-4" />
                      Pay Selected
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedInvoices(new Set())}
                    >
                      Clear
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {filteredAndSortedInvoices.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Receipt className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">
              {invoices.length === 0 ? 'No invoices found' : 'No invoices match your filters'}
            </p>
            <p className="text-sm text-slate-400 mt-2">
              {invoices.length === 0 ? 'Invoices will appear here after job completion' : 'Try adjusting your filters'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {/* Select All Header */}
          {filteredAndSortedInvoices.length > 1 && (
            <div className="flex items-center gap-2 px-2 py-1">
              <button
                onClick={toggleSelectAll}
                className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900"
              >
                {selectedInvoices.size === filteredAndSortedInvoices.length ? (
                  <CheckSquare className="w-4 h-4 text-blue-600" />
                ) : (
                  <Square className="w-4 h-4" />
                )}
                Select All
              </button>
            </div>
          )}
          
          <AnimatePresence>
          {filteredAndSortedInvoices.map((invoice) => (
            <motion.div
              key={invoice.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <Card className={`hover:shadow-lg transition-all ${
                selectedInvoices.has(invoice.id) ? 'ring-2 ring-blue-500' : ''
              }`}>
                <CardContent className="p-6">
                  <div className="flex items-start gap-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSelectInvoice(invoice.id);
                      }}
                      className="mt-1"
                    >
                      {selectedInvoices.has(invoice.id) ? (
                        <CheckSquare className="w-5 h-5 text-blue-600" />
                      ) : (
                        <Square className="w-5 h-5 text-slate-400 hover:text-slate-600" />
                      )}
                    </button>
                    
                    <div 
                      className="flex-1 cursor-pointer" 
                      onClick={() => setSelectedInvoice(invoice)}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold text-slate-900">{invoice.invoice_number}</h3>
                        <Badge className={statusConfig[invoice.displayStatus].className}>
                          {statusConfig[invoice.displayStatus].label}
                        </Badge>
                        {invoice.displayStatus === 'overdue' && (
                          <AlertCircle className="w-4 h-4 text-red-500" />
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-slate-600">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>Due {format(new Date(invoice.due_date), 'MMM d, yyyy')}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4" />
                          <span className="font-semibold text-slate-900">${invoice.total_amount?.toFixed(2)}</span>
                        </div>
                        {invoice.balance_due > 0 && invoice.balance_due !== invoice.total_amount && (
                          <div className="flex items-center gap-1">
                            <span className="text-amber-600 font-medium">
                              Balance: ${invoice.balance_due?.toFixed(2)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="gap-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownloadPdf(invoice);
                        }}
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="gap-2"
                        onClick={() => setSelectedInvoice(invoice)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
          </AnimatePresence>
        </div>
        )}
      </div>
    </>
  );
}