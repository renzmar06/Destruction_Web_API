import React, { useState, useEffect, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from '../Layout';

// Lazy load all pages
const pages = {
  Analytics: lazy(() => import('../pages/Analytics')),
  ServiceRequests: lazy(() => import('../pages/ServiceRequests')),
  Tasks: lazy(() => import('../pages/Tasks')),
  ProductsServices: lazy(() => import('../pages/ProductsServices')),
  Customers: lazy(() => import('../pages/Customers')),
  CustomerFeedback: lazy(() => import('../pages/CustomerFeedback')),
  Vendors: lazy(() => import('../pages/Vendors')),
  Estimates: lazy(() => import('../pages/Estimates')),
  Jobs: lazy(() => import('../pages/Jobs')),
  JobMedia: lazy(() => import('../pages/JobMedia')),
  Invoices: lazy(() => import('../pages/Invoices')),
  SendInvoice: lazy(() => import('../pages/SendInvoice')),
  Affidavits: lazy(() => import('../pages/Affidavits')),
  VerifyDocument: lazy(() => import('../pages/VerifyDocument')),
  Expenses: lazy(() => import('../pages/Expenses')),
  ReceivePayment: lazy(() => import('../pages/ReceivePayment')),
  Payments: lazy(() => import('../pages/Payments')),
  ServiceProviderProfile: lazy(() => import('../pages/ServiceProviderProfile')),
  CustomerDashboard: lazy(() => import('../pages/CustomerDashboard')),
  CustomerRequests: lazy(() => import('../pages/CustomerRequests')),
  CustomerEstimates: lazy(() => import('../pages/CustomerEstimates')),
  CustomerJobs: lazy(() => import('../pages/CustomerJobs')),
  CustomerInvoices: lazy(() => import('../pages/CustomerInvoices')),
  CustomerPayments: lazy(() => import('../pages/CustomerPayments')),
  CustomerDocuments: lazy(() => import('../pages/CustomerDocuments')),
  CustomerMessages: lazy(() => import('../pages/CustomerMessages')),
  CustomerNotifications: lazy(() => import('../pages/CustomerNotifications')),
  CustomerProfile: lazy(() => import('../pages/CustomerProfile')),
};

const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
  </div>
);

export default function SPARouter() {
  const [currentPage, setCurrentPage] = useState('Analytics');

  useEffect(() => {
    // Sync current page with URL
    const path = window.location.pathname.substring(1) || 'Analytics';
    setCurrentPage(path);
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        {Object.entries(pages).map(([pageName, PageComponent]) => (
          <Route
            key={pageName}
            path={`/${pageName}`}
            element={
              <Layout currentPageName={pageName}>
                <Suspense fallback={<LoadingFallback />}>
                  <PageComponent />
                </Suspense>
              </Layout>
            }
          />
        ))}
        <Route path="/" element={<Navigate to="/Analytics" replace />} />
        <Route path="*" element={<Navigate to="/Analytics" replace />} />
      </Routes>
    </BrowserRouter>
  );
}