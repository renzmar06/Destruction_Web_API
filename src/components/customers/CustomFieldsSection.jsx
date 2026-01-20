import React, { useState } from 'react';
import { Settings, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";

export default function CustomFieldsSection() {
  const [showDialog, setShowDialog] = useState(false);
  const [fieldName, setFieldName] = useState('');
  const [dataType, setDataType] = useState('');
  const [category, setCategory] = useState('customer');
  const [selectedForms, setSelectedForms] = useState({
    sales_receipt: false,
    invoice: false,
    estimate: false,
    credit_memo: false,
    refund_receipt: false,
    purchase_order: false,
    expense: false,
    bill: false,
    check: false,
    vendor_credit: false,
    credit_card_credit: false
  });
  const [printOnForm, setPrintOnForm] = useState({
    sales_receipt: false,
    invoice: false,
    estimate: false,
    credit_memo: false,
    refund_receipt: false,
    purchase_order: false
  });

  const forms = [
    { id: 'sales_receipt', label: 'Sales Receipt', hasPrint: true },
    { id: 'invoice', label: 'Invoice', hasPrint: true },
    { id: 'estimate', label: 'Estimate', hasPrint: true },
    { id: 'credit_memo', label: 'Credit Memo', hasPrint: true },
    { id: 'refund_receipt', label: 'Refund Receipt', hasPrint: true },
    { id: 'purchase_order', label: 'Purchase Order', hasPrint: true },
    { id: 'expense', label: 'Expense', hasPrint: false },
    { id: 'bill', label: 'Bill', hasPrint: false },
    { id: 'check', label: 'Check', hasPrint: false },
    { id: 'vendor_credit', label: 'Vendor credit', hasPrint: false },
    { id: 'credit_card_credit', label: 'Credit card credit', hasPrint: false }
  ];

  const handleSave = () => {
    // Handle save logic here
    console.log({ fieldName, dataType, category, selectedForms, printOnForm });
    setShowDialog(false);
    // Reset form
    setFieldName('');
    setDataType('');
    setCategory('customer');
    setSelectedForms({});
    setPrintOnForm({});
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
      <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
        <Settings className="w-5 h-5 text-slate-700" />
        <h3 className="font-semibold text-slate-900">Custom fields</h3>
      </div>

      <div className="space-y-3">
        <p className="text-sm text-slate-600">
          Add customer details. Sort, filter, and track. Create reports your business needs.
        </p>
        <Button 
          variant="link" 
          className="h-auto p-0 text-blue-600 hover:text-blue-700 gap-1"
          onClick={() => setShowDialog(true)}
        >
          <Plus className="w-4 h-4" />
          Add custom field
        </Button>
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="flex flex-row items-center justify-between pb-4 border-b">
            <DialogTitle className="text-lg font-semibold">Add custom field</DialogTitle>
            <button onClick={() => setShowDialog(false)} className="hover:bg-slate-100 rounded p-1">
              <X className="w-5 h-5" />
            </button>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Name and Data Type */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="field_name">Name</Label>
                <Input
                  id="field_name"
                  value={fieldName}
                  onChange={(e) => setFieldName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="data_type">Data type</Label>
                <Select value={dataType} onValueChange={setDataType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type here" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">Text</SelectItem>
                    <SelectItem value="number">Number</SelectItem>
                    <SelectItem value="date">Date</SelectItem>
                    <SelectItem value="dropdown">Dropdown</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Category */}
            <div className="space-y-3 pt-2 border-t">
              <Label>Select category</Label>
              <RadioGroup value={category} onValueChange={setCategory}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="customer" id="category_customer" />
                  <Label htmlFor="category_customer" className="font-normal cursor-pointer">Customer</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="transaction" id="category_transaction" />
                  <Label htmlFor="category_transaction" className="font-normal cursor-pointer">Transaction</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="time" id="category_time" />
                  <Label htmlFor="category_time" className="font-normal cursor-pointer">Time</Label>
                </div>
              </RadioGroup>
            </div>

            {/* Select Forms */}
            <div className="space-y-3 pt-2 border-t">
              <Label className="text-xs text-slate-600 uppercase">Select forms</Label>
              <div className="space-y-2">
                {forms.map((form) => (
                  <div key={form.id} className="flex items-center justify-between py-1">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={form.id}
                        checked={selectedForms[form.id] || false}
                        onCheckedChange={(checked) => 
                          setSelectedForms({ ...selectedForms, [form.id]: checked })
                        }
                      />
                      <Label htmlFor={form.id} className="font-normal cursor-pointer">
                        {form.label}
                      </Label>
                    </div>
                    {form.hasPrint && (
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={printOnForm[form.id] || false}
                          onCheckedChange={(checked) => 
                            setPrintOnForm({ ...printOnForm, [form.id]: checked })
                          }
                          disabled={!selectedForms[form.id]}
                        />
                        <span className="text-sm text-slate-500">Print on form</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end pt-4 border-t">
            <Button 
              onClick={handleSave}
              className="bg-green-600 hover:bg-green-700 px-8"
            >
              Save
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}