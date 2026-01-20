import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CreditCard } from "lucide-react";

export default function PaymentsSection({ data, onChange }) {
  const handleChange = (field, value) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
      <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
        <CreditCard className="w-5 h-5 text-slate-700" />
        <h3 className="font-semibold text-slate-900">Payments</h3>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="primary_payment_method">Primary payment method</Label>
          <Select value={data.primary_payment_method || ''} onValueChange={(value) => handleChange('primary_payment_method', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select a primary payment method" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="cash">Cash</SelectItem>
              <SelectItem value="check">Check</SelectItem>
              <SelectItem value="credit_card">Credit Card</SelectItem>
              <SelectItem value="ach">ACH</SelectItem>
              <SelectItem value="wire_transfer">Wire Transfer</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="payment_terms">Default Payment Terms</Label>
          <Select value={data.payment_terms || 'net_30'} onValueChange={(value) => handleChange('payment_terms', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select terms" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="due_on_receipt">Payment Due Upon Receipt</SelectItem>
              <SelectItem value="net_15">Net 15</SelectItem>
              <SelectItem value="net_30">Net 30</SelectItem>
              <SelectItem value="net_45">Net 45</SelectItem>
              <SelectItem value="net_60">Net 60</SelectItem>
              <SelectItem value="net_90">Net 90</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-slate-500">Applied automatically to new estimates and invoices</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="delivery_method">Sales form delivery options</Label>
          <Select value={data.delivery_method || ''} onValueChange={(value) => handleChange('delivery_method', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select delivery method" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="email">Email</SelectItem>
              <SelectItem value="mail">Mail</SelectItem>
              <SelectItem value="none">None</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="invoice_language">Language to use when you send invoices</Label>
          <Input
            id="invoice_language"
            value={data.invoice_language || 'English'}
            onChange={(e) => handleChange('invoice_language', e.target.value)}
            readOnly
            className="bg-slate-50"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="credit_limit">Credit Limit</Label>
        <Input
          id="credit_limit"
          type="number"
          value={data.credit_limit || ''}
          onChange={(e) => handleChange('credit_limit', parseFloat(e.target.value))}
          placeholder="0.00"
          className="max-w-xs"
        />
      </div>
    </div>
  );
}