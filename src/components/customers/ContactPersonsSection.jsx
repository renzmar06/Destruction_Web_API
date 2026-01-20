import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Users, Plus, Edit2, Trash2, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";

export default function ContactPersonsSection({ customerId }) {
  const [showDialog, setShowDialog] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  const [formData, setFormData] = useState({
    contact_name: '',
    title: '',
    email: '',
    phone: '',
    mobile: '',
    is_primary: false,
    receive_estimates: true,
    receive_invoices: true,
    receive_job_updates: false,
    notes: ''
  });

  const queryClient = useQueryClient();

  const { data: contacts = [] } = useQuery({
    queryKey: ['customerContacts', customerId],
    queryFn: () => customerId ? base44.entities.CustomerContact.filter({ customer_id: customerId }) : [],
    enabled: !!customerId
  });

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      if (editingContact) {
        return base44.entities.CustomerContact.update(editingContact.id, data);
      } else {
        return base44.entities.CustomerContact.create({ ...data, customer_id: customerId });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customerContacts', customerId] });
      toast.success(editingContact ? 'Contact updated' : 'Contact added');
      handleClose();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (contactId) => base44.entities.CustomerContact.delete(contactId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customerContacts', customerId] });
      toast.success('Contact removed');
    }
  });

  const handleAdd = () => {
    setEditingContact(null);
    setFormData({
      contact_name: '',
      title: '',
      email: '',
      phone: '',
      mobile: '',
      is_primary: false,
      receive_estimates: true,
      receive_invoices: true,
      receive_job_updates: false,
      notes: ''
    });
    setShowDialog(true);
  };

  const handleEdit = (contact) => {
    setEditingContact(contact);
    setFormData({
      contact_name: contact.contact_name || '',
      title: contact.title || '',
      email: contact.email || '',
      phone: contact.phone || '',
      mobile: contact.mobile || '',
      is_primary: contact.is_primary || false,
      receive_estimates: contact.receive_estimates ?? true,
      receive_invoices: contact.receive_invoices ?? true,
      receive_job_updates: contact.receive_job_updates || false,
      notes: contact.notes || ''
    });
    setShowDialog(true);
  };

  const handleDelete = (contact) => {
    if (confirm(`Remove ${contact.contact_name}?`)) {
      deleteMutation.mutate(contact.id);
    }
  };

  const handleSave = () => {
    if (!formData.contact_name || !formData.email) {
      toast.error('Contact name and email are required');
      return;
    }
    saveMutation.mutate(formData);
  };

  const handleClose = () => {
    setShowDialog(false);
    setEditingContact(null);
  };

  if (!customerId) {
    return (
      <div className="bg-slate-50 rounded-xl border border-slate-200 p-6 text-center">
        <Users className="w-8 h-8 text-slate-400 mx-auto mb-2" />
        <p className="text-sm text-slate-600">Save customer first to add contacts</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-slate-700" />
          <h3 className="font-semibold text-slate-900">Contact Persons</h3>
        </div>
        <Button onClick={handleAdd} size="sm" className="gap-2">
          <Plus className="w-4 h-4" />
          Add Contact
        </Button>
      </div>

      {contacts.length === 0 ? (
        <div className="text-center py-8 text-slate-500">
          <Users className="w-12 h-12 text-slate-300 mx-auto mb-2" />
          <p className="text-sm">No contacts added yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {contacts.map((contact) => (
            <div key={contact.id} className="border border-slate-200 rounded-lg p-4 hover:bg-slate-50 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-slate-900">{contact.contact_name}</span>
                    {contact.is_primary && (
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">Primary</span>
                    )}
                  </div>
                  {contact.title && (
                    <p className="text-sm text-slate-600 mt-1">{contact.title}</p>
                  )}
                  <div className="mt-2 space-y-1">
                    <p className="text-sm text-slate-700">{contact.email}</p>
                    {contact.phone && <p className="text-sm text-slate-600">Phone: {contact.phone}</p>}
                    {contact.mobile && <p className="text-sm text-slate-600">Mobile: {contact.mobile}</p>}
                  </div>
                  <div className="mt-2 flex gap-2 text-xs text-slate-500">
                    {contact.receive_estimates && <span>✓ Estimates</span>}
                    {contact.receive_invoices && <span>✓ Invoices</span>}
                    {contact.receive_job_updates && <span>✓ Job Updates</span>}
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(contact)} className="h-8 w-8">
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(contact)} className="h-8 w-8 text-red-600">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingContact ? 'Edit Contact' : 'Add Contact Person'}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Contact Name <span className="text-red-500">*</span></Label>
                <Input
                  value={formData.contact_name}
                  onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
                  placeholder="John Doe"
                />
              </div>
              <div className="space-y-2">
                <Label>Job Title</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Operations Manager"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Email <span className="text-red-500">*</span></Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="john@company.com"
                />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="(555) 123-4567"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Mobile</Label>
              <Input
                value={formData.mobile}
                onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                placeholder="(555) 987-6543"
              />
            </div>

            <div className="space-y-3 border-t pt-4">
              <Label className="font-semibold">Notification Preferences</Label>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={formData.is_primary}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_primary: checked })}
                    id="is_primary"
                  />
                  <Label htmlFor="is_primary" className="cursor-pointer">Primary contact</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={formData.receive_estimates}
                    onCheckedChange={(checked) => setFormData({ ...formData, receive_estimates: checked })}
                    id="receive_estimates"
                  />
                  <Label htmlFor="receive_estimates" className="cursor-pointer">Receive estimate notifications</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={formData.receive_invoices}
                    onCheckedChange={(checked) => setFormData({ ...formData, receive_invoices: checked })}
                    id="receive_invoices"
                  />
                  <Label htmlFor="receive_invoices" className="cursor-pointer">Receive invoice notifications</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={formData.receive_job_updates}
                    onCheckedChange={(checked) => setFormData({ ...formData, receive_job_updates: checked })}
                    id="receive_job_updates"
                  />
                  <Label htmlFor="receive_job_updates" className="cursor-pointer">Receive job status updates</Label>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Notes</Label>
              <Input
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Additional notes about this contact"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saveMutation.isPending}>
              {saveMutation.isPending ? 'Saving...' : editingContact ? 'Update' : 'Add Contact'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}