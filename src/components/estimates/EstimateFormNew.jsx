import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { GripVertical, Trash2, Plus, Upload } from "lucide-react";
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

export default function EstimateFormNew({ 
  estimate, 
  formData, 
  onChange, 
  onSave,
  customers 
}) {
  const [items, setItems] = useState([]);
  const [discountType, setDiscountType] = useState('percent');
  const [discountValue, setDiscountValue] = useState(0);
  const [showCcBcc, setShowCcBcc] = useState(false);
  const [showShipping, setShowShipping] = useState(true);
  const [showAttachments, setShowAttachments] = useState(false);
  const [showTagsManager, setShowTagsManager] = useState(false);
  const [showEditTotals, setShowEditTotals] = useState(false);
  const [showTaxMath, setShowTaxMath] = useState(false);
  const [showPaymentEdit, setShowPaymentEdit] = useState(false);
  const queryClient = useQueryClient();

  const { data: services = [] } = useQuery({
    queryKey: ['services'],
    queryFn: () => base44.entities.Service.filter({ service_status: 'active' })
  });

  const { data: savedItems = [] } = useQuery({
    queryKey: ['estimateItems', estimate?.id],
    queryFn: () => estimate?.id ? base44.entities.EstimateItem.filter({ estimate_id: estimate.id }, 'sort_order') : [],
    enabled: !!estimate?.id
  });

  React.useEffect(() => {
    if (savedItems.length > 0) {
      setItems(savedItems);
    }
  }, [savedItems]);

  const itemsMutation = useMutation({
    mutationFn: async (itemsData) => {
      if (!estimate?.id) return;
      
      // Delete existing items
      for (const item of savedItems) {
        await base44.entities.EstimateItem.delete(item.id);
      }
      
      // Create new items
      for (const item of itemsData) {
        await base44.entities.EstimateItem.create({
          ...item,
          estimate_id: estimate.id
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['estimateItems', estimate?.id] });
    }
  });

  const handleCustomerChange = (customerId) => {
    const customer = customers.find(c => c.id === customerId);
    if (customer) {
      const billTo = `${customer.billing_street_1 || ''}\n${customer.billing_street_2 || ''}\n${customer.billing_city || ''}, ${customer.billing_state || ''} ${customer.billing_zip || ''}`.trim();
      const shipTo = customer.shipping_same_as_billing ? billTo : 
        `${customer.shipping_street_1 || ''}\n${customer.shipping_street_2 || ''}\n${customer.shipping_city || ''}, ${customer.shipping_state || ''} ${customer.shipping_zip || ''}`.trim();
      
      onChange({
        ...formData,
        customer_id: customerId,
        customer_name: customer.legal_company_name || customer.display_name,
        customer_email: customer.email || '',
        bill_to_address: billTo,
        ship_to_address: shipTo
      });
    }
  };

  const handleAddItem = () => {
    setItems([...items, {
      service_id: '',
      item_type: 'service',
      service_date: '',
      description: '',
      quantity: 1,
      unit_price: 0,
      line_total: 0,
      is_taxable: true,
      sort_order: items.length
    }]);
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    
    if (field === 'quantity' || field === 'unit_price') {
      newItems[index].line_total = (newItems[index].quantity || 0) * (newItems[index].unit_price || 0);
    }
    
    if (field === 'service_id') {
      const service = services.find(s => s.id === value);
      if (service) {
        newItems[index].description = service.service_name;
        newItems[index].unit_price = service.default_rate || 0;
        newItems[index].pricing_unit = service.pricing_unit;
        newItems[index].line_total = newItems[index].quantity * (service.default_rate || 0);
      }
    }
    
    setItems(newItems);
    calculateTotals(newItems, formData);
  };

  const handleRemoveItem = (index) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
    calculateTotals(newItems, formData);
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const newItems = Array.from(items);
    const [reorderedItem] = newItems.splice(result.source.index, 1);
    newItems.splice(result.destination.index, 0, reorderedItem);

    // Update sort_order for all items
    const updatedItems = newItems.map((item, index) => ({
      ...item,
      sort_order: index
    }));

    setItems(updatedItems);
  };

  const calculateTotals = (currentItems, currentFormData) => {
    const dataToUse = currentFormData || formData;
    const subtotal = currentItems.reduce((sum, item) => sum + (item.line_total || 0), 0);
    const discountAmount = discountType === 'percent' 
      ? (subtotal * discountValue / 100)
      : discountValue;
    const taxableSubtotal = subtotal - discountAmount;
    const taxAmount = taxableSubtotal * ((dataToUse.tax_rate || 0) / 100);
    const total = taxableSubtotal + taxAmount + (parseFloat(dataToUse.shipping_amount) || 0);
    
    onChange({
      ...dataToUse,
      subtotal,
      discount_amount: discountAmount,
      discount_percent: discountType === 'percent' ? discountValue : 0,
      taxable_subtotal: taxableSubtotal,
      tax_amount: taxAmount,
      total_amount: total
    });
  };

  const handleSaveEstimate = async () => {
    await onSave();
    if (estimate?.id) {
      await itemsMutation.mutateAsync(items);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen pb-32">
      {/* Sticky Record Header */}
      <div className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-sm">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div>
                <div className="text-xs uppercase text-slate-500 font-medium mb-1">Estimate</div>
                <div className="text-xl font-bold text-slate-900">
                  {formData.estimate_number || 'New Estimate'}
                </div>
              </div>
              {formData.estimate_status && (
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                  formData.estimate_status === 'draft' ? 'bg-slate-100 text-slate-700' :
                  formData.estimate_status === 'sent' ? 'bg-blue-100 text-blue-700' :
                  formData.estimate_status === 'accepted' ? 'bg-green-100 text-green-700' :
                  'bg-slate-100 text-slate-700'
                }`}>
                  {formData.estimate_status === 'draft' ? 'Draft' :
                   formData.estimate_status === 'sent' ? 'Sent' :
                   formData.estimate_status === 'accepted' ? 'Accepted' :
                   formData.estimate_status}
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
              <div className="text-xs text-slate-500 mb-1">Total Amount</div>
              <div className="text-2xl font-bold text-slate-900">${formData.total_amount?.toFixed(2) || '0.00'}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
        
        {/* Customer & Basic Info Card */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
          <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wide mb-4">Customer Information</h3>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <Label className="text-xs font-medium text-slate-600 mb-2 block">Customer</Label>
            <Select value={formData.customer_id} onValueChange={handleCustomerChange}>
              <SelectTrigger className="h-10">
                <SelectValue placeholder="Select customer" />
              </SelectTrigger>
              <SelectContent>
                {customers.map(customer => (
                  <SelectItem key={customer.id} value={customer.id}>
                    {customer.legal_company_name || customer.display_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs font-medium text-slate-600 mb-2 block">Email</Label>
            <Input 
              placeholder="customer@example.com" 
              value={formData.customer_email || ''}
              onChange={(e) => onChange({...formData, customer_email: e.target.value})}
              className="h-10"
            />
          </div>
        </div>

        <button 
          type="button"
          onClick={() => setShowCcBcc(!showCcBcc)}
          className="text-xs text-blue-600 hover:underline mt-2"
        >
          {showCcBcc ? 'Hide Cc/Bcc' : '+ Add Cc/Bcc'}
        </button>
        {showCcBcc && (
          <div className="grid grid-cols-2 gap-4 mt-3">
            <div>
              <Label className="text-xs font-medium text-slate-600 mb-2 block">Cc</Label>
              <Input 
                placeholder="Cc email" 
                value={formData.cc_emails || ''}
                onChange={(e) => onChange({...formData, cc_emails: e.target.value})}
                className="h-10"
              />
            </div>
            <div>
              <Label className="text-xs font-medium text-slate-600 mb-2 block">Bcc</Label>
              <Input 
                placeholder="Bcc email" 
                value={formData.bcc_emails || ''}
                onChange={(e) => onChange({...formData, bcc_emails: e.target.value})}
                className="h-10"
              />
            </div>
          </div>
        )}

        {/* Addresses */}
        <div className={`grid ${showShipping ? 'grid-cols-3' : 'grid-cols-2'} gap-4 mt-6`}>
          <div>
            <Label className="text-xs font-medium text-slate-600 mb-2 block">Bill to</Label>
            <Textarea 
              rows={4} 
              value={formData.bill_to_address || ''}
              onChange={(e) => onChange({...formData, bill_to_address: e.target.value})}
              className="text-sm"
            />
          </div>
          {showShipping && (
            <>
              <div>
                <Label className="text-xs font-medium text-slate-600 mb-2 block">Ship to</Label>
                <Textarea 
                  rows={4}
                  value={formData.ship_to_address || ''}
                  onChange={(e) => onChange({...formData, ship_to_address: e.target.value})}
                  className="text-sm"
                />
                <button 
                  type="button"
                  onClick={() => setShowShipping(false)}
                  className="text-xs text-blue-600 hover:underline mt-1"
                >
                  Remove shipping info
                </button>
              </div>
              <div>
                <Label className="text-xs font-medium text-slate-600 mb-2 block">Ship from (hidden)</Label>
                <Textarea 
                  rows={4}
                  value={formData.ship_from_address || ''}
                  onChange={(e) => onChange({...formData, ship_from_address: e.target.value})}
                  className="text-sm bg-slate-50"
                />
              </div>
            </>
          )}
          {!showShipping && (
            <div className="flex items-center">
              <button 
                type="button"
                onClick={() => setShowShipping(true)}
                className="text-xs text-blue-600 hover:underline"
              >
                + Add shipping info
              </button>
            </div>
          )}
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-x-12 gap-y-3 mt-6">
          <div className="flex items-center gap-3">
            <Label className="text-xs font-medium text-slate-600 w-32">Ship via</Label>
            <Input 
              value={formData.ship_via || ''}
              onChange={(e) => onChange({...formData, ship_via: e.target.value})}
              className="flex-1 h-10"
            />
            </div>
            <div className="flex items-center gap-3">
            <Label className="text-xs font-medium text-slate-600 w-32">Estimate no.</Label>
            <Input value={formData.estimate_number || 'Auto'} disabled className="flex-1 h-10 bg-slate-50" />
            </div>

            <div className="flex items-center gap-3">
            <Label className="text-xs font-medium text-slate-600 w-32">Shipping date</Label>
            <Input 
              type="date"
              value={formData.shipping_date || ''}
              onChange={(e) => onChange({...formData, shipping_date: e.target.value})}
              className="flex-1 h-10"
            />
            </div>
            <div className="flex items-center gap-3">
            <Label className="text-xs font-medium text-slate-600 w-32">Estimate date</Label>
            <Input 
              type="date" 
              value={formData.estimate_date}
              onChange={(e) => onChange({...formData, estimate_date: e.target.value})}
              className="flex-1 h-10"
            />
            </div>

            <div className="flex items-center gap-3">
            <Label className="text-xs font-medium text-slate-600 w-32">Tracking no.</Label>
            <Input 
              value={formData.tracking_number || ''}
              onChange={(e) => onChange({...formData, tracking_number: e.target.value})}
              className="flex-1 h-10"
            />
            </div>
            <div className="flex items-center gap-3">
            <Label className="text-xs font-medium text-slate-600 w-32">Expiration date</Label>
            <Input 
              type="date"
              value={formData.valid_until_date}
              onChange={(e) => onChange({...formData, valid_until_date: e.target.value})}
              className="flex-1 h-10"
            />
            </div>

            <div />
            <div className="flex items-center gap-3">
            <Label className="text-xs font-medium text-slate-600 w-32">Accepted by</Label>
            <Input 
              value={formData.accepted_by || ''}
              onChange={(e) => onChange({...formData, accepted_by: e.target.value})}
              className="flex-1 h-10"
            />
            </div>

            <div />
            <div className="flex items-center gap-3">
            <Label className="text-xs font-medium text-slate-600 w-32">Accepted date</Label>
            <Input 
              type="date"
              value={formData.accepted_date || ''}
              onChange={(e) => onChange({...formData, accepted_date: e.target.value})}
              className="flex-1 h-10"
            />
            </div>
            </div>
            </div>

            {/* PRIMARY WORKSPACE - Destruction Services & Pricing */}
        {/* PRIMARY WORKSPACE - Destruction Services & Pricing */}
        <div className="bg-white rounded-lg border-2 border-blue-100 shadow-md">
          <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-blue-50 to-white">
            <h3 className="text-base font-bold text-slate-900 uppercase tracking-wide">Destruction Services & Pricing</h3>
            <p className="text-xs text-slate-500 mt-1">Define billable destruction services — totals update automatically</p>
          </div>
          <div className="p-6">
            <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">#</TableHead>
              <TableHead>Service Date</TableHead>
              <TableHead>Product/service</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Qty</TableHead>
              <TableHead className="text-right">Rate</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="w-16 text-center">Tax</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="items">
              {(provided) => (
                <TableBody {...provided.droppableProps} ref={provided.innerRef}>
                  {items.map((item, index) => (
                    <Draggable key={index} draggableId={`item-${index}`} index={index}>
                      {(provided, snapshot) => (
                        <TableRow
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={snapshot.isDragging ? 'bg-slate-50' : ''}
                        >
                          <TableCell {...provided.dragHandleProps}>
                            <GripVertical className="w-4 h-4 text-slate-400 cursor-move" />
                          </TableCell>
                          <TableCell>
                            <Input 
                              type="date"
                              value={item.service_date || ''}
                              onChange={(e) => handleItemChange(index, 'service_date', e.target.value)}
                              className="h-9 text-sm w-32"
                            />
                          </TableCell>
                          <TableCell>
                            <Select 
                              value={item.service_id}
                              onValueChange={(value) => handleItemChange(index, 'service_id', value)}
                            >
                              <SelectTrigger className="h-9 text-sm">
                                <SelectValue placeholder="Select" />
                              </SelectTrigger>
                              <SelectContent>
                                {services.map(service => (
                                  <SelectItem key={service.id} value={service.id}>
                                    {service.service_name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <Input 
                              value={item.description}
                              onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                              className="h-9 text-sm"
                            />
                          </TableCell>
                          <TableCell>
                            <Input 
                              type="number"
                              step="0.01"
                              value={item.quantity}
                              onChange={(e) => handleItemChange(index, 'quantity', parseFloat(e.target.value) || 0)}
                              className="h-9 text-sm text-right w-20"
                            />
                          </TableCell>
                          <TableCell>
                            <Input 
                              type="number"
                              step="0.01"
                              value={item.unit_price}
                              onChange={(e) => handleItemChange(index, 'unit_price', parseFloat(e.target.value) || 0)}
                              className="h-9 text-sm text-right w-24"
                            />
                          </TableCell>
                          <TableCell className="text-right font-semibold">
                            ${item.line_total?.toFixed(2) || '0.00'}
                          </TableCell>
                          <TableCell className="text-center">
                            <Checkbox 
                              checked={item.is_taxable}
                              onCheckedChange={(checked) => handleItemChange(index, 'is_taxable', checked)}
                            />
                          </TableCell>
                          <TableCell>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => handleRemoveItem(index)}
                              className="h-8 w-8"
                            >
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </TableBody>
              )}
            </Droppable>
          </DragDropContext>
            </Table>
            <div className="flex gap-2 mt-4">
              <Button variant="outline" size="sm" onClick={handleAddItem} className="gap-2">
                <Plus className="w-4 h-4" />
                Add product or service
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                type="button"
                onClick={() => {
                  if (confirm('Clear all line items?')) {
                    setItems([]);
                    calculateTotals([], formData);
                  }
                }}
              >
                Clear all lines
              </Button>
            </div>
          </div>
        </div>

        {/* Bottom Section - Two Columns */}
        <div className="grid grid-cols-2 gap-6">
          {/* Left: Secondary Sections */}
          <div className="space-y-4">
            {/* Payment Options - Collapsible */}
            <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4">
              <div className="flex items-center justify-between mb-3">
                <Label className="text-xs font-semibold uppercase text-slate-600">Customer payment options</Label>
                <button 
                  type="button"
                  onClick={() => setShowPaymentEdit(!showPaymentEdit)}
                  className="text-xs text-blue-600 hover:underline"
                >
                  {showPaymentEdit ? 'Hide' : 'Edit'}
                </button>
              </div>
              <div className="flex gap-2 mb-3">
                <div className="px-2 py-1 border rounded text-xs">Apple Pay</div>
                <div className="px-2 py-1 border rounded text-xs">VISA</div>
                <div className="px-2 py-1 border rounded text-xs">Mastercard</div>
                <div className="px-2 py-1 border rounded text-xs">AMEX</div>
                <div className="px-2 py-1 border rounded text-xs">ACH</div>
              </div>
              {showPaymentEdit && (
                <div className="mb-3 p-4 bg-slate-50 border border-slate-200 rounded-lg">
                  <p className="text-xs text-slate-600 mb-2">Select payment methods to display:</p>
                  <div className="space-y-2">
                    {['Credit Card', 'ACH Bank Transfer', 'Check', 'Cash', 'Wire Transfer', 'PayPal', 'Venmo'].map(method => (
                      <div key={method} className="flex items-center gap-2">
                        <input type="checkbox" defaultChecked={['Credit Card', 'ACH Bank Transfer'].includes(method)} />
                        <label className="text-xs">{method}</label>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <Textarea 
                rows={2} 
                placeholder="Tell your customer how you want to get paid"
                value={formData.payment_options || ''}
                onChange={(e) => onChange({...formData, payment_options: e.target.value})}
                className="text-xs"
              />
            </div>
            
            {/* Customer Note */}
            <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4">
              <Label className="text-xs font-semibold uppercase text-slate-600 mb-2 block">Note to customer</Label>
              <Textarea 
                rows={2}
                placeholder="Thank you for your business"
                value={formData.note_to_customer || ''}
                onChange={(e) => onChange({...formData, note_to_customer: e.target.value})}
                className="text-xs"
              />
            </div>
            
            {/* Internal Memo */}
            <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4">
              <Label className="text-xs font-semibold uppercase text-slate-600 mb-2 block">Memo on statement (hidden)</Label>
              <Textarea 
                rows={2}
                placeholder="Internal memo (not shown to customer)"
                value={formData.memo_on_statement || ''}
                onChange={(e) => onChange({...formData, memo_on_statement: e.target.value})}
                className="text-xs"
              />
            </div>
            
            {/* Attachments */}
            <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4">
              <Label className="text-xs font-semibold uppercase text-slate-600 mb-2 block">Attachments</Label>
              {!showAttachments ? (
                <button 
                  type="button"
                  onClick={() => setShowAttachments(true)}
                  className="text-xs text-blue-600 hover:underline flex items-center gap-2"
                >
                  <Upload className="w-3 h-3" />
                  Add attachment
                </button>
              ) : (
                <div className="border-2 border-dashed rounded-lg p-4 text-center">
                  <input 
                    type="file"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        alert(`File "${file.name}" selected. Upload functionality would be implemented here.`);
                      }
                    }}
                    className="hidden"
                    id="file-upload"
                  />
                  <label htmlFor="file-upload" className="text-xs text-blue-600 hover:underline flex items-center gap-2 mx-auto cursor-pointer">
                    <Upload className="w-3 h-3" />
                    Choose file
                  </label>
                  <div className="text-xs text-slate-500 mt-1">Max file size: 20 MB</div>
                  <button 
                    type="button"
                    onClick={() => setShowAttachments(false)}
                    className="text-xs text-red-600 hover:underline mt-2"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>
            
            {/* Tags - Hidden/Collapsed */}
            <details className="bg-white rounded-lg border border-slate-200 shadow-sm">
              <summary className="px-4 py-3 cursor-pointer hover:bg-slate-50 text-xs font-semibold uppercase text-slate-600">
                Tags (hidden)
              </summary>
              <div className="px-4 pb-4 space-y-3">
                <Input 
                  placeholder="Start typing to add a tag"
                  value={formData.tags || ''}
                  onChange={(e) => onChange({...formData, tags: e.target.value})}
                  className="h-9 text-xs"
                />
                <button 
                  type="button"
                  onClick={() => setShowTagsManager(!showTagsManager)}
                  className="text-xs text-blue-600 hover:underline"
                >
                  {showTagsManager ? 'Hide manager' : 'Manage tags'}
                </button>
                {showTagsManager && (
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                    <p className="text-xs text-slate-600 mb-2">Common tags:</p>
                    <div className="flex flex-wrap gap-2">
                      {['Urgent', 'Recurring', 'Large Order', 'VIP Customer', 'Seasonal'].map(tag => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => {
                            const currentTags = formData.tags ? formData.tags.split(',').map(t => t.trim()) : [];
                            if (!currentTags.includes(tag)) {
                              onChange({...formData, tags: [...currentTags, tag].join(', ')});
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
          </div>

          {/* Right: Totals Summary */}
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
            <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wide mb-4 pb-2 border-b">Estimate Totals</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Subtotal</span>
                <span className="font-semibold">${formData.subtotal?.toFixed(2) || '0.00'}</span>
              </div>
              
              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-slate-600">Discount</span>
                  <Input 
                    type="number"
                    step="0.01"
                    value={discountValue}
                    onChange={(e) => {
                      const value = parseFloat(e.target.value) || 0;
                      setDiscountValue(value);
                      calculateTotals(items, formData);
                    }}
                    className="h-7 w-16 text-xs"
                  />
                  <div className="flex border border-slate-300 rounded overflow-hidden">
                    <button 
                      type="button"
                      className={`px-2 py-1 text-xs ${discountType === 'percent' ? 'bg-slate-200' : 'bg-white hover:bg-slate-50'}`}
                      onClick={() => {
                        setDiscountType('percent');
                        calculateTotals(items, formData);
                      }}
                    >
                      %
                    </button>
                    <button 
                      type="button"
                      className={`px-2 py-1 text-xs border-l border-slate-300 ${discountType === 'dollar' ? 'bg-slate-200' : 'bg-white hover:bg-slate-50'}`}
                      onClick={() => {
                        setDiscountType('dollar');
                        calculateTotals(items, formData);
                      }}
                    >
                      $
                    </button>
                  </div>
                </div>
                <span className="font-semibold">${formData.discount_amount?.toFixed(2) || '0.00'}</span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Taxable subtotal</span>
                <span className="font-semibold">${formData.taxable_subtotal?.toFixed(2) || '0.00'}</span>
              </div>
              
              <div>
                <Label className="text-xs text-slate-600 mb-2 block">Select sales tax rate</Label>
                <Select 
                  value={formData.tax_rate?.toString() || '0'}
                  onValueChange={(value) => {
                    const newTaxRate = parseFloat(value);
                    const updatedFormData = {...formData, tax_rate: newTaxRate};
                    onChange(updatedFormData);
                    calculateTotals(items, updatedFormData);
                  }}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Automatic Calculation" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">0%</SelectItem>
                    <SelectItem value="5">5%</SelectItem>
                    <SelectItem value="8">8%</SelectItem>
                    <SelectItem value="10">10%</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-600">Sales tax</span>
                <button 
                  type="button"
                  onClick={() => setShowTaxMath(!showTaxMath)}
                  className="text-blue-600 text-xs hover:underline"
                >
                  {showTaxMath ? 'Hide math' : 'See the math'}
                </button>
              </div>
              {showTaxMath && (
                <div className="mb-2 p-3 bg-blue-50 border border-blue-200 rounded text-xs space-y-1">
                  <div className="flex justify-between">
                    <span>Taxable subtotal:</span>
                    <span>${formData.taxable_subtotal?.toFixed(2) || '0.00'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax rate:</span>
                    <span>{formData.tax_rate || 0}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Calculation:</span>
                    <span>${formData.taxable_subtotal?.toFixed(2) || '0.00'} × {formData.tax_rate || 0}%</span>
                  </div>
                  <div className="flex justify-between font-semibold pt-1 border-t border-blue-300">
                    <span>Sales tax:</span>
                    <span>${formData.tax_amount?.toFixed(2) || '0.00'}</span>
                  </div>
                </div>
              )}
              <div className="text-right font-semibold">${formData.tax_amount?.toFixed(2) || '0.00'}</div>
              
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-600">Shipping</span>
                <Input 
                  type="number"
                  step="0.01"
                  value={formData.shipping_amount || ''}
                  onChange={(e) => {
                    const newShippingAmount = parseFloat(e.target.value) || 0;
                    const updatedFormData = {...formData, shipping_amount: newShippingAmount};
                    onChange(updatedFormData);
                    calculateTotals(items, updatedFormData);
                  }}
                  className="h-9 w-32 text-sm text-right"
                  placeholder="$0.00"
                />
              </div>
              
              <div className="flex justify-between text-xl font-bold pt-4 mt-2 border-t-2 border-slate-300">
                <span>Estimate Total</span>
                <span className="text-blue-600">${formData.total_amount?.toFixed(2) || '0.00'}</span>
              </div>
            </div>
            
            <div className="mt-6">
              <button 
                type="button"
                onClick={() => setShowEditTotals(!showEditTotals)}
                className="text-blue-600 text-xs hover:underline"
              >
                {showEditTotals ? 'Hide edit totals' : 'Edit totals'}
              </button>
              {showEditTotals && (
                <div className="mt-3 p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-3">
                  <div>
                    <Label className="text-xs mb-1 block">Subtotal override</Label>
                    <Input 
                      type="number"
                      step="0.01"
                      value={formData.subtotal || 0}
                      onChange={(e) => onChange({...formData, subtotal: parseFloat(e.target.value) || 0})}
                      className="h-8 text-xs"
                    />
                  </div>
                  <div>
                    <Label className="text-xs mb-1 block">Tax override</Label>
                    <Input 
                      type="number"
                      step="0.01"
                      value={formData.tax_amount || 0}
                      onChange={(e) => onChange({...formData, tax_amount: parseFloat(e.target.value) || 0})}
                      className="h-8 text-xs"
                    />
                  </div>
                  <div>
                    <Label className="text-xs mb-1 block">Total override</Label>
                    <Input 
                      type="number"
                      step="0.01"
                      value={formData.total_amount || 0}
                      onChange={(e) => onChange({...formData, total_amount: parseFloat(e.target.value) || 0})}
                      className="h-8 text-xs"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-slate-200 shadow-lg z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex gap-3">
            <Button 
              variant="ghost" 
              className="text-slate-600"
              onClick={() => window.history.back()}
            >
              Cancel
            </Button>
            <Button 
              variant="ghost" 
              className="text-slate-600"
              onClick={() => {
                if (confirm('Clear all data?')) {
                  window.location.reload();
                }
              }}
            >
              Clear
            </Button>
          </div>
          
          <div className="flex gap-3">
            <Button 
              variant="outline"
              className="border-slate-300"
              onClick={() => alert('Preview/Print functionality')}
            >
              Preview / Print
            </Button>
            <Button 
              className="bg-green-600 hover:bg-green-700 px-8"
              onClick={handleSaveEstimate}
            >
              Save & Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}