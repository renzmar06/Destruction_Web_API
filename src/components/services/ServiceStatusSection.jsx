import React from 'react';
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, Info } from "lucide-react";

export default function ServiceStatusSection({ data }) {
  const statusConfig = {
    active: { label: 'Active', className: 'bg-green-100 text-green-700', description: 'Service is available for selection on new Estimates' },
    inactive: { label: 'Inactive', className: 'bg-slate-100 text-slate-500', description: 'Service cannot be added to new Estimates but remains visible on historical records' }
  };

  const config = statusConfig[data.service_status || 'active'];

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
      <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
        <ShieldCheck className="w-5 h-5 text-slate-700" />
        <h3 className="font-semibold text-slate-900">Service Status</h3>
      </div>

      <div className="flex items-start gap-3">
        <Badge className={`${config.className} text-sm px-3 py-1`}>
          {config.label}
        </Badge>
        <div className="flex-1">
          <div className="flex items-start gap-2 bg-blue-50 border border-blue-200 rounded-lg p-3">
            <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-blue-800">{config.description}</p>
          </div>
        </div>
      </div>
    </div>
  );
}