import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, Plus, Edit2, Trash2, Star } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";

export default function ServiceLocationsSection({ customerId }) {
  const [showDialog, setShowDialog] = useState(false);
  const [editingLocation, setEditingLocation] = useState(null);
  const [formData, setFormData] = useState({
    location_name: '',
    location_type: 'warehouse',
    contact_name: '',
    contact_phone: '',
    contact_email: '',
    street_address_1: '',
    street_address_2: '',
    city: '',
    state: '',
    zip_code: '',
    country: 'USA',
    is_primary: false,
    operating_hours: '',
    access_instructions: '',
    dock_availability: false,
    forklift_available: false,
    notes: '',
    location_status: 'active'
  });

  const queryClient = useQueryClient();

  const { data: locations = [] } = useQuery({
    queryKey: ['locations', customerId],
    queryFn: () => customerId ? base44.entities.Location.filter({ customer_id: customerId }) : [],
    enabled: !!customerId
  });

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      if (editingLocation) {
        return base44.entities.Location.update(editingLocation.id, data);
      } else {
        return base44.entities.Location.create({ ...data, customer_id: customerId });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations', customerId] });
      toast.success(editingLocation ? 'Location updated' : 'Location added');
      handleClose();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (locationId) => base44.entities.Location.delete(locationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations', customerId] });
      toast.success('Location removed');
    }
  });

  const handleAdd = () => {
    setEditingLocation(null);
    setFormData({
      location_name: '',
      location_type: 'warehouse',
      contact_name: '',
      contact_phone: '',
      contact_email: '',
      street_address_1: '',
      street_address_2: '',
      city: '',
      state: '',
      zip_code: '',
      country: 'USA',
      is_primary: false,
      operating_hours: '',
      access_instructions: '',
      dock_availability: false,
      forklift_available: false,
      notes: '',
      location_status: 'active'
    });
    setShowDialog(true);
  };

  const handleEdit = (location) => {
    setEditingLocation(location);
    setFormData({
      location_name: location.location_name || '',
      location_type: location.location_type || 'warehouse',
      contact_name: location.contact_name || '',
      contact_phone: location.contact_phone || '',
      contact_email: location.contact_email || '',
      street_address_1: location.street_address_1 || '',
      street_address_2: location.street_address_2 || '',
      city: location.city || '',
      state: location.state || '',
      zip_code: location.zip_code || '',
      country: location.country || 'USA',
      is_primary: location.is_primary || false,
      operating_hours: location.operating_hours || '',
      access_instructions: location.access_instructions || '',
      dock_availability: location.dock_availability || false,
      forklift_available: location.forklift_available || false,
      notes: location.notes || '',
      location_status: location.location_status || 'active'
    });
    setShowDialog(true);
  };

  const handleDelete = (location) => {
    if (confirm(`Remove ${location.location_name}?`)) {
      deleteMutation.mutate(location.id);
    }
  };

  const handleSave = () => {
    if (!formData.location_name || !formData.street_address_1 || !formData.city || !formData.state || !formData.zip_code) {
      toast.error('Location name and address are required');
      return;
    }
    saveMutation.mutate(formData);
  };

  const handleClose = () => {
    setShowDialog(false);
    setEditingLocation(null);
  };

  if (!customerId) {
    return (
      <div className="bg-slate-50 rounded-xl border border-slate-200 p-6 text-center">
        <MapPin className="w-8 h-8 text-slate-400 mx-auto mb-2" />
        <p className="text-sm text-slate-600">Save customer first to add service locations</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-slate-700" />
          <h3 className="font-semibold text-slate-900">Service Locations</h3>
        </div>
        <Button onClick={handleAdd} size="sm" className="gap-2">
          <Plus className="w-4 h-4" />
          Add Location
        </Button>
      </div>

      {locations.length === 0 ? (
        <div className="text-center py-8 text-slate-500">
          <MapPin className="w-12 h-12 text-slate-300 mx-auto mb-2" />
          <p className="text-sm">No service locations added yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {locations.map((location) => (
            <div key={location.id} className="border border-slate-200 rounded-lg p-4 hover:bg-slate-50 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-slate-900">{location.location_name}</span>
                    {location.is_primary && (
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    )}
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded-full">
                      {location.location_type?.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="mt-2 text-sm text-slate-700">
                    <p>{location.street_address_1}{location.street_address_2 ? `, ${location.street_address_2}` : ''}</p>
                    <p>{location.city}, {location.state} {location.zip_code}</p>
                  </div>
                  {location.contact_name && (
                    <p className="text-sm text-slate-600 mt-2">Contact: {location.contact_name}</p>
                  )}
                  <div className="mt-2 flex gap-2 text-xs text-slate-500">
                    {location.dock_availability && <span>✓ Loading Dock</span>}
                    {location.forklift_available && <span>✓ Forklift</span>}
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(location)} className="h-8 w-8">
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(location)} className="h-8 w-8 text-red-600">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingLocation ? 'Edit Service Location' : 'Add Service Location'}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Location Name <span className="text-red-500">*</span></Label>
                <Input
                  value={formData.location_name}
                  onChange={(e) => setFormData({ ...formData, location_name: e.target.value })}
                  placeholder="e.g., Main Warehouse, Downtown Office"
                />
              </div>
              <div className="space-y-2">
                <Label>Location Type</Label>
                <Select value={formData.location_type} onValueChange={(value) => setFormData({ ...formData, location_type: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="warehouse">Warehouse</SelectItem>
                    <SelectItem value="distribution_center">Distribution Center</SelectItem>
                    <SelectItem value="retail_store">Retail Store</SelectItem>
                    <SelectItem value="manufacturing_plant">Manufacturing Plant</SelectItem>
                    <SelectItem value="office">Office</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="border-t pt-4">
              <h4 className="font-medium text-slate-900 mb-3">Address</h4>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Street Address 1 <span className="text-red-500">*</span></Label>
                    <Input
                      value={formData.street_address_1}
                      onChange={(e) => setFormData({ ...formData, street_address_1: e.target.value })}
                      placeholder="123 Main Street"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Street Address 2</Label>
                    <Input
                      value={formData.street_address_2}
                      onChange={(e) => setFormData({ ...formData, street_address_2: e.target.value })}
                      placeholder="Suite, Unit, etc."
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>City <span className="text-red-500">*</span></Label>
                    <Input
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>State <span className="text-red-500">*</span></Label>
                    <Input
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      placeholder="CA"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>ZIP Code <span className="text-red-500">*</span></Label>
                    <Input
                      value={formData.zip_code}
                      onChange={(e) => setFormData({ ...formData, zip_code: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <h4 className="font-medium text-slate-900 mb-3">On-Site Contact</h4>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Contact Name</Label>
                  <Input
                    value={formData.contact_name}
                    onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input
                    value={formData.contact_phone}
                    onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={formData.contact_email}
                    onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <h4 className="font-medium text-slate-900 mb-3">Location Details</h4>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Operating Hours</Label>
                  <Input
                    value={formData.operating_hours}
                    onChange={(e) => setFormData({ ...formData, operating_hours: e.target.value })}
                    placeholder="e.g., Mon-Fri 8am-5pm"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Access Instructions</Label>
                  <Textarea
                    value={formData.access_instructions}
                    onChange={(e) => setFormData({ ...formData, access_instructions: e.target.value })}
                    placeholder="Gate codes, parking instructions, etc."
                    rows={2}
                  />
                </div>
                <div className="flex gap-4">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={formData.is_primary}
                      onCheckedChange={(checked) => setFormData({ ...formData, is_primary: checked })}
                      id="is_primary"
                    />
                    <Label htmlFor="is_primary" className="cursor-pointer">Primary location</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={formData.dock_availability}
                      onCheckedChange={(checked) => setFormData({ ...formData, dock_availability: checked })}
                      id="dock_availability"
                    />
                    <Label htmlFor="dock_availability" className="cursor-pointer">Loading dock available</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={formData.forklift_available}
                      onCheckedChange={(checked) => setFormData({ ...formData, forklift_available: checked })}
                      id="forklift_available"
                    />
                    <Label htmlFor="forklift_available" className="cursor-pointer">Forklift available</Label>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Notes</Label>
                  <Textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Additional notes about this location"
                    rows={3}
                  />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saveMutation.isPending}>
              {saveMutation.isPending ? 'Saving...' : editingLocation ? 'Update' : 'Add Location'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}