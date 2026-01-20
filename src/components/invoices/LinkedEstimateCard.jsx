import React from 'react';
import { Link2, ExternalLink, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LinkedEstimateCard({ estimate }) {
  if (!estimate) return null;

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg p-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-600 rounded-lg">
            <Link2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-600" />
              <span className="font-semibold text-blue-900">
                Linked Estimate: {estimate.estimate_number}
              </span>
            </div>
            <p className="text-sm text-blue-700 mt-1">
              Created: {new Date(estimate.estimate_date).toLocaleDateString()} • 
              Total: ${estimate.total_amount?.toFixed(2) || '0.00'}
            </p>
            {estimate.accepted_date && (
              <p className="text-xs text-blue-600 mt-1">
                Accepted: {new Date(estimate.accepted_date).toLocaleDateString()}
                {estimate.accepted_by && ` by ${estimate.accepted_by}`}
              </p>
            )}
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="border-blue-300 text-blue-700 hover:bg-blue-100"
          onClick={() => window.open(`#/estimates?id=${estimate.id}`, '_blank')}
        >
          <ExternalLink className="w-4 h-4 mr-1" />
          View
        </Button>
      </div>
    </div>
  );
}