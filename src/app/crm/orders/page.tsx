'use client';

import React, { useState, useEffect } from 'react';
import OrderTable from '@/components/orders/OrderTable';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
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
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Search, 
  Plus, 
  Package,
  DollarSign,
  Truck,
  Clock,
  CheckCircle
} from 'lucide-react';
import { Skeleton } from "@/components/ui/skeleton";

export default function Orders() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isNewOrderOpen, setIsNewOrderOpen] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newOrder, setNewOrder] = useState({
    order_number: '',
    customer_id: '',
    items: [{ name: '', quantity: 1, unit_price: 0, total: 0 }],
    shipping_fee: 0,
    discount: 0
  });

  const generateOrderNumber = () => {
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
    return `ORD-${year}-${random}`;
  };

  useEffect(() => {
    if (isNewOrderOpen && !newOrder.order_number) {
      setNewOrder({ ...newOrder, order_number: generateOrderNumber() });
    }
  }, [isNewOrderOpen]);

  // Fetch orders and customers from database
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ordersRes, customersRes] = await Promise.all([
          fetch('/api/orders'),
          fetch('/api/customers')
        ]);
        const ordersData = await ordersRes.json();
        const customersData = await customersRes.json();
        
        setOrders(ordersData.data || []);
        const mappedCustomers = (customersData.data || []).map((c: any) => ({
          ...c,
          id: c._id
        }));
        setCustomers(mappedCustomers);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredOrders = orders.filter(order => {
    const matchesSearch = !searchQuery || 
      order.order_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customers.find(c => c.id === order.customer_id)?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleViewOrder = (order: any) => {
    setSelectedOrder(order);
    setIsDetailOpen(true);
  };

  const handleUpdateStatus = async (order: any, newStatus: string) => {
    setOrders(orders.map(o => 
      o._id === order._id ? { ...o, status: newStatus } : o
    ));
    if (selectedOrder?._id === order._id) {
      setSelectedOrder({ ...order, status: newStatus });
    }
    try {
      await fetch(`/api/orders/${order._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
    } catch (error) {
      console.error('Failed to update order:', error);
    }
  };

  const handleCreateOrder = async () => {
    const subtotal = newOrder.items.reduce((sum, item) => sum + item.total, 0);
    const total = subtotal + newOrder.shipping_fee - newOrder.discount;
    
    const orderData = {
      ...newOrder,
      subtotal,
      total,
      status: 'pending',
      payment_status: 'unpaid'
    };
    
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });
      const result = await response.json();
      if (result.success) {
        setOrders([result.data, ...orders]);
        setIsNewOrderOpen(false);
        setNewOrder({
          order_number: '',
          customer_id: '',
          items: [{ name: '', quantity: 1, unit_price: 0, total: 0 }],
          shipping_fee: 0,
          discount: 0
        });
      }
    } catch (error) {
      console.error('Failed to create order:', error);
    }
  };

  const updateItem = (index: number, field: string, value: any) => {
    const items = [...newOrder.items];
    items[index] = { ...items[index], [field]: value };
    if (field === 'quantity' || field === 'unit_price') {
      items[index].total = items[index].quantity * items[index].unit_price;
    }
    setNewOrder({ ...newOrder, items });
  };

  const addItem = () => {
    setNewOrder({
      ...newOrder,
      items: [...newOrder.items, { name: '', quantity: 1, unit_price: 0, total: 0 }]
    });
  };

  const removeItem = (index: number) => {
    setNewOrder({
      ...newOrder,
      items: newOrder.items.filter((_, i) => i !== index)
    });
  };

  // Stats
  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    processing: orders.filter(o => ['confirmed', 'processing'].includes(o.status)).length,
    shipped: orders.filter(o => o.status === 'shipped').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    totalRevenue: orders.filter(o => o.payment_status === 'paid').reduce((sum, o) => sum + (o.total || 0), 0),
  };

  if (loading) {
    return (
      <div className="p-6 bg-slate-50 min-h-screen space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-96 rounded-2xl" />
      </div>
    );
  }

  const selectedCustomer = selectedOrder 
    ? customers.find(c => c.id === selectedOrder.customer_id)
    : null;

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Orders</h1>
          <p className="text-slate-500">Manage and track your orders</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-5 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-slate-100">
              <Package className="w-5 h-5 text-slate-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Total</p>
              <p className="text-xl font-bold text-slate-900">{stats.total}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-yellow-100">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Pending</p>
              <p className="text-xl font-bold text-yellow-600">{stats.pending}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-100">
              <Package className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Processing</p>
              <p className="text-xl font-bold text-blue-600">{stats.processing}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-indigo-100">
              <Truck className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Shipped</p>
              <p className="text-xl font-bold text-indigo-600">{stats.shipped}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-100">
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Revenue</p>
              <p className="text-xl font-bold text-green-600">${stats.totalRevenue.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 mb-6">
        <div className='flex justify-end mb-4'>
            <Button onClick={() => setIsNewOrderOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              New Order
            </Button>
          </div>
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search orders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Tabs value={statusFilter} onValueChange={setStatusFilter}>
            <TabsList className="bg-slate-100">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="processing">Processing</TabsTrigger>
              <TabsTrigger value="shipped">Shipped</TabsTrigger>
              <TabsTrigger value="delivered">Delivered</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Orders Table */}
      <OrderTable
        orders={filteredOrders}
        customers={customers}
        onViewOrder={handleViewOrder}
        onUpdateStatus={handleUpdateStatus}
      />

      {/* Order Detail Sheet */}
      <Sheet open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <SheetContent className="w-[500px] sm:max-w-[500px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>
              Order #{selectedOrder?.order_number || selectedOrder?.id?.slice(0, 8)}
            </SheetTitle>
          </SheetHeader>

          {selectedOrder && (
            <div className="mt-6 space-y-6">
              {/* Customer Info */}
              <div>
                <h4 className="text-sm font-medium text-slate-500 mb-2">Customer</h4>
                <div className="bg-slate-50 rounded-lg p-3">
                  <p className="font-medium">{selectedCustomer?.name || 'Unknown'}</p>
                  <p className="text-sm text-slate-500">{selectedCustomer?.email}</p>
                  <p className="text-sm text-slate-500">{selectedCustomer?.phone}</p>
                </div>
              </div>

              {/* Order Status */}
              <div>
                <h4 className="text-sm font-medium text-slate-500 mb-2">Status</h4>
                <Select 
                  value={selectedOrder.status} 
                  onValueChange={(v) => handleUpdateStatus(selectedOrder, v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="shipped">Shipped</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Items */}
              <div>
                <h4 className="text-sm font-medium text-slate-500 mb-2">Items</h4>
                <div className="space-y-2">
                  {selectedOrder.items?.map((item: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between bg-slate-50 rounded-lg p-3">
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-slate-500">Qty: {item.quantity} × ${item.unit_price}</p>
                      </div>
                      <p className="font-semibold">${item.total}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totals */}
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Subtotal</span>
                  <span>${selectedOrder.subtotal?.toLocaleString() || 0}</span>
                </div>
                {selectedOrder.discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Discount</span>
                    <span className="text-green-600">-${selectedOrder.discount}</span>
                  </div>
                )}
                {selectedOrder.shipping_fee > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Shipping</span>
                    <span>${selectedOrder.shipping_fee}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold pt-2 border-t">
                  <span>Total</span>
                  <span>${selectedOrder.total?.toLocaleString() || 0}</span>
                </div>
              </div>

              {/* Shipping Address */}
              {selectedOrder.shipping_address && (
                <div>
                  <h4 className="text-sm font-medium text-slate-500 mb-2">Shipping Address</h4>
                  <div className="bg-slate-50 rounded-lg p-3 text-sm">
                    <p className="font-medium">{selectedOrder.shipping_address.name}</p>
                    <p>{selectedOrder.shipping_address.address}</p>
                    <p>{selectedOrder.shipping_address.city}, {selectedOrder.shipping_address.country}</p>
                    <p>{selectedOrder.shipping_address.phone}</p>
                  </div>
                </div>
              )}

              {/* Tracking */}
              {selectedOrder.tracking_number && (
                <div>
                  <h4 className="text-sm font-medium text-slate-500 mb-2">Tracking</h4>
                  <div className="bg-blue-50 rounded-lg p-3">
                    <p className="font-mono text-sm">{selectedOrder.tracking_number}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* New Order Dialog */}
      <Dialog open={isNewOrderOpen} onOpenChange={setIsNewOrderOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Order</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Order Number *</Label>
                <Input
                  value={newOrder.order_number}
                  onChange={(e) => setNewOrder({ ...newOrder, order_number: e.target.value })}
                  placeholder="ORD-001"
                />
              </div>
              <div>
                <Label>Customer *</Label>
                <Select 
                  value={newOrder.customer_id} 
                  onValueChange={(v) => setNewOrder({ ...newOrder, customer_id: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select customer" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <Label>Items *</Label>
                <Button type="button" size="sm" onClick={addItem}>Add Item</Button>
              </div>
              {newOrder.items.map((item, index) => (
                <div key={index} className="grid grid-cols-12 gap-2 mb-2">
                  <Input
                    className="col-span-5"
                    placeholder="Item name"
                    value={item.name}
                    onChange={(e) => updateItem(index, 'name', e.target.value)}
                  />
                  <Input
                    className="col-span-2"
                    type="number"
                    placeholder="Qty"
                    value={item.quantity}
                    onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 0)}
                  />
                  <Input
                    className="col-span-2"
                    type="number"
                    placeholder="Price"
                    value={item.unit_price}
                    onChange={(e) => updateItem(index, 'unit_price', parseFloat(e.target.value) || 0)}
                  />
                  <Input
                    className="col-span-2"
                    value={item.total}
                    readOnly
                  />
                  {newOrder.items.length > 1 && (
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="col-span-1"
                      onClick={() => removeItem(index)}
                    >
                      ×
                    </Button>
                  )}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Shipping Fee</Label>
                <Input
                  type="number"
                  value={newOrder.shipping_fee}
                  onChange={(e) => setNewOrder({ ...newOrder, shipping_fee: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div>
                <Label>Discount</Label>
                <Input
                  type="number"
                  value={newOrder.discount}
                  onChange={(e) => setNewOrder({ ...newOrder, discount: parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => setIsNewOrderOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleCreateOrder}
                disabled={!newOrder.order_number || !newOrder.customer_id}
              >
                Create Order
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}