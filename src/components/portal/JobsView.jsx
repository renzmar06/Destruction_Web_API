import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Briefcase, Calendar, MapPin, CheckCircle } from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { useAppSelector } from '@/redux/hooks';



const statusConfig = {
  scheduled: { label: 'Scheduled', className: 'bg-blue-100 text-blue-700' },
  in_progress: { label: 'In Progress', className: 'bg-amber-100 text-amber-700' },
  completed: { label: 'Completed', className: 'bg-green-100 text-green-700' },
  archived: { label: 'Archived', className: 'bg-slate-100 text-slate-600' }
};

export default function JobsView({ userId=null }) {

  const { jobs, loading } = useAppSelector(state => state.jobs);
  
  const customerJobs = jobs.filter(job => {
    if (userId === null) {
      return true; // Show all jobs if userId is null
    }
    return job.customer_id === userId;
  });
  const isLoading = loading;
  if (isLoading) {
    return <div className="text-center py-12 text-slate-500">Loading jobs...</div>;
  }

  if (customerJobs.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <Briefcase className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500">No jobs found</p>
          <p className="text-sm text-slate-400 mt-2">Jobs will appear here once estimates are accepted</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {customerJobs.map((job) => (
        <motion.div
          key={job._id || job.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-bold text-slate-900">{job.job_id}</h3>
                    <Badge className={statusConfig[job.job_status].className}>
                      {statusConfig[job.job_status].label}
                    </Badge>
                  </div>
                  <p className="text-slate-600">{job.job_name}</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Calendar className="w-4 h-4" />
                  <span>Scheduled: {job.scheduled_date ? format(new Date(job.scheduled_date), 'MMMM d, yyyy') : 'Not scheduled'}</span>
                </div>

                {job.actual_start_date && (
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>Started: {format(new Date(job.actual_start_date), 'MMMM d, yyyy')}</span>
                  </div>
                )}

                {job.actual_completion_date && (
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>Completed: {format(new Date(job.actual_completion_date), 'MMMM d, yyyy')}</span>
                  </div>
                )}

                {job.destruction_method && (
                  <div className="bg-slate-50 rounded-lg p-3 text-sm">
                    <p className="font-medium text-slate-900 mb-1">Destruction Method</p>
                    <p className="text-slate-600">
                      {job.destruction_method
                        .replace(/_/g, ' ')
                        .replace(/\b\w/g, l => l.toUpperCase())}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}