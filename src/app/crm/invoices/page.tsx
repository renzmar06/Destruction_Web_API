'use client';

import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Search, 
  Plus, 
  FileText, 
  AlertCircle,
  CheckCircle2,
  Trash2,
  Edit
} from 'lucide-react';
import { cn } from "@/lib/utils";

const statusConfig = {
  draft: { label: 'Draft', color: 'bg-slate-100 text-slate-700' },
  sent: { label: 'Sent', color: 'bg-blue-100 text-blue-700' },
  paid: { label: 'Paid', color: 'bg-green-100 text-green-700' },
  overdue: { label: 'Overdue', color: 'bg-red-100 text-red-700' },
  cancelled: { label: 'Cancelled', color: 'bg-slate-100 text-slate-500' },
};

export default function Invoices() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [invoices, setInvoices] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [crmEstimates, setCrmEstimates] = useState([]);
  const [customerEstimates, setCustomerEstimates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingInvoice, setEditingInvoice] = useState<any>(null);
  const [newInvoice, setNewInvoice] = useState({
    customer_id: '',
    crm_estimate_id: '',
    items: [{ description: '', quantity: 1, unit_price: 0, total: 0 }],
    due_date: '',
    issue_date: new Date().toISOString().split('T')[0],
    notes: '',
    payment_terms: 'Net 30'
  });

  useEffect(() => {
    fetchInvoices();
    fetchCustomers();
    fetchCrmEstimates();
  }, []);

  const fetchInvoices = async () => {
    try {
      const res = await fetch('/api/crm-invoices');
      const result = await res.json();
      if (result.success) {
        setInvoices(result.data);
      }
    } catch (error) {
      console.error('Error fetching invoices:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCustomers = async () => {
    try {
      const res = await fetch('/api/customers');
      const result = await res.json();
      if (result.success) {
        setCustomers(result.data);
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

  const fetchCrmEstimates = async () => {
    try {
      const res = await fetch('/api/crm-estimates');
      const result = await res.json();
      if (result.success) {
        setCrmEstimates(result.data);
      }
    } catch (error) {
      console.error('Error fetching CRM estimates:', error);
    }
  };

  const handleCustomerChange = (customerId: string) => {
    setNewInvoice({ 
      ...newInvoice, 
      customer_id: customerId,
      crm_estimate_id: '' 
    });
    
    // Filter estimates for selected customer
    const filtered = crmEstimates.filter((est: any) => est.customer_id === customerId);
    setCustomerEstimates(filtered);
  };

  const handleEstimateChange = (estimateId: string) => {
    setNewInvoice({ ...newInvoice, crm_estimate_id: estimateId });
    
    // Optionally pre-fill items from estimate
    if (estimateId) {
      const selectedEstimate: any = crmEstimates.find((est: any) => est._id === estimateId);
      if (selectedEstimate && selectedEstimate.items && selectedEstimate.items.length > 0) {
        setNewInvoice({ 
          ...newInvoice, 
          crm_estimate_id: estimateId,
          items: selectedEstimate.items.map((item: any) => ({ ...item }))
        });
      }
    }
  };

  const createInvoice = async (data: any) => {
    try {
      const res = await fetch('/api/crm-invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const result = await res.json();
      if (result.success) {
        fetchInvoices();
        setIsCreateOpen(false);
        setNewInvoice({
          customer_id: '',
          crm_estimate_id: '',
          items: [{ description: '', quantity: 1, unit_price: 0, total: 0 }],
          due_date: '',
          issue_date: new Date().toISOString().split('T')[0],
          notes: '',
          payment_terms: 'Net 30'
        });
        setCustomerEstimates([]);
      }
    } catch (error) {
      console.error('Error creating invoice:', error);
    }
  };

  const updateInvoice = async (id: string, data: any) => {
    try {
      const res = await fetch(`/api/crm-invoices/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const result = await res.json();
      if (result.success) {
        fetchInvoices();
      }
    } catch (error) {
      console.error('Error updating invoice:', error);
    }
  };

  const handleAddItem = () => {
    setNewInvoice({
      ...newInvoice,
      items: [...newInvoice.items, { description: '', quantity: 1, unit_price: 0, total: 0 }]
    });
  };

  const handleRemoveItem = (index: number) => {
    setNewInvoice({
      ...newInvoice,
      items: newInvoice.items.filter((_, i) => i !== index)
    });
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const items = [...newInvoice.items];
    (items[index] as any)[field] = value;
    if (field === 'quantity' || field === 'unit_price') {
      items[index].total = (items[index].quantity || 0) * (items[index].unit_price || 0);
    }
    setNewInvoice({ ...newInvoice, items });
  };

  const calculateTotal = () => {
    return newInvoice.items.reduce((sum, item) => sum + (item.total || 0), 0);
  };

  const handleCreate = () => {
    const total = calculateTotal();
    const invoiceNumber = `INV-${Date.now()}`;
    createInvoice({
      ...newInvoice,
      invoice_number: invoiceNumber,
      subtotal: total,
      total: total,
      status: 'draft',
      payment_status: 'unpaid'
    });
  };

  const handleEdit = (invoice: any) => {
    setEditingInvoice({
      ...invoice,
      issue_date: invoice.issue_date ? new Date(invoice.issue_date).toISOString().split('T')[0] : '',
      due_date: invoice.due_date ? new Date(invoice.due_date).toISOString().split('T')[0] : ''
    });
    setIsEditOpen(true);
  };

  const handleEditItemChange = (index: number, field: string, value: any) => {
    const items = [...editingInvoice.items];
    (items[index] as any)[field] = value;
    if (field === 'quantity' || field === 'unit_price') {
      items[index].total = (items[index].quantity || 0) * (items[index].unit_price || 0);
    }
    setEditingInvoice({ ...editingInvoice, items });
  };

  const calculateEditTotal = () => {
    return editingInvoice?.items.reduce((sum: number, item: any) => sum + (item.total || 0), 0) || 0;
  };

  const handleUpdate = () => {
    const total = calculateEditTotal();
    updateInvoice(editingInvoice._id, {
      ...editingInvoice,
      subtotal: total,
      total: total
    });
    setIsEditOpen(false);
    setEditingInvoice(null);
  };

  const filteredInvoices = invoices.filter((inv: any) => {
    if (!searchQuery) return true;
    const customer: any = customers.find((c: any) => c._id === inv.customer_id);
    return inv.invoice_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer?.name?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const stats = {
    total: invoices.reduce((sum: number, inv: any) => sum + (inv.total || 0), 0),
    paid: invoices.filter((i: any) => i.payment_status === 'paid').reduce((sum: number, i: any) => sum + (i.total || 0), 0),
    unpaid: invoices.filter((i: any) => i.payment_status === 'unpaid').reduce((sum: number, i: any) => sum + (i.total || 0), 0),
    overdue: invoices.filter((i: any) => i.status === 'overdue').length,
  };

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Invoices</h1>
          <p className="text-slate-500">Create and manage invoices</p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)} className="bg-blue-500 hover:bg-blue-600">
          <Plus className="w-4 h-4 mr-2" />
          Create Invoice
        </Button>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 border border-slate-100">
          <p className="text-sm text-slate-500">Total Revenue</p>
          <p className="text-2xl font-bold text-slate-900">${stats.total.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-100">
          <p className="text-sm text-slate-500">Paid</p>
          <p className="text-2xl font-bold text-green-600">${stats.paid.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-100">
          <p className="text-sm text-slate-500">Unpaid</p>
          <p className="text-2xl font-bold text-orange-600">${stats.unpaid.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-100">
          <p className="text-sm text-slate-500">Overdue</p>
          <p className="text-2xl font-bold text-red-600">{stats.overdue}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
        <div className="p-4 border-b">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search invoices..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50">
              <TableHead className="font-semibold">Invoice #</TableHead>
              <TableHead className="font-semibold">Customer</TableHead>
              <TableHead className="font-semibold">Amount</TableHead>
              <TableHead className="font-semibold">Status</TableHead>
              <TableHead className="font-semibold">Payment</TableHead>
              <TableHead className="font-semibold">Due Date</TableHead>
              <TableHead className="font-semibold">Created</TableHead>
              <TableHead className="w-12">Edit</TableHead>
              <TableHead className="w-12">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredInvoices.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-12 text-slate-400">
                  <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No invoices found</p>
                </TableCell>
              </TableRow>
            ) : (
              filteredInvoices.map((invoice: any) => {
                const customer: any = customers.find((c: any) => c._id === invoice.customer_id);
                const statusInfo = (statusConfig as any)[invoice.status] || statusConfig.draft;
                
                return (
                  <TableRow key={invoice._id} className="hover:bg-slate-50">
                    <TableCell className="font-medium">{invoice.invoice_number}</TableCell>
                    <TableCell>{customer?.name || 'Unknown'}</TableCell>
                    <TableCell className="font-semibold">${invoice.total?.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge className={cn("capitalize", statusInfo.color)}>
                        {statusInfo.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {invoice.payment_status === 'paid' ? (
                        <div className="flex items-center gap-1 text-green-600">
                          <CheckCircle2 className="w-4 h-4" />
                          <span className="text-sm">Paid</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-orange-600">
                          <AlertCircle className="w-4 h-4" />
                          <span className="text-sm">Unpaid</span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-sm">
                      {invoice.due_date ? format(new Date(invoice.due_date), 'MMM d, yyyy') : '-'}
                    </TableCell>
                    <TableCell className="text-sm text-slate-500">
                      {format(new Date(invoice.created_date), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(invoice)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                    </TableCell>
                    <TableCell>
                      <Select 
                        value={invoice.payment_status} 
                        onValueChange={(v) => updateInvoice(invoice._id, { 
                          payment_status: v,
                          status: v === 'paid' ? 'paid' : invoice.status
                        })}
                      >
                        <SelectTrigger className="h-8 w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="unpaid">Unpaid</SelectItem>
                          <SelectItem value="partial">Partial</SelectItem>
                          <SelectItem value="paid">Paid</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Invoice</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Customer *</Label>
                <Select value={newInvoice.customer_id} onValueChange={handleCustomerChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select customer" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map((c: any) => (
                      <SelectItem key={c._id} value={c._id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Issue Date</Label>
                <Input
                  type="date"
                  value={newInvoice.issue_date}
                  onChange={(e) => setNewInvoice({ ...newInvoice, issue_date: e.target.value })}
                />
              </div>
            </div>

            {newInvoice.customer_id && (
              <div>
                <Label>Select CRM Estimate (Optional)</Label>
                <Select value={newInvoice.crm_estimate_id || undefined} onValueChange={handleEstimateChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select estimate (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {customerEstimates.map((est: any) => (
                      <SelectItem key={est._id} value={est._id}>
                        {est.estimate_number} - ${est.total?.toLocaleString()} ({est.status})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Items *</Label>
                <Button variant="outline" size="sm" onClick={handleAddItem}>
                  <Plus className="w-4 h-4 mr-1" /> Add Item
                </Button>
              </div>
              <div className="space-y-2 border rounded-lg p-3">
                {newInvoice.items.map((item, idx) => (
                  <div key={idx} className="grid grid-cols-12 gap-2 items-end">
                    <div className="col-span-5">
                      <Input
                        placeholder="Description"
                        value={item.description}
                        onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                      />
                    </div>
                    <div className="col-span-2">
                      <Input
                        type="number"
                        placeholder="Qty"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(idx, 'quantity', parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <div className="col-span-2">
                      <Input
                        type="number"
                        placeholder="Price"
                        value={item.unit_price}
                        onChange={(e) => handleItemChange(idx, 'unit_price', parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <div className="col-span-2">
                      <Input value={`$${item.total.toFixed(2)}`} disabled />
                    </div>
                    <div className="col-span-1">
                      <Button variant="ghost" size="icon" onClick={() => handleRemoveItem(idx)}>
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-end mt-2">
                <p className="text-lg font-bold">Total: ${calculateTotal().toFixed(2)}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Due Date</Label>
                <Input
                  type="date"
                  value={newInvoice.due_date}
                  onChange={(e) => setNewInvoice({ ...newInvoice, due_date: e.target.value })}
                />
              </div>
              <div>
                <Label>Payment Terms</Label>
                <Select value={newInvoice.payment_terms} onValueChange={(v) => setNewInvoice({ ...newInvoice, payment_terms: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Due on receipt">Due on receipt</SelectItem>
                    <SelectItem value="Net 15">Net 15</SelectItem>
                    <SelectItem value="Net 30">Net 30</SelectItem>
                    <SelectItem value="Net 60">Net 60</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Notes</Label>
              <Textarea
                value={newInvoice.notes}
                onChange={(e) => setNewInvoice({ ...newInvoice, notes: e.target.value })}
                rows={2}
                placeholder="Additional notes..."
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
              <Button onClick={handleCreate} disabled={!newInvoice.customer_id || newInvoice.items.length === 0}>
                Create Invoice
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Invoice</DialogTitle>
          </DialogHeader>
          {editingInvoice && (
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Customer *</Label>
                  <Select value={editingInvoice.customer_id} onValueChange={(v) => setEditingInvoice({ ...editingInvoice, customer_id: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select customer" />
                    </SelectTrigger>
                    <SelectContent>
                      {customers.map((c: any) => (
                        <SelectItem key={c._id} value={c._id}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Issue Date</Label>
                  <Input
                    type="date"
                    value={editingInvoice.issue_date}
                    onChange={(e) => setEditingInvoice({ ...editingInvoice, issue_date: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Items *</Label>
                  <Button variant="outline" size="sm" onClick={() => setEditingInvoice({ ...editingInvoice, items: [...editingInvoice.items, { description: '', quantity: 1, unit_price: 0, total: 0 }] })}>
                    <Plus className="w-4 h-4 mr-1" /> Add Item
                  </Button>
                </div>
                <div className="space-y-2 border rounded-lg p-3">
                  {editingInvoice.items.map((item: any, idx: number) => (
                    <div key={idx} className="grid grid-cols-12 gap-2 items-end">
                      <div className="col-span-5">
                        <Input
                          placeholder="Description"
                          value={item.description}
                          onChange={(e) => handleEditItemChange(idx, 'description', e.target.value)}
                        />
                      </div>
                      <div className="col-span-2">
                        <Input
                          type="number"
                          placeholder="Qty"
                          value={item.quantity}
                          onChange={(e) => handleEditItemChange(idx, 'quantity', parseFloat(e.target.value) || 0)}
                        />
                      </div>
                      <div className="col-span-2">
                        <Input
                          type="number"
                          placeholder="Price"
                          value={item.unit_price}
                          onChange={(e) => handleEditItemChange(idx, 'unit_price', parseFloat(e.target.value) || 0)}
                        />
                      </div>
                      <div className="col-span-2">
                        <Input value={`$${item.total.toFixed(2)}`} disabled />
                      </div>
                      <div className="col-span-1">
                        <Button variant="ghost" size="icon" onClick={() => setEditingInvoice({ ...editingInvoice, items: editingInvoice.items.filter((_: any, i: number) => i !== idx) })}>
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-end mt-2">
                  <p className="text-lg font-bold">Total: ${calculateEditTotal().toFixed(2)}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Due Date</Label>
                  <Input
                    type="date"
                    value={editingInvoice.due_date}
                    onChange={(e) => setEditingInvoice({ ...editingInvoice, due_date: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Payment Terms</Label>
                  <Select value={editingInvoice.payment_terms} onValueChange={(v) => setEditingInvoice({ ...editingInvoice, payment_terms: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Due on receipt">Due on receipt</SelectItem>
                      <SelectItem value="Net 15">Net 15</SelectItem>
                      <SelectItem value="Net 30">Net 30</SelectItem>
                      <SelectItem value="Net 60">Net 60</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Notes</Label>
                <Textarea
                  value={editingInvoice.notes}
                  onChange={(e) => setEditingInvoice({ ...editingInvoice, notes: e.target.value })}
                  rows={2}
                  placeholder="Additional notes..."
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
                <Button onClick={handleUpdate}>
                  Update Invoice
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
