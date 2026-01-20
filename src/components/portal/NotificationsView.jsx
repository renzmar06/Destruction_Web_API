import React, { useState } from 'react';
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bell, CheckCircle, Clock, AlertCircle, Calendar, MessageSquare, Mail } from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";

const notificationTypeConfig = {
  status_change: { icon: AlertCircle, color: 'text-blue-600', bg: 'bg-blue-50' },
  admin_notes_added: { icon: MessageSquare, color: 'text-purple-600', bg: 'bg-purple-50' },
  request_submitted: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
  upcoming_service: { icon: Calendar, color: 'text-amber-600', bg: 'bg-amber-50' },
  delay_notification: { icon: Clock, color: 'text-red-600', bg: 'bg-red-50' },
  issue_reported: { icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50' },
  feedback_request: { icon: MessageSquare, color: 'text-indigo-600', bg: 'bg-indigo-50' }
};

export default function NotificationsView({ customerId }) {
  const [filter, setFilter] = useState('all');
  const queryClient = useQueryClient();

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['customerNotifications', customerId],
    queryFn: () => base44.entities.Notification.filter({ customer_id: customerId }, '-created_date')
  });

  const markAsReadMutation = useMutation({
    mutationFn: (notificationId) => base44.entities.Notification.update(notificationId, { is_read: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customerNotifications'] });
    }
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      const unreadNotifications = notifications.filter(n => !n.is_read);
      await Promise.all(unreadNotifications.map(n => 
        base44.entities.Notification.update(n.id, { is_read: true })
      ));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customerNotifications'] });
    }
  });

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread') return !n.is_read;
    if (filter === 'read') return n.is_read;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.is_read).length;

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-500">Loading notifications...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Notifications</h2>
          <p className="text-slate-600 mt-1">Stay updated on your service requests</p>
        </div>
        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => markAllAsReadMutation.mutate()}
            disabled={markAllAsReadMutation.isPending}
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Mark All as Read
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('all')}
        >
          All ({notifications.length})
        </Button>
        <Button
          variant={filter === 'unread' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('unread')}
        >
          Unread ({unreadCount})
        </Button>
        <Button
          variant={filter === 'read' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('read')}
        >
          Read ({notifications.length - unreadCount})
        </Button>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Bell className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">
                {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredNotifications.map((notification) => {
            const config = notificationTypeConfig[notification.notification_type] || notificationTypeConfig.status_change;
            const Icon = config.icon;

            return (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card 
                  className={`${!notification.is_read ? 'border-l-4 border-l-blue-600' : ''} hover:shadow-md transition-all`}
                >
                  <CardContent className="p-5">
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-full ${config.bg}`}>
                        <Icon className={`w-5 h-5 ${config.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className={`font-semibold ${!notification.is_read ? 'text-slate-900' : 'text-slate-600'}`}>
                                {notification.subject}
                              </h3>
                              {!notification.is_read && (
                                <Badge className="bg-blue-600 text-white">New</Badge>
                              )}
                            </div>
                            <p className="text-sm text-slate-600 whitespace-pre-wrap">
                              {notification.message}
                            </p>
                          </div>
                          {!notification.is_read && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => markAsReadMutation.mutate(notification.id)}
                              disabled={markAsReadMutation.isPending}
                            >
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {notification.created_date ? format(new Date(notification.created_date), 'MMM d, yyyy h:mm a') : 'N/A'}
                          </span>
                          <span className="flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            Sent via {notification.sent_via}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}