import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, CheckCircle } from "lucide-react";

export default function CustomerEstimatesTab({ customer, estimates, onCreateEstimate }) {
  const statusConfig = {
    draft: { label: 'Draft', class: 'bg-slate-100 text-slate-700', icon: null },
    sent: { label: 'Pending', class: 'bg-blue-100 text-blue-700', icon: null },
    accepted: { label: 'Accepted', class: 'bg-green-100 text-green-700', icon: CheckCircle },
    expired: { label: 'Expired', class: 'bg-red-100 text-red-700', icon: null },
    cancelled: { label: 'Cancelled', class: 'bg-slate-100 text-slate-700', icon: null }
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
      <div className="p-6 border-b border-slate-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">Estimates</h3>
          <Button 
            onClick={onCreateEstimate}
            size="sm"
            className="bg-green-600 hover:bg-green-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Estimate
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50">
              <TableHead className="font-semibold">NUMBER</TableHead>
              <TableHead className="font-semibold">DATE</TableHead>
              <TableHead className="font-semibold">EXPIRATION</TableHead>
              <TableHead className="font-semibold">STATUS</TableHead>
              <TableHead className="font-semibold text-right">AMOUNT</TableHead>
              <TableHead className="font-semibold text-right">ACTION</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {estimates.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-slate-500">
                  No estimates yet. Create the first estimate for this customer.
                </TableCell>
              </TableRow>
            ) : (
              estimates.map((estimate) => {
                const config = statusConfig[estimate.estimate_status] || statusConfig.draft;
                const Icon = config.icon;
                
                return (
                  <TableRow key={estimate.id} className="hover:bg-slate-50">
                    <TableCell className="font-medium text-slate-900">
                      {estimate.estimate_number}
                    </TableCell>
                    <TableCell className="text-slate-700">
                      {new Date(estimate.estimate_date).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric', 
                        year: 'numeric' 
                      })}
                    </TableCell>
                    <TableCell className="text-slate-700">
                      {estimate.valid_until_date ? 
                        new Date(estimate.valid_until_date).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric', 
                          year: 'numeric' 
                        }) : '—'
                      }
                    </TableCell>
                    <TableCell>
                      <Badge className={config.class}>
                        {Icon && <Icon className="w-3 h-3 mr-1" />}
                        {config.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-semibold text-slate-900">
                      ${estimate.total_amount?.toFixed(2) || '0.00'}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="link" size="sm" className="text-blue-600 h-auto p-0">
                        View / Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}