import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Eye, FileText, Image, Search } from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";

const statusConfig = {
  scheduled: { label: 'Scheduled', className: 'bg-blue-100 text-blue-700 border-blue-200' },
  in_progress: { label: 'In Progress', className: 'bg-amber-100 text-amber-700 border-amber-200' },
  completed: { label: 'Completed', className: 'bg-green-100 text-green-700 border-green-200' }
};

export default function JobList({ jobs, customers, onView, onGenerateInvoice, onGenerateAffidavit, isLoading }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [customerFilter, setCustomerFilter] = useState('all');

  const getCustomerName = (customerId) => {
    const customer = customers.find(c => c._id === customerId);
    return customer?.legal_company_name || customer?.display_name || 'Unknown';
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.job_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.job_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         getCustomerName(job.customer_id).toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || job.job_status === statusFilter;
    const matchesCustomer = customerFilter === 'all' || job.customer_id === customerFilter;
    return matchesSearch && matchesStatus && matchesCustomer;
  });

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
      <div className="p-6 border-b border-slate-100 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search jobs..."
            className="pl-10 h-12 border-slate-200"
          />
        </div>
        
        <div className="flex gap-3">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>

          <Select value={customerFilter} onValueChange={setCustomerFilter}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Customer" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Customers</SelectItem>
              {customers.map(customer => (
                <SelectItem key={customer._id} value={customer._id}>
                  {customer.legal_company_name || customer.display_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50">
              <TableHead className="font-semibold">Job ID</TableHead>
              <TableHead className="font-semibold">Job Name</TableHead>
              <TableHead className="font-semibold">Customer</TableHead>
              <TableHead className="font-semibold">Status</TableHead>
              <TableHead className="font-semibold">Scheduled</TableHead>
              <TableHead className="font-semibold">Completed</TableHead>
              <TableHead className="font-semibold text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array(5).fill(0).map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={7}>
                    <div className="h-4 bg-slate-100 rounded animate-pulse" />
                  </TableCell>
                </TableRow>
              ))
            ) : filteredJobs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12 text-slate-500">
                  {searchTerm || statusFilter !== 'all' || customerFilter !== 'all' 
                    ? 'No jobs found' 
                    : 'No jobs yet. Create a job from an accepted estimate.'}
                </TableCell>
              </TableRow>
            ) : (
              filteredJobs.map((job) => (
                <motion.tr
                  key={job._id || job.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                >
                  <TableCell className="font-medium text-slate-900">{job.job_id}</TableCell>
                  <TableCell className="text-slate-700">{job.job_name}</TableCell>
                  <TableCell className="text-slate-700">{getCustomerName(job.customer_id)}</TableCell>
                  <TableCell>
                    <Badge className={statusConfig[job.job_status]?.className}>
                      {statusConfig[job.job_status]?.label}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-slate-600 text-sm">
                    {job.scheduled_date ? format(new Date(job.scheduled_date), 'MMM d, yyyy') : 'N/A'}
                  </TableCell>
                  <TableCell className="text-slate-600 text-sm">
                    {job.actual_completion_date ? format(new Date(job.actual_completion_date), 'MMM d, yyyy') : '-'}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onView(job)}
                        className="h-8 gap-2"
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </Button>
                      {job.job_status === 'completed' && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onGenerateInvoice(job)}
                            className="h-8 gap-2 text-green-600 hover:text-green-700"
                          >
                            <FileText className="w-4 h-4" />
                            Invoice
                          </Button>
                          {job.requires_affidavit && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onGenerateAffidavit(job)}
                              className="h-8 gap-2 text-purple-600 hover:text-purple-700"
                            >
                              <FileText className="w-4 h-4" />
                              Affidavit
                            </Button>
                          )}
                        </>
                      )}
                    </div>
                  </TableCell>
                </motion.tr>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}