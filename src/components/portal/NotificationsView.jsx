import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bell, CheckCircle, Clock, AlertCircle, Calendar, MessageSquare, Mail } from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";

const notificationTypeConfig = {
  service_request_update: { icon: AlertCircle, color: 'text-blue-600', bg: 'bg-blue-50' },
  general: { icon: MessageSquare, color: 'text-purple-600', bg: 'bg-purple-50' },
  system: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' }
};

export default function NotificationsView({ customerId }) {
  const [filter, setFilter] = useState('all');
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await fetch('/api/notifications');
        const data = await response.json();
        if (data.success) {
          setNotifications(data.notifications);
        }
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchNotifications();
  }, [customerId]);

  const markAsRead = async (notificationId) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'read' })
      });
      if (response.ok) {
        setNotifications(prev => prev.map(n => 
          n._id === notificationId ? { ...n, status: 'read' } : n
        ));
      }
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const markAllAsRead = async () => {
    const unreadNotifications = notifications.filter(n => n.status === 'unread');
    await Promise.all(unreadNotifications.map(n => markAsRead(n._id)));
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread') return n.status === 'unread';
    if (filter === 'read') return n.status === 'read';
    return true;
  });

  const unreadCount = notifications.filter(n => n.status === 'unread').length;

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
            onClick={markAllAsRead}
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
            const config = notificationTypeConfig[notification.type] || notificationTypeConfig.service_request_update;
            const Icon = config.icon;

            return (
              <motion.div
                key={notification._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card 
                  className={`${notification.status === 'unread' ? 'border-l-4 border-l-blue-600' : ''} hover:shadow-md transition-all`}
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
                              <h3 className={`font-semibold ${notification.status === 'unread' ? 'text-slate-900' : 'text-slate-600'}`}>
                                {notification.title}
                              </h3>
                              {notification.status === 'unread' && (
                                <Badge className="bg-blue-600 text-white">New</Badge>
                              )}
                            </div>
                            <p className="text-sm text-slate-600 whitespace-pre-wrap">
                              {notification.message}
                            </p>
                          </div>
                          {notification.status === 'unread' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              data-id={notification._id}
                              onClick={() => markAsRead(notification._id)}
                            >
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {notification.createdAt ? format(new Date(notification.createdAt), 'MMM d, yyyy h:mm a') : 'N/A'}
                          </span>
                          <span className="flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            Sent via {notification.sentVia}
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