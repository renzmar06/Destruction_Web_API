import React from 'react';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { CheckCircle, ExternalLink, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AcceptedEstimatesPanel({ onConvertToInvoice }) {
  const queryClient = useQueryClient();

  const { data: notifications = [] } = useQuery({
    queryKey: ['estimateAcceptanceNotifications'],
    queryFn: () => base44.entities.EstimateAcceptanceNotification.filter(
      { notification_status: 'pending' },
      '-accepted_date'
    ),
  });

  const markViewedMutation = useMutation({
    mutationFn: (notificationId) => {
      return base44.entities.EstimateAcceptanceNotification.update(notificationId, {
        notification_status: 'viewed',
        viewed_date: new Date().toISOString()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['estimateAcceptanceNotifications'] });
    }
  });

  const handleDismiss = (notificationId) => {
    markViewedMutation.mutate(notificationId);
  };

  const handleConvert = async (notification) => {
    await onConvertToInvoice(notification.estimate_id, notification.id);
  };

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-20 right-8 z-50 w-96 space-y-2">
      <AnimatePresence>
        {notifications.map((notification) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className="bg-white border-2 border-green-500 rounded-lg shadow-xl p-4"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-green-100 rounded-full">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">Estimate Accepted!</h3>
                  <p className="text-xs text-slate-500">
                    {new Date(notification.accepted_date).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDismiss(notification.id)}
                className="h-6 w-6"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="mb-3">
              <p className="text-sm text-slate-700">
                <span className="font-semibold">{notification.customer_name}</span> accepted
              </p>
              <p className="text-sm text-blue-600 font-semibold">
                {notification.estimate_number}
              </p>
              {notification.accepted_by && (
                <p className="text-xs text-slate-500 mt-1">
                  Accepted by: {notification.accepted_by}
                </p>
              )}
            </div>

            <div className="flex gap-2">
              <Button
                onClick={() => handleConvert(notification)}
                className="flex-1 bg-green-600 hover:bg-green-700 h-9"
              >
                Convert to Invoice
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9"
                onClick={() => window.open(`#/estimates?id=${notification.estimate_id}`, '_blank')}
              >
                <ExternalLink className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}