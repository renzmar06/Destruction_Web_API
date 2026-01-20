import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

export default function PriceRuleDialog({ open, onClose, onSave, rule, customers, services }) {
  const [formData, setFormData] = useState(rule || {
    rule_name: '',
    rule_status: 'active',
    applies_to_customers: 'all_customers',
    customer_type: '',
    selected_customer_ids: '',
    applies_to_services: 'all_products_services',
    service_category: '',
    selected_service_ids: '',
    adjustment_method: 'percentage',
    adjustment_direction: 'decrease',
    adjustment_value: 0,
    rounding_method: 'no_rounding',
    rounding_value: 0,
    start_date: '',
    end_date: ''
  });

  const [selectedCustomers, setSelectedCustomers] = useState(
    rule?.selected_customer_ids ? rule.selected_customer_ids.split(',') : []
  );
  const [selectedServices, setSelectedServices] = useState(
    rule?.selected_service_ids ? rule.selected_service_ids.split(',') : []
  );

  const handleSave = () => {
    const dataToSave = {
      ...formData,
      selected_customer_ids: selectedCustomers.join(','),
      selected_service_ids: selectedServices.join(',')
    };
    onSave(dataToSave);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{rule ? 'Edit Price Rule' : 'Create Price Rule'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Rule Name & Status */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Rule Name *</Label>
              <Input
                value={formData.rule_name}
                onChange={(e) => setFormData({...formData, rule_name: e.target.value})}
                placeholder="e.g., Distributor 10% Discount"
              />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={formData.rule_status} onValueChange={(v) => setFormData({...formData, rule_status: v})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Applies To Customers */}
          <div className="space-y-3 border-t pt-4">
            <Label className="text-sm font-semibold">Applies To Customers</Label>
            <Select value={formData.applies_to_customers} onValueChange={(v) => setFormData({...formData, applies_to_customers: v})}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all_customers">All Customers</SelectItem>
                <SelectItem value="customer_type">Customer Type</SelectItem>
                <SelectItem value="selected_customers">Selected Customers</SelectItem>
              </SelectContent>
            </Select>

            {formData.applies_to_customers === 'customer_type' && (
              <Input
                placeholder="e.g., Brand Owner, Distributor"
                value={formData.customer_type}
                onChange={(e) => setFormData({...formData, customer_type: e.target.value})}
              />
            )}

            {formData.applies_to_customers === 'selected_customers' && (
              <div className="border rounded-lg p-4 max-h-48 overflow-y-auto space-y-2">
                {customers?.map(customer => (
                  <div key={customer.id} className="flex items-center gap-2">
                    <Checkbox
                      checked={selectedCustomers.includes(customer.id)}
                      onCheckedChange={(checked) => {
                        setSelectedCustomers(checked 
                          ? [...selectedCustomers, customer.id]
                          : selectedCustomers.filter(id => id !== customer.id)
                        );
                      }}
                    />
                    <label className="text-sm">{customer.legal_company_name || customer.display_name}</label>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Applies To Services */}
          <div className="space-y-3 border-t pt-4">
            <Label className="text-sm font-semibold">Applies To Services</Label>
            <Select value={formData.applies_to_services} onValueChange={(v) => setFormData({...formData, applies_to_services: v})}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all_products_services">All Products & Services</SelectItem>
                <SelectItem value="all_services_only">All Services Only</SelectItem>
                <SelectItem value="service_category">Service Category</SelectItem>
                <SelectItem value="selected_services">Selected Services</SelectItem>
              </SelectContent>
            </Select>

            {formData.applies_to_services === 'service_category' && (
              <Input
                placeholder="e.g., Beverage Destruction"
                value={formData.service_category}
                onChange={(e) => setFormData({...formData, service_category: e.target.value})}
              />
            )}

            {formData.applies_to_services === 'selected_services' && (
              <div className="border rounded-lg p-4 max-h-48 overflow-y-auto space-y-2">
                {services?.map(service => (
                  <div key={service.id} className="flex items-center gap-2">
                    <Checkbox
                      checked={selectedServices.includes(service.id)}
                      onCheckedChange={(checked) => {
                        setSelectedServices(checked 
                          ? [...selectedServices, service.id]
                          : selectedServices.filter(id => id !== service.id)
                        );
                      }}
                    />
                    <label className="text-sm">{service.service_name}</label>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Adjustment */}
          <div className="space-y-3 border-t pt-4">
            <Label className="text-sm font-semibold">Adjustment</Label>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-xs">Method</Label>
                <Select value={formData.adjustment_method} onValueChange={(v) => setFormData({...formData, adjustment_method: v})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage</SelectItem>
                    <SelectItem value="fixed_amount">Fixed Amount</SelectItem>
                    <SelectItem value="custom_price">Custom Price</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.adjustment_method !== 'custom_price' && (
                <div className="space-y-2">
                  <Label className="text-xs">Direction</Label>
                  <Select value={formData.adjustment_direction} onValueChange={(v) => setFormData({...formData, adjustment_direction: v})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="increase">Increase</SelectItem>
                      <SelectItem value="decrease">Decrease</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <Label className="text-xs">
                  {formData.adjustment_method === 'percentage' ? 'Percentage (%)' :
                   formData.adjustment_method === 'fixed_amount' ? 'Amount ($)' : 
                   'Price ($)'}
                </Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.adjustment_value}
                  onChange={(e) => setFormData({...formData, adjustment_value: parseFloat(e.target.value) || 0})}
                />
              </div>
            </div>
          </div>

          {/* Rounding */}
          <div className="space-y-3 border-t pt-4">
            <Label className="text-sm font-semibold">Rounding</Label>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs">Method</Label>
                <Select value={formData.rounding_method} onValueChange={(v) => setFormData({...formData, rounding_method: v})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="no_rounding">No Rounding</SelectItem>
                    <SelectItem value="nearest_increment">Nearest Increment</SelectItem>
                    <SelectItem value="price_ending">Price Ending</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.rounding_method !== 'no_rounding' && (
                <div className="space-y-2">
                  <Label className="text-xs">
                    {formData.rounding_method === 'nearest_increment' ? 'Increment' : 'Ending'}
                  </Label>
                  <Select value={formData.rounding_value.toString()} onValueChange={(v) => setFormData({...formData, rounding_value: parseFloat(v)})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {formData.rounding_method === 'nearest_increment' ? (
                        <>
                          <SelectItem value="0.05">$0.05</SelectItem>
                          <SelectItem value="0.10">$0.10</SelectItem>
                          <SelectItem value="0.20">$0.20</SelectItem>
                          <SelectItem value="0.25">$0.25</SelectItem>
                          <SelectItem value="0.50">$0.50</SelectItem>
                          <SelectItem value="1.00">$1.00</SelectItem>
                        </>
                      ) : (
                        <>
                          <SelectItem value="0.49">$0.49</SelectItem>
                          <SelectItem value="0.79">$0.79</SelectItem>
                          <SelectItem value="0.88">$0.88</SelectItem>
                          <SelectItem value="0.89">$0.89</SelectItem>
                          <SelectItem value="0.98">$0.98</SelectItem>
                          <SelectItem value="0.99">$0.99</SelectItem>
                        </>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </div>

          {/* Validity Period */}
          <div className="space-y-3 border-t pt-4">
            <Label className="text-sm font-semibold">Validity Period (Optional)</Label>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs">Start Date</Label>
                <Input
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">End Date</Label>
                <Input
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({...formData, end_date: e.target.value})}
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 border-t pt-4">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700">
              {rule ? 'Update Rule' : 'Create Rule'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}