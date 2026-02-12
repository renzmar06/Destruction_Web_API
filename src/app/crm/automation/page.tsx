'use client';

import React, { useState, useEffect } from 'react';
import RuleCard from "@/components/automation/RuleCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Plus, 
  Zap, 
  Search,
  Settings,
  Play
} from 'lucide-react';
import { Skeleton } from "@/components/ui/skeleton";

const triggerOptions = [
  { value: 'new_message', label: 'New Message Received' },
  { value: 'new_customer', label: 'New Customer Created' },
  { value: 'new_conversation', label: 'New Conversation Started' },
  { value: 'keyword_match', label: 'Keyword Match' },
  { value: 'no_reply_timeout', label: 'No Reply Timeout' },
  { value: 'tag_added', label: 'Tag Added' },
];

const actionOptions = [
  { value: 'auto_reply', label: 'Send Auto Reply' },
  { value: 'add_tag', label: 'Add Tag' },
  { value: 'assign_agent', label: 'Assign to Agent' },
  { value: 'notify', label: 'Send Notification' },
  { value: 'update_status', label: 'Update Status' },
  { value: 'create_deal', label: 'Create Deal' },
];

export default function Automation() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<any>(null);
  const [rules, setRules] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newRule, setNewRule] = useState({
    name: '',
    description: '',
    trigger_type: '',
    actions: [] as any[],
    is_active: true,
    priority: 0
  });
  const [selectedAction, setSelectedAction] = useState('');
  const [selectedEditAction, setSelectedEditAction] = useState('');

  useEffect(() => {
    fetchRules();
  }, []);

  const fetchRules = async () => {
    try {
      const res = await fetch('/api/automation-rules');
      const result = await res.json();
      if (result.success) {
        setRules(result.data);
      }
    } catch (error) {
      console.error('Error fetching rules:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const createRule = async (data: any) => {
    try {
      const res = await fetch('/api/automation-rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const result = await res.json();
      if (result.success) {
        fetchRules();
        setIsAddDialogOpen(false);
        setNewRule({
          name: '',
          description: '',
          trigger_type: '',
          actions: [],
          is_active: true,
          priority: 0
        });
      }
    } catch (error) {
      console.error('Error creating rule:', error);
    }
  };

  const updateRule = async (id: string, data: any) => {
    try {
      const res = await fetch(`/api/automation-rules/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const result = await res.json();
      if (result.success) {
        fetchRules();
      }
    } catch (error) {
      console.error('Error updating rule:', error);
    }
  };

  const deleteRule = async (id: string) => {
    try {
      const res = await fetch(`/api/automation-rules/${id}`, {
        method: 'DELETE'
      });
      const result = await res.json();
      if (result.success) {
        fetchRules();
      }
    } catch (error) {
      console.error('Error deleting rule:', error);
    }
  };

  const filteredRules = rules.filter(rule =>
    !searchQuery || 
    rule.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    rule.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleToggle = (rule: any) => {
    updateRule(rule._id, { is_active: !rule.is_active });
  };

  const handleAddAction = () => {
    if (!selectedAction) return;
    setNewRule({
      ...newRule,
      actions: [...newRule.actions, { type: selectedAction, params: {} }]
    });
    setSelectedAction('');
  };

  const handleRemoveAction = (index: number) => {
    setNewRule({
      ...newRule,
      actions: newRule.actions.filter((_, i) => i !== index)
    });
  };

  const handleEdit = (rule: any) => {
    setEditingRule({ ...rule });
    setIsEditDialogOpen(true);
  };

  const handleUpdate = () => {
    if (!editingRule.name.trim() || !editingRule.trigger_type || editingRule.actions.length === 0) return;
    updateRule(editingRule._id, editingRule);
    setIsEditDialogOpen(false);
    setEditingRule(null);
  };

  const handleAddEditAction = () => {
    if (!selectedEditAction) return;
    setEditingRule({
      ...editingRule,
      actions: [...editingRule.actions, { type: selectedEditAction, params: {} }]
    });
    setSelectedEditAction('');
  };

  const handleRemoveEditAction = (index: number) => {
    setEditingRule({
      ...editingRule,
      actions: editingRule.actions.filter((_: any, i: number) => i !== index)
    });
  };

  const handleRun = async (rule: any) => {
    try {
      const res = await fetch(`/api/automation-rules/${rule._id}`, {
        method: 'POST'
      });
      const result = await res.json();
      if (result.success) {
        fetchRules();
      }
    } catch (error) {
      console.error('Error running rule:', error);
    }
  };

  const handleCreateRule = () => {
    if (!newRule.name.trim() || !newRule.trigger_type || newRule.actions.length === 0) return;
    createRule(newRule);
  };

  // Stats
  const activeRules = rules.filter(r => r.is_active).length;
  const totalRuns = rules.reduce((sum, r) => sum + (r.run_count || 0), 0);

  if (isLoading) {
    return (
      <div className="p-6 bg-slate-50 min-h-screen space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-48 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Automation</h1>
          <p className="text-slate-500">Create rules to automate your workflow</p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)} className="bg-blue-500 hover:bg-blue-600">
          <Plus className="w-4 h-4 mr-2" />
          Create Rule
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-50">
              <Zap className="w-5 h-5 text-purple-500" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Total Rules</p>
              <p className="text-2xl font-bold text-slate-900">{rules.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-green-50">
              <Play className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Active Rules</p>
              <p className="text-2xl font-bold text-green-600">{activeRules}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-50">
              <Settings className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Total Executions</p>
              <p className="text-2xl font-bold text-slate-900">{totalRuns.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search rules..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Rules Grid */}
      {filteredRules.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
          <Zap className="w-12 h-12 mx-auto mb-4 text-slate-300" />
          <h3 className="font-semibold text-slate-900 mb-2">No automation rules yet</h3>
          <p className="text-slate-500 mb-4">Create your first rule to automate repetitive tasks</p>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Rule
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredRules.map(rule => (
            <RuleCard
              key={rule._id}
              rule={rule}
              onToggle={handleToggle}
              onEdit={handleEdit}
              onDelete={(rule: any) => deleteRule(rule._id)}
              onRun={(rule: any) => handleRun(rule)}
            />
          ))}
        </div>
      )}

      {/* Add Rule Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Create Automation Rule</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label>Rule Name *</Label>
              <Input
                value={newRule.name}
                onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
                placeholder="e.g., Auto-reply to price inquiries"
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={newRule.description}
                onChange={(e) => setNewRule({ ...newRule, description: e.target.value })}
                placeholder="What does this rule do?"
                rows={2}
              />
            </div>
            <div>
              <Label>Trigger *</Label>
              <Select 
                value={newRule.trigger_type} 
                onValueChange={(v) => setNewRule({ ...newRule, trigger_type: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="When should this rule run?" />
                </SelectTrigger>
                <SelectContent>
                  {triggerOptions.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Actions *</Label>
              <div className="space-y-2 mb-2">
                {newRule.actions.map((action, idx) => (
                  <Badge key={idx} variant="secondary" className="mr-2">
                    {actionOptions.find(a => a.value === action.type)?.label || action.type}
                    <button
                      onClick={() => handleRemoveAction(idx)}
                      className="ml-2 text-slate-400 hover:text-slate-600"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Select value={selectedAction} onValueChange={setSelectedAction}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Add action..." />
                  </SelectTrigger>
                  <SelectContent>
                    {actionOptions.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button 
                  variant="outline" 
                  onClick={handleAddAction}
                  disabled={!selectedAction}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <Label>Active</Label>
              <Switch
                checked={newRule.is_active}
                onCheckedChange={(v) => setNewRule({ ...newRule, is_active: v })}
              />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleCreateRule}
                disabled={!newRule.name.trim() || !newRule.trigger_type || newRule.actions.length === 0}
              >
                Create Rule
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Rule Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Automation Rule</DialogTitle>
          </DialogHeader>
          {editingRule && (
            <div className="space-y-4 mt-4">
              <div>
                <Label>Rule Name *</Label>
                <Input
                  value={editingRule.name}
                  onChange={(e) => setEditingRule({ ...editingRule, name: e.target.value })}
                  placeholder="e.g., Auto-reply to price inquiries"
                />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  value={editingRule.description}
                  onChange={(e) => setEditingRule({ ...editingRule, description: e.target.value })}
                  placeholder="What does this rule do?"
                  rows={2}
                />
              </div>
              <div>
                <Label>Trigger *</Label>
                <Select 
                  value={editingRule.trigger_type} 
                  onValueChange={(v) => setEditingRule({ ...editingRule, trigger_type: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="When should this rule run?" />
                  </SelectTrigger>
                  <SelectContent>
                    {triggerOptions.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Actions *</Label>
                <div className="space-y-2 mb-2">
                  {editingRule.actions.map((action: any, idx: number) => (
                    <Badge key={idx} variant="secondary" className="mr-2">
                      {actionOptions.find(a => a.value === action.type)?.label || action.type}
                      <button
                        onClick={() => handleRemoveEditAction(idx)}
                        className="ml-2 text-slate-400 hover:text-slate-600"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Select value={selectedEditAction} onValueChange={setSelectedEditAction}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Add action..." />
                    </SelectTrigger>
                    <SelectContent>
                      {actionOptions.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button 
                    variant="outline" 
                    onClick={handleAddEditAction}
                    disabled={!selectedEditAction}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <Label>Active</Label>
                <Switch
                  checked={editingRule.is_active}
                  onCheckedChange={(v) => setEditingRule({ ...editingRule, is_active: v })}
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleUpdate}
                  disabled={!editingRule.name.trim() || !editingRule.trigger_type || editingRule.actions.length === 0}
                >
                  Update Rule
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}