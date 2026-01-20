import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { GripVertical, Trash2, Plus, Upload, Image as ImageIcon } from "lucide-react";
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

export default function InvoiceItemsSection({ invoiceId, invoiceStatus, onTotalChange }) {
  const [items, setItems] = useState([]);
  const [hasInitialized, setHasInitialized] = useState(false);

  const queryClient = useQueryClient();

  const { data: services = [] } = useQuery({
    queryKey: ['services'],
    queryFn: () => base44.entities.Service.filter({ service_status: 'active' })
  });

  const { data: savedItems = [] } = useQuery({
    queryKey: ['invoiceItems', invoiceId],
    queryFn: () => invoiceId ? base44.entities.InvoiceLineItem.filter({ invoice_id: invoiceId }, 'sort_order') : [],
    enabled: !!invoiceId
  });

  React.useEffect(() => {
    if (savedItems.length > 0 && !hasInitialized) {
      setItems(savedItems);
      setHasInitialized(true);
    }
  }, [savedItems, hasInitialized]);

  const itemsMutation = useMutation({
    mutationFn: async (itemsData) => {
      if (!invoiceId) return;
      
      // Delete existing items
      for (const item of savedItems) {
        await base44.entities.InvoiceLineItem.delete(item.id);
      }
      
      // Create new items
      for (const item of itemsData) {
        await base44.entities.InvoiceLineItem.create({
          ...item,
          invoice_id: invoiceId
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoiceItems', invoiceId] });
    }
  });

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
    calculateTotal(newItems);
  };

  const handleRemoveItem = (index) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
    calculateTotal(newItems);
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

  const calculateTotal = (currentItems) => {
    const total = currentItems.reduce((sum, item) => sum + (item.line_total || 0), 0);
    onTotalChange(total);
  };

  const handleClearAll = () => {
    if (confirm('Clear all line items?')) {
      setItems([]);
      setHasInitialized(false);
      onTotalChange(0);
    }
  };

  React.useEffect(() => {
    calculateTotal(items);
  }, [items]);

  const isLocked = invoiceStatus === 'finalized' || invoiceStatus === 'paid';

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-slate-900">Product or service</h3>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">#</TableHead>
            <TableHead className="w-20">Image</TableHead>
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
                  <Draggable key={index} draggableId={`item-${index}`} index={index} isDragDisabled={isLocked}>
                    {(provided, snapshot) => (
                      <TableRow
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={snapshot.isDragging ? 'bg-slate-50' : ''}
                      >
                        <TableCell {...provided.dragHandleProps}>
                          {!isLocked && <GripVertical className="w-4 h-4 text-slate-400 cursor-move" />}
                        </TableCell>
                        <TableCell>
                          {item.image_url ? (
                            <img 
                              src={item.image_url} 
                              alt="Item" 
                              className="w-12 h-12 object-cover rounded border"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-slate-100 rounded border flex items-center justify-center">
                              <ImageIcon className="w-4 h-4 text-slate-400" />
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <Input 
                            type="date"
                            value={item.service_date || ''}
                            onChange={(e) => handleItemChange(index, 'service_date', e.target.value)}
                            className="h-9 text-sm w-32"
                            disabled={isLocked}
                          />
                        </TableCell>
                        <TableCell>
                          <Select 
                            value={item.service_id}
                            onValueChange={(value) => handleItemChange(index, 'service_id', value)}
                            disabled={isLocked}
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
                            disabled={isLocked}
                          />
                        </TableCell>
                        <TableCell>
                          <Input 
                            type="number"
                            step="0.01"
                            value={item.quantity}
                            onChange={(e) => handleItemChange(index, 'quantity', parseFloat(e.target.value) || 0)}
                            className="h-9 text-sm text-right w-20"
                            disabled={isLocked}
                          />
                        </TableCell>
                        <TableCell>
                          <Input 
                            type="number"
                            step="0.01"
                            value={item.unit_price}
                            onChange={(e) => handleItemChange(index, 'unit_price', parseFloat(e.target.value) || 0)}
                            className="h-9 text-sm text-right w-24"
                            disabled={isLocked}
                          />
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          ${item.line_total?.toFixed(2) || '0.00'}
                        </TableCell>
                        <TableCell className="text-center">
                          <Checkbox 
                            checked={item.is_taxable}
                            onCheckedChange={(checked) => handleItemChange(index, 'is_taxable', checked)}
                            disabled={isLocked}
                          />
                        </TableCell>
                        <TableCell>
                          {!isLocked && (
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => handleRemoveItem(index)}
                              className="h-8 w-8"
                            >
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </Button>
                          )}
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
      {!isLocked && (
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleAddItem} className="gap-2">
            <Plus className="w-4 h-4" />
            Add product or service
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleClearAll}
          >
            Clear all lines
          </Button>
        </div>
      )}
    </div>
  );
}