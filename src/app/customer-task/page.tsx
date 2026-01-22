'use client';

import { toast } from 'sonner';
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Edit, Trash2, Calendar, User, AlertCircle, CheckCircle, Clock, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';

interface CustomerTask {
  _id: string;
  title: string;
  description: string;
  status: 'to_do' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  customer_id: string;
  assigned_to: string;
  due_date?: string;
  completed_date?: string;
  tags: string;
  related_to: 'none' | 'customer' | 'estimate' | 'job' | 'invoice';
  createdAt: string;
  updatedAt: string;
}

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
}

const statusConfig = {
  to_do: { label: 'To Do', className: 'bg-blue-100 text-blue-700 border-blue-300', icon: Clock },
  in_progress: { label: 'In Progress', className: 'bg-amber-100 text-amber-700 border-amber-300', icon: AlertCircle },
  completed: { label: 'Completed', className: 'bg-green-100 text-green-700 border-green-300', icon: CheckCircle },
  cancelled: { label: 'Cancelled', className: 'bg-red-100 text-red-700 border-red-300', icon: X }
};

const priorityConfig = {
  low: { label: 'Low', className: 'bg-gray-100 text-gray-700' },
  medium: { label: 'Medium', className: 'bg-blue-100 text-blue-700' },
  high: { label: 'High', className: 'bg-orange-100 text-orange-700' },
  urgent: { label: 'Urgent', className: 'bg-red-100 text-red-700' }
};

export default function CustomerTaskPage() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<CustomerTask[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<CustomerTask | null>(null);
  const [filters, setFilters] = useState({
    status: 'all',
    priority: 'all',
    assignedTo: 'all'
  });

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'to_do' as CustomerTask['status'],
    priority: 'medium' as CustomerTask['priority'],
    customer_id: user?.id || '',
    assigned_to: '',
    due_date: '',
    tags: '',
    related_to: 'none' as CustomerTask['related_to']
  });

  useEffect(() => {
    if (user?.id) {
      fetchTasks();
      fetchUsers();
    }
  }, [user?.id]);

  useEffect(() => {
    if (user) {
      setFormData(prev => ({ ...prev, customer_id: user.id }));
    }
  }, [user]);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users');
      const data = await response.json();
      if (data.success) {
        setUsers(data.data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchTasks = async () => {
    if (!user?.id) return;
    
    try {
      const response = await fetch(`/api/customer-tasks?customer_id=${user.id}`);
      const data = await response.json();
      if (data.success) {
        setTasks(data.data);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = editingTask ? `/api/customer-tasks/${editingTask._id}` : '/api/customer-tasks';
      const method = editingTask ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (data.success) {
        await fetchTasks();
        resetForm();
        toast.success(editingTask ? 'Task updated successfully!' : 'Task created successfully!');
      } else {
        toast.error(data.message || 'Operation failed');
      }
    } catch (error) {
      console.error('Error saving task:', error);
      toast.error('Error saving task');
    }
  };

  const handleEdit = (task: CustomerTask) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      customer_id: task.customer_id,
      assigned_to: task.assigned_to,
      due_date: task.due_date ? new Date(task.due_date).toISOString().split('T')[0] : '',
      tags: task.tags,
      related_to: task.related_to
    });
    setShowForm(true);
  };

  const handleDelete = async (taskId: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    
    try {
      const response = await fetch(`/api/customer-tasks/${taskId}`, {
        method: 'DELETE'
      });
      
      const data = await response.json();
      
      if (data.success) {
        await fetchTasks();
        toast.success('Task deleted successfully!');
      } else {
        toast.error(data.message || 'Delete failed');
      }
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error('Error deleting task');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      status: 'to_do' as CustomerTask['status'],
      priority: 'medium' as CustomerTask['priority'],
      customer_id: user?.id || '',
      assigned_to: '',
      due_date: '',
      tags: '',
      related_to: 'none' as CustomerTask['related_to']
    });
    setEditingTask(null);
    setShowForm(false);
  };

  const filteredTasks = tasks.filter(task => {
    if (filters.status === 'active' && task.status === 'completed') return false;
    if (filters.status !== 'all' && filters.status !== 'active' && task.status !== filters.status) return false;
    if (filters.priority !== 'all' && task.priority !== filters.priority) return false;
    if (filters.assignedTo !== 'all' && task.assigned_to !== filters.assignedTo) return false;
    return true;
  });

  const isOverdue = (dueDate?: string) => {
    if (!dueDate || formData.status === 'completed') return false;
    return new Date(dueDate) < new Date();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-500">Loading tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Tasks</h1>
            <p className="text-slate-600 mt-1">Manage and track your tasks</p>
          </div>
          <Button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 hover:bg-blue-700 gap-2"
          >
            <Plus className="w-4 h-4" />
            New Task
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-blue-200 bg-white shadow-sm">
            <CardContent className="p-5 text-center">
              <p className="text-sm font-medium text-slate-600">Total Tasks</p>
              <p className="text-3xl font-bold text-slate-900 mt-1">{tasks.length}</p>
            </CardContent>
          </Card>

          <Card className="border-blue-200 bg-white shadow-sm">
            <CardContent className="p-5 text-center">
              <p className="text-sm font-medium text-blue-600">To Do</p>
              <p className="text-3xl font-bold text-blue-700 mt-1">
                {tasks.filter(t => t.status === 'to_do').length}
              </p>
            </CardContent>
          </Card>

          <Card className="border-amber-200 bg-white shadow-sm">
            <CardContent className="p-5 text-center">
              <p className="text-sm font-medium text-amber-600">In Progress</p>
              <p className="text-3xl font-bold text-amber-700 mt-1">
                {tasks.filter(t => t.status === 'in_progress').length}
              </p>
            </CardContent>
          </Card>

          <Card className="border-green-200 bg-white shadow-sm">
            <CardContent className="p-5 text-center">
              <p className="text-sm font-medium text-green-600">Completed</p>
              <p className="text-3xl font-bold text-green-700 mt-1">
                {tasks.filter(t => t.status === 'completed').length}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="bg-white border rounded-lg p-4 shadow-sm">
          <div className="flex items-center gap-6 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-slate-700">Filters:</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-600">Status:</span>
              <Select value={filters.status} onValueChange={(value) => setFilters({...filters, status: value})}>
                <SelectTrigger className="w-36 h-9">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="to_do">To Do</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-600">Priority:</span>
              <Select value={filters.priority} onValueChange={(value) => setFilters({...filters, priority: value})}>
                <SelectTrigger className="w-32 h-9">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-600">Assigned to:</span>
              <Select value={filters.assignedTo} onValueChange={(value) => setFilters({...filters, assignedTo: value})}>
                <SelectTrigger className="w-40 h-9">
                  <SelectValue placeholder="Assigned to" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  {users.map(u => (
                    <SelectItem key={u._id} value={u.name}>
                      {u.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Tasks List */}
        {filteredTasks.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Calendar className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 mb-2">No Tasks Yet</h3>
              <p className="text-slate-600 mb-6">Create your first customer task to get started.</p>
              <Button onClick={() => setShowForm(true)} className="bg-blue-600 hover:bg-blue-700">
                Create First Task
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredTasks.map((task) => {
              const statusInfo = statusConfig[task.status];
              const priorityInfo = priorityConfig[task.priority];
              const StatusIcon = statusInfo.icon;
              const overdue = isOverdue(task.due_date);

              return (
                <Card key={task._id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-5">
                    <div className="flex items-start gap-4">
                      <Checkbox />

                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-3 flex-wrap">
                          <h3 className="text-lg font-semibold text-slate-900">
                            {task.title}
                          </h3>
                          <Badge 
                            variant="outline" 
                            className={`${statusInfo.className} px-3 py-0.5 text-xs font-medium border`}
                          >
                            <StatusIcon className="w-3.5 h-3.5 mr-1" />
                            {statusInfo.label}
                          </Badge>
                          <Badge 
                            className={`${priorityInfo.className} px-2.5 py-0.5 text-xs`}
                          >
                            {priorityInfo.label}
                          </Badge>
                        </div>

                        <p className="text-slate-600 text-sm leading-relaxed">
                          {task.description || 'No description provided'}
                        </p>

                        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-600">
                          {task.due_date && (
                            <div className="flex items-center gap-1.5">
                              <Calendar className="w-4 h-4" />
                              <span className={overdue ? 'text-red-600 font-medium' : ''}>
                                Due {new Date(task.due_date).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric'
                                })}
                                {overdue && <span className="ml-1 text-red-600 font-semibold">(Overdue)</span>}
                              </span>
                            </div>
                          )}

                          {task.assigned_to && (
                            <div className="flex items-center gap-1.5 bg-blue-50 px-3 py-1 rounded-full text-xs font-medium">
                              <User className="w-3.5 h-3.5" />
                              Assigned to: {task.assigned_to}
                            </div>
                          )}

                          <div className="flex items-center gap-1.5 bg-purple-50 px-3 py-1 rounded-full text-xs font-medium">
                            <User className="w-3.5 h-3.5" />
                            customer: {task.customer_id.slice(0, 8)}...
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(task)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleDelete(task._id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Task Form Modal */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold">
                      {editingTask ? 'Edit Task' : 'Create New Task'}
                    </h2>
                    <Button variant="outline" size="sm" onClick={resetForm}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Title *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Task title"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Description *
                      </label>
                      <textarea
                        required
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full p-3 border border-slate-300 rounded-lg h-28 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Task description"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Priority
                        </label>
                        <select
                          value={formData.priority}
                          onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                          className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                          <option value="urgent">Urgent</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Status
                        </label>
                        <select
                          value={formData.status}
                          onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                          className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="to_do">To Do</option>
                          <option value="in_progress">In Progress</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div className="hidden">
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Customer ID
                        </label>
                        <input
                          type="text"
                          value={formData.customer_id}
                          readOnly
                          className="w-full p-3 border border-slate-300 rounded-lg bg-slate-100 text-slate-600"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Assigned To
                        </label>
                        <select
                          value={formData.assigned_to}
                          onChange={(e) => setFormData({ ...formData, assigned_to: e.target.value })}
                          className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">Select user</option>
                          {users.map(u => (
                            <option key={u._id} value={u.name}>
                              {u.name} ({u.role})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Due Date
                        </label>
                        <input
                          type="date"
                          value={formData.due_date}
                          onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                          className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Related To
                      </label>
                      <select
                        value={formData.related_to}
                        onChange={(e) => setFormData({ ...formData, related_to: e.target.value as any })}
                        className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="none">None</option>
                        <option value="customer">Customer</option>
                        <option value="estimate">Estimate</option>
                        <option value="job">Job</option>
                        <option value="invoice">Invoice</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Tags
                      </label>
                      <textarea
                        value={formData.tags}
                        onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                        className="w-full p-3 border border-slate-300 rounded-lg h-20 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="comma separated tags..."
                      />
                    </div>

                    <div className="flex justify-end gap-4 pt-6">
                      <Button type="button" variant="outline" onClick={resetForm}>
                        Cancel
                      </Button>
                      <Button type="submit" className="bg-blue-600 hover:bg-blue-700 px-6">
                        {editingTask ? 'Update Task' : 'Create Task'}
                      </Button>
                    </div>
                  </form>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}