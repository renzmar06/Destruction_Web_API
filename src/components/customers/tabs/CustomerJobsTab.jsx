import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function CustomerJobsTab({ customer, jobs, onCreateJob }) {
  const statusConfig = {
    scheduled: { label: 'Scheduled', class: 'bg-blue-100 text-blue-700' },
    in_progress: { label: 'In Progress', class: 'bg-yellow-100 text-yellow-700' },
    completed: { label: 'Completed', class: 'bg-green-100 text-green-700' },
    archived: { label: 'Archived', class: 'bg-slate-100 text-slate-700' }
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
      <div className="p-6 border-b border-slate-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">Jobs</h3>
          <Button 
            onClick={onCreateJob}
            size="sm"
            className="bg-green-600 hover:bg-green-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Job
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50">
              <TableHead className="font-semibold">JOB ID</TableHead>
              <TableHead className="font-semibold">JOB NAME</TableHead>
              <TableHead className="font-semibold">SCHEDULED DATE</TableHead>
              <TableHead className="font-semibold">STATUS</TableHead>
              <TableHead className="font-semibold">DESTRUCTION METHOD</TableHead>
              <TableHead className="font-semibold text-right">ACTION</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {jobs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-slate-500">
                  No jobs yet. Create the first job for this customer.
                </TableCell>
              </TableRow>
            ) : (
              jobs.map((job) => {
                const config = statusConfig[job.job_status] || statusConfig.scheduled;
                
                return (
                  <TableRow key={job.id} className="hover:bg-slate-50">
                    <TableCell className="font-medium text-slate-900">
                      {job.job_id}
                    </TableCell>
                    <TableCell className="text-slate-700">
                      {job.job_name}
                    </TableCell>
                    <TableCell className="text-slate-700">
                      {new Date(job.scheduled_date).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric', 
                        year: 'numeric' 
                      })}
                    </TableCell>
                    <TableCell>
                      <Badge className={config.class}>
                        {config.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-slate-700">
                      {job.destruction_method?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || '—'}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="link" size="sm" className="text-blue-600 h-auto p-0">
                        View / Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}