import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calculator, Percent, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function EstimateSummary({ data, onChange, lineItemsTotal, chargesTotal }) {
  const [discountType, setDiscountType] = useState(data.discount_type || 'percentage');
  const subtotal = lineItemsTotal + chargesTotal;
  
  // Calculate discount amount
  let discountAmount = 0;
  if (data.discount_value) {
    if (discountType === 'percentage') {
      discountAmount = subtotal * (data.discount_value / 100);
    } else {
      discountAmount = data.discount_value;
    }
  }
  
  const taxableSubtotal = subtotal - discountAmount;
  const taxAmount = taxableSubtotal * ((data.tax_rate || 0) / 100);
  const shippingAmount = data.shipping_amount || 0;
  const total = taxableSubtotal + taxAmount + shippingAmount;

  const handleDiscountTypeChange = (type) => {
    setDiscountType(type);
    onChange({
      ...data,
      discount_type: type,
      discount_value: data.discount_value || 0
    });
  };

  const handleDiscountValueChange = (value) => {
    const discountValue = parseFloat(value) || 0;
    onChange({
      ...data,
      discount_type: discountType,
      discount_value: discountValue
    });
  };

  const handleTaxRateChange = (value) => {
    const taxRate = parseFloat(value) || 0;
    onChange({
      ...data,
      tax_rate: taxRate
    });
  };

  const handleShippingChange = (value) => {
    const shipping = parseFloat(value) || 0;
    onChange({
      ...data,
      shipping_amount: shipping
    });
  };

  React.useEffect(() => {
    // Recalculate all totals
    let calcDiscountAmount = 0;
    if (data.discount_value) {
      if (discountType === 'percentage') {
        calcDiscountAmount = subtotal * (data.discount_value / 100);
      } else {
        calcDiscountAmount = data.discount_value;
      }
    }
    
    const calcTaxableSubtotal = subtotal - calcDiscountAmount;
    const calcTaxAmount = calcTaxableSubtotal * ((data.tax_rate || 0) / 100);
    const calcShipping = data.shipping_amount || 0;
    const calcTotal = calcTaxableSubtotal + calcTaxAmount + calcShipping;
    
    onChange({
      ...data,
      subtotal: subtotal,
      discount_amount: calcDiscountAmount,
      taxable_subtotal: calcTaxableSubtotal,
      tax_amount: calcTaxAmount,
      total_amount: calcTotal
    });
  }, [lineItemsTotal, chargesTotal, data.discount_value, discountType, data.tax_rate, data.shipping_amount]);

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-6 space-y-3">
      <div className="flex justify-between text-sm">
        <span className="text-slate-700">Subtotal</span>
        <span className="font-semibold text-slate-900">${subtotal.toFixed(2)}</span>
      </div>

      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1">
          <span className="text-slate-700 text-sm">Discount</span>
          <Input
            type="number"
            min="0"
            step="0.01"
            value={data.discount_value || ''}
            onChange={(e) => handleDiscountValueChange(e.target.value)}
            placeholder="0"
            className="w-20 h-8 text-sm"
          />
          <div className="flex border border-slate-300 rounded">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => handleDiscountTypeChange('percentage')}
              className={`h-8 px-3 rounded-r-none ${
                discountType === 'percentage' 
                  ? 'bg-slate-200 text-slate-900' 
                  : 'bg-white text-slate-600'
              }`}
            >
              %
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => handleDiscountTypeChange('amount')}
              className={`h-8 px-3 rounded-l-none border-l ${
                discountType === 'amount' 
                  ? 'bg-slate-200 text-slate-900' 
                  : 'bg-white text-slate-600'
              }`}
            >
              $
            </Button>
          </div>
        </div>
        <span className="font-semibold text-slate-900 text-sm">${discountAmount.toFixed(2)}</span>
      </div>

      <div className="flex justify-between text-sm">
        <span className="text-slate-700">Taxable subtotal</span>
        <span className="font-semibold text-slate-900">${taxableSubtotal.toFixed(2)}</span>
      </div>

      <div className="space-y-2">
        <div className="text-sm text-slate-700">Select sales tax rate</div>
        <select 
          value={data.tax_rate || ''}
          onChange={(e) => handleTaxRateChange(e.target.value)}
          className="w-full h-10 border border-slate-300 rounded px-3 text-sm"
        >
          <option value="">Automatic Calculation</option>
          <option value="0">Tax Exempt (0%)</option>
          <option value="7.5">Standard Rate (7.5%)</option>
          <option value="8.5">Higher Rate (8.5%)</option>
          <option value="10">Premium Rate (10%)</option>
        </select>
      </div>

      <div className="flex justify-between text-sm">
        <span className="text-slate-700">Sales tax</span>
        <span className="font-semibold text-slate-900">${taxAmount.toFixed(2)}</span>
      </div>

      <div className="flex items-center justify-between gap-3">
        <span className="text-slate-700 text-sm">Shipping</span>
        <Input
          type="number"
          min="0"
          step="0.01"
          value={data.shipping_amount || ''}
          onChange={(e) => handleShippingChange(e.target.value)}
          placeholder="0.00"
          className="w-24 h-8 text-sm text-right"
        />
      </div>

      <div className="flex justify-between pt-3 border-t-2 border-slate-300">
        <span className="text-base font-bold text-slate-900">Estimate total</span>
        <span className="text-base font-bold text-slate-900">${total.toFixed(2)}</span>
      </div>

      <div className="pt-2">
        <button 
          type="button"
          className="text-sm text-blue-600 hover:underline"
          onClick={() => {}}
        >
          Edit totals
        </button>
      </div>
    </div>
  );
}