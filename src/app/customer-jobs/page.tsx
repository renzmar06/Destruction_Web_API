'use client';
import React, { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User } from "lucide-react";
import JobsView from "@/components/portal/JobsView";
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { fetchJobs } from '@/redux/slices/jobsSlice';
import { fetchCustomers } from '@/redux/slices/customersSlice';
import { loadUserFromStorage } from '@/redux/slices/authSlice';

export default function CustomerJobs() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(state => state.auth);
  const { customers, loading: customersLoading } = useAppSelector(state => state.customers);
  const { jobs, loading: jobsLoading } = useAppSelector(state => state.jobs);

  const [customer, setCustomer] = useState<any>(null);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);

  useEffect(() => {
    dispatch(loadUserFromStorage());
    dispatch(fetchCustomers());
    dispatch(fetchJobs());
  }, [dispatch]);

  useEffect(() => {
    if (user && customers.length > 0) {
      if ((user as any).role === 'admin') {
        if (selectedCustomerId) {
          const selected = customers.find(c => c._id === selectedCustomerId || c.id === selectedCustomerId);
          setCustomer(selected || null);
        } else if (customers.length > 0) {
          setSelectedCustomerId((customers[0]._id || customers[0].id) || null);
          setCustomer(customers[0]);
        }
      } else {

        // Regular customer/user — match by email
        const matchedCustomer = customers.find(c => c.email === user.email);
        setCustomer(matchedCustomer || null);
      }
    }
  }, [user, customers, selectedCustomerId]);

  if (!user || customersLoading || jobsLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-slate-900 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md text-center bg-white rounded-2xl border border-slate-200 p-8">
          <User className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Customer Profile Not Found</h2>
          <p className="text-slate-600 mb-4">
            Your email ({user.email}) is not associated with a customer profile.
          </p>
          <p className="text-sm text-slate-500">
            Please contact support to get your account set up.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Admin Preview Selector */}
        {(user as any)?.role === 'admin' && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
            <p className="text-sm font-medium text-amber-900 mb-2">Admin Preview Mode</p>
            <Select value={selectedCustomerId || ''} onValueChange={setSelectedCustomerId}>
              <SelectTrigger className="w-full md:w-96 bg-white">
                <SelectValue placeholder="Select customer to preview" />
              </SelectTrigger>
              <SelectContent>
                {customers.map(c => (
                  <SelectItem key={c._id || c.id} value={(c._id || c.id) || ''}>
                    {c.legal_company_name || c.display_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Jobs</h1>
          <p className="text-slate-600 mt-1">Track operational execution and completion</p>
        </div>

        {/* Content */}
        <JobsView 
          userId={user.id || customer.id} 
          selectedJob={null}
          onBack={() => {}}
        />
      </div>
    </div>
  );
}