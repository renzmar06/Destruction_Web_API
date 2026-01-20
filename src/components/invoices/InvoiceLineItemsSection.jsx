import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Edit, Trash2, Plus, List, Filter } from "lucide-react";
import { applyPriceRulesToService } from "../estimates/PriceRuleApplier";

const pricingUnitLabels = {
  per_case: 'Per Case',
  per_lb: 'Per LB',
  per_pallet: 'Per Pallet',
  per_load: 'Per Load',
  by_packaging_type: 'By Packaging Type',
  flat_fee: 'Flat Fee'
};

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

export default function InvoiceLineItemsSection({ invoiceId, invoiceStatus, onTotalChange, customerId }) {
  const [editingItem, setEditingItem] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('all');

  const queryClient = useQueryClient();

  const { data: lineItems = [] } = useQuery({
    queryKey: ['invoiceLineItems', invoiceId],
    queryFn: () => invoiceId ? base44.entities.InvoiceLineItem.filter({ invoice_id: invoiceId }, 'sort_order') : [],
    enabled: !!invoiceId
  });

  const { data: estimateLineItems = [] } = useQuery({
    queryKey: ['estimateLineItemsForInvoice', invoiceId],
    queryFn: async () => {
      if (!invoiceId) return [];
      const invoice = await base44.entities.Invoice.filter({ id: invoiceId });
      if (!invoice[0]?.estimate_id) return [];
      return base44.entities.EstimateLineItem.filter({ estimate_id: invoice[0].estimate_id });
    },
    enabled: !!invoiceId
  });

  const { data: services = [] } = useQuery({
    queryKey: ['services'],
    queryFn: () => base44.entities.Service.filter({ service_status: 'active' })
  });

  const getServiceForLineItem = (lineItem) => {
    const estimateItem = estimateLineItems.find(ei => ei.description === lineItem.description);
    return services.find(s => s.id === estimateItem?.service_id);
  };

  const filteredLineItems = lineItems.filter(item => {
    if (categoryFilter === 'all') return true;
    const service = getServiceForLineItem(item);
    return service?.service_category === categoryFilter;
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.InvoiceLineItem.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoiceLineItems', invoiceId] });
      setShowForm(false);
      setEditingItem(null);
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.InvoiceLineItem.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoiceLineItems', invoiceId] });
      setShowForm(false);
      setEditingItem(null);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.InvoiceLineItem.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoiceLineItems', invoiceId] });
    }
  });

  const lineItemsTotal = lineItems.reduce((sum, item) => sum + (item.line_total || 0), 0);

  React.useEffect(() => {
    onTotalChange(lineItemsTotal);
  }, [lineItemsTotal, onTotalChange]);

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
    if (confirm('Delete this line item?')) {
      deleteMutation.mutate(item.id);
    }
  };

  const handleAddNew = () => {
    setEditingItem(null);
    setShowForm(true);
  };

  const isLocked = invoiceStatus === 'finalized' || invoiceStatus === 'paid';
  const isPricingLocked = invoiceStatus !== 'draft';

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        {!isLocked && !showForm && (
          <>
            <Button onClick={handleAddNew} variant="outline" size="sm" className="gap-2">
              <Plus className="w-4 h-4" />
              Add product or service
            </Button>
            <Button variant="outline" size="sm" className="text-slate-600">
              Clear all lines
            </Button>
          </>
        )}
      </div>

      {isPricingLocked && !isLocked && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
          <strong>Pricing Locked:</strong> Unit prices cannot be changed. Only quantities can be adjusted.
        </div>
      )}

      {showForm && (
        <LineItemForm
          item={editingItem}
          invoiceId={invoiceId}
          onSave={handleSave}
          onCancel={() => {
            setShowForm(false);
            setEditingItem(null);
          }}
          isPricingLocked={isPricingLocked}
          customerId={customerId}
        />
      )}

      <div className="overflow-x-auto border border-slate-200 rounded">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50">
              <TableHead className="w-12">#</TableHead>
              <TableHead>Service Date</TableHead>
              <TableHead>Product/service</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Qty</TableHead>
              <TableHead className="text-right">Rate</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="w-12">Tax</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {lineItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-slate-500">
                  <p>No line items yet</p>
                </TableCell>
              </TableRow>
            ) : (
              filteredLineItems.map((item, index) => (
                <TableRow key={item.id}>
                  <TableCell className="text-center">{index + 1}</TableCell>
                  <TableCell>
                    <Input type="date" className="h-8 text-sm" />
                  </TableCell>
                  <TableCell className="text-sm">{item.description}</TableCell>
                  <TableCell className="text-sm text-slate-600">{item.description}</TableCell>
                  <TableCell className="text-right text-sm">{item.actual_quantity}</TableCell>
                  <TableCell className="text-right text-sm">${item.unit_price?.toFixed(2)}</TableCell>
                  <TableCell className="text-right font-semibold">${item.line_total?.toFixed(2)}</TableCell>
                  <TableCell className="text-center">
                    <input type="checkbox" className="w-4 h-4" />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function LineItemForm({ item, invoiceId, onSave, onCancel, isPricingLocked, customerId }) {
  const [selectedServiceId, setSelectedServiceId] = useState(item?.service_id || '');
  const [applyingPriceRules, setApplyingPriceRules] = useState(false);
  const [formData, setFormData] = useState({
    invoice_id: invoiceId,
    service_id: item?.service_id || '',
    pricing_unit: item?.pricing_unit || 'per_case',
    description: item?.description || '',
    actual_quantity: item?.actual_quantity || 0,
    unit_price: item?.unit_price || 0,
    line_total: item?.line_total || 0,
    packaging_type: item?.packaging_type || '',
    variance_reason: item?.variance_reason || '',
    sort_order: item?.sort_order || 0
  });

  const { data: services = [] } = useQuery({
    queryKey: ['services'],
    queryFn: () => base44.entities.Service.filter({ service_status: 'active' })
  });

  React.useEffect(() => {
    const total = formData.actual_quantity * formData.unit_price;
    setFormData(prev => ({ ...prev, line_total: total }));
  }, [formData.actual_quantity, formData.unit_price]);

  const handleServiceSelect = async (serviceId) => {
    setSelectedServiceId(serviceId);
    const service = services.find(s => s.id === serviceId);
    if (!service) return;
    
    setApplyingPriceRules(true);
    
    // Apply price rules if customer exists
    let finalPrice = service.default_rate || 0;
    if (customerId && !isPricingLocked) {
      finalPrice = await applyPriceRulesToService(serviceId, customerId, finalPrice);
    }
    
    setFormData(prev => ({
      ...prev,
      service_id: serviceId,
      pricing_unit: service.pricing_unit,
      description: service.service_name,
      unit_price: finalPrice,
      packaging_type: service.packaging_type || ''
    }));
    
    setApplyingPriceRules(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="border border-slate-200 rounded-lg p-4 space-y-4 bg-slate-50">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2 space-y-2">
          <Label>Product or Service</Label>
          <Select value={selectedServiceId} onValueChange={handleServiceSelect}>
            <SelectTrigger>
              <SelectValue placeholder="Select a service..." />
            </SelectTrigger>
            <SelectContent>
              {services.map(service => (
                <SelectItem key={service.id} value={service.id}>
                  {service.service_name} - {categoryLabels[service.service_category]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {applyingPriceRules && (
            <p className="text-xs text-purple-600 font-medium mt-1">🔄 Applying price rules...</p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Pricing Unit</Label>
          <Input
            value={pricingUnitLabels[formData.pricing_unit]}
            disabled
            className="bg-white"
          />
        </div>

        <div className="space-y-2">
          <Label>Actual Quantity</Label>
          <Input
            type="number"
            step="0.01"
            value={formData.actual_quantity}
            onChange={(e) => setFormData({ ...formData, actual_quantity: parseFloat(e.target.value) || 0 })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label>Unit Price</Label>
          <Input
            type="number"
            step="0.01"
            value={formData.unit_price}
            onChange={(e) => setFormData({ ...formData, unit_price: parseFloat(e.target.value) || 0 })}
            disabled={isPricingLocked}
            className={isPricingLocked ? 'bg-slate-100' : ''}
            required
          />
          {isPricingLocked && <p className="text-xs text-slate-500">Locked after Draft status</p>}
        </div>

        <div className="space-y-2">
          <Label>Line Total</Label>
          <Input
            value={`$${formData.line_total.toFixed(2)}`}
            disabled
            className="bg-white font-semibold"
          />
        </div>

        <div className="md:col-span-2 space-y-2">
          <Label>Description</Label>
          <Input
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Line item description"
            required
          />
        </div>

        {item && (
          <div className="md:col-span-2 space-y-2">
            <Label>Variance Reason (if quantity changed)</Label>
            <Textarea
              value={formData.variance_reason}
              onChange={(e) => setFormData({ ...formData, variance_reason: e.target.value })}
              placeholder="Explain why quantity differs from estimate..."
              rows={2}
              className="resize-none"
            />
          </div>
        )}
      </div>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" className="bg-slate-900 hover:bg-slate-800">Save</Button>
      </div>
    </form>
  );
}