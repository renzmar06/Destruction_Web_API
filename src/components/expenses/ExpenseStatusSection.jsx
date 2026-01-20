import React from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle, Clock, Send } from "lucide-react";

const statusConfig = {
  draft: {
    label: 'Draft',
    icon: Clock,
    className: 'bg-slate-100 text-slate-700 border-slate-200',
    description: 'Expense is editable'
  },
  submitted: {
    label: 'Submitted',
    icon: Send,
    className: 'bg-blue-100 text-blue-700 border-blue-200',
    description: 'Awaiting approval'
  },
  approved: {
    label: 'Approved',
    icon: CheckCircle,
    className: 'bg-green-100 text-green-700 border-green-200',
    description: 'Locked and included in P&L'
  },
  archived: {
    label: 'Archived',
    icon: AlertCircle,
    className: 'bg-slate-100 text-slate-500 border-slate-200',
    description: 'Retained for history, excluded from reporting'
  }
};

export default function ExpenseStatusSection({ data, canSubmit, canApprove }) {
  const currentConfig = statusConfig[data.expense_status || 'draft'];
  const Icon = currentConfig.icon;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
      <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
        <Icon className="w-5 h-5 text-slate-700" />
        <h3 className="font-semibold text-slate-900">Expense Status</h3>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <Badge className={`${currentConfig.className} text-base px-4 py-2 mb-2`}>
            {currentConfig.label}
          </Badge>
          <p className="text-sm text-slate-600">{currentConfig.description}</p>
        </div>
      </div>

      <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-sm text-slate-600">
        <strong>Status Workflow:</strong>
        <p className="mt-1">Draft → Submitted → Approved → Archived</p>
        <ul className="mt-2 space-y-1 text-xs">
          <li>• Draft: Fully editable</li>
          <li>• Submitted: Under review</li>
          <li>• Approved: Locked, feeds P&L calculations</li>
          <li>• Archived: Excluded from active reporting</li>
        </ul>
      </div>
    </div>
  );
}