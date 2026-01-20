import React, { useState } from 'react';
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, MapPin } from "lucide-react";

export default function CreateJobFromEstimate({ estimate, customer, locations, onSuccess, onCancel }) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    job_name: `Job for ${customer?.legal_company_name || 'Customer'}`,
    scheduled_date: new Date().toISOString().split('T')[0],
    job_location_id: '',
    destruction_method: 'mechanical_destruction',
    destruction_description: 'As per estimate specifications',
    special_handling_notes: customer?.special_handling_notes || '',
    requires_affidavit: customer?.requires_affidavit || false
  });

  const createJobMutation = useMutation({
    mutationFn: async (jobData) => {
      const jobId = `JOB-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      
      return base44.entities.Job.create({
        job_id: jobId,
        job_name: jobData.job_name,
        customer_id: estimate.customer_id,
        customer_name: customer?.legal_company_name || '',
        estimate_id: estimate.id,
        estimate_number: estimate.estimate_number,
        job_location_id: jobData.job_location_id,
        scheduled_date: jobData.scheduled_date,
        destruction_method: jobData.destruction_method,
        destruction_description: jobData.destruction_description,
        requires_affidavit: jobData.requires_affidavit,
        special_handling_notes: jobData.special_handling_notes,
        job_status: 'scheduled'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      onSuccess?.();
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    createJobMutation.mutate(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Job Name</Label>
        <Input 
          value={formData.job_name}
          onChange={(e) => setFormData({...formData, job_name: e.target.value})}
          required
        />
      </div>

      <div className="space-y-2">
        <Label>Scheduled Date</Label>
        <Input 
          type="date"
          value={formData.scheduled_date}
          onChange={(e) => setFormData({...formData, scheduled_date: e.target.value})}
          required
        />
      </div>

      <div className="space-y-2">
        <Label>Job Location</Label>
        <Select 
          value={formData.job_location_id}
          onValueChange={(value) => setFormData({...formData, job_location_id: value})}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select location" />
          </SelectTrigger>
          <SelectContent>
            {locations.map(loc => (
              <SelectItem key={loc.id} value={loc.id}>
                {loc.location_name} - {loc.city}, {loc.state}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Destruction Method</Label>
        <Select 
          value={formData.destruction_method}
          onValueChange={(value) => setFormData({...formData, destruction_method: value})}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="mechanical_destruction">Mechanical Destruction</SelectItem>
            <SelectItem value="liquidization">Liquidization</SelectItem>
            <SelectItem value="fermentation">Fermentation</SelectItem>
            <SelectItem value="anaerobic_digestion">Anaerobic Digestion</SelectItem>
            <SelectItem value="hybrid_multi_step">Hybrid Multi-Step</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Destruction Description</Label>
        <Textarea 
          value={formData.destruction_description}
          onChange={(e) => setFormData({...formData, destruction_description: e.target.value})}
          rows={3}
          required
        />
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button 
          type="submit" 
          disabled={createJobMutation.isPending}
          className="bg-green-600 hover:bg-green-700"
        >
          {createJobMutation.isPending ? 'Creating...' : 'Create Job'}
        </Button>
      </div>
    </form>
  );
}