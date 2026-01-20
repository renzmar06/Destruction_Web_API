import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { FileText, Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function AdditionalInfoSection({ data, onChange }) {
  const [showNewTypeDialog, setShowNewTypeDialog] = useState(false);
  const [newTypeName, setNewTypeName] = useState('');
  const [customTypes, setCustomTypes] = useState([]);

  const handleChange = (field, value) => {
    onChange({ ...data, [field]: value });
  };

  const handleAddCustomType = () => {
    if (newTypeName.trim()) {
      const typeValue = newTypeName.toLowerCase().replace(/\s+/g, '_');
      setCustomTypes([...customTypes, { value: typeValue, label: newTypeName }]);
      handleChange('customer_type', typeValue);
      setNewTypeName('');
      setShowNewTypeDialog(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-6">
      <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
        <FileText className="w-5 h-5 text-slate-700" />
        <h3 className="font-semibold text-slate-900">Additional info</h3>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="customer_type">Customer type</Label>
          <Select value={data.customer_type || ''} onValueChange={(value) => {
            if (value === 'add_new') {
              setShowNewTypeDialog(true);
            } else {
              handleChange('customer_type', value);
            }
          }}>
            <SelectTrigger className="max-w-xs">
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="brand_owner">Brand Owner</SelectItem>
              <SelectItem value="distributor">Distributor</SelectItem>
              <SelectItem value="co_packer">Co-Packer</SelectItem>
              <SelectItem value="retailer">Retailer</SelectItem>
              <SelectItem value="3pl_warehouse">3PL / Warehouse</SelectItem>
              <SelectItem value="broker">Broker</SelectItem>
              {customTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
              ))}
              <SelectItem value="add_new" className="text-blue-600 font-medium">
                <div className="flex items-center gap-1">
                  <Plus className="w-4 h-4" />
                  Add new
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Dialog open={showNewTypeDialog} onOpenChange={setShowNewTypeDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add customer type</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="new_type_name">Customer type name</Label>
                <Input
                  id="new_type_name"
                  value={newTypeName}
                  onChange={(e) => setNewTypeName(e.target.value)}
                  placeholder="Enter customer type name"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleAddCustomType();
                    }
                  }}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setShowNewTypeDialog(false);
                setNewTypeName('');
              }}>
                Cancel
              </Button>
              <Button onClick={handleAddCustomType}>
                Add
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <div className="pt-3 border-t border-slate-100">
          <h4 className="font-medium text-slate-900 mb-3">Taxes</h4>
          
          <div className="flex items-center gap-2 mb-4">
            <Checkbox
              id="tax_exempt"
              checked={data.tax_exempt || false}
              onCheckedChange={(checked) => handleChange('tax_exempt', checked)}
            />
            <Label htmlFor="tax_exempt" className="text-sm font-normal cursor-pointer">
              This customer is tax exempt
            </Label>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tax_rate_id">Select tax rate</Label>
            <Select value={data.tax_rate_id || ''} onValueChange={(value) => handleChange('tax_rate_id', value)} disabled={data.tax_exempt}>
              <SelectTrigger className="max-w-md">
                <SelectValue placeholder="Select tax rate" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="standard">Standard Rate</SelectItem>
                <SelectItem value="reduced">Reduced Rate</SelectItem>
                <SelectItem value="zero">Zero Rate</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100">
          <h4 className="font-medium text-slate-900 mb-3">Opening balance</h4>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="opening_balance">Opening balance</Label>
              <Input
                id="opening_balance"
                type="number"
                value={data.opening_balance || ''}
                onChange={(e) => handleChange('opening_balance', parseFloat(e.target.value))}
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="opening_balance_date">As of</Label>
              <Input
                id="opening_balance_date"
                type="date"
                value={data.opening_balance_date || ''}
                onChange={(e) => handleChange('opening_balance_date', e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}