import React, { useState, useEffect } from 'react';
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Package, User, Phone, Edit, Trash2, FileText, Image, Eye, CheckCircle } from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";
import RequestDetailView from "./RequestDetailView";

const statusConfig = {
  draft: { label: 'Draft', className: 'bg-slate-100 text-slate-700' },
  pending: { label: 'Pending Review', className: 'bg-amber-100 text-amber-700' },
  in_review: { label: 'In Review', className: 'bg-blue-100 text-blue-700' },
  quoted: { label: 'Quote Sent', className: 'bg-purple-100 text-purple-700' },
  approved: { label: 'Approved', className: 'bg-green-100 text-green-700' },
  in_progress: { label: 'In Progress', className: 'bg-indigo-100 text-indigo-700' },
  completed: { label: 'Completed', className: 'bg-slate-100 text-slate-700' },
  cancelled: { label: 'Cancelled', className: 'bg-red-100 text-red-700' }
};

const urgencyConfig = {
  normal: { label: 'Normal', className: 'bg-slate-100 text-slate-700' },
  expedited: { label: 'Expedited', className: 'bg-blue-100 text-blue-700' },
  urgent: { label: 'Urgent', className: 'bg-red-100 text-red-700' }
};

export default function MyServiceRequests({ customerId, onEdit }) {
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    const loadUser = async () => {
      try {
        const user = await base44.auth.me();
        setCurrentUser(user);
      } catch (error) {
        console.error('Failed to load user:', error);
      }
    };
    loadUser();
  }, []);

  const { data: requests = [], isLoading } = useQuery({
    queryKey: ['myServiceRequests', customerId],
    queryFn: () => base44.entities.ServiceRequest.filter({ customer_id: customerId }, '-created_date')
  });

  const { data: allFeedback = [] } = useQuery({
    queryKey: ['customerFeedback', customerId],
    queryFn: () => base44.entities.ServiceRequestFeedback.filter({ customer_id: customerId })
  });

  const deleteMutation = useMutation({
    mutationFn: (requestId) => base44.entities.ServiceRequest.delete(requestId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myServiceRequests'] });
      setSelectedRequest(null);
    }
  });

  const handleDelete = (request) => {
    if (confirm(`Delete ${request.is_draft ? 'draft' : 'service request'} #${request.request_number}?`)) {
      deleteMutation.mutate(request.id);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-500">Loading your requests...</p>
        </CardContent>
      </Card>
    );
  }

  if (requests.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500">No service requests yet</p>
          <p className="text-sm text-slate-400 mt-2">Create your first service request to get started</p>
        </CardContent>
      </Card>
    );
  }

  if (selectedRequest) {
    return (
      <RequestDetailView
        request={selectedRequest}
        onBack={() => setSelectedRequest(null)}
        onEdit={onEdit}
        onDelete={handleDelete}
        currentUser={currentUser}
      />
    );
  }

  return (
    <div className="space-y-4">
      {requests.map((request) => {
        const config = statusConfig[request.request_status] || statusConfig.pending;
        
        const hasFeedback = allFeedback.some(f => f.request_id === request.id);

        return (
          <motion.div
            key={request.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="hover:shadow-lg transition-all">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div 
                    className="flex-1 cursor-pointer"
                    onClick={() => setSelectedRequest(request)}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-slate-900">Request #{request.request_number}</h3>
                      <Badge className={config.className}>{config.label}</Badge>
                      {request.urgency !== 'normal' && (
                        <Badge className={urgencyConfig[request.urgency]?.className}>
                          {urgencyConfig[request.urgency]?.label}
                        </Badge>
                      )}
                      {request.request_status === 'completed' && hasFeedback && (
                        <Badge className="bg-green-100 text-green-700 gap-1">
                          <CheckCircle className="w-3 h-3" />
                          Feedback Submitted
                        </Badge>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 text-sm text-slate-600">
                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4" />
                        <span className="capitalize">{request.service_type?.replace(/_/g, ' ') || 'Not specified'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>{request.preferred_date ? format(new Date(request.preferred_date), 'MMM d, yyyy') : 'TBD'}</span>
                      </div>
                    </div>
                    
                    <p className="text-xs text-slate-500 mt-2">
                      {request.is_draft ? 'Draft saved' : 'Submitted'}: {request.created_date ? format(new Date(request.created_date), 'MMM d, yyyy') : 'N/A'}
                    </p>
                  </div>
                  
                  <div className="flex gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedRequest(request);
                      }}
                      className="h-9 gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      View Details
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}