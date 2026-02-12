"use client";

import type { FC } from "react";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Send, MessageSquare } from "lucide-react";
import { toast } from 'sonner';
import { fetchServiceRequests } from '@/redux/slices/customerRequestsSlice';
import { sendMessage, clearError } from '@/redux/slices/messagesSlice';
import { RootState, AppDispatch } from '@/redux/store';

type RequestStatus = "Quote Sent" | "In Review" | "Pending" | "Completed";

interface ServiceRequest {
  _id?: string;
  id?: string;
  requestNumber?: string;
  status?: string;
  serviceType: string;
  productType?: string;
  estimatedWeight?: string;
  preferredDate?: string;
  contactName?: string;
  contactPhone?: string;
  createdAt?: string;
  messages?: Array<{
    sentBy: string;
    message: string;
    timestamp: string;
  }>;
}

const statusStyles: Record<string, string> = {
  "quote sent": "bg-purple-200 text-purple-600",
  "in review": "bg-blue-200 text-blue-600",
  "pending": "bg-amber-200 text-amber-600",
  "completed": "bg-emerald-200 text-emerald-600",
  "draft": "bg-slate-200 text-slate-600",
  "approved": "bg-green-200 text-green-600",
  "in_progress": "bg-indigo-200 text-indigo-600"
};

const CustomerMessagesPage: FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { requests, loading } = useSelector((state: RootState) => state.customerRequests);
  const { loading: sendingMessage, error } = useSelector((state: RootState) => state.messages);
  
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const [messageCounts, setMessageCounts] = useState<Record<string, number>>({});
  
  useEffect(() => {
    dispatch(fetchServiceRequests());
  }, [dispatch]);

  useEffect(() => {
    if (requests.length > 0) {
      fetchAllMessageCounts();
    }
  }, [requests]);

  const fetchAllMessageCounts = async () => {
    const counts: Record<string, number> = {};
    await Promise.all(
      requests.map(async (req: ServiceRequest) => {
        const requestId = req._id || req.id;
        if (requestId) {
          try {
            const res = await fetch(`/api/messages/count?conversation_id=${requestId}`);
            const data = await res.json();
            if (data.success) {
              counts[requestId] = data.data.count;
            }
          } catch (error) {
            console.error('Failed to fetch message count:', error);
          }
        }
      })
    );
    setMessageCounts(counts);
  };

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  useEffect(() => {
    if (selectedRequest) {
      fetchMessages();
    }
  }, [selectedRequest]);

  const fetchMessages = async () => {
    if (!selectedRequest) return;
    try {
      const requestId = selectedRequest._id || selectedRequest.id;
      const res = await fetch(`/api/customer-requests/${requestId}/messages`);
      const data = await res.json();
      if (data.success) {
        setMessages(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedRequest) return;
    
    const requestId = selectedRequest._id || selectedRequest.id;
    if (!requestId) {
      toast.error('Invalid request ID');
      return;
    }
    
    try {
      const result = await dispatch(sendMessage({
        requestId,
        message: newMessage
      })).unwrap();
      
      await fetchMessages();
      setNewMessage('');
      toast.success('Message sent successfully');
    } catch (error) {
      // Error is handled by useEffect
    }
  };

  const getStatusStyle = (status: string) => {
    return statusStyles[status?.toLowerCase()] || statusStyles.pending;
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8 font-sans">
      {/* Header Bar */}

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 mb-8 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-medium text-amber-900">
            Admin Preview Mode
          </p>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 border border-amber-300">
            Preview only
          </span>
        </div>
        <div className="w-full md:w-80 bg-white shadow-sm border border-slate-300 rounded-lg px-3 py-2">
          <span className="text-slate-700">ABC Construction</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl">
        <h1 className="mb-2 text-3xl font-bold text-slate-800">Messages</h1>
        <p className="mb-8 text-slate-600">
          Communicate about your requests and jobs
        </p>

        {selectedRequest && (
          <div className="mb-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedRequest(null)}
              className="text-slate-600 hover:bg-slate-200 gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to All Messages
            </Button>
          </div>
        )}
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          {/* Section Header */}
          <div className="border-b border-slate-200 bg-slate-50 px-6 py-4">
            {selectedRequest ? (
              <div className="flex items-center gap-3">
                <div>
                  <h2 className="text-xl font-semibold text-slate-800">
                    Request #{selectedRequest.requestNumber || 'N/A'}
                  </h2>
                  <p className="text-sm text-slate-600 capitalize">
                    {selectedRequest.serviceType?.replace(/-/g, " ") || 'Service Request'}
                  </p>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-3">
                  <MessageSquare className="w-6 h-6 text-blue-400" />
                  <h2 className="text-xl font-semibold text-slate-800">
                    Messages
                  </h2>
                </div>
                <p className="mt-1 text-sm text-slate-600">
                  All conversations about your service requests
                </p>
              </div>
            )}
          </div>

          {selectedRequest ? (
            <div className="px-6 py-4">
              <div className="space-y-4">
                <div className="max-h-96 overflow-y-auto space-y-3">
                  {messages.length === 0 ? (
                    <p className="text-center text-slate-500 py-8">
                      No messages yet.
                    </p>
                  ) : (
                    messages.map((msg: any, index: number) => (
                      <div
                        key={index}
                        className={`rounded-lg p-3 max-w-xs ${
                          msg.sender_type === "customer" ? "bg-blue-500" : "bg-blue-300 ml-auto"
                        }`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-medium text-white">
                            {msg.sender_id?.name || msg.sender_id?.email || 'User'}
                          </span>
                          <span className="text-xs text-white">
                            {new Date(msg.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-white">{msg.content}</p>
                      </div>
                    ))
                  )}
                </div>

                <div className="border-t pt-4">
                  <div className="flex gap-2">
                    <textarea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type your message..."
                      className="flex-1 p-2 border border-slate-300 rounded-lg resize-none"
                      rows={2}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim() || sendingMessage}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {loading ? (
                <div className="text-center py-12">Loading requests...</div>
              ) : requests.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-slate-500">No service requests found.</p>
                </div>
              ) : (
                requests.map((req: ServiceRequest) => (
                  <div
                    key={req._id || req.id}
                    className="px-6 py-5 transition-colors border rounded-md m-6 hover:bg-slate-50 cursor-pointer"
                    onClick={() => setSelectedRequest(req)}
                  >
                    <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="font-semibold text-slate-800">
                          Request #{req.requestNumber || 'N/A'}
                        </span>
                        {req.status && (
                          <span
                            className={`inline-flex rounded-md px-3 py-1 text-xs font-semibold ${getStatusStyle(req.status)}`}
                          >
                            {req.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </span>
                        )}
                      </div>
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                        {messageCounts[req._id || req.id || ''] || 0} messages
                      </span>
                    </div>
                    <h3 className="mb-3 text-sm font-semibold ">
                      {req.serviceType?.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Service Request'}
                    </h3>
                    <div className="items-baseline gap-y-1 text-sm bg-gray-50 p-2 text-slate-600 space-y-1">
                      <div className="font-semibold text-slate-700 whitespace-nowrap">
                        Contact: {req.contactName || 'N/A'}
                      </div>
                      <div className="text-slate-600">
                        {req.productType || 'No product type specified'}
                      </div>
                      <div className="text-slate-500 whitespace-nowrap text-xs sm:text-sm">
                        {req.createdAt ? new Date(req.createdAt).toLocaleDateString('en-US', {
                          month: 'short', day: 'numeric', year: 'numeric'
                        }) : 'No date'}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}        </div>
      </div>
    </div>
  );
};

export default CustomerMessagesPage;
