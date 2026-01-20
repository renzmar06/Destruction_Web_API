import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calculator, HelpCircle } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function InvoiceSummary({ data, onChange, subtotal, adjustmentsTotal }) {
  const [taxRate, setTaxRate] = React.useState(data.tax_rate || 0);
  const [discountType, setDiscountType] = React.useState('percent');
  const [discountValue, setDiscountValue] = React.useState(0);

  React.useEffect(() => {
    const discountAmount = discountType === 'percent' 
      ? (subtotal * discountValue / 100)
      : discountValue;
    const taxableSubtotal = subtotal - discountAmount;
    const taxAmount = taxableSubtotal * (taxRate / 100);
    const shippingAmount = parseFloat(data.shipping_amount) || 0;
    const totalAmount = taxableSubtotal + adjustmentsTotal + taxAmount + shippingAmount;

    onChange({
      ...data,
      subtotal,
      discount_amount: discountAmount,
      discount_percent: discountType === 'percent' ? discountValue : 0,
      adjustments_total: adjustmentsTotal,
      taxable_subtotal: taxableSubtotal,
      tax_rate: taxRate,
      tax_amount: taxAmount,
      total_amount: totalAmount
    });
  }, [subtotal, adjustmentsTotal, taxRate, discountType, discountValue, data.shipping_amount]);

  const discountAmount = discountType === 'percent' 
    ? (subtotal * discountValue / 100)
    : discountValue;
  const taxableSubtotal = subtotal - discountAmount;
  const taxAmount = taxableSubtotal * (taxRate / 100);
  const shippingAmount = parseFloat(data.shipping_amount) || 0;
  const totalAmount = taxableSubtotal + adjustmentsTotal + taxAmount + shippingAmount;

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center text-sm">
        <span className="text-slate-600">Subtotal</span>
        <span className="font-semibold">${subtotal.toFixed(2)}</span>
      </div>

      <div className="flex justify-between items-center text-sm">
        <div className="flex items-center gap-2">
          <span className="text-slate-600">Discount</span>
          <Input 
            type="number" 
            step="0.01"
            className="w-16 h-7 text-xs" 
            value={discountValue}
            onChange={(e) => setDiscountValue(parseFloat(e.target.value) || 0)}
          />
          <div className="flex border border-slate-300 rounded overflow-hidden">
            <button 
              className={`px-2 py-1 text-xs ${discountType === 'percent' ? 'bg-slate-200' : 'bg-white hover:bg-slate-50'}`}
              onClick={() => setDiscountType('percent')}
            >
              %
            </button>
            <button 
              className={`px-2 py-1 text-xs border-l border-slate-300 ${discountType === 'dollar' ? 'bg-slate-200' : 'bg-white hover:bg-slate-50'}`}
              onClick={() => setDiscountType('dollar')}
            >
              $
            </button>
          </div>
        </div>
        <span className="font-semibold">${discountAmount.toFixed(2)}</span>
      </div>

      <div className="flex justify-between items-center text-sm">
        <span className="text-slate-600">Taxable subtotal</span>
        <span className="font-semibold">${taxableSubtotal.toFixed(2)}</span>
      </div>

      <div className="flex justify-between items-center text-sm">
        <div className="flex items-center gap-2">
          <span className="text-slate-600">Select sales tax rate</span>
        </div>
        <span className="font-semibold">${taxAmount.toFixed(2)}</span>
      </div>

      <Select value="auto" onValueChange={(v) => {}}>
        <SelectTrigger className="w-full h-9 text-sm">
          <SelectValue placeholder="Automatic Calculation" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="auto">Automatic Calculation</SelectItem>
        </SelectContent>
      </Select>

      <div className="flex justify-between items-center text-sm">
        <div className="flex items-center gap-1">
          <span className="text-slate-600">Sales tax</span>
          <HelpCircle className="w-3 h-3 text-slate-400" />
        </div>
        <span className="font-semibold">${taxAmount.toFixed(2)}</span>
      </div>

      <div className="flex justify-between items-center text-sm">
        <span className="text-slate-600">Shipping</span>
        <Input 
          type="number"
          step="0.01"
          value={data.shipping_amount || ''}
          onChange={(e) => {
            const newShippingAmount = parseFloat(e.target.value) || 0;
            onChange({...data, shipping_amount: newShippingAmount});
          }}
          className="h-9 w-32 text-sm text-right"
          placeholder="$0.00"
        />
      </div>

      <div className="border-t-2 border-slate-900 pt-3 mt-4">
        <div className="flex justify-between items-center">
          <span className="text-lg font-bold">Invoice total</span>
          <span className="text-xl font-bold">${totalAmount.toFixed(2)}</span>
        </div>
      </div>

      <div className="text-right">
        <button className="text-sm text-blue-600 hover:underline">Edit totals</button>
      </div>
    </div>
  );
}