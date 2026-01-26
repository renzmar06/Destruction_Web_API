'use client';
import React, { useState, useEffect } from 'react';
import { User } from "lucide-react";
import PaymentHistoryView from "@/components/portal/PaymentHistoryView";
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { loadUserFromStorage } from '@/redux/slices/authSlice';

export default function CustomerPayments() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(state => state.auth);
  const [loading, setLoading] = useState(true);

  // Load user from localStorage
  useEffect(() => {
    dispatch(loadUserFromStorage());
  }, [dispatch]);

  // Set customer as the logged-in user (or finish loading if none)
 

  setLoading

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md text-center bg-white rounded-2xl border border-slate-200 p-8">
          <User className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Authentication Required</h2>
          <p className="text-slate-600 mb-4">
            Please log in to view your payment history.
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md text-center bg-white rounded-2xl border border-slate-200 p-8">
          <User className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Customer Profile Not Found</h2>
          <p className="text-slate-600 mb-4">
            Your account is missing profile data. Please contact support.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Payment History</h1>
          <p className="text-slate-600 mt-1">View your transaction history and receipts</p>
        </div>

        {/* Content */}
        <PaymentHistoryView customerId={user.id} />
      </div>
    </div>
  );
}