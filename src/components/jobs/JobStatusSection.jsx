import React from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle, Clock } from "lucide-react";

const statusConfig = {
  scheduled: { 
    label: 'Scheduled', 
    icon: Clock,
    className: 'bg-blue-100 text-blue-700 border-blue-200',
    nextStatus: 'in_progress',
    nextLabel: 'Start Job'
  },
  in_progress: { 
    label: 'In Progress', 
    icon: AlertCircle,
    className: 'bg-amber-100 text-amber-700 border-amber-200',
    nextStatus: 'completed',
    nextLabel: 'Complete Job'
  },
  completed: { 
    label: 'Completed', 
    icon: CheckCircle,
    className: 'bg-green-100 text-green-700 border-green-200',
    nextStatus: null,
    nextLabel: null
  },
  archived: {
    label: 'Archived',
    icon: AlertCircle,
    className: 'bg-slate-100 text-slate-600 border-slate-200',
    nextStatus: null,
    nextLabel: null
  }
};

export default function JobStatusSection({ data, onChange, canChangeStatus }) {
  const currentConfig = statusConfig[data.job_status || 'scheduled'];
  const Icon = currentConfig.icon;

  const handleStatusChange = () => {
    if (!currentConfig.nextStatus) return;

    if (currentConfig.nextStatus === 'in_progress') {
      onChange({
        ...data,
        job_status: 'in_progress',
        started_timestamp: new Date().toISOString(),
        actual_start_date: data.actual_start_date || new Date().toISOString().split('T')[0]
      });
    } else if (currentConfig.nextStatus === 'completed') {
      if (!data.actual_completion_date) {
        alert('Please set the Actual Completion Date before marking the job as completed.');
        return;
      }
      onChange({
        ...data,
        job_status: 'completed',
        completed_timestamp: new Date().toISOString()
      });
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
      <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
        <Icon className="w-5 h-5 text-slate-700" />
        <h3 className="font-semibold text-slate-900">Job Status</h3>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Badge className={`${currentConfig.className} text-base px-4 py-2`}>
            {currentConfig.label}
          </Badge>
          {data.started_timestamp && (
            <span className="text-sm text-slate-500">
              Started: {new Date(data.started_timestamp).toLocaleDateString()}
            </span>
          )}
          {data.completed_timestamp && (
            <span className="text-sm text-slate-500">
              Completed: {new Date(data.completed_timestamp).toLocaleDateString()}
            </span>
          )}
        </div>

        {currentConfig.nextStatus && canChangeStatus && (
          <Button
            onClick={handleStatusChange}
            className="bg-slate-900 hover:bg-slate-800"
          >
            {currentConfig.nextLabel}
          </Button>
        )}
      </div>

      {data.job_status === 'completed' && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-sm text-green-800">
          <strong>Job Completed:</strong> Core details are now locked. You can generate invoices and affidavits.
        </div>
      )}

      {data.job_status !== 'completed' && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
          <strong>Status Workflow:</strong> Scheduled → In Progress → Completed. Once completed, core details become read-only.
        </div>
      )}
    </div>
  );
}