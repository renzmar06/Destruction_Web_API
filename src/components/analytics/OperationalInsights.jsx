import React from 'react';
import { Lightbulb } from "lucide-react";

export default function OperationalInsights({ jobs, invoices, expenses, customers }) {
  // Calculate profitability by customer
  const customerProfitability = customers.map(customer => {
    const customerInvoices = invoices.filter(inv => inv.customer_id === customer.id);
    const customerJobs = jobs.filter(job => job.customer_id === customer.id);
    const customerExpenses = expenses.filter(exp => {
      const job = jobs.find(j => j.id === exp.job_id);
      return job && job.customer_id === customer.id;
    });

    const revenue = customerInvoices.reduce((sum, inv) => sum + (inv.total_amount || 0), 0);
    const expenseTotal = customerExpenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);
    const profit = revenue - expenseTotal;

    return {
      name: customer.legal_company_name,
      profit,
      revenue
    };
  }).filter(c => c.revenue > 0);

  const mostProfitable = customerProfitability.sort((a, b) => b.profit - a.profit)[0];
  const leastProfitable = customerProfitability.sort((a, b) => a.profit - b.profit)[0];

  // Jobs with negative margin
  const negativeMarginJobs = jobs
    .filter(job => job.job_status === 'completed')
    .map(job => {
      const jobInvoices = invoices.filter(inv => inv.job_id === job.id);
      const jobExpenses = expenses.filter(exp => exp.job_id === job.id && exp.expense_status === 'approved');
      
      const revenue = jobInvoices.reduce((sum, inv) => sum + (inv.total_amount || 0), 0);
      const expenseTotal = jobExpenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);
      const profit = revenue - expenseTotal;

      return {
        jobId: job.job_id,
        profit,
        hasInvoices: jobInvoices.length > 0
      };
    })
    .filter(j => j.hasInvoices && j.profit < 0);

  const insights = [
    {
      label: 'Most Profitable Customer',
      value: mostProfitable ? `${mostProfitable.name} ($${mostProfitable.profit.toFixed(2)})` : 'N/A',
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      label: 'Least Profitable Customer',
      value: leastProfitable ? `${leastProfitable.name} ($${leastProfitable.profit.toFixed(2)})` : 'N/A',
      color: 'text-red-600',
      bgColor: 'bg-red-50'
    },
    {
      label: 'Jobs with Negative Margin',
      value: negativeMarginJobs.length > 0 ? `${negativeMarginJobs.length} jobs flagged` : 'None',
      color: negativeMarginJobs.length > 0 ? 'text-red-600' : 'text-green-600',
      bgColor: negativeMarginJobs.length > 0 ? 'bg-red-50' : 'bg-green-50'
    }
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Lightbulb className="w-5 h-5 text-slate-700" />
        <h2 className="text-xl font-semibold text-slate-900">Operational Insights</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {insights.map((insight, idx) => (
          <div key={idx} className={`rounded-xl border-2 p-6 ${insight.bgColor}`}>
            <p className="text-sm font-medium text-slate-700 mb-2">{insight.label}</p>
            <p className={`text-lg font-bold ${insight.color}`}>{insight.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
        <strong>Note:</strong> All insights are auto-generated from approved expenses, finalized/paid invoices, and completed jobs. No manual configuration available.
      </div>
    </div>
  );
}