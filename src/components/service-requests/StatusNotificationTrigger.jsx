import React, { useState } from 'react';
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bell, Send } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function StatusNotificationTrigger({ request, onClose }) {
  const [notificationType, setNotificationType] = useState('status_change');
  const [customMessage, setCustomMessage] = useState('');
  const queryClient = useQueryClient();

  const sendNotificationMutation = useMutation({
    mutationFn: async () => {
      const notificationMessages = {
        status_change: `Your service request ${request.request_number} status has been updated to: ${request.request_status.replace(/_/g, ' ').toUpperCase()}`,
        admin_notes_added: `We've added notes to your service request ${request.request_number}. Please check your portal for details.`,
        delay_notification: `There's an update regarding the timeline for request ${request.request_number}. Please check your portal.`,
        feedback_request: `Your service for request ${request.request_number} is complete! We'd love to hear your feedback.`
      };

      const message = customMessage || notificationMessages[notificationType] || 'You have a new update on your service request.';

      await base44.asServiceRole.entities.Notification.create({
        customer_id: request.customer_id,
        request_id: request.id,
        notification_type: notificationType,
        subject: `Update: Request ${request.request_number}`,
        message: message,
        is_read: false,
        sent_via: 'email'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      alert('Notification sent successfully!');
      onClose();
    }
  });

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white rounded-lg border border-slate-200 shadow-lg p-6 space-y-4"
    >
      <div className="flex items-center gap-3 mb-4">
        <Bell className="w-6 h-6 text-blue-600" />
        <div>
          <h3 className="font-semibold text-slate-900">Send Customer Notification</h3>
          <p className="text-sm text-slate-600">Request: {request.request_number}</p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium text-slate-700 mb-2 block">
            Notification Type
          </label>
          <Select value={notificationType} onValueChange={setNotificationType}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="status_change">Status Change</SelectItem>
              <SelectItem value="admin_notes_added">Admin Notes Added</SelectItem>
              <SelectItem value="delay_notification">Delay/Update Notice</SelectItem>
              <SelectItem value="feedback_request">Feedback Request</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700 mb-2 block">
            Custom Message (Optional)
          </label>
          <Textarea
            value={customMessage}
            onChange={(e) => setCustomMessage(e.target.value)}
            placeholder="Leave empty to use default message for selected type"
            rows={4}
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button
          onClick={() => sendNotificationMutation.mutate()}
          disabled={sendNotificationMutation.isPending}
          className="bg-blue-600 hover:bg-blue-700 gap-2"
        >
          <Send className="w-4 h-4" />
          {sendNotificationMutation.isPending ? 'Sending...' : 'Send Notification'}
        </Button>
      </div>
    </motion.div>
  );
}