import React from 'react';
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Link2 } from "lucide-react";

export default function JobLinkageSection({ data, onChange, jobs, isReadOnly }) {
  const handleJobChange = (jobId) => {
    const job = jobs.find(j => (j._id || j.id) === jobId);
    onChange({
      ...data,
      job_id: jobId || null,
      job_reference: job ? job.job_number : null
    });
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
      <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
        <Link2 className="w-5 h-5 text-slate-700" />
        <h3 className="font-semibold text-slate-900">Job Association</h3>
      </div>

      <div className="space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
          <strong>Note:</strong> Link this expense to a job to include it in job-level P&L. Unlinked expenses only feed general P&L.
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="job_id">Link to Job (Optional)</Label>
            <Select
              value={data.job_id || 'none'}
              onValueChange={(value) => handleJobChange(value === 'none' ? null : value)}
              disabled={isReadOnly}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a job" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No Job Link</SelectItem>
                {jobs.map(job => (
                  <SelectItem key={job._id || job.id} value={job._id || job.id}>
                    {job.job_number} - {job.job_name || job.customer_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="job_reference">Job Reference</Label>
            <Input
              id="job_reference"
              value={data.job_reference || 'Not linked'}
              disabled
              className="bg-slate-50"
            />
          </div>
        </div>
      </div>
    </div>
  );
}