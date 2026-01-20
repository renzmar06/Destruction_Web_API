import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DollarSign, CheckCircle, Clock, Calendar } from "lucide-react";

const paymentStatusConfig = {
  not_ready: { label: 'Not Ready', icon: Clock, className: 'bg-slate-100 text-slate-600' },
  pending: { label: 'Pending Payment', icon: Clock, className: 'bg-amber-100 text-amber-700' },
  scheduled: { label: 'Scheduled', icon: Calendar, className: 'bg-blue-100 text-blue-700' },
  paid: { label: 'Paid', icon: CheckCircle, className: 'bg-green-100 text-green-700' }
};

export default function PaymentSection({ data, onChange, canMarkForPayment, onMarkForPayment, onMarkAsPaid }) {
  const handleChange = (field, value) => {
    onChange({ ...data, [field]: value });
  };

  const StatusIcon = paymentStatusConfig[data.payment_status]?.icon || Clock;
  const isPaymentReady = data.expense_status === 'approved';
  const isPaid = data.payment_status === 'paid';

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-slate-700" />
          <h3 className="font-semibold text-slate-900">Payment Information</h3>
        </div>
        <Badge className={paymentStatusConfig[data.payment_status]?.className}>
          <StatusIcon className="w-3 h-3 mr-1" />
          {paymentStatusConfig[data.payment_status]?.label}
        </Badge>
      </div>

      {!isPaymentReady && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-800">
          <strong>Note:</strong> Expense must be approved before payment can be processed.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Payment Status</Label>
          <Select
            value={data.payment_status || 'not_ready'}
            onValueChange={(value) => handleChange('payment_status', value)}
            disabled={!isPaymentReady || isPaid}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="not_ready">Not Ready</SelectItem>
              <SelectItem value="pending">Pending Payment</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Payment Method</Label>
          <Select
            value={data.payment_method || ''}
            onValueChange={(value) => handleChange('payment_method', value)}
            disabled={!isPaymentReady || isPaid}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select method" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="check">Check</SelectItem>
              <SelectItem value="ach">ACH Transfer</SelectItem>
              <SelectItem value="wire_transfer">Wire Transfer</SelectItem>
              <SelectItem value="credit_card">Credit Card</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Payment Date</Label>
          <Input
            type="date"
            value={data.payment_date || ''}
            onChange={(e) => handleChange('payment_date', e.target.value)}
            disabled={!isPaymentReady || isPaid}
          />
        </div>

        <div className="space-y-2">
          <Label>Payment Reference</Label>
          <Input
            value={data.payment_reference || ''}
            onChange={(e) => handleChange('payment_reference', e.target.value)}
            placeholder="Check #, Transaction ID, etc."
            disabled={!isPaymentReady || isPaid}
          />
        </div>

        <div className="md:col-span-2 space-y-2">
          <Label>Payment Notes</Label>
          <Textarea
            value={data.payment_notes || ''}
            onChange={(e) => handleChange('payment_notes', e.target.value)}
            placeholder="Additional payment details..."
            rows={3}
            disabled={!isPaymentReady || isPaid}
          />
        </div>
      </div>

      {isPaymentReady && !isPaid && (
        <div className="flex gap-3 pt-4">
          {data.payment_status === 'not_ready' && canMarkForPayment && (
            <Button
              onClick={onMarkForPayment}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Mark for Payment
            </Button>
          )}
          {(data.payment_status === 'pending' || data.payment_status === 'scheduled') && onMarkAsPaid && (
            <Button
              onClick={onMarkAsPaid}
              className="bg-green-600 hover:bg-green-700"
            >
              Mark as Paid
            </Button>
          )}
        </div>
      )}
    </div>
  );
}