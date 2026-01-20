import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Edit, Trash2, Plus, DollarSign } from "lucide-react";

const adjustmentTypeLabels = {
  transportation: 'Transportation',
  fuel_surcharge: 'Fuel Surcharge',
  cod_affidavit_fee: 'COD / Affidavit Fee',
  storage: 'Storage',
  disposal: 'Disposal',
  credit_discount: 'Credit / Discount',
  other: 'Other'
};

export default function InvoiceAdjustmentsSection({ invoiceId, invoiceStatus, onTotalChange }) {
  const [editingItem, setEditingItem] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const queryClient = useQueryClient();

  const { data: adjustments = [] } = useQuery({
    queryKey: ['invoiceAdjustments', invoiceId],
    queryFn: () => invoiceId ? base44.entities.InvoiceAdjustment.filter({ invoice_id: invoiceId }, 'sort_order') : [],
    enabled: !!invoiceId
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.InvoiceAdjustment.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoiceAdjustments', invoiceId] });
      setShowForm(false);
      setEditingItem(null);
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.InvoiceAdjustment.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoiceAdjustments', invoiceId] });
      setShowForm(false);
      setEditingItem(null);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.InvoiceAdjustment.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoiceAdjustments', invoiceId] });
    }
  });

  const adjustmentsTotal = adjustments.reduce((sum, item) => sum + (item.amount || 0), 0);

  React.useEffect(() => {
    onTotalChange(adjustmentsTotal);
  }, [adjustmentsTotal, onTotalChange]);

  const handleSave = (itemData) => {
    if (editingItem?.id) {
      updateMutation.mutate({ id: editingItem.id, data: itemData });
    } else {
      createMutation.mutate(itemData);
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setShowForm(true);
  };

  const handleDelete = (item) => {
    if (confirm('Delete this adjustment?')) {
      deleteMutation.mutate(item.id);
    }
  };

  const handleAddNew = () => {
    setEditingItem(null);
    setShowForm(true);
  };

  const isLocked = invoiceStatus === 'finalized' || invoiceStatus === 'paid';

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-slate-700" />
          <h3 className="font-semibold text-slate-900">Adjustments & Other Charges</h3>
        </div>
        {!isLocked && !showForm && (
          <Button onClick={handleAddNew} variant="outline" size="sm" className="gap-2">
            <Plus className="w-4 h-4" />
            Add Adjustment
          </Button>
        )}
      </div>

      {showForm && (
        <AdjustmentForm
          item={editingItem}
          invoiceId={invoiceId}
          onSave={handleSave}
          onCancel={() => {
            setShowForm(false);
            setEditingItem(null);
          }}
        />
      )}

      {adjustments.length === 0 ? (
        <div className="text-center py-6 text-slate-500">
          <p className="text-sm">No adjustments</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead>Type</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                {!isLocked && <TableHead className="text-right">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {adjustments.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="text-sm">{adjustmentTypeLabels[item.adjustment_type]}</TableCell>
                  <TableCell className="text-sm">{item.description}</TableCell>
                  <TableCell className="text-sm text-slate-600">{item.adjustment_reason}</TableCell>
                  <TableCell className={`text-right font-semibold ${item.amount < 0 ? 'text-red-600' : 'text-slate-900'}`}>
                    ${item.amount?.toFixed(2)}
                  </TableCell>
                  {!isLocked && (
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(item)}
                          className="h-7 w-7 p-0"
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(item)}
                          className="h-7 w-7 p-0 text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <div className="flex justify-end pt-3 border-t border-slate-100">
        <div className="text-right">
          <p className="text-sm text-slate-600">Adjustments Total</p>
          <p className={`text-xl font-bold ${adjustmentsTotal < 0 ? 'text-red-600' : 'text-slate-900'}`}>
            ${adjustmentsTotal.toFixed(2)}
          </p>
        </div>
      </div>
    </div>
  );
}

const categoryLabels = {
  recycling: 'Recycling',
  shredding: 'Shredding',
  data_destruction: 'Data Destruction',
  beverage_destruction: 'Beverage Destruction',
  liquid_processing: 'Liquid Processing',
  packaging_destruction: 'Packaging Destruction',
  transportation: 'Transportation',
  certificate_affidavit: 'Certificate / Affidavit',
  storage: 'Storage',
  other: 'Other'
};

function AdjustmentForm({ item, invoiceId, onSave, onCancel }) {
  const [sourceType, setSourceType] = useState(item?.service_id ? 'service' : 'manual');
  const [selectedServiceId, setSelectedServiceId] = useState(item?.service_id || '');
  const [formData, setFormData] = useState({
    invoice_id: invoiceId,
    service_id: item?.service_id || '',
    adjustment_type: item?.adjustment_type || 'transportation',
    description: item?.description || '',
    amount: item?.amount || 0,
    adjustment_reason: item?.adjustment_reason || '',
    sort_order: item?.sort_order || 0
  });

  const { data: services = [] } = useQuery({
    queryKey: ['services'],
    queryFn: () => base44.entities.Service.filter({ service_status: 'active' })
  });

  const handleServiceSelect = (serviceId) => {
    setSelectedServiceId(serviceId);
    const service = services.find(s => s.id === serviceId);
    if (service) {
      setFormData(prev => ({
        ...prev,
        service_id: serviceId,
        adjustment_type: service.service_category,
        description: service.service_name,
        amount: service.default_rate || 0
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.adjustment_reason.trim()) {
      alert('Please provide a reason for this adjustment');
      return;
    }
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="border border-slate-200 rounded-lg p-4 space-y-4 bg-slate-50">
      <div className="space-y-2">
        <Label>Source</Label>
        <Select value={sourceType} onValueChange={(value) => {
          setSourceType(value);
          if (value === 'manual') {
            setFormData(prev => ({ ...prev, service_id: '' }));
            setSelectedServiceId('');
          }
        }}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="service">From Products & Services</SelectItem>
            <SelectItem value="manual">Manual Entry</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {sourceType === 'service' && (
        <div className="space-y-2">
          <Label>Select Product or Service</Label>
          <Select value={selectedServiceId} onValueChange={handleServiceSelect}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a service..." />
            </SelectTrigger>
            <SelectContent>
              {services.map(service => (
                <SelectItem key={service.id} value={service.id}>
                  {service.service_name} - {categoryLabels[service.service_category]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sourceType === 'manual' && (
          <div className="space-y-2">
            <Label>Type</Label>
            <Select value={formData.adjustment_type} onValueChange={(value) => setFormData({ ...formData, adjustment_type: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(adjustmentTypeLabels).map(([key, label]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="space-y-2">
          <Label>Amount</Label>
          <Input
            type="number"
            step="0.01"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
            placeholder="Use negative for credits"
            required
          />
          <p className="text-xs text-slate-500">Use negative values for discounts/credits</p>
        </div>

        <div className="md:col-span-2 space-y-2">
          <Label>Description</Label>
          <Input
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Brief description"
            required
          />
        </div>

        <div className="md:col-span-2 space-y-2">
          <Label>Reason <span className="text-red-500">*</span></Label>
          <Textarea
            value={formData.adjustment_reason}
            onChange={(e) => setFormData({ ...formData, adjustment_reason: e.target.value })}
            placeholder="Explain why this adjustment is being applied..."
            rows={2}
            className="resize-none"
            required
          />
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" className="bg-slate-900 hover:bg-slate-800">Save</Button>
      </div>
    </form>
  );
}