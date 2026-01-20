import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "lucide-react";

export default function DateRangeFilter({ dateRange, onDateRangeChange, customers, jobs, selectedCustomer, selectedJob, onCustomerChange, onJobChange }) {
  const today = new Date();
  const firstDayThisMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
  const lastDayThisMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];
  const firstDayLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1).toISOString().split('T')[0];
  const lastDayLastMonth = new Date(today.getFullYear(), today.getMonth(), 0).toISOString().split('T')[0];

  const handlePresetChange = (preset) => {
    if (preset === 'this_month') {
      onDateRangeChange({ startDate: firstDayThisMonth, endDate: lastDayThisMonth, preset: 'this_month' });
    } else if (preset === 'last_month') {
      onDateRangeChange({ startDate: firstDayLastMonth, endDate: lastDayLastMonth, preset: 'last_month' });
    } else if (preset === 'custom') {
      onDateRangeChange({ ...dateRange, preset: 'custom' });
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="w-5 h-5 text-slate-700" />
        <h3 className="font-semibold text-slate-900">Filters</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="space-y-2">
          <Label>Date Range</Label>
          <Select value={dateRange.preset} onValueChange={handlePresetChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="this_month">This Month</SelectItem>
              <SelectItem value="last_month">Last Month</SelectItem>
              <SelectItem value="custom">Custom Range</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {dateRange.preset === 'custom' && (
          <>
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Input
                type="date"
                value={dateRange.startDate}
                onChange={(e) => onDateRangeChange({ ...dateRange, startDate: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>End Date</Label>
              <Input
                type="date"
                value={dateRange.endDate}
                onChange={(e) => onDateRangeChange({ ...dateRange, endDate: e.target.value })}
              />
            </div>
          </>
        )}

        <div className="space-y-2">
          <Label>Customer (Optional)</Label>
          <Select value={selectedCustomer} onValueChange={onCustomerChange}>
            <SelectTrigger>
              <SelectValue placeholder="All Customers" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Customers</SelectItem>
              {customers.map(customer => (
                <SelectItem key={customer.id} value={customer.id}>
                  {customer.legal_company_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Job (Optional)</Label>
          <Select value={selectedJob} onValueChange={onJobChange}>
            <SelectTrigger>
              <SelectValue placeholder="All Jobs" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Jobs</SelectItem>
              {jobs.map(job => (
                <SelectItem key={job.id} value={job.id}>
                  {job.job_id} - {job.job_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}