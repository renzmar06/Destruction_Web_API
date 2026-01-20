import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { CheckCircle2, Clock, AlertCircle, Circle, Trash2, Edit, Link as LinkIcon } from "lucide-react";
import { format, isPast, isToday } from 'date-fns';

const priorityConfig = {
  low: { class: 'bg-slate-100 text-slate-700', label: 'Low' },
  medium: { class: 'bg-blue-100 text-blue-700', label: 'Medium' },
  high: { class: 'bg-orange-100 text-orange-700', label: 'High' },
  urgent: { class: 'bg-red-100 text-red-700', label: 'Urgent' }
};

const statusConfig = {
  todo: { icon: Circle, class: 'text-slate-500', label: 'To Do' },
  in_progress: { icon: Clock, class: 'text-blue-600', label: 'In Progress' },
  completed: { icon: CheckCircle2, class: 'text-green-600', label: 'Completed' },
  cancelled: { icon: AlertCircle, class: 'text-red-600', label: 'Cancelled' }
};

export default function TaskList({ tasks, onEdit, onDelete, onToggleComplete, onNavigateToRelated }) {
  const getDateColor = (dueDate, status) => {
    if (!dueDate || status === 'completed' || status === 'cancelled') return 'text-slate-600';
    if (isPast(new Date(dueDate)) && !isToday(new Date(dueDate))) return 'text-red-600 font-semibold';
    if (isToday(new Date(dueDate))) return 'text-orange-600 font-semibold';
    return 'text-slate-600';
  };

  if (tasks.length === 0) {
    return (
      <div className="text-center py-12 text-slate-500">
        No tasks yet. Create your first task to get started.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {tasks.map((task) => {
        const StatusIcon = statusConfig[task.task_status]?.icon || Circle;
        const isOverdue = task.due_date && isPast(new Date(task.due_date)) && !isToday(new Date(task.due_date)) && task.task_status !== 'completed' && task.task_status !== 'cancelled';
        
        return (
          <div
            key={task.id}
            className={`bg-white rounded-lg border-2 p-4 transition-all hover:shadow-md ${
              task.task_status === 'completed' ? 'border-green-200 bg-green-50/30' : 
              isOverdue ? 'border-red-200 bg-red-50/30' : 
              'border-slate-200'
            }`}
          >
            <div className="flex items-start gap-4">
              <div className="pt-1">
                <Checkbox
                  checked={task.task_status === 'completed'}
                  onCheckedChange={() => onToggleComplete(task)}
                  className="h-5 w-5"
                />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex-1">
                    <h3 className={`font-semibold text-slate-900 ${task.task_status === 'completed' ? 'line-through text-slate-500' : ''}`}>
                      {task.title}
                    </h3>
                    {task.description && (
                      <p className="text-sm text-slate-600 mt-1 line-clamp-2">
                        {task.description}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(task)}
                      className="h-8 w-8"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(task)}
                      className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-sm">
                  <div className="flex items-center gap-1.5">
                    <StatusIcon className={`w-4 h-4 ${statusConfig[task.task_status]?.class}`} />
                    <span className="text-slate-600">{statusConfig[task.task_status]?.label}</span>
                  </div>

                  <span className="text-slate-300">•</span>

                  <Badge className={priorityConfig[task.priority]?.class}>
                    {priorityConfig[task.priority]?.label}
                  </Badge>

                  {task.due_date && (
                    <>
                      <span className="text-slate-300">•</span>
                      <span className={getDateColor(task.due_date, task.task_status)}>
                        Due {format(new Date(task.due_date), 'MMM d, yyyy')}
                        {isOverdue && ' (Overdue)'}
                      </span>
                    </>
                  )}

                  {task.assigned_to_name && (
                    <>
                      <span className="text-slate-300">•</span>
                      <span className="text-slate-600">
                        Assigned to {task.assigned_to_name}
                      </span>
                    </>
                  )}

                  {task.related_to_type !== 'none' && task.related_to_name && (
                    <>
                      <span className="text-slate-300">•</span>
                      <button
                        onClick={() => onNavigateToRelated(task)}
                        className="flex items-center gap-1 text-blue-600 hover:text-blue-700 hover:underline"
                      >
                        <LinkIcon className="w-3 h-3" />
                        {task.related_to_type}: {task.related_to_name}
                      </button>
                    </>
                  )}
                </div>

                {task.tags && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {task.tags.split(',').map((tag, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {tag.trim()}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}