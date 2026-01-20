'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  ClipboardList, 
  Calendar, 
  MessageSquare, 
  FileText,
  Clock,
  CheckCircle,
  ArrowRight,
  Bell
} from "lucide-react";
import { format, isFuture, parseISO, isToday, isTomorrow } from "date-fns";
import { motion } from "framer-motion";
import Link from "next/link";
import OnboardingTour from "@/components/onboarding/OnboardingTour";
import ProfileCompletionBanner from "@/components/onboarding/ProfileCompletionBanner";
import ChatSupport from "@/components/onboarding/ChatSupport";

const statusConfig = {
  draft: { label: 'Draft', className: 'bg-slate-100 text-slate-700', icon: FileText },
  pending: { label: 'Pending Review', className: 'bg-amber-100 text-amber-700', icon: Clock },
  in_review: { label: 'In Review', className: 'bg-blue-100 text-blue-700', icon: Clock },
  quoted: { label: 'Quote Sent', className: 'bg-purple-100 text-purple-700', icon: FileText },
  approved: { label: 'Approved', className: 'bg-green-100 text-green-700', icon: CheckCircle },
  in_progress: { label: 'In Progress', className: 'bg-indigo-100 text-indigo-700', icon: Clock },
  completed: { label: 'Completed', className: 'bg-slate-100 text-slate-700', icon: CheckCircle }
};

export default function CustomerDashboard() {
  const [currentUser, setCurrentUser] = useState({ full_name: 'John Doe', email: 'john.doe@example.com' });
  const [customerId, setCustomerId] = useState('1');
  const [loading, setLoading] = useState(false);
   const [showOnboarding, setShowOnboarding] = useState(false);
  const [showProfileBanner, setShowProfileBanner] = useState(true);

  useEffect(() => {
    setLoading(false);
  }, []);

  // Mock data
  const customer = { id: '1', email: 'john.doe@example.com', onboarding_completed: true };
  const requests = [
    {
      id: '1',
      request_number: 'REQ-001',
      service_type: 'demolition',
      request_status: 'pending',
      preferred_date: '2024-02-15',
      created_date: '2024-01-15'
    },
    {
      id: '2',
      request_number: 'REQ-002',
      service_type: 'cleanup',
      request_status: 'completed',
      preferred_date: '2024-01-20',
      created_date: '2024-01-10'
    }
  ];
  const estimates = [{ id: '1', estimate_status: 'sent' }];
  const jobs = [{ id: '1', job_status: 'in_progress' }];
  const invoices = [{ id: '1', invoice_status: 'sent', balance_due: 1000 }];
  const allMessages = [{ id: '1', sender_type: 'admin', is_read: false, request_id: '1' }];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-500">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!customerId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 flex items-center justify-center p-4">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <ClipboardList className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Customer Profile Not Found</h2>
            <p className="text-slate-600 mb-4">
              Your email ({currentUser?.email}) is not associated with a customer profile.
            </p>
            <p className="text-sm text-slate-500">
              Please contact support to get your account set up.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Calculate stats
  const activeRequests = requests.filter(r => ['pending', 'in_review', 'quoted', 'approved', 'in_progress'].includes(r.request_status));
  const completedRequests = requests.filter(r => r.request_status === 'completed');
  const unreadMessages = allMessages.filter(m => m.sender_type === 'admin' && !m.is_read);
  
  // Estimate stats
  const openEstimates = estimates.filter(e => ['draft', 'sent'].includes(e.estimate_status));
  
  // Job stats
  const activeJobs = jobs.filter(j => ['scheduled', 'in_progress'].includes(j.job_status));
  
  // Invoice stats
  const outstandingInvoices = invoices.filter(i => 
    ['sent', 'finalized', 'partially_paid'].includes(i.invoice_status) && 
    (i.balance_due > 0)
  );
  
  // Get upcoming appointments (future preferred dates)
  const upcomingAppointments = requests
    .filter(r => r.preferred_date && isFuture(parseISO(r.preferred_date)) && ['approved', 'in_progress'].includes(r.request_status))
    .sort((a, b) => new Date(a.preferred_date) - new Date(b.preferred_date))
    .slice(0, 3);

  // Get recent requests
  const recentRequests = requests.slice(0, 5);

  const getDateLabel = (dateString) => {
    const date = parseISO(dateString);
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    return format(date, 'MMM d, yyyy');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Welcome Header */}
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Welcome back, {currentUser.full_name?.split(' ')[0] || 'Customer'}!
          </h1>
          <p className="text-slate-600 mt-2">Here's what's happening with your account</p>
        </div>
         {/* Onboarding Tour */}
              {showOnboarding && (
                <OnboardingTour
                  onComplete={() => {
                    setShowOnboarding(false);
                    completeOnboardingMutation.mutate();
                  }}
                  onSkip={() => {
                    setShowOnboarding(false);
                    completeOnboardingMutation.mutate();
                  }}
                />
              )}
        
              {/* Chat Support */}
              <ChatSupport />

              {customer && showProfileBanner && (
                    <ProfileCompletionBanner
                      customer={customer}
                      onDismiss={() => setShowProfileBanner(false)}
                    />
                  )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Link href="/customer-requests">
              <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100 text-xs font-medium">Active Requests</p>
                      <p className="text-3xl font-bold mt-1">{activeRequests.length}</p>
                    </div>
                    <ClipboardList className="w-10 h-10 text-blue-200" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Link href="/customer-estimates">
              <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-100 text-xs font-medium">Open Estimates</p>
                      <p className="text-3xl font-bold mt-1">{openEstimates.length}</p>
                    </div>
                    <FileText className="w-10 h-10 text-purple-200" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Link href="/customer-jobs">
              <Card className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white border-0 hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-indigo-100 text-xs font-medium">Active Jobs</p>
                      <p className="text-3xl font-bold mt-1">{activeJobs.length}</p>
                    </div>
                    <Clock className="w-10 h-10 text-indigo-200" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Link href="/customer-invoices">
              <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white border-0 hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-red-100 text-xs font-medium">Outstanding</p>
                      <p className="text-3xl font-bold mt-1">{outstandingInvoices.length}</p>
                    </div>
                    <Bell className="w-10 h-10 text-red-200" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Link href="/customer-messages">
              <Card className="bg-gradient-to-br from-amber-500 to-amber-600 text-white border-0 hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-amber-100 text-xs font-medium">New Messages</p>
                      <p className="text-3xl font-bold mt-1">{unreadMessages.length}</p>
                    </div>
                    <MessageSquare className="w-10 h-10 text-amber-200" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Link href="/customer-requests">
              <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100 text-xs font-medium">Completed</p>
                      <p className="text-3xl font-bold mt-1">{completedRequests.length}</p>
                    </div>
                    <CheckCircle className="w-10 h-10 text-green-200" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Requests */}
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-white">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <ClipboardList className="w-5 h-5 text-blue-600" />
                    Recent Service Requests
                  </CardTitle>
                  <Link href="/customer-requests">
                    <Button variant="ghost" size="sm" className="gap-2">
                      View All <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {recentRequests.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">
                    <ClipboardList className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                    <p>No service requests yet</p>
                    <Link href="/customer-requests">
                      <Button className="mt-4 bg-blue-600 hover:bg-blue-700">
                        Create Your First Request
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentRequests.map((request) => {
                      const config = statusConfig[request.request_status] || statusConfig.pending;
                      const Icon = config.icon;
                      
                      return (
                        <Link key={request.id} href="/customer-requests">
                          <div className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <p className="font-semibold text-slate-900">#{request.request_number}</p>
                                  <Badge className={config.className}>
                                    <Icon className="w-3 h-3 mr-1" />
                                    {config.label}
                                  </Badge>
                                </div>
                                <p className="text-sm text-slate-600 capitalize">
                                  {request.service_type?.replace(/_/g, ' ')}
                                </p>
                                <p className="text-xs text-slate-500 mt-1">
                                  {request.created_date ? format(new Date(request.created_date), 'MMM d, yyyy') : 'N/A'}
                                </p>
                              </div>
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Upcoming Appointments */}
            <Card>
              <CardHeader className="border-b bg-gradient-to-r from-purple-50 to-white">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Calendar className="w-5 h-5 text-purple-600" />
                  Upcoming Appointments
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                {upcomingAppointments.length === 0 ? (
                  <p className="text-sm text-slate-500 text-center py-4">No upcoming appointments</p>
                ) : (
                  <div className="space-y-3">
                    {upcomingAppointments.map((request) => (
                      <div key={request.id} className="p-3 bg-purple-50 rounded-lg border border-purple-100">
                        <div className="flex items-start gap-2">
                          <Calendar className="w-4 h-4 text-purple-600 mt-0.5" />
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-slate-900">
                              {getDateLabel(request.preferred_date)}
                            </p>
                            <p className="text-xs text-slate-600 capitalize">
                              {request.service_type?.replace(/_/g, ' ')}
                            </p>
                            <p className="text-xs text-slate-500 mt-1">#{request.request_number}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Unread Messages */}
            {unreadMessages.length > 0 && (
              <Card className="border-amber-200 bg-amber-50">
                <CardHeader className="border-b border-amber-200">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Bell className="w-5 h-5 text-amber-600" />
                    New Messages
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <p className="text-sm text-slate-700">
                      You have <span className="font-semibold">{unreadMessages.length}</span> unread message{unreadMessages.length !== 1 ? 's' : ''} from our team.
                    </p>
                    <Link href="/customer-messages">
                      <Button variant="outline" size="sm" className="w-full mt-2 border-amber-300 hover:bg-amber-100">
                        View Messages
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Quick Actions */}
            <Card>
              <CardHeader className="border-b bg-gradient-to-r from-slate-50 to-white">
                <CardTitle className="text-base">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-2">
                <Link href="/customer-requests">
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <ClipboardList className="w-4 h-4" />
                    New Service Request
                  </Button>
                </Link>
                <Link href="/customer-estimates">
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <FileText className="w-4 h-4" />
                    View Estimates
                  </Button>
                </Link>
                <Link href="/customer-invoices">
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <Bell className="w-4 h-4" />
                    View Invoices
                  </Button>
                </Link>
                <Link href="/customer-messages">
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <MessageSquare className="w-4 h-4" />
                    Messages
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}