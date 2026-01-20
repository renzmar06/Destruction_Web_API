import React, { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { MapPin, Plus, Trash2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export default function LocationsSection({ customerId }) {
  const [editingLocation, setEditingLocation] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const queryClient = useQueryClient();

  const { data: locations = [], isLoading } = useQuery({
    queryKey: ['locations', customerId],
    queryFn: () => customerId ? base44.entities.Location.filter({ customer_id: customerId }) : [],
    enabled: !!customerId
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Location.create({ ...data, customer_id: customerId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations', customerId] });
      setShowForm(false);
      setEditingLocation(null);
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Location.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations', customerId] });
      setShowForm(false);
      setEditingLocation(null);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Location.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations', customerId] });
    }
  });

  const handleSaveLocation = (locationData) => {
    if (editingLocation?.id) {
      updateMutation.mutate({ id: editingLocation.id, data: locationData });
    } else {
      createMutation.mutate(locationData);
    }
  };

  const handleEdit = (location) => {
    setEditingLocation(location);
    setShowForm(true);
  };

  const handleAdd = () => {
    setEditingLocation({
      location_name: '',
      street_address: '',
      city: '',
      state: '',
      zip_code: '',
      country: 'USA',
      location_type: 'pickup_location',
      access_notes: '',
      is_default: false
    });
    setShowForm(true);
  };

  if (!customerId) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100 mb-4">
          <MapPin className="w-5 h-5 text-slate-700" />
          <h3 className="font-semibold text-slate-900">Locations</h3>
        </div>
        <p className="text-sm text-slate-500">Save the customer first to add locations.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border-2 border-slate-200 p-8 space-y-6 shadow-lg">
      <div className="flex items-center justify-between pb-4 border-b-2 border-slate-200">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-orange-100 rounded-xl">
            <MapPin className="w-5 h-5 text-orange-700" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900">Operational Locations</h3>
            <p className="text-sm text-slate-600 mt-1">Used in estimates, jobs, and affidavits</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={handleAdd} className="gap-2">
          <Plus className="w-4 h-4" />
          Add Location
        </Button>
      </div>

      {showForm && editingLocation && (
        <LocationForm
          location={editingLocation}
          onSave={handleSaveLocation}
          onCancel={() => {
            setShowForm(false);
            setEditingLocation(null);
          }}
          isSaving={createMutation.isPending || updateMutation.isPending}
        />
      )}

      <div className="space-y-3">
        {isLoading ? (
          <div className="text-sm text-slate-500">Loading locations...</div>
        ) : locations.length === 0 ? (
          <p className="text-sm text-slate-500">No locations added yet.</p>
        ) : (
          locations.map((location) => (
            <div key={location.id} className="p-4 border border-slate-200 rounded-lg hover:border-slate-300 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-medium text-slate-900">{location.location_name}</h4>
                    <span className="text-xs px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full border border-blue-200">
                      {location.location_type}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600">
                    {location.street_address}, {location.city}, {location.state} {location.zip_code}
                  </p>
                  {location.access_notes && (
                    <p className="text-xs text-slate-500 mt-2">{location.access_notes}</p>
                  )}
                  {location.is_default && (
                    <span className="text-xs px-2 py-0.5 bg-green-50 text-green-700 rounded-full border border-green-200 inline-block mt-2">
                      Default Location
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="sm" onClick={() => handleEdit(location)}>
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteMutation.mutate(location.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function LocationForm({ location, onSave, onCancel, isSaving }) {
  const [formData, setFormData] = useState(location);

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 border-2 border-blue-200 bg-blue-50/30 rounded-lg space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="location_name">Location Name *</Label>
          <Input
            id="location_name"
            value={formData.location_name || ''}
            onChange={(e) => handleChange('location_name', e.target.value)}
            placeholder="e.g., Warehouse A"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="location_type">Location Type *</Label>
          <Select value={formData.location_type || ''} onValueChange={(value) => handleChange('location_type', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pickup_location">Pickup Location</SelectItem>
              <SelectItem value="customer_warehouse">Customer Warehouse</SelectItem>
              <SelectItem value="delivery_drop">Delivery / Drop</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="md:col-span-2 space-y-2">
          <Label htmlFor="street_address">Street Address *</Label>
          <Input
            id="street_address"
            value={formData.street_address || ''}
            onChange={(e) => handleChange('street_address', e.target.value)}
            placeholder="123 Business Street"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="city">City *</Label>
          <Input
            id="city"
            value={formData.city || ''}
            onChange={(e) => handleChange('city', e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="state">State *</Label>
          <Input
            id="state"
            value={formData.state || ''}
            onChange={(e) => handleChange('state', e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="zip_code">ZIP Code *</Label>
          <Input
            id="zip_code"
            value={formData.zip_code || ''}
            onChange={(e) => handleChange('zip_code', e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="country">Country</Label>
          <Input
            id="country"
            value={formData.country || 'USA'}
            onChange={(e) => handleChange('country', e.target.value)}
          />
        </div>

        <div className="md:col-span-2 space-y-2">
          <Label htmlFor="access_notes">Access Notes (dock hours, gate codes, etc.)</Label>
          <Textarea
            id="access_notes"
            value={formData.access_notes || ''}
            onChange={(e) => handleChange('access_notes', e.target.value)}
            placeholder="e.g., Dock hours 8am-5pm, use Gate B, code #1234"
            className="resize-none"
          />
        </div>

        <div className="md:col-span-2">
          <div className="flex items-center gap-2">
            <Checkbox
              id="is_default"
              checked={formData.is_default || false}
              onCheckedChange={(checked) => handleChange('is_default', checked)}
            />
            <Label htmlFor="is_default" className="text-sm font-medium cursor-pointer">
              Set as default location
            </Label>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Save Location'}
        </Button>
      </div>
    </form>
  );
}