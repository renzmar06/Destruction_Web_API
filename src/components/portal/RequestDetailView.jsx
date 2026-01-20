import React, { useState } from 'react';
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Calendar, 
  Package, 
  User, 
  Phone, 
  MapPin, 
  Image as ImageIcon, 
  Upload, 
  X, 
  Send,
  MessageSquare,
  FileText,
  Clock,
  Edit,
  Trash2,
  Star,
  CheckCircle
} from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";
import FeedbackForm from "./FeedbackForm";

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

export default function RequestDetailView({ request, onBack, onEdit, onDelete, currentUser }) {
  const [newMessage, setNewMessage] = useState('');
  const [uploading, setUploading] = useState(false);
  const [messageAttachments, setMessageAttachments] = useState([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const queryClient = useQueryClient();

  const config = statusConfig[request.request_status] || statusConfig.pending;
  const attachments = request.attachments ? JSON.parse(request.attachments) : [];

  // Fetch messages for this request
  const { data: messages = [] } = useQuery({
    queryKey: ['requestMessages', request.id],
    queryFn: () => base44.entities.ServiceRequestMessage.filter({ request_id: request.id }, 'created_date')
  });

  // Fetch feedback for this request
  const { data: feedbackList = [] } = useQuery({
    queryKey: ['serviceFeedback', request.id],
    queryFn: () => base44.entities.ServiceRequestFeedback.filter({ request_id: request.id })
  });

  const existingFeedback = feedbackList.length > 0 ? feedbackList[0] : null;
  const shouldShowFeedbackPrompt = request.request_status === 'completed' && !existingFeedback;

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (messageData) => {
      return base44.entities.ServiceRequestMessage.create(messageData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['requestMessages', request.id] });
      setNewMessage('');
      setMessageAttachments([]);
    }
  });

  // Upload additional files mutation
  const uploadFileMutation = useMutation({
    mutationFn: async (newFiles) => {
      const updatedAttachments = [...attachments, ...newFiles];
      return base44.entities.ServiceRequest.update(request.id, {
        attachments: JSON.stringify(updatedAttachments)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myServiceRequests'] });
      queryClient.invalidateQueries({ queryKey: ['serviceRequests'] });
    }
  });

  const handleFileUpload = async (e, isForMessage = false) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploading(true);
    try {
      const uploadedUrls = [];
      for (const file of files) {
        const { data } = await base44.integrations.Core.UploadFile({ file });
        uploadedUrls.push(data.file_url);
      }

      if (isForMessage) {
        setMessageAttachments([...messageAttachments, ...uploadedUrls]);
      } else {
        uploadFileMutation.mutate(uploadedUrls);
      }
    } catch (error) {
      alert('Failed to upload files: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() && messageAttachments.length === 0) return;

    sendMessageMutation.mutate({
      request_id: request.id,
      sender_type: 'customer',
      sender_name: currentUser?.full_name || 'Customer',
      sender_email: currentUser?.email || '',
      message_text: newMessage,
      attachments: JSON.stringify(messageAttachments)
    });
  };

  const canEdit = ['draft', 'pending', 'in_review', 'quoted'].includes(request.request_status);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack}>
          ← Back to Requests
        </Button>
        {canEdit && (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => onEdit(request)}>
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
            <Button variant="outline" size="sm" onClick={() => onDelete(request)} className="text-red-600">
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
          </div>
        )}
      </div>

      <Card>
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <CardTitle className="text-2xl">Request #{request.request_number}</CardTitle>
                <Badge className={config.className}>{config.label}</Badge>
                <Badge className={urgencyConfig[request.urgency]?.className}>
                  {urgencyConfig[request.urgency]?.label}
                </Badge>
              </div>
              <p className="text-sm text-slate-600">
                Submitted: {request.created_date ? format(new Date(request.created_date), 'MMM d, yyyy h:mm a') : 'N/A'}
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          {/* Feedback Prompt Banner */}
          {shouldShowFeedbackPrompt && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="font-semibold text-green-900">Service Completed!</p>
                    <p className="text-sm text-green-700">How was your experience? Share your feedback.</p>
                  </div>
                </div>
                <Button
                  size="sm"
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => setShowFeedback(true)}
                >
                  Leave Feedback
                </Button>
              </div>
            </motion.div>
          )}

          <Tabs defaultValue="details" className="space-y-6">
            <TabsList className={`grid w-full ${request.request_status === 'completed' ? 'grid-cols-4' : 'grid-cols-3'}`}>
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="messages">
                Messages
                {messages.filter(m => m.sender_type === 'admin' && !m.is_read).length > 0 && (
                  <span className="ml-2 px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
                    {messages.filter(m => m.sender_type === 'admin' && !m.is_read).length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="files">Files ({attachments.length})</TabsTrigger>
              {request.request_status === 'completed' && (
                <TabsTrigger value="feedback" className="gap-2">
                  Feedback
                  {existingFeedback && <CheckCircle className="w-3 h-3 text-green-600" />}
                </TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="details" className="space-y-6">
              {/* Request Information */}
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-700 mb-1">Service Type</p>
                    <p className="text-slate-900 capitalize">{request.service_type?.replace(/_/g, ' ')}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-700 mb-1">Product Type</p>
                    <p className="text-slate-900 capitalize">{request.product_type?.replace(/_/g, ' ')}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-700 mb-1">Estimated Volume</p>
                    <p className="text-slate-900">{request.estimated_volume}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-700 mb-1">Preferred Date</p>
                    <p className="text-slate-900">
                      {request.preferred_date ? format(new Date(request.preferred_date), 'MMM d, yyyy') : 'Not specified'}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-700 mb-1">Contact</p>
                    <p className="text-slate-900">{request.contact_name}</p>
                    <p className="text-slate-600 text-sm">{request.contact_phone}</p>
                  </div>
                  {request.location_notes && (
                    <div>
                      <p className="text-sm font-semibold text-slate-700 mb-1">Location Notes</p>
                      <p className="text-slate-900 text-sm">{request.location_notes}</p>
                    </div>
                  )}
                  {request.special_requirements && (
                    <div>
                      <p className="text-sm font-semibold text-slate-700 mb-1">Special Requirements</p>
                      <p className="text-slate-900 text-sm">{request.special_requirements}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Admin Notes (visible to customer) */}
              {request.admin_notes && (
                <div className="border-t pt-4">
                  <p className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    Notes from our team
                  </p>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-slate-900 text-sm whitespace-pre-wrap">{request.admin_notes}</p>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="messages" className="space-y-4">
              {/* Messages List */}
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {messages.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">
                    <MessageSquare className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                    <p>No messages yet. Start a conversation!</p>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isCustomer = msg.sender_type === 'customer';
                    const msgAttachments = msg.attachments ? JSON.parse(msg.attachments) : [];

                    return (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${isCustomer ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[70%] ${isCustomer ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-900'} rounded-lg p-3`}>
                          <div className="flex items-center gap-2 mb-1">
                            <p className={`text-xs font-semibold ${isCustomer ? 'text-blue-100' : 'text-slate-600'}`}>
                              {msg.sender_name}
                            </p>
                            <p className={`text-xs ${isCustomer ? 'text-blue-200' : 'text-slate-500'}`}>
                              {msg.created_date ? format(new Date(msg.created_date), 'MMM d, h:mm a') : ''}
                            </p>
                          </div>
                          <p className="text-sm whitespace-pre-wrap">{msg.message_text}</p>
                          {msgAttachments.length > 0 && (
                            <div className="mt-2 space-y-1">
                              {msgAttachments.map((url, idx) => (
                                <a
                                  key={idx}
                                  href={url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className={`text-xs flex items-center gap-1 ${isCustomer ? 'text-blue-100 hover:text-white' : 'text-blue-600 hover:text-blue-700'}`}
                                >
                                  <FileText className="w-3 h-3" />
                                  Attachment {idx + 1}
                                </a>
                              ))}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </div>

              {/* Message Input */}
              <div className="border-t pt-4 space-y-3">
                <Textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message here..."
                  rows={3}
                />

                {messageAttachments.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {messageAttachments.map((url, idx) => (
                      <div key={idx} className="flex items-center gap-2 bg-slate-100 px-3 py-1 rounded-lg">
                        <FileText className="w-4 h-4 text-slate-600" />
                        <span className="text-sm text-slate-700">File {idx + 1}</span>
                        <button
                          onClick={() => setMessageAttachments(messageAttachments.filter((_, i) => i !== idx))}
                          className="text-slate-500 hover:text-slate-700"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <div>
                    <input
                      type="file"
                      multiple
                      onChange={(e) => handleFileUpload(e, true)}
                      className="hidden"
                      id="message-file-upload"
                    />
                    <label htmlFor="message-file-upload">
                      <Button variant="outline" size="sm" asChild disabled={uploading}>
                        <span className="cursor-pointer">
                          <Upload className="w-4 h-4 mr-2" />
                          {uploading ? 'Uploading...' : 'Attach Files'}
                        </span>
                      </Button>
                    </label>
                  </div>
                  <Button
                    onClick={handleSendMessage}
                    disabled={(!newMessage.trim() && messageAttachments.length === 0) || sendMessageMutation.isPending}
                    className="bg-blue-600 hover:bg-blue-700 gap-2"
                  >
                    <Send className="w-4 h-4" />
                    Send Message
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="files" className="space-y-4">
              {/* Existing Attachments */}
              {attachments.length > 0 ? (
                <div className="grid grid-cols-3 gap-3">
                  {attachments.map((url, idx) => (
                    <a
                      key={idx}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block border border-slate-200 rounded-lg p-4 hover:bg-slate-50 transition-colors"
                    >
                      <ImageIcon className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                      <p className="text-xs text-slate-600 text-center truncate">Attachment {idx + 1}</p>
                    </a>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-slate-500">
                  <ImageIcon className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                  <p>No files attached yet</p>
                </div>
              )}

              {/* Upload More Files */}
              <div className="border-t pt-4">
                <input
                  type="file"
                  multiple
                  accept="image/*,video/*,.pdf,.doc,.docx"
                  onChange={(e) => handleFileUpload(e, false)}
                  className="hidden"
                  id="additional-file-upload"
                />
                <label htmlFor="additional-file-upload">
                  <Button variant="outline" className="w-full" asChild disabled={uploading}>
                    <span className="cursor-pointer">
                      <Upload className="w-4 h-4 mr-2" />
                      {uploading ? 'Uploading...' : 'Upload Additional Files'}
                    </span>
                  </Button>
                </label>
              </div>
            </TabsContent>

            {request.request_status === 'completed' && (
              <TabsContent value="feedback" className="space-y-4">
                {existingFeedback && !showFeedback ? (
                  <div className="space-y-4">
                    <Card className="bg-green-50 border-green-200">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="font-semibold text-green-900 mb-2">Your Feedback</h3>
                            <div className="flex gap-1 mb-2">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`w-5 h-5 ${
                                    star <= existingFeedback.rating
                                      ? 'fill-amber-400 text-amber-400'
                                      : 'text-slate-300'
                                  }`}
                                />
                              ))}
                            </div>
                            {existingFeedback.comments && (
                              <p className="text-sm text-slate-700 mt-2">{existingFeedback.comments}</p>
                            )}
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowFeedback(true)}
                          >
                            Edit
                          </Button>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-slate-600 mb-1">Service Quality</p>
                            <div className="flex gap-0.5">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`w-4 h-4 ${
                                    star <= existingFeedback.service_quality
                                      ? 'fill-amber-400 text-amber-400'
                                      : 'text-slate-300'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                          <div>
                            <p className="text-slate-600 mb-1">Communication</p>
                            <div className="flex gap-0.5">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`w-4 h-4 ${
                                    star <= existingFeedback.communication
                                      ? 'fill-amber-400 text-amber-400'
                                      : 'text-slate-300'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                          <div>
                            <p className="text-slate-600 mb-1">Timeliness</p>
                            <div className="flex gap-0.5">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`w-4 h-4 ${
                                    star <= existingFeedback.timeliness
                                      ? 'fill-amber-400 text-amber-400'
                                      : 'text-slate-300'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ) : (
                  <FeedbackForm
                    request={request}
                    customerId={request.customer_id}
                    existingFeedback={existingFeedback}
                    onSubmitSuccess={() => setShowFeedback(false)}
                  />
                )}
              </TabsContent>
            )}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}