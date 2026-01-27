"use client";

import React, { useMemo, useState, useEffect } from "react";
import { BarChart3, Clock } from "lucide-react";
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/redux/store';
import { fetchInvoices } from '@/redux/slices/invoicesSlice';
import { fetchExpenses } from '@/redux/slices/expensesSlice';
import { fetchJobs } from '@/redux/slices/jobsSlice';
import { fetchCustomers } from '@/redux/slices/customersSlice';
import { fetchEstimates } from '@/redux/slices/estimatesSlice';

/* Components (UNCHANGED UI) */
import DateRangeFilter from "@/components/analytics/DateRangeFilter";
import TopKPIs from "@/components/analytics/TopKPIs";
import RevenueBreakdown from "@/components/analytics/RevenueBreakdown";
import ExpenseBreakdown from "@/components/analytics/ExpenseBreakdown";
import JobProfitability from "@/components/analytics/JobProfitability";
import EstimateVariance from "@/components/analytics/EstimateVariance";
import OperationalInsights from "@/components/analytics/OperationalInsights";



/* --------------------------------------------------
   PAGE
-------------------------------------------------- */

export default function AnalyticsPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { invoices } = useSelector((state: RootState) => state.invoices);
  const { expenses } = useSelector((state: RootState) => state.expenses);
  const { jobs } = useSelector((state: RootState) => state.jobs);
  const { customers } = useSelector((state: RootState) => state.customers);
  const { estimates } = useSelector((state: RootState) => state.estimates);
  const today = new Date();
  const firstDayThisMonth = new Date(
    today.getFullYear(),
    today.getMonth(),
    1
  )
    .toISOString()
    .split("T")[0];

  const lastDayThisMonth = new Date(
    today.getFullYear(),
    today.getMonth() + 1,
    0
  )
    .toISOString()
    .split("T")[0];

  const [dateRange, setDateRange] = useState({
    startDate: firstDayThisMonth,
    endDate: lastDayThisMonth,
    preset: "this_month",
  });

  const [selectedCustomer, setSelectedCustomer] = useState("all");
  const [selectedJob, setSelectedJob] = useState("all");
  const [lastUpdated] = useState(new Date());

  useEffect(() => {
    dispatch(fetchInvoices());
    dispatch(fetchExpenses());
    dispatch(fetchJobs());
    dispatch(fetchCustomers());
    dispatch(fetchEstimates());
  }, [dispatch]);

  /* --------------------------------------------------
     FILTERED DATA (STATIC LOGIC)
  -------------------------------------------------- */

  const filteredData = useMemo(() => {
    const filteredInvoices = invoices.filter((inv) => {
      // More flexible status check
      if (inv.invoice_status !== "finalized" && inv.invoice_status !== "paid" && inv.invoice_status !== "sent") return false;
      if (selectedCustomer !== "all" && inv.customer_id !== selectedCustomer) return false;
      if (selectedJob !== "all" && inv.job_id !== selectedJob) return false;
      
      // More flexible date filtering
      if (inv.issue_date) {
        const invDate = new Date(inv.issue_date);
        const startDate = new Date(dateRange.startDate);
        const endDate = new Date(dateRange.endDate);
        endDate.setHours(23, 59, 59, 999); // Include full end date
        return invDate >= startDate && invDate <= endDate;
      }
      return true; // Include if no date
    });

    const filteredExpenses = expenses.filter((exp) => {
      // More flexible status check - remove the "paid" comparison since it's not a valid expense status
      if (exp.expense_status !== "approved") return false;
      if (selectedJob !== "all" && exp.job_id !== selectedJob) return false;
      
      // More flexible date filtering
      if (exp.expense_date) {
        const expDate = new Date(exp.expense_date);
        const startDate = new Date(dateRange.startDate);
        const endDate = new Date(dateRange.endDate);
        endDate.setHours(23, 59, 59, 999); // Include full end date
        return expDate >= startDate && expDate <= endDate;
      }
      return true; // Include if no date
    });

    const filteredJobs = jobs.filter((job) => {
      if (selectedCustomer !== "all" && job.customer_id !== selectedCustomer) return false;
      if (selectedJob !== "all" && (job._id !== selectedJob)) return false;
      return true;
    });

    return {
      invoices: filteredInvoices,
      expenses: filteredExpenses,
      jobs: filteredJobs,
    };
  }, [dateRange, selectedCustomer, selectedJob, invoices, expenses, jobs]);

  /* --------------------------------------------------
     METRICS
  -------------------------------------------------- */

  const totalRevenue = filteredData.invoices.reduce(
    (sum, inv) => sum + (inv.total_amount || 0),
    0
  );

  const totalExpenses = filteredData.expenses.reduce(
    (sum, exp) => sum + (exp.amount || 0),
    0
  );

  const jobsCompleted = filteredData.jobs.filter(
    (j) => j.job_status === "completed"
  ).length;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-slate-900 rounded-2xl">
              <BarChart3 className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Analytics</h1>
              <p className="text-slate-500 mt-1">
                Real-time business analytics and insights
              </p>
            </div>
          </div>

          <div className="text-right">
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Clock className="w-4 h-4" />
              <span>Last updated: {lastUpdated.toLocaleString()}</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Live data from your business operations
            </p>
          </div>
        </div>

        {/* Data status notice */}
        {(!invoices.length && !expenses.length && !jobs.length && !customers.length) ? (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex items-start gap-3">
            <BarChart3 className="w-5 h-5 text-amber-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-amber-800">
                No Data Available
              </p>
              <p className="text-sm text-amber-700 mt-0.5">
                Create some customers, jobs, invoices, and expenses to see analytics data.
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 flex items-start gap-3">
            <BarChart3 className="w-5 h-5 text-green-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-green-800">
                Data Loaded Successfully
              </p>
              <p className="text-sm text-green-700 mt-0.5">
                Found: {customers.length} customers, {jobs.length} jobs, {invoices.length} invoices, {expenses.length} expenses
              </p>
            </div>
          </div>
        )}

        <div className="space-y-8">
          {/* Filters */}
          <DateRangeFilter
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
            customers={customers}
            jobs={jobs}
            selectedCustomer={selectedCustomer}
            selectedJob={selectedJob}
            onCustomerChange={setSelectedCustomer}
            onJobChange={setSelectedJob}
          />

          {/* KPIs - Show even with no data */}
          <TopKPIs
            revenue={totalRevenue}
            expenses={totalExpenses}
            jobsCompleted={jobsCompleted}
          />

          {/* Show filtered data counts for debugging */}
          <div className="bg-slate-100 border border-slate-200 rounded-xl p-4 mb-6">
            <p className="text-sm text-slate-600">
              <strong>Filtered Results:</strong> {filteredData.invoices.length} invoices, {filteredData.expenses.length} expenses, {filteredData.jobs.length} jobs
              <br />
              <strong>Date Range:</strong> {dateRange.startDate} to {dateRange.endDate}
            </p>
          </div>

          {/* Charts & Insights - Only show if we have data */}
          {(filteredData.invoices.length > 0 || filteredData.expenses.length > 0 || filteredData.jobs.length > 0) && (
            <>
              <RevenueBreakdown
                invoices={filteredData.invoices}
                customers={customers}
                jobs={filteredData.jobs}
              />

              <ExpenseBreakdown
                expenses={filteredData.expenses}
                jobs={filteredData.jobs}
              />

              <JobProfitability
                jobs={filteredData.jobs}
                invoices={filteredData.invoices}
                expenses={filteredData.expenses}
                customers={customers}
              />

              <EstimateVariance
                jobs={filteredData.jobs}
                estimates={estimates}
                invoices={filteredData.invoices}
              />

              <OperationalInsights
                jobs={filteredData.jobs}
                invoices={filteredData.invoices}
                expenses={filteredData.expenses}
                customers={customers}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
