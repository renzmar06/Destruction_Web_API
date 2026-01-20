import React from 'react';
import { DollarSign, TrendingUp, Briefcase, Target } from "lucide-react";

export default function TopKPIs({ revenue, expenses, jobsCompleted }) {
  const grossProfit = revenue - expenses;
  const avgRevenuePerJob = jobsCompleted > 0 ? revenue / jobsCompleted : 0;
  const avgMarginPerJob = revenue > 0 ? (grossProfit / revenue) * 100 : 0;

  const kpis = [
    {
      label: 'Total Revenue',
      value: `$${revenue.toFixed(2)}`,
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      label: 'Total Expenses',
      value: `$${expenses.toFixed(2)}`,
      icon: TrendingUp,
      color: 'text-red-600',
      bgColor: 'bg-red-100'
    },
    {
      label: 'Gross Profit',
      value: `$${grossProfit.toFixed(2)}`,
      icon: Target,
      color: grossProfit >= 0 ? 'text-blue-600' : 'text-red-600',
      bgColor: grossProfit >= 0 ? 'bg-blue-100' : 'bg-red-100'
    },
    {
      label: 'Jobs Completed',
      value: jobsCompleted,
      icon: Briefcase,
      color: 'text-slate-600',
      bgColor: 'bg-slate-100'
    },
    {
      label: 'Avg Revenue/Job',
      value: `$${avgRevenuePerJob.toFixed(2)}`,
      icon: DollarSign,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      label: 'Avg Margin/Job',
      value: `${avgMarginPerJob.toFixed(1)}%`,
      icon: Target,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100'
    }
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-slate-900">Key Metrics</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div key={idx} className="bg-white rounded-xl border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-600">{kpi.label}</span>
                <div className={`p-2 rounded-lg ${kpi.bgColor}`}>
                  <Icon className={`w-5 h-5 ${kpi.color}`} />
                </div>
              </div>
              <p className="text-3xl font-bold text-slate-900">{kpi.value}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}