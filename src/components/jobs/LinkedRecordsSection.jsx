import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link2, FileText, Image, CheckCircle, ExternalLink } from "lucide-react";
import { createPageUrl } from "../../utils";

export default function LinkedRecordsSection({ job }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
      <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
        <Link2 className="w-5 h-5 text-slate-700" />
        <h3 className="font-semibold text-slate-900">Linked Records</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 border border-slate-200 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-slate-700">Estimate</span>
            </div>
            {job.estimate_id && (
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-blue-600 hover:text-blue-700">
                <ExternalLink className="w-3 h-3" />
              </Button>
            )}
          </div>
          <p className="text-lg font-semibold text-slate-900">
            {job.estimate_number || 'N/A'}
          </p>
        </div>

        <div className="p-4 border border-slate-200 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-slate-700">Invoices</span>
            </div>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-green-600 hover:text-green-700">
              <ExternalLink className="w-3 h-3" />
            </Button>
          </div>
          <p className="text-sm text-slate-500">View in Invoices</p>
        </div>

        <div className="p-4 border border-slate-200 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-medium text-slate-700">Affidavit</span>
            </div>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-purple-600 hover:text-purple-700">
              <ExternalLink className="w-3 h-3" />
            </Button>
          </div>
          <p className="text-sm text-slate-500">View in Affidavits</p>
        </div>

        <div className="p-4 border border-slate-200 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Image className="w-4 h-4 text-indigo-600" />
              <span className="text-sm font-medium text-slate-700">Media</span>
            </div>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-indigo-600 hover:text-indigo-700">
              <ExternalLink className="w-3 h-3" />
            </Button>
          </div>
          <p className="text-sm text-slate-500">Upload in Job Media</p>
        </div>
      </div>
    </div>
  );
}