import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

export default function TaskForm({ task, users, customers, estimates, jobs, onSave, onCancel }) {
  const [formData, setFormData] = React.useState(task || {
    title: '',
    description: '',
    task_status: 'todo',
    priority: 'medium',
    assigned_to: '',
    assigned_to_name: '',
    due_date: '',
    related_to_type: 'none',
    related_to_id: '',
    related_to_name: '',
    tags: ''
  });

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAssigneeChange = (userEmail) => {
    const user = users.find(u => u.email === userEmail);
    setFormData(prev => ({
      ...prev,
      assigned_to: userEmail,
      assigned_to_name: user?.full_name || ''
    }));
  };

  const handleRelatedEntityChange = (entityId) => {
    let entityName = '';
    if (formData.related_to_type === 'customer') {
      const customer = customers.find(c => c.id === entityId);
      entityName = customer?.display_name || '';
    } else if (formData.related_to_type === 'estimate') {
      const estimate = estimates.find(e => e.id === entityId);
      entityName = estimate?.estimate_number || '';
    } else if (formData.related_to_type === 'job') {
      const job = jobs.find(j => j.id === entityId);
      entityName = job?.job_name || '';
    }
    
    setFormData(prev => ({
      ...prev,
      related_to_id: entityId,
      related_to_name: entityName
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title">
          Task Title <span className="text-red-500">*</span>
        </Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => handleChange('title', e.target.value)}
          placeholder="Enter task title"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
          placeholder="Add task details..."
          rows={4}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="priority">Priority</Label>
          <Select value={formData.priority} onValueChange={(value) => handleChange('priority', value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="task_status">Status</Label>
          <Select value={formData.task_status} onValueChange={(value) => handleChange('task_status', value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todo">To Do</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="assigned_to">Assign To</Label>
          <Select value={formData.assigned_to} onValueChange={handleAssigneeChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select user" />
            </SelectTrigger>
            <SelectContent>
              {users.map(user => (
                <SelectItem key={user.id} value={user.email}>
                  {user.full_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="due_date">Due Date</Label>
          <Input
            id="due_date"
            type="date"
            value={formData.due_date}
            onChange={(e) => handleChange('due_date', e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="related_to_type">Related To</Label>
        <Select value={formData.related_to_type} onValueChange={(value) => handleChange('related_to_type', value)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">None</SelectItem>
            <SelectItem value="customer">Customer</SelectItem>
            <SelectItem value="estimate">Estimate</SelectItem>
            <SelectItem value="job">Job</SelectItem>
            <SelectItem value="invoice">Invoice</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {formData.related_to_type !== 'none' && formData.related_to_type !== 'invoice' && (
        <div className="space-y-2">
          <Label htmlFor="related_to_id">
            {formData.related_to_type === 'customer' && 'Customer'}
            {formData.related_to_type === 'estimate' && 'Estimate'}
            {formData.related_to_type === 'job' && 'Job'}
          </Label>
          <Select value={formData.related_to_id} onValueChange={handleRelatedEntityChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select..." />
            </SelectTrigger>
            <SelectContent>
              {formData.related_to_type === 'customer' && customers.map(customer => (
                <SelectItem key={customer.id} value={customer.id}>
                  {customer.display_name}
                </SelectItem>
              ))}
              {formData.related_to_type === 'estimate' && estimates.map(estimate => (
                <SelectItem key={estimate.id} value={estimate.id}>
                  {estimate.estimate_number}
                </SelectItem>
              ))}
              {formData.related_to_type === 'job' && jobs.map(job => (
                <SelectItem key={job.id} value={job.id}>
                  {job.job_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="tags">Tags</Label>
        <Input
          id="tags"
          value={formData.tags}
          onChange={(e) => handleChange('tags', e.target.value)}
          placeholder="e.g., urgent, follow-up (comma-separated)"
        />
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
          {task ? 'Update Task' : 'Create Task'}
        </Button>
      </div>
    </form>
  );
}