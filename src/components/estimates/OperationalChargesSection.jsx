import React, { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Truck } from "lucide-react";

const chargeTypeLabels = {
  transportation: 'Transportation / Haul',
  fuel_surcharge: 'Fuel Surcharge',
  cod_affidavit_fee: 'COD / Affidavit Fee',
  storage_fee: 'Storage',
  disposal_fee: 'Overage / Underage Adjustment',
  credit_adjustment: 'Credit (Packaging Recovery, Goodwill)',
  other: 'Other'
};

export default function OperationalChargesSection({ estimateId, onTotalChange, isReadOnly, unsavedCharges = [], onUnsavedChargesChange }) {
  const [editingCharge, setEditingCharge] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const savedCharges = [];
  const isLoading = false;
  const charges = unsavedCharges; // Always use unsavedCharges

  useEffect(() => {
    const total = charges.reduce((sum, charge) => sum + (charge.amount || 0), 0);
    onTotalChange(total);
  }, [charges, onTotalChange]);

  const createMutation = {
    mutate: (data) => {
      onUnsavedChargesChange([...unsavedCharges, { ...data, id: Date.now().toString() }]);
      setShowForm(false);
      setEditingCharge(null);
    },
    isPending: false
  };

  const updateMutation = {
    mutate: ({ id, data }) => {
      const updated = unsavedCharges.map(charge => 
        charge.id === id ? { ...charge, ...data } : charge
      );
      onUnsavedChargesChange(updated);
      setShowForm(false);
      setEditingCharge(null);
    },
    isPending: false
  };

  const deleteMutation = {
    mutate: (id) => {
      onUnsavedChargesChange(unsavedCharges.filter(charge => charge.id !== id));
    }
  };

  const handleSave = (chargeData) => {
    if (editingCharge?.id) {
      updateMutation.mutate({ id: editingCharge.id, data: chargeData });
    } else {
      createMutation.mutate({ ...chargeData, sort_order: charges.length });
    }
  };

  const handleAdd = () => {
    setEditingCharge({
      charge_type: 'transportation',
      description: '',
      amount: 0
    });
    setShowForm(true);
  };

  return (
    <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl border-2 border-slate-300 p-8 space-y-6 shadow-xl">
      <div className="flex items-center justify-between pb-5 border-b-2 border-slate-300">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-slate-600 to-slate-700 rounded-xl shadow-lg shadow-slate-300">
            <Truck className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900">Operational Charges & Adjustments</h3>
            <p className="text-base text-slate-600 mt-1">Transportation, fuel surcharges, COD fees, storage, and credits</p>
          </div>
        </div>
        {!isReadOnly && (
          <Button variant="outline" onClick={handleAdd} className="h-11 px-6 gap-2 border-2 border-slate-400 hover:bg-slate-100 font-semibold">
            <Plus className="w-5 h-5" />
            Add Operational Charge
          </Button>
        )}
      </div>



      {showForm && editingCharge && (
        <ChargeForm
          charge={editingCharge}
          onSave={handleSave}
          onCancel={() => {
            setShowForm(false);
            setEditingCharge(null);
          }}
          isSaving={createMutation.isPending || updateMutation.isPending}
        />
      )}

      <div className="space-y-2">
        {isLoading ? (
          <div className="text-sm text-slate-500">Loading charges...</div>
        ) : charges.length === 0 ? (
          <p className="text-sm text-slate-500">No operational charges added yet.</p>
        ) : (
          <div className="border-2 border-slate-300 rounded-xl overflow-hidden bg-white shadow-md">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-slate-100 to-slate-50 border-b-2 border-slate-300">
                <tr>
                  <th className="text-left p-4 font-bold text-slate-900 text-sm">Description</th>
                  <th className="text-left p-4 font-bold text-slate-900 text-sm">Type</th>
                  <th className="text-right p-4 font-bold text-slate-900 text-sm">Amount</th>
                  {!isReadOnly && <th className="w-24"></th>}
                </tr>
              </thead>
              <tbody>
                {charges.map((charge) => (
                  <tr key={charge.id} className="border-b border-slate-100 hover:bg-slate-50/70 transition-colors">
                    <td className="p-4">
                      <div className="font-semibold text-slate-900">{charge.description}</div>
                    </td>
                    <td className="p-4 text-slate-700 font-medium">{chargeTypeLabels[charge.charge_type]}</td>
                    <td className="p-4 text-right">
                      <span className={`font-bold text-base ${charge.amount < 0 ? 'text-green-600' : 'text-slate-900'}`}>
                        {charge.amount < 0 ? '-' : ''}${Math.abs(charge.amount).toFixed(2)}
                      </span>
                    </td>
                    {!isReadOnly && (
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEditingCharge(charge);
                              setShowForm(true);
                            }}
                            className="h-9 px-4 font-medium hover:bg-slate-100 border-slate-300"
                          >
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteMutation.mutate(charge.id)}
                            className="h-9 px-3 text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function ChargeForm({ charge, onSave, onCancel, isSaving }) {
  const [formData, setFormData] = useState(charge);

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 border-2 border-slate-300 bg-gradient-to-br from-slate-50 to-white rounded-xl space-y-6 shadow-lg">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-2">
          <Label htmlFor="charge_type">Type *</Label>
          <Select value={formData.charge_type || ''} onValueChange={(value) => handleChange('charge_type', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="transportation">Transportation / Haul</SelectItem>
              <SelectItem value="fuel_surcharge">Fuel Surcharge</SelectItem>
              <SelectItem value="cod_affidavit_fee">COD / Affidavit Fee</SelectItem>
              <SelectItem value="storage_fee">Storage</SelectItem>
              <SelectItem value="disposal_fee">Overage / Underage Adjustment</SelectItem>
              <SelectItem value="credit_adjustment">Credit (Packaging Recovery, Goodwill)</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description *</Label>
          <Input
            id="description"
            value={formData.description || ''}
            onChange={(e) => handleChange('description', e.target.value)}
            placeholder="Description"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="amount">Amount * (negative for credit)</Label>
          <Input
            id="amount"
            type="number"
            step="0.01"
            value={formData.amount || ''}
            onChange={(e) => handleChange('amount', parseFloat(e.target.value))}
            placeholder="0.00"
            required
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onCancel} className="h-11 px-6 border-2">
          Cancel
        </Button>
        <Button type="submit" disabled={isSaving} className="h-11 px-8 bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-800 hover:to-slate-900 shadow-lg shadow-slate-300 font-semibold">
          {isSaving ? 'Saving...' : 'Save Charge'}
        </Button>
      </div>
    </form>
  );
}