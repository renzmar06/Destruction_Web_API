import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Package } from "lucide-react";
import { Card } from "@/components/ui/card";

export default function JobMaterialsSection({ jobId, isReadOnly }) {
  const [editingMaterial, setEditingMaterial] = useState(null);
  const [materials, setMaterials] = useState([]);

  const handleAddNew = () => {
    setEditingMaterial({
      job_id: jobId,
      material_type: '',
      packaging_type: '',
      quantity: 0,
      unit_of_measure: '',
      container_type: '',
      final_disposition: '',
      description: '',
      sort_order: materials.length
    });
  };

  const handleSave = () => {
    if (editingMaterial.id) {
      setMaterials(prev => prev.map(m => m.id === editingMaterial.id ? editingMaterial : m));
    } else {
      setMaterials(prev => [...prev, { ...editingMaterial, id: Date.now() }]);
    }
    setEditingMaterial(null);
  };

  const handleDelete = (id) => {
    if (confirm('Delete this material entry?')) {
      setMaterials(prev => prev.filter(m => m.id !== id));
    }
  };

  if (isReadOnly && materials.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Package className="w-5 h-5 text-slate-700" />
          <h3 className="text-base font-semibold text-slate-900">Material Details</h3>
        </div>
        {!isReadOnly && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleAddNew}
            disabled={!!editingMaterial}
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Material
          </Button>
        )}
      </div>

      {materials.length === 0 && !editingMaterial ? (
        <div className="text-center py-8 border-2 border-dashed border-slate-200 rounded-lg">
          <Package className="w-12 h-12 text-slate-300 mx-auto mb-2" />
          <p className="text-sm text-slate-500">No materials added yet</p>
        </div>
      ) : (
        <div className="border border-slate-200 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-100 border-b border-slate-200">
              <tr>
                <th className="text-left p-3 font-semibold">Material Type</th>
                <th className="text-left p-3 font-semibold">Packaging</th>
                <th className="text-right p-3 font-semibold">Quantity</th>
                <th className="text-left p-3 font-semibold">Container</th>
                <th className="text-left p-3 font-semibold">Disposition</th>
                {!isReadOnly && <th className="text-center p-3 font-semibold w-20">Action</th>}
              </tr>
            </thead>
            <tbody>
              {materials.map((material) => (
                <tr key={material.id} className="border-b border-slate-100">
                  <td className="p-3 capitalize">{material.material_type?.replace(/_/g, ' ')}</td>
                  <td className="p-3 capitalize">{material.packaging_type?.replace(/_/g, ' ')}</td>
                  <td className="p-3 text-right">{material.quantity} {material.unit_of_measure}</td>
                  <td className="p-3">{material.container_type || '-'}</td>
                  <td className="p-3 capitalize">{material.final_disposition?.replace(/_/g, ' ')}</td>
                  {!isReadOnly && (
                    <td className="p-3 text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(material.id)}
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editingMaterial && (
        <Card className="p-4 border-2 border-blue-200 bg-blue-50/30">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 mb-1 block">Material Type *</label>
              <Select
                value={editingMaterial.material_type}
                onValueChange={(value) => setEditingMaterial({ ...editingMaterial, material_type: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="alcoholic_beverages">Alcoholic Beverages</SelectItem>
                  <SelectItem value="non_alcoholic_beverages">Non-Alcoholic Beverages</SelectItem>
                  <SelectItem value="food_products">Food Products</SelectItem>
                  <SelectItem value="pharmaceuticals">Pharmaceuticals</SelectItem>
                  <SelectItem value="consumer_goods">Consumer Goods</SelectItem>
                  <SelectItem value="packaging_materials">Packaging Materials</SelectItem>
                  <SelectItem value="hazardous_materials">Hazardous Materials</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 mb-1 block">Packaging Type *</label>
              <Select
                value={editingMaterial.packaging_type}
                onValueChange={(value) => setEditingMaterial({ ...editingMaterial, packaging_type: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select packaging" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="aluminum_cans">Aluminum Cans</SelectItem>
                  <SelectItem value="plastic_bottles">Plastic Bottles</SelectItem>
                  <SelectItem value="glass_bottles">Glass Bottles</SelectItem>
                  <SelectItem value="tetra_pak">Tetra Pak</SelectItem>
                  <SelectItem value="kegs">Kegs</SelectItem>
                  <SelectItem value="drums">Drums</SelectItem>
                  <SelectItem value="pallets">Pallets</SelectItem>
                  <SelectItem value="bulk">Bulk</SelectItem>
                  <SelectItem value="mixed_packaging">Mixed Packaging</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 mb-1 block">Quantity *</label>
              <Input
                type="number"
                value={editingMaterial.quantity}
                onChange={(e) => setEditingMaterial({ ...editingMaterial, quantity: parseFloat(e.target.value) })}
                placeholder="0"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 mb-1 block">Unit of Measure *</label>
              <Select
                value={editingMaterial.unit_of_measure}
                onValueChange={(value) => setEditingMaterial({ ...editingMaterial, unit_of_measure: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select unit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cases">Cases</SelectItem>
                  <SelectItem value="pallets">Pallets</SelectItem>
                  <SelectItem value="pounds">Pounds (lbs)</SelectItem>
                  <SelectItem value="kilograms">Kilograms (kg)</SelectItem>
                  <SelectItem value="gallons">Gallons</SelectItem>
                  <SelectItem value="liters">Liters</SelectItem>
                  <SelectItem value="units">Units</SelectItem>
                  <SelectItem value="tons">Tons</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 mb-1 block">Container Type</label>
              <Input
                value={editingMaterial.container_type}
                onChange={(e) => setEditingMaterial({ ...editingMaterial, container_type: e.target.value })}
                placeholder="e.g., 12oz cans, 750ml bottles"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 mb-1 block">Final Disposition *</label>
              <Select
                value={editingMaterial.final_disposition}
                onValueChange={(value) => setEditingMaterial({ ...editingMaterial, final_disposition: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select disposition" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="landfill">Landfill</SelectItem>
                  <SelectItem value="recycling">Recycling</SelectItem>
                  <SelectItem value="composting">Composting</SelectItem>
                  <SelectItem value="incineration">Incineration</SelectItem>
                  <SelectItem value="waste_to_energy">Waste to Energy</SelectItem>
                  <SelectItem value="reprocessing">Reprocessing</SelectItem>
                  <SelectItem value="scrap_metal">Scrap Metal</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="col-span-2">
              <label className="text-xs font-semibold text-slate-700 mb-1 block">Description / Notes</label>
              <Textarea
                value={editingMaterial.description}
                onChange={(e) => setEditingMaterial({ ...editingMaterial, description: e.target.value })}
                placeholder="Additional details about this material"
                rows={2}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setEditingMaterial(null)}>Cancel</Button>
            <Button onClick={handleSave} disabled={!editingMaterial.material_type || !editingMaterial.packaging_type}>
              Save Material
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}