import React, { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Package, Filter, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "../../utils";
import { applyPriceRulesToService } from "./PriceRuleApplier";

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

const packagingTypeLabels = {
  aluminum_cans: 'Aluminum Cans',
  plastic_bottles: 'Plastic Bottles',
  glass_bottles: 'Glass Bottles',
  mixed_packaging: 'Mixed Packaging',
  other: 'Other'
};

export default function LineItemsSection({ estimateId, onTotalChange, isReadOnly, estimateStatus, unsavedLineItems = [], onUnsavedLineItemsChange, customerId }) {
  const [editingItem, setEditingItem] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const queryClient = useQueryClient();

  const { data: savedLineItems = [], isLoading } = useQuery({
    queryKey: ['estimateLineItems', estimateId],
    queryFn: () => estimateId ? base44.entities.EstimateLineItem.filter({ estimate_id: estimateId }, 'sort_order') : [],
    enabled: !!estimateId
  });

  const lineItems = estimateId ? savedLineItems : unsavedLineItems;

  const { data: services = [] } = useQuery({
    queryKey: ['services'],
    queryFn: () => base44.entities.Service.filter({ service_status: 'active' })
  });

  const filteredLineItems = lineItems.filter(item => {
    if (categoryFilter === 'all') return true;
    const service = services.find(s => s.id === item.service_id);
    return service?.service_category === categoryFilter;
  });

  useEffect(() => {
    const total = lineItems.reduce((sum, item) => sum + (item.line_total || 0), 0);
    onTotalChange(total);
  }, [lineItems, onTotalChange]);

  const createMutation = useMutation({
    mutationFn: (data) => {
      if (estimateId) {
        return base44.entities.EstimateLineItem.create({ ...data, estimate_id: estimateId });
      }
      return Promise.resolve(data);
    },
    onSuccess: (data) => {
      if (estimateId) {
        queryClient.invalidateQueries({ queryKey: ['estimateLineItems', estimateId] });
      } else {
        // Add to unsaved items
        onUnsavedLineItemsChange([...unsavedLineItems, { ...data, id: Date.now().toString() }]);
      }
      setShowForm(false);
      setEditingItem(null);
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => {
      if (estimateId) {
        return base44.entities.EstimateLineItem.update(id, data);
      }
      return Promise.resolve(data);
    },
    onSuccess: (data, variables) => {
      if (estimateId) {
        queryClient.invalidateQueries({ queryKey: ['estimateLineItems', estimateId] });
      } else {
        // Update unsaved item
        const updated = unsavedLineItems.map(item => 
          item.id === variables.id ? { ...item, ...variables.data } : item
        );
        onUnsavedLineItemsChange(updated);
      }
      setShowForm(false);
      setEditingItem(null);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => {
      if (estimateId) {
        return base44.entities.EstimateLineItem.delete(id);
      }
      return Promise.resolve(id);
    },
    onSuccess: (_, id) => {
      if (estimateId) {
        queryClient.invalidateQueries({ queryKey: ['estimateLineItems', estimateId] });
      } else {
        // Remove from unsaved items
        onUnsavedLineItemsChange(unsavedLineItems.filter(item => item.id !== id));
      }
    }
  });

  const handleSave = (itemData) => {
    const lineTotal = (itemData.quantity || 0) * (itemData.unit_price || 0);
    const dataWithTotal = { ...itemData, line_total: lineTotal };
    
    if (editingItem?.id) {
      updateMutation.mutate({ id: editingItem.id, data: dataWithTotal });
    } else {
      createMutation.mutate({ ...dataWithTotal, sort_order: lineItems.length });
    }
  };

  const handleAdd = () => {
    setEditingItem({
      pricing_unit: 'per_case',
      description: '',
      quantity: 1,
      unit_price: 0,
      packaging_type: ''
    });
    setShowForm(true);
  };



  return (
    <div className="bg-gradient-to-br from-white to-blue-50/30 rounded-2xl border-2 border-blue-200 p-8 space-y-6 shadow-xl shadow-blue-100/50">
      <div className="pb-5 border-b-2 border-blue-200 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg shadow-blue-200">
              <Package className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">Destruction Services & Pricing</h3>
              <p className="text-base text-slate-600 mt-1">Select services from your catalog and set quantities</p>
            </div>
          </div>
          {!isReadOnly && (
            <Button onClick={handleAdd} className="h-11 px-6 gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-200 font-semibold">
              <Plus className="w-5 h-5" />
              Add Destruction Service
            </Button>
          )}
          </div>
        {lineItems.length > 0 && (
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-500" />
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-52 h-9">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {Object.entries(categoryLabels).map(([key, label]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {showForm && editingItem && (
        <LineItemForm
          item={editingItem}
          services={services}
          onSave={handleSave}
          onCancel={() => {
            setShowForm(false);
            setEditingItem(null);
          }}
          isSaving={createMutation.isPending || updateMutation.isPending}
          estimateStatus={estimateStatus || 'draft'}
          customerId={customerId}
        />
      )}

      <div className="space-y-2">
        {isLoading ? (
          <div className="text-sm text-slate-500">Loading line items...</div>
        ) : lineItems.length === 0 ? (
          <p className="text-sm text-slate-500">No line items added yet.</p>
        ) : (
          <div className="border-2 border-blue-200 rounded-xl overflow-hidden shadow-md">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-blue-100 to-blue-50 border-b-2 border-blue-300">
                <tr>
                  <th className="text-left p-4 font-bold text-slate-900 text-sm">Service</th>
                  <th className="text-left p-4 font-bold text-slate-900 text-sm">Category</th>
                  <th className="text-left p-4 font-bold text-slate-900 text-sm">Unit Type</th>
                  <th className="text-right p-4 font-bold text-slate-900 text-sm">Quantity</th>
                  <th className="text-right p-4 font-bold text-slate-900 text-sm">Rate</th>
                  <th className="text-right p-4 font-bold text-slate-900 text-sm">Line Total</th>
                  {!isReadOnly && <th className="w-24"></th>}
                </tr>
              </thead>
              <tbody>
                {filteredLineItems.map((item) => {
                  const service = services.find(s => s.id === item.service_id);
                  return (
                  <tr key={item.id} className="border-b border-blue-100 hover:bg-blue-50/50 transition-colors">
                    <td className="p-4">
                      <div className="font-semibold text-slate-900">{item.service_name || item.description}</div>
                      {item.description && item.service_name !== item.description && (
                        <div className="text-xs text-slate-600 mt-0.5">{item.description}</div>
                      )}
                      {item.packaging_type && (
                        <div className="text-xs text-slate-500 mt-0.5">
                          {packagingTypeLabels[item.packaging_type]}
                        </div>
                      )}
                    </td>
                    <td className="p-4">
                      {service?.service_category && (
                        <Badge variant="outline" className="text-xs font-medium border-blue-300 text-blue-700">
                          {categoryLabels[service.service_category]}
                        </Badge>
                      )}
                    </td>
                    <td className="p-4 text-slate-700 font-medium">{pricingUnitLabels[item.pricing_unit]}</td>
                    <td className="p-4 text-right text-slate-700 font-semibold">{item.quantity}</td>
                    <td className="p-4 text-right text-slate-700 font-semibold">${item.unit_price?.toFixed(2)}</td>
                    <td className="p-4 text-right font-bold text-blue-700 text-base">${item.line_total?.toFixed(2)}</td>
                    {!isReadOnly && (
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEditingItem(item);
                              setShowForm(true);
                            }}
                            className="h-9 px-4 font-medium hover:bg-blue-50 border-blue-200"
                          >
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteMutation.mutate(item.id)}
                            className="h-9 px-3 text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                      )}
                      </tr>
                      );
                      })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function LineItemForm({ item, services, onSave, onCancel, isSaving, estimateStatus, customerId }) {
  const [formData, setFormData] = useState(item);
  const [applyingPriceRules, setApplyingPriceRules] = useState(false);
  const isRateLocked = estimateStatus === 'sent' || estimateStatus === 'accepted';

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleServiceSelect = async (serviceId) => {
    const service = services.find(s => s.id === serviceId);
    if (!service) return;
    
    setApplyingPriceRules(true);
    
    // Apply price rules if customer exists
    let finalPrice = service.default_rate;
    if (customerId) {
      finalPrice = await applyPriceRulesToService(serviceId, customerId, service.default_rate);
    }
    
    setFormData({
      ...formData,
      service_id: serviceId,
      service_name: service.service_name,
      pricing_unit: service.pricing_unit,
      description: service.description || service.service_name,
      unit_price: finalPrice,
      packaging_type: service.packaging_type || '',
      is_taxable: service.is_taxable !== undefined ? service.is_taxable : true
    });
    
    setApplyingPriceRules(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const showPackagingType = formData.pricing_unit === 'by_packaging_type';

  return (
    <form onSubmit={handleSubmit} className="p-6 border-2 border-blue-300 bg-gradient-to-br from-blue-50 to-white rounded-xl space-y-6 shadow-lg">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2 space-y-2">
          <Label htmlFor="service_id">Select Service from Catalog *</Label>
          <Select value={formData.service_id || ''} onValueChange={handleServiceSelect} required>
            <SelectTrigger className="border-2 border-blue-300">
              <SelectValue placeholder="Choose from Products & Services catalog" />
            </SelectTrigger>
            <SelectContent>
              {services.length === 0 ? (
                <div className="p-3 text-sm text-slate-500">No services available. Add services in Products & Services first.</div>
              ) : (
                services.map(service => (
                  <SelectItem key={service.id} value={service.id}>
                    <div className="flex items-center justify-between gap-4 w-full">
                      <span className="font-medium">{service.service_name}</span>
                      <span className="text-slate-500">
                        {pricingUnitLabels[service.pricing_unit]} - ${service.default_rate?.toFixed(2)}
                      </span>
                    </div>
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
          <p className="text-xs text-blue-600 font-medium">⚡ Rate and unit type will auto-fill from the selected service</p>
          {applyingPriceRules && (
            <p className="text-xs text-purple-600 font-medium">🔄 Applying price rules...</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="pricing_unit">Pricing Unit *</Label>
          <Select value={formData.pricing_unit || ''} onValueChange={(value) => handleChange('pricing_unit', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select unit" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="per_case">Per Case</SelectItem>
              <SelectItem value="per_lb">Per LB</SelectItem>
              <SelectItem value="per_pallet">Per Pallet</SelectItem>
              <SelectItem value="per_load">Per Load</SelectItem>
              <SelectItem value="by_packaging_type">By Packaging Type</SelectItem>
              <SelectItem value="flat_fee">Flat Fee</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {showPackagingType && (
          <div className="space-y-2">
            <Label htmlFor="packaging_type">Packaging Type</Label>
            <Select value={formData.packaging_type || ''} onValueChange={(value) => handleChange('packaging_type', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="aluminum_cans">Aluminum Cans</SelectItem>
                <SelectItem value="plastic_bottles">Plastic Bottles</SelectItem>
                <SelectItem value="glass_bottles">Glass Bottles</SelectItem>
                <SelectItem value="mixed_packaging">Mixed Packaging</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        <div className={showPackagingType ? 'md:col-span-2' : 'md:col-span-1'}>
          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Input
              id="description"
              value={formData.description || ''}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Item description"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="quantity">Quantity *</Label>
          <Input
            id="quantity"
            type="number"
            min="0"
            step="0.01"
            value={formData.quantity || ''}
            onChange={(e) => handleChange('quantity', parseFloat(e.target.value))}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="unit_price">Unit Price *</Label>
          <Input
            id="unit_price"
            type="number"
            min="0"
            step="0.01"
            value={formData.unit_price || ''}
            onChange={(e) => handleChange('unit_price', parseFloat(e.target.value))}
            disabled={isRateLocked}
            className={isRateLocked ? 'bg-slate-50' : ''}
            required
          />
          {isRateLocked && (
            <p className="text-xs text-amber-600">Rate locked - estimate has been sent</p>
          )}
        </div>

        <div className="md:col-span-2 flex items-center justify-between p-3 bg-slate-100 rounded-lg">
          <span className="font-medium text-slate-700">Line Total:</span>
          <span className="text-xl font-bold text-slate-900">
            ${((formData.quantity || 0) * (formData.unit_price || 0)).toFixed(2)}
          </span>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onCancel} className="h-11 px-6 border-2">
          Cancel
        </Button>
        <Button type="submit" disabled={isSaving} className="h-11 px-8 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-200 font-semibold">
          {isSaving ? 'Saving...' : 'Save Line Item'}
        </Button>
      </div>
    </form>
  );
}