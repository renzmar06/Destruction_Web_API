import React from 'react';
import { format } from 'date-fns';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  MoreHorizontal, 
  Eye, 
  Edit, 
  Truck,
  Package,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle
} from 'lucide-react';
import { cn } from "@/lib/utils";

const statusConfig = {
  pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
  confirmed: { label: 'Confirmed', color: 'bg-blue-100 text-blue-700', icon: CheckCircle },
  processing: { label: 'Processing', color: 'bg-purple-100 text-purple-700', icon: Package },
  shipped: { label: 'Shipped', color: 'bg-indigo-100 text-indigo-700', icon: Truck },
  delivered: { label: 'Delivered', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-700', icon: XCircle },
  refunded: { label: 'Refunded', color: 'bg-slate-100 text-slate-700', icon: AlertCircle },
};

const paymentStatusConfig = {
  unpaid: { label: 'Unpaid', color: 'bg-red-100 text-red-700' },
  partial: { label: 'Partial', color: 'bg-yellow-100 text-yellow-700' },
  paid: { label: 'Paid', color: 'bg-green-100 text-green-700' },
  refunded: { label: 'Refunded', color: 'bg-slate-100 text-slate-700' },
};

export default function OrderTable({ 
  orders, 
  customers,
  onViewOrder,
  onUpdateStatus 
}) {
  const getCustomer = (customerId) => 
    customers.find(c => c.id === customerId);

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50">
            <TableHead className="font-semibold">Order</TableHead>
            <TableHead className="font-semibold">Customer</TableHead>
            <TableHead className="font-semibold">Date</TableHead>
            <TableHead className="font-semibold">Items</TableHead>
            <TableHead className="font-semibold">Total</TableHead>
            <TableHead className="font-semibold">Status</TableHead>
            <TableHead className="font-semibold">Payment</TableHead>
            <TableHead className="w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-12 text-slate-400">
                <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No orders yet</p>
              </TableCell>
            </TableRow>
          ) : (
            orders.map((order) => {
              const customer = getCustomer(order.customer_id);
              const status = statusConfig[order.status] || statusConfig.pending;
              const payment = paymentStatusConfig[order.payment_status] || paymentStatusConfig.unpaid;
              const StatusIcon = status.icon;

              return (
                <TableRow 
                  key={order.id}
                  className="cursor-pointer hover:bg-slate-50 transition-colors"
                  onClick={() => onViewOrder(order)}
                >
                  <TableCell>
                    <div className="font-medium text-slate-900">
                      #{order.order_number || order.id.slice(0, 8)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={customer?.avatar_url} />
                        <AvatarFallback className="text-xs">
                          {customer?.name?.charAt(0) || '?'}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{customer?.name || 'Unknown'}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-slate-600">
                    {order.createdAt ? format(new Date(order.createdAt), 'MMM d, yyyy') : 'N/A'}
                  </TableCell>
                  <TableCell className="text-sm text-slate-600">
                    {order.items?.length || 0} items
                  </TableCell>
                  <TableCell>
                    <span className="font-semibold text-slate-900">
                      ${order.total?.toLocaleString() || 0}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge className={cn("flex items-center gap-1 w-fit", status.color)}>
                      <StatusIcon className="w-3 h-3" />
                      {status.label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={payment.color}>
                      {payment.label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onViewOrder(order)}>
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onUpdateStatus(order, 'confirmed')}>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Confirm Order
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onUpdateStatus(order, 'shipped')}>
                          <Truck className="w-4 h-4 mr-2" />
                          Mark as Shipped
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}