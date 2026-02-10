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
  Send,
  CheckCircle,
  XCircle,
  Clock,
  Trash2,
  Edit
} from 'lucide-react';
import { cn } from "@/lib/utils";

const statusConfig = {
  draft: { label: 'Draft', color: 'bg-slate-100 text-slate-700', icon: FileText },
  sent: { label: 'Sent', color: 'bg-blue-100 text-blue-700', icon: Send },
  accepted: { label: 'Accepted', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  declined: { label: 'Declined', color: 'bg-red-100 text-red-700', icon: XCircle },
  expired: { label: 'Expired', color: 'bg-orange-100 text-orange-700', icon: Clock },
};

export default function Estimates() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [estimates, setEstimates] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingEstimate, setEditingEstimate] = useState<any>(null);
  const [newEstimate, setNewEstimate] = useState({
    customer_id: '',
    items: [{ description: '', quantity: 1, unit_price: 0, total: 0 }],
    valid_until: '',
    notes: '',
    terms: 'Valid for 30 days from issue date'
  });

  useEffect(() => {
    fetchEstimates();
    fetchCustomers();
  }, []);

  const fetchEstimates = async () => {
    try {
      const res = await fetch('/api/crm-estimates');
      const result = await res.json();
      if (result.success) {
        setEstimates(result.data);
      }
    } catch (error) {
      console.error('Error fetching estimates:', error);
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

  const createEstimate = async (data: any) => {
    try {
      const res = await fetch('/api/crm-estimates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const result = await res.json();
      if (result.success) {
        fetchEstimates();
        setIsCreateOpen(false);
        setNewEstimate({
          customer_id: '',
          items: [{ description: '', quantity: 1, unit_price: 0, total: 0 }],
          valid_until: '',
          notes: '',
          terms: 'Valid for 30 days from issue date'
        });
      }
    } catch (error) {
      console.error('Error creating estimate:', error);
    }
  };

  const updateEstimate = async (id: string, data: any) => {
    try {
      const res = await fetch(`/api/crm-estimates/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const result = await res.json();
      if (result.success) {
        fetchEstimates();
      }
    } catch (error) {
      console.error('Error updating estimate:', error);
    }
  };

  const handleAddItem = () => {
    setNewEstimate({
      ...newEstimate,
      items: [...newEstimate.items, { description: '', quantity: 1, unit_price: 0, total: 0 }]
    });
  };

  const handleRemoveItem = (index: number) => {
    setNewEstimate({
      ...newEstimate,
      items: newEstimate.items.filter((_, i) => i !== index)
    });
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const items = [...newEstimate.items];
    (items[index] as any)[field] = value;
    if (field === 'quantity' || field === 'unit_price') {
      items[index].total = (items[index].quantity || 0) * (items[index].unit_price || 0);
    }
    setNewEstimate({ ...newEstimate, items });
  };

  const calculateTotal = () => {
    const subtotal = newEstimate.items.reduce((sum, item) => sum + (item.total || 0), 0);
    return subtotal;
  };

  const handleCreate = () => {
    const total = calculateTotal();
    const estimateNumber = `EST-${Date.now()}`;
    createEstimate({
      ...newEstimate,
      estimate_number: estimateNumber,
      subtotal: total,
      total: total,
      status: 'draft'
    });
  };

  const handleEdit = (estimate: any) => {
    setEditingEstimate({
      ...estimate,
      valid_until: estimate.valid_until ? new Date(estimate.valid_until).toISOString().split('T')[0] : ''
    });
    setIsEditOpen(true);
  };

  const handleEditItemChange = (index: number, field: string, value: any) => {
    const items = [...editingEstimate.items];
    (items[index] as any)[field] = value;
    if (field === 'quantity' || field === 'unit_price') {
      items[index].total = (items[index].quantity || 0) * (items[index].unit_price || 0);
    }
    setEditingEstimate({ ...editingEstimate, items });
  };

  const calculateEditTotal = () => {
    return editingEstimate?.items.reduce((sum: number, item: any) => sum + (item.total || 0), 0) || 0;
  };

  const handleUpdate = () => {
    const total = calculateEditTotal();
    updateEstimate(editingEstimate._id, {
      ...editingEstimate,
      subtotal: total,
      total: total
    });
    setIsEditOpen(false);
    setEditingEstimate(null);
  };

  const filteredEstimates = estimates.filter((est: any) => {
    if (!searchQuery) return true;
    const customer: any = customers.find((c: any) => c._id === est.customer_id);
    return est.estimate_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer?.name?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const stats = {
    total: estimates.length,
    draft: estimates.filter((e: any) => e.status === 'draft').length,
    sent: estimates.filter((e: any) => e.status === 'sent').length,
    accepted: estimates.filter((e: any) => e.status === 'accepted').length,
  };

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Estimates</h1>
          <p className="text-slate-500">Create and manage estimates</p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)} className="bg-blue-500 hover:bg-blue-600">
          <Plus className="w-4 h-4 mr-2" />
          Create Estimate
        </Button>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 border border-slate-100">
          <p className="text-sm text-slate-500">Total Estimates</p>
          <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-100">
          <p className="text-sm text-slate-500">Draft</p>
          <p className="text-2xl font-bold text-slate-600">{stats.draft}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-100">
          <p className="text-sm text-slate-500">Sent</p>
          <p className="text-2xl font-bold text-blue-600">{stats.sent}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-100">
          <p className="text-sm text-slate-500">Accepted</p>
          <p className="text-2xl font-bold text-green-600">{stats.accepted}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
        <div className="p-4 border-b">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search estimates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50">
              <TableHead className="font-semibold">Estimate #</TableHead>
              <TableHead className="font-semibold">Customer</TableHead>
              <TableHead className="font-semibold">Amount</TableHead>
              <TableHead className="font-semibold">Status</TableHead>
              <TableHead className="font-semibold">Valid Until</TableHead>
              <TableHead className="font-semibold">Created</TableHead>
              <TableHead className="w-12">Edit</TableHead>
              <TableHead className="w-12">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredEstimates.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12 text-slate-400">
                  <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No estimates found</p>
                </TableCell>
              </TableRow>
            ) : (
              filteredEstimates.map((estimate: any) => {
                const customer: any = customers.find((c: any) => c._id === estimate.customer_id);
                const statusInfo = (statusConfig as any)[estimate.status] || statusConfig.draft;
                const StatusIcon = statusInfo.icon;
                
                return (
                  <TableRow key={estimate._id} className="hover:bg-slate-50">
                    <TableCell className="font-medium">{estimate.estimate_number}</TableCell>
                    <TableCell>{customer?.name || 'Unknown'}</TableCell>
                    <TableCell className="font-semibold">${estimate.total?.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge className={cn("capitalize", statusInfo.color)}>
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {statusInfo.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      {estimate.valid_until ? format(new Date(estimate.valid_until), 'MMM d, yyyy') : '-'}
                    </TableCell>
                    <TableCell className="text-sm text-slate-500">
                      {format(new Date(estimate.created_date), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(estimate)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                    </TableCell>
                    <TableCell>
                      <Select 
                        value={estimate.status} 
                        onValueChange={(v) => updateEstimate(estimate._id, { status: v })}
                      >
                        <SelectTrigger className="h-8 w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="sent">Sent</SelectItem>
                          <SelectItem value="accepted">Accepted</SelectItem>
                          <SelectItem value="declined">Declined</SelectItem>
                          <SelectItem value="expired">Expired</SelectItem>
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
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Estimate</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label>Customer</Label>
              <Select value={newEstimate.customer_id} onValueChange={(v) => setNewEstimate({ ...newEstimate, customer_id: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select customer" />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((customer: any) => (
                    <SelectItem key={customer._id} value={customer._id}>
                      {customer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Valid Until</Label>
              <Input
                type="date"
                value={newEstimate.valid_until}
                onChange={(e) => setNewEstimate({ ...newEstimate, valid_until: e.target.value })}
              />
            </div>

            <div>
              <Label>Items</Label>
              {newEstimate.items.map((item, index) => (
                <div key={index} className="grid grid-cols-5 gap-2 mb-2">
                  <Input
                    placeholder="Description"
                    value={item.description}
                    onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                    className="col-span-2"
                  />
                  <Input
                    type="number"
                    placeholder="Qty"
                    value={item.quantity}
                    onChange={(e) => handleItemChange(index, 'quantity', parseFloat(e.target.value))}
                  />
                  <Input
                    type="number"
                    placeholder="Price"
                    value={item.unit_price}
                    onChange={(e) => handleItemChange(index, 'unit_price', parseFloat(e.target.value))}
                  />
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">${item.total.toFixed(2)}</span>
                    {newEstimate.items.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveItem(index)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
              <Button type="button" variant="outline" onClick={handleAddItem} className="mt-2">
                <Plus className="w-4 h-4 mr-2" />
                Add Item
              </Button>
            </div>

            <div>
              <Label>Notes</Label>
              <Textarea
                value={newEstimate.notes}
                onChange={(e) => setNewEstimate({ ...newEstimate, notes: e.target.value })}
                rows={3}
              />
            </div>

            <div>
              <Label>Terms</Label>
              <Textarea
                value={newEstimate.terms}
                onChange={(e) => setNewEstimate({ ...newEstimate, terms: e.target.value })}
                rows={2}
              />
            </div>

            <div className="flex justify-between items-center pt-4 border-t">
              <div className="text-lg font-bold">
                Total: ${calculateTotal().toFixed(2)}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreate}>
                  Create Estimate
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Estimate</DialogTitle>
          </DialogHeader>
          
          {editingEstimate && (
            <div className="space-y-4">
              <div>
                <Label>Customer</Label>
                <Select value={editingEstimate.customer_id} onValueChange={(v) => setEditingEstimate({ ...editingEstimate, customer_id: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select customer" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map((customer: any) => (
                      <SelectItem key={customer._id} value={customer._id}>
                        {customer.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Valid Until</Label>
                <Input
                  type="date"
                  value={editingEstimate.valid_until}
                  onChange={(e) => setEditingEstimate({ ...editingEstimate, valid_until: e.target.value })}
                />
              </div>

              <div>
                <Label>Items</Label>
                {editingEstimate.items.map((item: any, index: number) => (
                  <div key={index} className="grid grid-cols-5 gap-2 mb-2">
                    <Input
                      placeholder="Description"
                      value={item.description}
                      onChange={(e) => handleEditItemChange(index, 'description', e.target.value)}
                      className="col-span-2"
                    />
                    <Input
                      type="number"
                      placeholder="Qty"
                      value={item.quantity}
                      onChange={(e) => handleEditItemChange(index, 'quantity', parseFloat(e.target.value))}
                    />
                    <Input
                      type="number"
                      placeholder="Price"
                      value={item.unit_price}
                      onChange={(e) => handleEditItemChange(index, 'unit_price', parseFloat(e.target.value))}
                    />
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">${item.total.toFixed(2)}</span>
                      {editingEstimate.items.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingEstimate({ ...editingEstimate, items: editingEstimate.items.filter((_: any, i: number) => i !== index) })}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
                <Button type="button" variant="outline" onClick={() => setEditingEstimate({ ...editingEstimate, items: [...editingEstimate.items, { description: '', quantity: 1, unit_price: 0, total: 0 }] })} className="mt-2">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Item
                </Button>
              </div>

              <div>
                <Label>Notes</Label>
                <Textarea
                  value={editingEstimate.notes}
                  onChange={(e) => setEditingEstimate({ ...editingEstimate, notes: e.target.value })}
                  rows={3}
                />
              </div>

              <div>
                <Label>Terms</Label>
                <Textarea
                  value={editingEstimate.terms}
                  onChange={(e) => setEditingEstimate({ ...editingEstimate, terms: e.target.value })}
                  rows={2}
                />
              </div>

              <div className="flex justify-between items-center pt-4 border-t">
                <div className="text-lg font-bold">
                  Total: ${calculateEditTotal().toFixed(2)}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setIsEditOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleUpdate}>
                    Update Estimate
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
