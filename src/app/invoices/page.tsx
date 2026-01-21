'use client';

import React, { useState, useEffect } from 'react';
import { Plus, CheckCircle, Upload } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { fetchCustomers } from '@/redux/slices/customersSlice';
import InvoiceList from '@/components/invoices/InvoiceList';

export interface Invoice {
  _id?: string;
  invoice_number: string;
  customer_id?: string;
  customer_name: string;
  customer_email: string;
  cc_emails?: string;
  bcc_emails?: string;
  job_id?: string;
  job_reference?: string;
  estimate_id?: string;
  invoice_status: 'draft' | 'sent' | 'finalized' | 'paid' | 'void';
  issue_date: string;
  due_date: string;
  payment_terms: string;
  bill_to_address: string;
  ship_to_address: string;
  ship_from_address?: string;
  ship_via?: string;
  shipping_date?: string;
  tracking_number?: string;
  subtotal?: number;
  discount_amount?: number;
  discount_percent?: number;
  adjustments_total?: number;
  tax_amount?: number;
  tax_rate?: number;
  shipping_amount?: number;
  total_amount: number;
  balance_due: number;
  amount_paid?: number;
  notes_to_customer: string;
  internal_notes: string;
  memo_on_statement?: string;
  tags?: string;
  sent_date?: string;
  paid_date?: string;
  createdAt?: string;
  updatedAt?: string;
}
import { fetchInvoices, createInvoice, updateInvoice, deleteInvoice, setCurrentInvoice } from '@/redux/slices/invoicesSlice';

export default function Invoices() {
  const dispatch = useAppDispatch();
  const { invoices, currentInvoice, loading, error } = useAppSelector(state => state.invoices);
  const { customers } = useAppSelector(state => state.customers);
  
  const [showForm, setShowForm] = useState(false);
  const [showCcBcc, setShowCcBcc] = useState(false);
  const [showShipping, setShowShipping] = useState(true);
  const [showTagsManager, setShowTagsManager] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [lineItems, setLineItems] = useState([{ id: 1, description: '', quantity: 1, rate: 0, amount: 0 }]);
  const [attachments, setAttachments] = useState<{id: number, name: string, url: string}[]>([]);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState<Partial<Invoice>>({
    invoice_number: '',
    customer_name: '',
    customer_email: '',
    cc_emails: '',
    bcc_emails: '',
    job_id: '',
    job_reference: '',
    estimate_id: '',
    invoice_status: 'draft',
    issue_date: new Date().toISOString().split('T')[0],
    due_date: '',
    payment_terms: 'net_30',
    bill_to_address: '',
    ship_to_address: '',
    ship_from_address: '',
    ship_via: '',
    shipping_date: '',
    tracking_number: '',
    subtotal: 0,
    discount_amount: 0,
    discount_percent: 0,
    adjustments_total: 0,
    tax_amount: 0,
    tax_rate: 0,
    shipping_amount: 0,
    total_amount: 0,
    amount_paid: 0,
    balance_due: 0,
    notes_to_customer: '',
    internal_notes: '',
    memo_on_statement: '',
    tags: ''
  });

  useEffect(() => {
    dispatch(fetchInvoices());
    dispatch(fetchCustomers());
  }, [dispatch]);

  const showSuccessToast = (message: string) => {
    setSuccessMessage(message);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleFileUpload = async (file: File) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      const result = await response.json();
      
      if (result.success) {
        const newAttachment = {
          id: Date.now(),
          name: file.name,
          url: result.url
        };
        setAttachments([...attachments, newAttachment]);
        showSuccessToast('File uploaded successfully.');
      } else {
        showSuccessToast('Failed to upload file.');
      }
    } catch (error) {
      showSuccessToast('Error uploading file.');
    } finally {
      setUploading(false);
    }
  };

  const removeAttachment = (id: number) => {
    setAttachments(attachments.filter(att => att.id !== id));
  };

  const addLineItem = () => {
    const newId = Math.max(...lineItems.map(item => item.id)) + 1;
    setLineItems([...lineItems, { id: newId, description: '', quantity: 1, rate: 0, amount: 0 }]);
  };

  const removeLineItem = (id: number) => {
    setLineItems(lineItems.filter(item => item.id !== id));
  };

  const updateLineItem = (id: number, field: string, value: string | number) => {
    setLineItems(lineItems.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        if (field === 'quantity' || field === 'rate') {
          updated.amount = updated.quantity * updated.rate;
        }
        return updated;
      }
      return item;
    }));
  };

  const generateInvoiceNumber = () => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `INV-${timestamp}-${random}`;
  };

  const handleAddNew = () => {
    dispatch(setCurrentInvoice(null));
    setFormData({
      invoice_number: generateInvoiceNumber(),
      customer_name: '',
      customer_email: '',
      cc_emails: '',
      bcc_emails: '',
      job_id: '',
      job_reference: '',
      estimate_id: '',
      invoice_status: 'draft',
      issue_date: new Date().toISOString().split('T')[0],
      due_date: '',
      payment_terms: 'net_30',
      bill_to_address: '',
      ship_to_address: '',
      ship_from_address: '',
      ship_via: '',
      shipping_date: '',
      tracking_number: '',
      subtotal: 0,
      discount_amount: 0,
      discount_percent: 0,
      adjustments_total: 0,
      tax_amount: 0,
      tax_rate: 0,
      shipping_amount: 0,
      total_amount: 0,
      amount_paid: 0,
      balance_due: 0,
      notes_to_customer: '',
      internal_notes: '',
      memo_on_statement: '',
      tags: ''
    });
    setShowForm(true);
  };

  const handleView = (invoice: Invoice) => {
    dispatch(setCurrentInvoice(invoice));
    setFormData(invoice);
    setShowForm(true);
  };

  const handleSave = async () => {
    // Basic validation
    if (!formData.customer_name?.trim()) {
      showSuccessToast('Please select a customer.');
      return;
    }
    if (!formData.customer_email?.trim()) {
      showSuccessToast('Please enter customer email.');
      return;
    }
    if (!formData.due_date) {
      showSuccessToast('Please enter due date.');
      return;
    }

    // Clean data - remove empty strings for ObjectId fields
    const cleanData = { ...formData };
    if (cleanData.job_id === '') delete cleanData.job_id;
    if (cleanData.customer_id === '') delete cleanData.customer_id;
    if (cleanData.estimate_id === '') delete cleanData.estimate_id;

    try {
      if (currentInvoice?._id) {
        await dispatch(updateInvoice({ id: currentInvoice._id, data: cleanData })).unwrap();
        showSuccessToast('Invoice updated successfully.');
      } else {
        await dispatch(createInvoice(cleanData as Omit<Invoice, '_id'>)).unwrap();
        showSuccessToast('Invoice created successfully.');
      }
      setShowForm(false);
    } catch (error) {
      console.error('Save error:', error);
      showSuccessToast('Error saving invoice.');
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    dispatch(setCurrentInvoice(null));
  };

  const handleSend = async (invoice: Invoice) => {
    try {
      const response = await fetch('/api/invoices/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invoiceId: invoice._id,
          email: invoice.customer_email,
          message: ''
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        await dispatch(fetchInvoices());
        showSuccessToast(`Invoice ${invoice.invoice_number} sent successfully.`);
      } else {
        showSuccessToast(result.error || 'Error sending invoice.');
      }
    } catch (error) {
      showSuccessToast('Error sending invoice.');
    }
  };

  const handleMarkPaid = async (invoice: Invoice) => {
    try {
      await dispatch(updateInvoice({ 
        id: invoice._id!, 
        data: { invoice_status: 'paid' } 
      })).unwrap();
      showSuccessToast(`Invoice ${invoice.invoice_number} marked as paid.`);
    } catch (error) {
      showSuccessToast('Error updating invoice.');
    }
  };

  const handleDelete = async (invoice: Invoice) => {
    if (confirm(`Delete invoice ${invoice.invoice_number}? This action cannot be undone.`)) {
      try {
        await dispatch(deleteInvoice(invoice._id!)).unwrap();
        showSuccessToast('Invoice deleted successfully.');
      } catch (error) {
        showSuccessToast('Error deleting invoice.');
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-slate-100 text-slate-700';
      case 'sent': return 'bg-blue-100 text-blue-700';
      case 'finalized': return 'bg-orange-100 text-orange-700';
      case 'paid': return 'bg-green-100 text-green-700';
      case 'void': return 'bg-red-100 text-red-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const unpaidAmount = invoices
    .filter(inv => inv.invoice_status === 'sent' || inv.invoice_status === 'finalized')
    .reduce((sum, inv) => sum + inv.total_amount, 0);
  
  const overdueAmount = invoices
    .filter(inv => {
      const isUnpaid = inv.invoice_status === 'sent' || inv.invoice_status === 'finalized';
      const isPastDue = new Date(inv.due_date) < new Date();
      return isUnpaid && isPastDue;
    })
    .reduce((sum, inv) => sum + inv.total_amount, 0);
  
  const paidAmount = invoices
    .filter(inv => inv.invoice_status === 'paid')
    .reduce((sum, inv) => sum + inv.total_amount, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-lg">Loading invoices...</div>
      </div>
    );
  }

  if (showForm) {
    return (
      <div className="min-h-screen bg-slate-50 pb-2">
        {/* Sticky Header */} 
        <div className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-sm">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div>
                  <div className="text-xs uppercase text-slate-500 font-medium mb-1">Invoice</div>
                  <div className="text-xl font-bold text-slate-900">
                    {formData.invoice_number || 'New Invoice'}
                  </div>
                </div>
                {formData.invoice_status && (
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(formData.invoice_status)}`}>
                    {formData.invoice_status.charAt(0).toUpperCase() + formData.invoice_status.slice(1)}
                  </div>
                )}
                {formData.customer_name && (
                  <>
                    <div className="text-slate-300">|</div>
                    <div className="text-sm text-slate-600">{formData.customer_name}</div>
                  </>
                )}
              </div>
              <div className="text-right">
                <div className="text-xs text-slate-500 mb-1">Balance Due</div>
                <div className="text-2xl font-bold text-slate-900">${formData.total_amount?.toFixed(2) || '0.00'}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
          {/* Customer Information */}
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
            <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wide mb-4">Customer Information</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <select 
                  value={formData.customer_name || ''} 
                  onChange={(e) => {
                    const customer = customers.find(c => c.legal_company_name === e.target.value);
                    setFormData({
                      ...formData, 
                      customer_name: e.target.value,
                      customer_email: customer?.email || ''
                    });
                  }}
                  className="w-64 h-10 border border-slate-300 rounded-md px-3"
                >
                  <option value="">Select customer</option>
                  {customers.map(customer => (
                    <option key={customer._id} value={customer.legal_company_name}>
                      {customer.legal_company_name}
                    </option>
                  ))}
                </select>
                <button className="text-blue-600 h-10 w-10 flex items-center justify-center">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <input 
                type="email"
                placeholder="Enter customer email" 
                className="w-full max-w-sm h-10 border border-slate-300 rounded-md px-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                value={formData.customer_email || ''}
                onChange={(e) => setFormData({...formData, customer_email: e.target.value})}
              />
              <button 
                onClick={() => setShowCcBcc(!showCcBcc)}
                className="text-xs text-blue-600 hover:underline font-medium"
              >
                {showCcBcc ? 'Hide Cc/Bcc' : '+ Add Cc/Bcc'}
              </button>
              {showCcBcc && (
                <div className="space-y-2 mt-2">
                  <input 
                    placeholder="Cc email" 
                    value={formData.cc_emails || ''}
                    onChange={(e) => setFormData({...formData, cc_emails: e.target.value})}
                    className="w-full max-w-sm h-10 border border-slate-300 rounded-md px-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  />
                  <input 
                    placeholder="Bcc email" 
                    value={formData.bcc_emails || ''}
                    onChange={(e) => setFormData({...formData, bcc_emails: e.target.value})}
                    className="w-full max-w-sm h-10 border border-slate-300 rounded-md px-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Addresses */}
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
            <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wide mb-4">Addresses</h3>
            <div className={`grid ${showShipping ? 'grid-cols-3' : 'grid-cols-2'} gap-4`}>
              <div>
                <div className="text-xs font-semibold text-slate-700 mb-2">Bill to</div>
                <textarea 
                  rows={4} 
                  className="w-full resize-none text-sm border border-slate-300 rounded-md p-3"
                  value={formData.bill_to_address || ''}
                  onChange={(e) => setFormData({...formData, bill_to_address: e.target.value})}
                />
              </div>
              {showShipping && (
                <>
                  <div>
                    <div className="text-xs font-semibold text-slate-700 mb-2">Ship to</div>
                    <textarea 
                      rows={4} 
                      className="w-full resize-none text-sm border border-slate-300 rounded-md p-3"
                      value={formData.ship_to_address || ''}
                      onChange={(e) => setFormData({...formData, ship_to_address: e.target.value})}
                    />
                    <button 
                      onClick={() => setShowShipping(false)}
                      className="text-xs text-blue-600 hover:underline mt-1 font-medium"
                    >
                      Remove shipping info
                    </button>
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-700 mb-2">Ship from (hidden)</div>
                    <textarea 
                      rows={4} 
                      className="w-full resize-none text-sm bg-slate-100 border border-slate-300 rounded-md p-3"
                      value={formData.ship_from_address || ''}
                      onChange={(e) => setFormData({...formData, ship_from_address: e.target.value})}
                    />
                  </div>
                </>
              )}
              {!showShipping && (
                <div className="flex items-center">
                  <button 
                    onClick={() => setShowShipping(true)}
                    className="text-xs text-blue-600 hover:underline font-medium"
                  >
                    + Add shipping info
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Invoice Details */}
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
            <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wide mb-4">Invoice Details</h3>
            <div className="grid grid-cols-2 gap-x-12 gap-y-3">
              <div className="flex items-center gap-3">
                <label className="text-xs font-semibold text-slate-700 w-32">Ship via</label>
                <input 
                  className="flex-1 h-10 border border-slate-300 rounded-md px-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  value={formData.ship_via || ''}
                  onChange={(e) => setFormData({...formData, ship_via: e.target.value})}
                />
              </div>
              <div className="flex items-center gap-3">
                <label className="text-xs font-semibold text-slate-700 w-32">Invoice no.</label>
                <input value={formData.invoice_number || 'Auto'} disabled className="flex-1 h-10 bg-slate-100 border border-slate-300 rounded-md px-3" />
              </div>
              <div className="flex items-center gap-3">
                <label className="text-xs font-semibold text-slate-700 w-32">Shipping date</label>
                <input 
                  type="date" 
                  className="flex-1 h-10 border border-slate-300 rounded-md px-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  value={formData.shipping_date || ''}
                  onChange={(e) => setFormData({...formData, shipping_date: e.target.value})}
                />
              </div>
              <div className="flex items-center gap-3">
                <label className="text-xs font-semibold text-slate-700 w-32">Terms</label>
                <select 
                  value={formData.payment_terms || 'net_30'}
                  onChange={(e) => setFormData({...formData, payment_terms: e.target.value})}
                  className="flex-1 h-10 border border-slate-300 rounded-md px-3"
                >
                  <option value="due_on_receipt">Due on receipt</option>
                  <option value="net_15">Net 15</option>
                  <option value="net_30">Net 30</option>
                  <option value="net_45">Net 45</option>
                  <option value="net_60">Net 60</option>
                </select>
              </div>
              <div className="flex items-center gap-3">
                <label className="text-xs font-semibold text-slate-700 w-32">Tracking no.</label>
                <input 
                  className="flex-1 h-10 border border-slate-300 rounded-md px-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  value={formData.tracking_number || ''}
                  onChange={(e) => setFormData({...formData, tracking_number: e.target.value})}
                />
              </div>
              <div className="flex items-center gap-3">
                <label className="text-xs font-semibold text-slate-700 w-32">Invoice date</label>
                <input 
                  type="date" 
                  value={formData.issue_date || ''} 
                  onChange={(e) => setFormData({...formData, issue_date: e.target.value})} 
                  className="flex-1 h-10 border border-slate-300 rounded-md px-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200" 
                />
              </div>
              <div className="flex items-center gap-3">
                <label className="text-xs font-semibold text-slate-700 w-32">Due date</label>
                <input 
                  type="date" 
                  value={formData.due_date || ''} 
                  onChange={(e) => setFormData({...formData, due_date: e.target.value})} 
                  className="flex-1 h-10 border border-slate-300 rounded-md px-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200" 
                />
              </div>
              <div className="flex items-center gap-3">
                <label className="text-xs font-semibold text-slate-700 w-32">Total Amount</label>
                <input 
                  type="number" 
                  step="0.01"
                  value={formData.total_amount || 0} 
                  onChange={(e) => setFormData({...formData, total_amount: parseFloat(e.target.value) || 0, balance_due: parseFloat(e.target.value) || 0})} 
                  className="flex-1 h-10 border border-slate-300 rounded-md px-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200" 
                />
              </div>
            </div>
          </div>

          {/* Invoice Line Items */}          
            <div className="bg-white rounded-lg border-2 border-blue-100 shadow-md">
              <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-blue-50 to-white">
                <h3 className="text-base font-bold text-slate-900 uppercase tracking-wide">Invoice Line Items</h3>
                <p className="text-xs text-slate-500 mt-1">Billable products and services — totals update automatically</p>
              </div>
              <div className="p-6">
                <div className="overflow-x-auto">
                  <table className="w-full border border-slate-200 rounded-lg">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider border-b">Description</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider border-b w-24">Qty</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider border-b w-32">Rate</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider border-b w-32">Amount</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider border-b w-16">Delete</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {lineItems.map((item) => (
                        <tr key={item.id}>
                          <td className="px-4 py-3">
                            <input 
                              type="text" 
                              placeholder="Enter description" 
                              value={item.description}
                              onChange={(e) => updateLineItem(item.id, 'description', e.target.value)}
                              className="w-full border border-slate-300 rounded px-3 py-2 text-sm"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <input 
                              type="number" 
                              placeholder="1" 
                              value={item.quantity}
                              onChange={(e) => updateLineItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                              className="w-full border border-slate-300 rounded px-3 py-2 text-sm"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <input 
                              type="number" 
                              step="0.01" 
                              placeholder="0.00" 
                              value={item.rate}
                              onChange={(e) => updateLineItem(item.id, 'rate', parseFloat(e.target.value) || 0)}
                              className="w-full border border-slate-300 rounded px-3 py-2 text-sm"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-sm font-medium">${item.amount.toFixed(2)}</span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <button 
                              onClick={() => removeLineItem(item.id)}
                              className="text-red-600 hover:text-red-800"
                            >
                              ×
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <button 
                  onClick={addLineItem}
                  className="mt-4 flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  <Plus className="w-4 h-4" />
                  Add line item
                </button>
              </div>
            </div>

          {/* Tags */}
          <details className="bg-white rounded-lg border border-slate-200 shadow-sm">
            <summary className="px-6 py-4 cursor-pointer hover:bg-slate-50 text-sm font-semibold uppercase text-slate-600 tracking-wide">
              Tags (Hidden)
            </summary>
            <div className="px-6 pb-6 space-y-3">
              <div className="flex items-center gap-3">
                <input 
                  placeholder="Start typing to add a tag" 
                  className="flex-1 max-w-md h-10 border border-slate-300 rounded-md px-3"
                  value={formData.tags || ''}
                  onChange={(e) => setFormData({...formData, tags: e.target.value})}
                />
                <button 
                  onClick={() => setShowTagsManager(!showTagsManager)}
                  className="text-xs text-blue-600 hover:underline font-medium"
                >
                  {showTagsManager ? 'Hide manager' : 'Manage tags'}
                </button>
              </div>
              {showTagsManager && (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                  <p className="text-xs text-slate-600 mb-2">Common tags:</p>
                  <div className="flex flex-wrap gap-2">
                    {['Urgent', 'Paid', 'Overdue', 'Recurring', 'Important'].map(tag => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => {
                          const currentTags = formData.tags ? formData.tags.split(',').map(t => t.trim()) : [];
                          if (!currentTags.includes(tag)) {
                            setFormData({...formData, tags: [...currentTags, tag].join(', ')});
                          }
                        }}
                        className="px-2 py-1 bg-white border border-slate-300 rounded text-xs hover:bg-slate-100"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </details>

          {/* Bottom Section */}
          <div className="grid grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              {/* Payment Options */}
              <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-xs font-semibold uppercase text-slate-600">Customer payment options</label>
                </div>
                <div className="flex gap-2 mb-3">
                  <div className="px-2 py-1 border rounded text-xs">Apple Pay</div>
                  <div className="px-2 py-1 border rounded text-xs">VISA</div>
                  <div className="px-2 py-1 border rounded text-xs">Mastercard</div>
                  <div className="px-2 py-1 border rounded text-xs">AMEX</div>
                  <div className="px-2 py-1 border rounded text-xs">ACH</div>
                </div>
                <textarea rows={2} placeholder="Tell your customer how you want to get paid" className="w-full resize-none text-xs border border-slate-300 rounded-md p-3" />
              </div>

              {/* Notes */}
              <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4">
                <label className="text-xs font-semibold uppercase text-slate-600 mb-2 block">Note to customer</label>
                <textarea 
                  rows={3} 
                  placeholder="Thank you for your business" 
                  className="w-full resize-none text-xs border border-slate-300 rounded-md p-3" 
                  value={formData.notes_to_customer || ''} 
                  onChange={(e) => setFormData({...formData, notes_to_customer: e.target.value})} 
                />
              </div>

              <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4">
                <label className="text-xs font-semibold uppercase text-slate-600 mb-2 block">Internal notes (hidden)</label>
                <textarea 
                  rows={3} 
                  placeholder="Internal notes (not visible to customer)" 
                  className="w-full resize-none text-xs border border-slate-300 rounded-md p-3"
                  value={formData.internal_notes || ''}
                  onChange={(e) => setFormData({...formData, internal_notes: e.target.value})}
                />
              </div>

              <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4">
                <label className="text-xs font-semibold uppercase text-slate-600 mb-2 block">Memo on statement (hidden)</label>
                <textarea 
                  rows={2} 
                  placeholder="Internal memo (not shown on invoice)" 
                  className="w-full resize-none text-xs border border-slate-300 rounded-md p-3"
                  value={formData.memo_on_statement || ''}
                  onChange={(e) => setFormData({...formData, memo_on_statement: e.target.value})}
                />
              </div>

              {/* Attachments */}
              <details className="bg-white rounded-lg border border-slate-200 shadow-sm">
                <summary className="px-4 py-3 cursor-pointer hover:bg-slate-50 text-xs font-semibold uppercase text-slate-600">
                  Attachments ({attachments.length})
                </summary>
                <div className="px-4 pb-4">
                  {attachments.length > 0 && (
                    <div className="mb-4 space-y-2">
                      {attachments.map((attachment) => (
                        <div key={attachment.id} className="flex items-center justify-between p-2 bg-slate-50 rounded border">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-slate-700">{attachment.name}</span>
                            <a 
                              href={attachment.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-xs text-blue-600 hover:underline"
                            >
                              View
                            </a>
                          </div>
                          <button 
                            onClick={() => removeAttachment(attachment.id)}
                            className="text-red-600 hover:text-red-800 text-sm"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="border-2 border-dashed border-slate-300 rounded-lg p-4 text-center">
                    <input 
                      type="file"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleFileUpload(file);
                        }
                      }}
                      className="hidden"
                      id="file-upload"
                      disabled={uploading}
                    />
                    <label htmlFor="file-upload" className={`text-xs flex items-center gap-2 mx-auto cursor-pointer font-medium ${
                      uploading ? 'text-slate-400' : 'text-blue-600 hover:underline'
                    }`}>
                      <Upload className="w-3 h-3" />
                      {uploading ? 'Uploading...' : 'Choose file'}
                    </label>
                    <div className="text-xs text-slate-500 mt-1">Max file size: 20 MB</div>
                  </div>
                </div>
              </details>
            </div>

            {/* Right Column - Summary */}
            <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
              <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wide mb-4 pb-2 border-b">Invoice Totals</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600">Subtotal</span>
                  <span className="text-sm font-medium">${formData.subtotal?.toFixed(2) || '0.00'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600">Tax</span>
                  <span className="text-sm font-medium">${formData.tax_amount?.toFixed(2) || '0.00'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600">Shipping</span>
                  <span className="text-sm font-medium">${formData.shipping_amount?.toFixed(2) || '0.00'}</span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between">
                    <span className="text-base font-semibold text-slate-900">Total</span>
                    <span className="text-base font-bold text-slate-900">${formData.total_amount?.toFixed(2) || '0.00'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="max-w-7xl mx-auto px-6 pb-6">
          <div className="flex justify-end gap-3 pt-6 border-t border-slate-200">
            <button
              onClick={handleCancel}
              className="px-4 py-2 border border-slate-300 text-slate-700 rounded hover:bg-slate-50"
            >
              Cancel
            </button>
            <button className="px-4 py-2 border border-slate-300 text-slate-700 rounded hover:bg-slate-50">
              Clear
            </button>
            <button className="px-4 py-2 border border-slate-300 text-slate-700 rounded hover:bg-slate-50">
              Print / Preview
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded"
            >
              Save & Close
            </button>
            {formData.invoice_status === 'draft' && (
              <button className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded">
                Send Invoice
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Invoices</h1>
        </div>

        {/* Financial Summary */}
        <div className="mb-8">
          <div className="grid grid-cols-3 gap-6">
            {/* Unpaid/Overdue Card */}
            <div className="bg-white border-2 border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="text-sm font-semibold text-slate-700 mb-1">${unpaidAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Unpaid</div>
                  <div className="text-xs text-slate-500">Last 365 days</div>
                </div>
              </div>
              <div className="mb-4">
                <div className="text-3xl font-bold text-orange-600 mb-1">${overdueAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                <div className="text-sm font-semibold text-slate-700">Overdue</div>
                <a href="#" className="text-sm text-blue-600 hover:underline font-medium">Get an invoice advance</a>
              </div>
              <div className="h-3 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full shadow-sm"></div>
            </div>

            {/* Net Due Yet Card */}
            <div className="bg-white border-2 border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="mb-6">
                <div className="text-3xl font-bold text-blue-600 mb-1">${(unpaidAmount - overdueAmount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                <div className="text-sm font-semibold text-slate-700">Net due yet</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-slate-900 mb-1">$0.00</div>
                <div className="text-sm font-semibold text-slate-700">Not deposited</div>
              </div>
            </div>

            {/* Paid Card */}
            <div className="bg-white border-2 border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="text-sm font-semibold text-slate-700 mb-1">${paidAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Paid</div>
                  <div className="text-xs text-slate-500">Last 30 days</div>
                </div>
              </div>
              <div className="mb-4">
                <div className="text-3xl font-bold text-green-600 mb-1">${paidAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                <div className="text-sm font-semibold text-slate-700">Deposited</div>
              </div>
              <div className="h-3 bg-gradient-to-r from-green-500 to-green-600 rounded-full shadow-sm"></div>
            </div>
          </div>
        </div>

        {/* Filters and Actions */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex gap-3">
            <select className="w-40 h-10 border border-slate-300 rounded-md px-3">
              <option>Batch actions</option>
              <option>Send invoices</option>
              <option>Export selected</option>
            </select>
            
            <select className="w-48 h-10 border border-slate-300 rounded-md px-3">
              <option>Needs attention</option>
              <option>All statuses</option>
              <option>Draft</option>
              <option>Sent</option>
              <option>Paid</option>
            </select>
            
            <select className="w-48 h-10 border border-slate-300 rounded-md px-3">
              <option>Last 12 months</option>
              <option>Last 30 days</option>
              <option>Last 90 days</option>
              <option>This year</option>
            </select>
          </div>

          <div className="flex gap-2">
            <button onClick={handleAddNew} className="h-10 px-6 bg-green-600 hover:bg-green-700 text-white rounded-md flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Create invoice
            </button>
          </div>
        </div>

        {/* Invoice List */}
        <InvoiceList 
          invoices={invoices.map(inv => ({ ...inv, id: inv._id }))}
          customers={customers}
          onView={handleView}
          onSend={handleSend}
          onFinalize={() => {}}
          onMarkPaid={handleMarkPaid}
          onDelete={handleDelete}
          onDuplicate={() => {}}
          onSendReminder={() => {}}
          onVoid={() => {}}
          isLoading={loading}
        />

        {/* Success Toast */}
        {showSuccess && (
          <div className="fixed bottom-8 right-8 bg-emerald-600 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 z-50">
            <CheckCircle className="w-5 h-5" />
            <span className="font-medium">{successMessage}</span>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="fixed bottom-8 left-8 bg-red-600 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 z-50">
            <span className="font-medium">{error}</span>
          </div>
        )}
      </div>
    </div>
  );
}
