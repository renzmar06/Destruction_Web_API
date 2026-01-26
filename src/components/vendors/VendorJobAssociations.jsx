import React, { useState, useEffect } from 'react';
import { Badge } from "@/components/ui/badge";
import { Briefcase, Calendar, MapPin } from 'lucide-react';
import { format } from 'date-fns';

export default function VendorJobAssociations({ vendor }) {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVendorJobs();
  }, [vendor.vendor_name]);

  const fetchVendorJobs = async () => {
    try {
      const response = await fetch('/api/jobs');
      const result = await response.json();
      if (result.success) {
        const filtered = result.data.filter(job => 
          job.materials?.some(m => m.vendor === vendor.vendor_name) ||
          job.vendor_name === vendor.vendor_name
        );
        setJobs(filtered);
      }
    } catch (error) {
      console.error('Error fetching vendor jobs:', error);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  const statusConfig = {
    pending: { label: 'Pending', class: 'bg-amber-100 text-amber-700' },
    in_progress: { label: 'In Progress', class: 'bg-blue-100 text-blue-700' },
    completed: { label: 'Completed', class: 'bg-green-100 text-green-700' },
    cancelled: { label: 'Cancelled', class: 'bg-red-100 text-red-700' }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-slate-200 rounded w-1/4"></div>
          <div className="h-20 bg-slate-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-slate-200">
      <div className="p-6 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <Briefcase className="w-5 h-5 text-slate-600" />
          <h3 className="text-lg font-semibold text-slate-900">Job Associations</h3>
          <Badge variant="secondary">{jobs.length} jobs</Badge>
        </div>
      </div>

      {jobs.length === 0 ? (
        <div className="p-6 text-center">
          <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500">No job associations for this vendor</p>
          <p className="text-sm text-slate-400 mt-2">Jobs with vendor materials will appear here</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Job #</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {jobs.map((job) => (
                <tr key={job._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{job.job_number}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{job.customer_name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-slate-400" />
                      {job.job_location || 'Not specified'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      {format(new Date(job.scheduled_date), 'MMM d, yyyy')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge className={statusConfig[job.job_status]?.class || 'bg-slate-100 text-slate-700'}>
                      {statusConfig[job.job_status]?.label || job.job_status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${job.total_amount?.toFixed(2) || '0.00'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}