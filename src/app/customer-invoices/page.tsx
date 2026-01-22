'use client';
import React, { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, CheckCircle, AlertCircle } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import InvoicesView from "@/components/portal/InvoicesView";
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { fetchInvoices } from '@/redux/slices/invoicesSlice';
import { fetchCustomers } from '@/redux/slices/customersSlice';
import { loadUserFromStorage } from '@/redux/slices/authSlice';



export default function CustomerInvoices() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(state => state.auth);
  const { customers, loading: customersLoading } = useAppSelector(state => state.customers);
  const { invoices, loading: invoicesLoading } = useAppSelector(state => state.invoices);
  
  const [customer, setCustomer] = useState<any>(null);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null);

  useEffect(() => {
    dispatch(loadUserFromStorage());
    dispatch(fetchCustomers());
    dispatch(fetchInvoices());
  }, [dispatch]);

  // Simulate URL payment status (for testing)
  useEffect(() => {
    // You can test payment status by adding ?payment=success or ?payment=cancelled to URL
    const urlParams = new URLSearchParams(window.location.search);
    const payment = urlParams.get('payment');
    if (payment === 'success') {
      setPaymentStatus('success');
      setTimeout(() => setPaymentStatus(null), 5000);
    } else if (payment === 'cancelled') {
      setPaymentStatus('cancelled');
      setTimeout(() => setPaymentStatus(null), 5000);
    }
  }, []);

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

  if (!user || customersLoading || invoicesLoading) {
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
        {/* Payment Status Notifications */}
        <AnimatePresence>
          {paymentStatus === 'success' && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed top-4 right-4 bg-green-600 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 z-50"
            >
              <CheckCircle className="w-5 h-5" />
              <div>
                <p className="font-semibold">Payment Successful!</p>
                <p className="text-sm text-green-100">Your invoice has been updated.</p>
              </div>
            </motion.div>
          )}
          {paymentStatus === 'cancelled' && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed top-4 right-4 bg-amber-600 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 z-50"
            >
              <AlertCircle className="w-5 h-5" />
              <div>
                <p className="font-semibold">Payment Cancelled</p>
                <p className="text-sm text-amber-100">You can try again anytime.</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

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
          <h1 className="text-3xl font-bold text-slate-900">Invoices</h1>
          <p className="text-slate-600 mt-1">View and pay your invoices</p>
        </div>

        {/* Content */}
        <InvoicesView 
          customerId={customer._id || customer.id} 
          customerEmail={customer.email}
        />
      </div>
    </div>
  );
}