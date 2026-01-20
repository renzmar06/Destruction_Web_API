import React, { useState } from 'react';
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare, Send, User, Loader2, ArrowLeft, FileText } from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";

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

export default function MessagesView({ customerId, currentUser }) {
  const [selectedRequestId, setSelectedRequestId] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const queryClient = useQueryClient();

  const { data: requests = [] } = useQuery({
    queryKey: ['myServiceRequests', customerId],
    queryFn: () => base44.entities.ServiceRequest.filter({ customer_id: customerId }, '-created_date'),
    enabled: !!customerId
  });

  const { data: allMessages = [] } = useQuery({
    queryKey: ['allCustomerMessages', customerId],
    queryFn: async () => {
      if (!customerId) return [];
      const messages = await base44.entities.ServiceRequestMessage.list('-created_date');
      const requestIds = requests.map(r => r.id);
      return messages.filter(m => requestIds.includes(m.request_id));
    },
    enabled: !!customerId && requests.length > 0
  });

  const { data: selectedMessages = [] } = useQuery({
    queryKey: ['requestMessages', selectedRequestId],
    queryFn: () => base44.entities.ServiceRequestMessage.filter({ request_id: selectedRequestId }, 'created_date'),
    enabled: !!selectedRequestId
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (messageData) => {
      const message = await base44.entities.ServiceRequestMessage.create(messageData);
      
      // Mark as read immediately for sender
      await base44.entities.ServiceRequestMessage.update(message.id, { is_read: true });
      
      return message;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['requestMessages'] });
      queryClient.invalidateQueries({ queryKey: ['allCustomerMessages'] });
      setNewMessage('');
    }
  });

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedRequestId) return;

    const selectedRequest = requests.find(r => r.id === selectedRequestId);
    
    sendMessageMutation.mutate({
      request_id: selectedRequestId,
      sender_type: 'customer',
      sender_name: currentUser?.full_name || 'Customer',
      sender_email: currentUser?.email || '',
      message_text: newMessage,
      is_read: false
    });
  };

  // Group messages by request
  const requestsWithMessages = requests.map(request => {
    const messages = allMessages.filter(m => m.request_id === request.id);
    const unreadCount = messages.filter(m => m.sender_type === 'admin' && !m.is_read).length;
    const lastMessage = messages[0]; // Already sorted by -created_date
    
    return {
      ...request,
      messageCount: messages.length,
      unreadCount,
      lastMessage
    };
  }).filter(r => r.messageCount > 0); // Only show requests with messages

  const selectedRequest = requests.find(r => r.id === selectedRequestId);

  if (selectedRequestId) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => setSelectedRequestId(null)} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back to All Messages
        </Button>

        <Card>
          <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-white">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  Request #{selectedRequest?.request_number}
                </CardTitle>
                <p className="text-sm text-slate-600 mt-1 capitalize">
                  {selectedRequest?.service_type?.replace(/_/g, ' ')}
                </p>
              </div>
              <Badge className={statusConfig[selectedRequest?.request_status]?.className || 'bg-slate-100'}>
                {statusConfig[selectedRequest?.request_status]?.label || 'Unknown'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {/* Messages Thread */}
            <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
              {selectedMessages.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  <MessageSquare className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                  <p>No messages yet</p>
                </div>
              ) : (
                selectedMessages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${message.sender_type === 'customer' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[70%] ${message.sender_type === 'customer' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-900'} rounded-lg p-4`}>
                      <div className="flex items-center gap-2 mb-1">
                        <User className="w-4 h-4" />
                        <span className="text-sm font-medium">{message.sender_name}</span>
                      </div>
                      <p className="text-sm">{message.message_text}</p>
                      <p className={`text-xs mt-2 ${message.sender_type === 'customer' ? 'text-blue-100' : 'text-slate-500'}`}>
                        {message.created_date ? format(new Date(message.created_date), 'MMM d, yyyy h:mm a') : 'Just now'}
                      </p>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {/* Message Input */}
            <div className="border-t pt-4">
              <Textarea
                placeholder="Type your message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                rows={3}
                className="mb-3"
              />
              <div className="flex justify-end">
                <Button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || sendMessageMutation.isPending}
                  className="bg-blue-600 hover:bg-blue-700 gap-2"
                >
                  {sendMessageMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Send Message
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-white">
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-blue-600" />
          Messages
        </CardTitle>
        <p className="text-sm text-slate-600 mt-1">All conversations about your service requests</p>
      </CardHeader>
      <CardContent className="p-6">
        {requestsWithMessages.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <MessageSquare className="w-16 h-16 mx-auto mb-4 text-slate-300" />
            <p>No messages yet</p>
            <p className="text-sm text-slate-400 mt-2">Messages will appear here when you communicate with our team</p>
          </div>
        ) : (
          <div className="space-y-3">
            {requestsWithMessages.map((request) => (
              <motion.div
                key={request.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => setSelectedRequestId(request.id)}
                className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-slate-900">Request #{request.request_number}</p>
                      <Badge className={statusConfig[request.request_status]?.className}>
                        {statusConfig[request.request_status]?.label}
                      </Badge>
                      {request.unreadCount > 0 && (
                        <Badge className="bg-red-500 text-white">
                          {request.unreadCount} new
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-slate-600 capitalize mb-2">
                      {request.service_type?.replace(/_/g, ' ')}
                    </p>
                    {request.lastMessage && (
                      <div className="text-sm text-slate-500 bg-slate-50 rounded p-2 mt-2">
                        <p className="font-medium text-slate-700">
                          {request.lastMessage.sender_name}:
                        </p>
                        <p className="truncate">{request.lastMessage.message_text}</p>
                        <p className="text-xs mt-1">
                          {request.lastMessage.created_date ? format(new Date(request.lastMessage.created_date), 'MMM d, yyyy h:mm a') : 'Just now'}
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="ml-4">
                    <Badge variant="outline">{request.messageCount} messages</Badge>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}