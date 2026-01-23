import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DollarSign } from "lucide-react";

const expenseTypeLabels = {
  transport: 'Transport',
  packaging: 'Packaging',
  equipment: 'Equipment',
  labor: 'Labor',
  materials: 'Materials',
  utilities: 'Utilities',
  other: 'Other'
};

export default function ExpenseDetailsSection({ data, onChange, errors, isReadOnly }) {
  const handleChange = (field, value) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 pb-2">
        <DollarSign className="w-5 h-5 text-slate-600" />
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">Expense Details</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="expense_id" className="text-xs font-semibold text-slate-700">Expense ID</Label>
          <Input
            id="expense_id"
            value={data.expense_id || 'Auto-generated'}
            disabled
            className="bg-slate-100 border-slate-300 h-10"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="expense_type" className="text-xs font-semibold text-slate-700">
            Expense Type <span className="text-red-500">*</span>
          </Label>
          <Select
            value={data.expense_type || ''}
            onValueChange={(value) => handleChange('expense_type', value)}
            disabled={isReadOnly}
          >
            <SelectTrigger className={`h-10 border-slate-300 ${errors.expense_type ? 'border-red-400' : ''}`}>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(expenseTypeLabels).map(([key, label]) => (
                <SelectItem key={key} value={key}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.expense_type && <p className="text-xs text-red-500">{errors.expense_type}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="vendor_name" className="text-xs font-semibold text-slate-700">
            Vendor <span className="text-red-500">*</span>
          </Label>
          {isReadOnly ? (
            <Input
              id="vendor_name"
              value={data.vendor_name || ''}
              disabled
              className="bg-slate-100 border-slate-300 h-10"
            />
          ) : (
            <Input
              id="vendor_name"
              value={data.vendor_name || ''}
              onChange={(e) => handleChange('vendor_name', e.target.value)}
              placeholder="Enter vendor name"
              className={`h-10 border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 ${errors.vendor_name ? 'border-red-400' : ''}`}
            />
          )}
          {errors.vendor_name && <p className="text-xs text-red-500">{errors.vendor_name}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="expense_date" className="text-xs font-semibold text-slate-700">
            Expense Date <span className="text-red-500">*</span>
          </Label>
          <Input
            id="expense_date"
            type="date"
            value={data.expense_date || ''}
            onChange={(e) => handleChange('expense_date', e.target.value)}
            disabled={isReadOnly}
            className={`h-10 border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 ${errors.expense_date ? 'border-red-400' : ''}`}
          />
          {errors.expense_date && <p className="text-xs text-red-500">{errors.expense_date}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="amount" className="text-xs font-semibold text-slate-700">
            Amount <span className="text-red-500">*</span>
          </Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-semibold">$</span>
            <Input
              id="amount"
              type="number"
              step="0.01"
              value={data.amount || ''}
              onChange={(e) => handleChange('amount', parseFloat(e.target.value) || 0)}
              placeholder="0.00"
              disabled={isReadOnly}
              className={`h-10 pl-7 border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 font-semibold ${errors.amount ? 'border-red-400' : ''}`}
            />
          </div>
          {errors.amount && <p className="text-xs text-red-500">{errors.amount}</p>}
        </div>

        <div className="md:col-span-2 space-y-2">
          <Label htmlFor="description" className="text-xs font-semibold text-slate-700">Description</Label>
          <Textarea
            id="description"
            value={data.description || ''}
            onChange={(e) => handleChange('description', e.target.value)}
            placeholder="Additional details about this expense..."
            className="resize-none border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            rows={3}
            disabled={isReadOnly}
          />
        </div>
      </div>
    </div>
  );
}