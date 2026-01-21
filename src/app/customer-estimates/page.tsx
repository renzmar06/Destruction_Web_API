'use client';

import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/redux/store';
import { fetchEstimates, Estimate } from '@/redux/slices/estimatesSlice';
import { fetchCustomers } from '@/redux/slices/customersSlice';
import { useAuth } from '@/contexts/AuthContext';
import { CalendarDays, DollarSign, Eye, ArrowLeft, FileText, Clock, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface Customer {
  _id?: string;
  id?: string;
  email: string;
  display_name?: string;
  legal_company_name?: string;
}

const statusConfig: Record<string, { label: string; className: string; icon: any }> = {
  draft: { label: 'Draft', className: 'bg-slate-100 text-slate-700', icon: FileText },
  sent: { label: 'Sent', className: 'bg-blue-100 text-blue-700', icon: Clock },
  accepted: { label: 'Accepted', className: 'bg-green-100 text-green-700', icon: CheckCircle },
  rejected: { label: 'Rejected', className: 'bg-red-100 text-red-700', icon: FileText },
  expired: { label: 'Expired', className: 'bg-amber-100 text-amber-700', icon: Clock },
  cancelled: { label: 'Cancelled', className: 'bg-slate-100 text-slate-700', icon: FileText }
};

const CustomerEstimatesPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { estimates, loading } = useSelector((state: RootState) => state.estimates);
  const { customers } = useSelector((state: RootState) => state.customers);
  const { user } = useAuth();
  const [selectedEstimate, setSelectedEstimate] = useState<Estimate | null>(null);
  const [currentCustomer, setCurrentCustomer] = useState<Customer | null>(null);

  useEffect(() => {
    dispatch(fetchEstimates());
    dispatch(fetchCustomers());
  }, [dispatch]);

  // Find customer by logged-in user email
  useEffect(() => {
    if (user && customers.length > 0) {
      const customer = customers.find(c => c.email === user.email);
      setCurrentCustomer(customer || null);
    }
  }, [user, customers]);

  // Filter estimates for current customer
  const customerEstimates = currentCustomer 
    ? estimates.filter(estimate => 
        estimate.customer_id === currentCustomer._id
      )
    : [];

  const getStatusConfig = (status: string) => {
    return statusConfig[status?.toLowerCase()] || statusConfig.draft;
  };

  if (selectedEstimate) {
    const config = getStatusConfig(selectedEstimate.estimate_status);
    const Icon = config.icon;

    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="max-w-7xl mx-auto">
          <Button
            variant="outline"
            onClick={() => setSelectedEstimate(null)}
            className="mb-6 gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Estimates
          </Button>

          <Card>
            <CardHeader className="border-b bg-slate-50">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-2xl font-bold">
                    Estimate #{selectedEstimate.estimate_number}
                  </CardTitle>
                  <p className="text-slate-600 mt-1">
                    Created: {new Date(selectedEstimate.estimate_date).toLocaleDateString('en-US', {
                      month: 'long', day: 'numeric', year: 'numeric'
                    })}
                  </p>
                </div>
                <Badge className={`${config.className} text-base px-4 py-2`}>
                  <Icon className="w-4 h-4 mr-2" />
                  {config.label}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="p-6">
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <h4 className="text-sm font-medium text-slate-500 mb-2">Service Details</h4>
                    <p className="font-medium text-slate-900 capitalize">
                      {selectedEstimate.destruction_type || 'Standard Destruction'}
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-slate-500 mb-2">Valid Until</h4>
                    <div className="flex items-center gap-2">
                      <CalendarDays className="w-4 h-4 text-slate-600" />
                      <span className="font-medium text-slate-900">
                        {new Date(selectedEstimate.valid_until_date).toLocaleDateString('en-US', {
                          month: 'long', day: 'numeric', year: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>

                  {selectedEstimate.note_to_customer && (
                    <div>
                      <h4 className="text-sm font-medium text-slate-500 mb-2">Notes</h4>
                      <p className="text-slate-700 whitespace-pre-wrap">
                        {selectedEstimate.note_to_customer}
                      </p>
                    </div>
                  )}
                </div>

                <div className="space-y-6">
                  <div className="bg-slate-50 p-4 rounded-lg">
                    <h4 className="text-sm font-medium text-slate-500 mb-3">Estimate Total</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-slate-600">Subtotal:</span>
                        <span className="font-medium">
                          ${selectedEstimate.subtotal?.toFixed(2) || '0.00'}
                        </span>
                      </div>
                      <div className="flex justify-between text-lg font-bold border-t pt-2">
                        <span>Total:</span>
                        <span className="text-blue-600">
                          ${selectedEstimate.total_amount?.toFixed(2) || '0.00'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {selectedEstimate.estimate_status === 'sent' && (
                    <div className="space-y-3">
                      <Button className="w-full bg-green-600 hover:bg-green-700">
                        Accept Estimate
                      </Button>
                      <Button variant="outline" className="w-full">
                        Request Changes
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">My Estimates</h1>
          <p className="text-slate-600 mt-2">Review and manage your service estimates</p>
        </div>

        {loading || !user ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-500">{!user ? 'Please log in to view estimates...' : 'Loading estimates...'}</p>
          </div>
        ) : !currentCustomer ? (
          <Card>
            <CardContent className="p-12 text-center">
              <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Customer Profile Not Found</h3>
              <p className="text-slate-600 mb-6">
                Your account is not linked to a customer profile. Please contact support.
              </p>
            </CardContent>
          </Card>
        ) : customerEstimates.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 mb-2">No Estimates Yet</h3>
              <p className="text-slate-600 mb-6">
                You don't have any estimates yet. Submit a service request to get started.
              </p>
              <Link href="/customer-requests">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  Create Service Request
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {customerEstimates.map((estimate, index) => {
              const config = getStatusConfig(estimate.estimate_status);
              const Icon = config.icon;

              return (
                <motion.div
                  key={estimate._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => setSelectedEstimate(estimate)}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-slate-900">
                              Estimate #{estimate.estimate_number}
                            </h3>
                            <Badge className={`${config.className} px-3 py-1`}>
                              <Icon className="w-3.5 h-3.5 mr-1.5" />
                              {config.label}
                            </Badge>
                          </div>

                          <p className="text-slate-700 font-medium capitalize mb-3">
                            {estimate.destruction_type || 'Standard Destruction Service'}
                          </p>

                          <div className="flex flex-wrap items-center gap-5 text-sm text-slate-500">
                            <div className="flex items-center gap-1.5">
                              <CalendarDays className="w-4 h-4" />
                              <span>
                                Created: {new Date(estimate.estimate_date).toLocaleDateString('en-US', {
                                  month: 'short', day: 'numeric', year: 'numeric'
                                })}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Clock className="w-4 h-4" />
                              Valid until: {new Date(estimate.valid_until_date).toLocaleDateString('en-US', {
                                month: 'short', day: 'numeric', year: 'numeric'
                              })}
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="flex items-center gap-1.5 text-lg font-bold text-slate-900 mb-2">
                            <DollarSign className="w-5 h-5" />
                            <span>${estimate.total_amount?.toFixed(2) || '0.00'}</span>
                          </div>
                          <Button variant="outline" size="sm" className="gap-2">
                            <Eye className="w-4 h-4" />
                            View Details
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerEstimatesPage;