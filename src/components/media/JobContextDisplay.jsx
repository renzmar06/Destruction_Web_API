import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Briefcase, Building2, Hash } from "lucide-react";

const statusConfig = {
  scheduled: { label: 'Scheduled', className: 'bg-blue-100 text-blue-700 border-blue-200' },
  in_progress: { label: 'In Progress', className: 'bg-amber-100 text-amber-700 border-amber-200' },
  completed: { label: 'Completed', className: 'bg-green-100 text-green-700 border-green-200' }
};

export default function JobContextDisplay({ job }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div>
            <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
              <Hash className="w-4 h-4" />
              <span>Job ID</span>
            </div>
            <p className="font-semibold text-slate-900">{job.job_id}</p>
          </div>

          <div className="h-12 w-px bg-slate-200" />

          <div>
            <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
              <Briefcase className="w-4 h-4" />
              <span>Job Name</span>
            </div>
            <p className="font-semibold text-slate-900">{job.job_name}</p>
          </div>

          <div className="h-12 w-px bg-slate-200" />

          <div>
            <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
              <Building2 className="w-4 h-4" />
              <span>Customer</span>
            </div>
            <p className="font-semibold text-slate-900">{job.customer_name}</p>
          </div>
        </div>

        <div>
          <div className="text-sm text-slate-500 mb-1 text-right">Status</div>
          <Badge className={`${statusConfig[job.job_status]?.className} text-base px-4 py-1`}>
            {statusConfig[job.job_status]?.label}
          </Badge>
        </div>
      </div>

      {job.job_status === 'completed' && (
        <div className="mt-4 pt-4 border-t border-slate-200 bg-amber-50 rounded-lg p-3 text-sm text-amber-800">
          <strong>Job Completed:</strong> Media uploads are disabled. Existing media is locked and cannot be deleted.
        </div>
      )}
    </div>
  );
}