import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Briefcase, DollarSign, Calendar, TrendingUp } from "lucide-react";
import { format } from "date-fns";

export default function VendorJobAssociations({ vendor, expenses, jobs }) {
  // Group expenses by job
  const jobExpenses = expenses
    .filter(e => e.job_id)
    .reduce((acc, expense) => {
      const jobId = expense.job_id;
      if (!acc[jobId]) {
        const job = jobs.find(j => j._id === jobId);
        acc[jobId] = {
          job_id: jobId,
          job_reference: expense.job_reference || job?.job_id,
          job_name: job?.job_name,
          job_status: job?.job_status,
          customer_name: job?.customer_name,
          expenses: [],
          total: 0
        };
      }
      acc[jobId].expenses.push(expense);
      acc[jobId].total += expense.amount || 0;
      return acc;
    }, {});

  const jobList = Object.values(jobExpenses);

  if (jobList.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <Briefcase className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500">No job associations for this vendor</p>
          <p className="text-sm text-slate-400 mt-2">Expenses linked to jobs will appear here</p>
        </CardContent>
      </Card>
    );
  }

  const totalJobSpending = jobList.reduce((sum, job) => sum + job.total, 0);

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-700 mb-1">Total Job-Related Spending</p>
              <p className="text-3xl font-bold text-blue-900">${totalJobSpending.toFixed(2)}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-blue-700">{jobList.length} jobs</p>
              <p className="text-xs text-blue-600 mt-1">
                {expenses.filter(e => e.job_id).length} expenses
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Job List */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-slate-900">Jobs with Vendor Expenses</h3>
        
        {jobList.map((job) => (
          <Card key={job.job_id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-100 rounded-lg">
                    <Briefcase className="w-5 h-5 text-indigo-700" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900">{job.job_reference}</h4>
                    <p className="text-sm text-slate-600">{job.job_name}</p>
                    {job.customer_name && (
                      <p className="text-xs text-slate-500 mt-1">{job.customer_name}</p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-slate-900">${job.total.toFixed(2)}</p>
                  <p className="text-xs text-slate-500 mt-1">{job.expenses.length} expenses</p>
                </div>
              </div>

              {/* Expense Breakdown */}
              <div className="space-y-2 border-t pt-4">
                {job.expenses.map((expense) => (
                  <div key={expense.id} className="flex items-center justify-between text-sm p-3 bg-slate-50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-slate-700">{expense.description}</p>
                      <p className="text-xs text-slate-500 mt-1">
                        {expense.expense_type?.replace(/_/g, ' ')} • {format(new Date(expense.expense_date), 'MMM d, yyyy')}
                      </p>
                    </div>
                    <p className="font-semibold text-slate-900">${expense.amount?.toFixed(2)}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}