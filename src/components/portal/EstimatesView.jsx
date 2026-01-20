import React, { useState } from 'react';
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Eye, FileText, Calendar, DollarSign } from "lucide-react";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

const statusConfig = {
  draft: { label: 'Draft', className: 'bg-slate-100 text-slate-700' },
  sent: { label: 'Pending Review', className: 'bg-blue-100 text-blue-700' },
  accepted: { label: 'Accepted', className: 'bg-green-100 text-green-700' },
  expired: { label: 'Expired', className: 'bg-red-100 text-red-700' }
};

export default function EstimatesView({ customerId }) {
  const [selectedEstimate, setSelectedEstimate] = useState(null);
  const queryClient = useQueryClient();

  const { data: estimates = [], isLoading } = useQuery({
    queryKey: ['customerEstimates', customerId],
    queryFn: () => base44.entities.Estimate.filter({ customer_id: customerId }, '-created_date')
  });

  const { data: lineItems = [] } = useQuery({
    queryKey: ['estimateLineItems', selectedEstimate?.id],
    queryFn: () => selectedEstimate ? base44.entities.EstimateLineItem.filter({ estimate_id: selectedEstimate.id }, 'sort_order') : [],
    enabled: !!selectedEstimate
  });

  const { data: additionalCharges = [] } = useQuery({
    queryKey: ['estimateCharges', selectedEstimate?.id],
    queryFn: () => selectedEstimate ? base44.entities.EstimateAdditionalCharge.filter({ estimate_id: selectedEstimate.id }, 'sort_order') : [],
    enabled: !!selectedEstimate
  });

  const acceptMutation = useMutation({
    mutationFn: async (estimate) => {
      const response = await base44.functions.invoke('acceptEstimate', { 
        estimate_id: estimate.id 
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customerEstimates', customerId] });
      queryClient.invalidateQueries({ queryKey: ['customerJobs', customerId] });
      alert('Estimate accepted successfully! A job has been created and we will contact you to schedule the work.');
      setSelectedEstimate(null);
    }
  });

  // Track estimate view when customer opens detailed view
  React.useEffect(() => {
    if (selectedEstimate) {
      base44.functions.invoke('trackEstimateView', { 
        estimate_id: selectedEstimate.id 
      }).catch(err => console.error('Failed to track view:', err));
    }
  }, [selectedEstimate]);

  const handleAccept = (estimate) => {
    if (confirm(`Accept estimate ${estimate.estimate_number}? This will initiate the job scheduling process.`)) {
      acceptMutation.mutate(estimate);
    }
  };

  if (isLoading) {
    return <div className="text-center py-12 text-slate-500">Loading estimates...</div>;
  }

  if (selectedEstimate) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <Button variant="outline" onClick={() => setSelectedEstimate(null)}>
          ← Back to Estimates
        </Button>

        <Card>
          <CardHeader className="border-b bg-slate-50">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold text-slate-900">{selectedEstimate.estimate_number}</h3>
                <p className="text-slate-600 mt-1">Valid until {format(new Date(selectedEstimate.valid_until_date), 'MMMM d, yyyy')}</p>
              </div>
              <Badge className={statusConfig[selectedEstimate.estimate_status].className}>
                {statusConfig[selectedEstimate.estimate_status].label}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="p-6 space-y-6">
            {/* Line Items */}
            <div>
              <h4 className="font-semibold text-slate-900 mb-3">Services</h4>
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="text-left p-3 font-semibold">Description</th>
                      <th className="text-right p-3 font-semibold">Qty</th>
                      <th className="text-right p-3 font-semibold">Rate</th>
                      <th className="text-right p-3 font-semibold">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lineItems.map((item) => (
                      <tr key={item.id} className="border-t border-slate-100">
                        <td className="p-3">{item.description}</td>
                        <td className="p-3 text-right">{item.quantity}</td>
                        <td className="p-3 text-right">${item.unit_price?.toFixed(2)}</td>
                        <td className="p-3 text-right font-semibold">${item.line_total?.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Additional Charges */}
            {additionalCharges.length > 0 && (
              <div>
                <h4 className="font-semibold text-slate-900 mb-3">Additional Charges</h4>
                <div className="space-y-2">
                  {additionalCharges.map((charge) => (
                    <div key={charge.id} className="flex justify-between text-sm p-3 bg-slate-50 rounded-lg">
                      <span className="text-slate-700">{charge.description}</span>
                      <span className="font-semibold text-slate-900">${charge.amount?.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Total */}
            <div className="border-t-2 border-slate-300 pt-4">
              <div className="flex justify-between items-center">
                <span className="text-xl font-bold text-slate-900">Total Amount</span>
                <span className="text-3xl font-bold text-slate-900">${selectedEstimate.total_amount?.toFixed(2)}</span>
              </div>
            </div>

            {/* Customer Notes */}
            {selectedEstimate.customer_notes && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm font-medium text-blue-900 mb-2">Notes</p>
                <p className="text-sm text-blue-800 whitespace-pre-wrap">{selectedEstimate.customer_notes}</p>
              </div>
            )}

            {/* Actions */}
            {selectedEstimate.estimate_status === 'sent' && (
              <div className="flex justify-end">
                <Button
                  onClick={() => handleAccept(selectedEstimate)}
                  disabled={acceptMutation.isPending}
                  className="bg-green-600 hover:bg-green-700 gap-2"
                  size="lg"
                >
                  <CheckCircle className="w-5 h-5" />
                  {acceptMutation.isPending ? 'Accepting...' : 'Accept Estimate'}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <div className="space-y-4">
      {estimates.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">No estimates found</p>
          </CardContent>
        </Card>
      ) : (
        <AnimatePresence>
          {estimates.map((estimate) => (
            <motion.div
              key={estimate.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setSelectedEstimate(estimate)}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold text-slate-900">{estimate.estimate_number}</h3>
                        <Badge className={statusConfig[estimate.estimate_status].className}>
                          {statusConfig[estimate.estimate_status].label}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-slate-600">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>Valid until {format(new Date(estimate.valid_until_date), 'MMM d, yyyy')}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4" />
                          <span className="font-semibold text-slate-900">${estimate.total_amount?.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="gap-2">
                      <Eye className="w-4 h-4" />
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      )}
    </div>
  );
}