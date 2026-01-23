'use client';

import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, User, Phone, Edit, Trash2, Send } from "lucide-react";
import { toast } from 'sonner';
import { sendMessage, clearError } from '@/redux/slices/messagesSlice';
import { RootState, AppDispatch } from '@/redux/store';

interface ViewDetailProps {
  selectedRequest: any;
  onBack: () => void;
  onNewRequest: () => void;
  onEdit: (request: any) => void;
  onDelete: (request: any) => void;
}

export default function ViewDetail({ selectedRequest, onBack, onNewRequest, onEdit, onDelete }: ViewDetailProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { loading: sendingMessage, error } = useSelector((state: RootState) => state.messages);
  
  const [attachments, setAttachments] = useState(selectedRequest.attachments || []);
  const [messages, setMessages] = useState(selectedRequest.messages || []);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    
    try {
      const result = await dispatch(sendMessage({
        requestId: selectedRequest._id || selectedRequest.id,
        message: newMessage
      })).unwrap();
      
      setMessages((prev: any[]) => [...prev, result]);
      setNewMessage('');
      toast.success('Message sent successfully');
    } catch (error) {
      // Error is handled by useEffect
    }
  };
  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Service Requests</h1>
          <p className="text-slate-600 mt-1">Submit and track your service requests</p>
        </div>
        <Button onClick={onNewRequest} className="bg-blue-600 hover:bg-blue-700 gap-2">
            <Plus className="w-4 h-4" />New Request
          </Button>
      </div>
       <div className="flex gap-3 mb-6">
          <Button variant="outline" onClick={onBack}>← Back to List</Button>
        </div>

      {/* Request Details */}
      <Card>
        <CardHeader className="pb-4 border-b bg-slate-50">
          <div className="flex items-start justify-between gap-4">
            <div>
              <CardTitle className="text-2xl font-bold">
                Service Request
              </CardTitle>
              <p className="text-slate-600 mt-1.5">
                Submitted: {new Date(selectedRequest.createdAt || Date.now()).toLocaleString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit',
                  hour12: true
                })}
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => {
                onBack(); // Close details view first
                onEdit(selectedRequest); // Then open edit form
              }} className="gap-1">
                <Edit className="w-4 h-4" />
                Edit
              </Button>
              <Button variant="outline" size="sm" onClick={() => onDelete(selectedRequest)} className="gap-1">
                <Trash2 className="w-4 h-4" />
                Delete
              </Button>
            </div>
          </div>
        </CardHeader>

        <Tabs defaultValue="details" className="">
          <TabsList className="w-full px-6 rounded-none justify-start ">
            <TabsTrigger value="details" className="text-base flex-1">Details</TabsTrigger>
            <TabsTrigger value="messages" className="text-base flex-1">Messages</TabsTrigger>
            <TabsTrigger value="files" className="text-base flex-1">Files</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="px-6 py-6">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-medium text-slate-500 mb-1.5">Service Type</h4>
                  <p className="font-medium text-slate-900 capitalize">
                    {selectedRequest.serviceType?.replace(/-/g, ' ') || '—'}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-slate-500 mb-1.5">Product Type</h4>
                  <p className="font-medium text-slate-900">{selectedRequest.productType || '—'}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-slate-500 mb-1.5">Estimated Volume</h4>
                  <p className="font-medium text-slate-900">
                    {selectedRequest.estimatedWeight || selectedRequest.unitCount || selectedRequest.quantityBreakdown?.substring(0, 60) + '...' || '—'}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-slate-500 mb-1.5">Preferred Date</h4>
                  <p className="font-medium text-slate-900">
                    {selectedRequest.preferredDate ? new Date(selectedRequest.preferredDate).toLocaleDateString('en-US', {
                      month: 'long', day: 'numeric', year: 'numeric'
                    }) : '—'}
                  </p>
                </div>
              </div>
              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-medium text-slate-500 mb-2">Contact</h4>
                  <div className="space-y-2.5 bg-slate-50 p-4 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <User className="h-5 w-5 text-slate-600" />
                      <span className="font-medium">{selectedRequest.contactName || ''}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone className="h-5 w-5 text-slate-600" />
                      <span className="font-medium">{selectedRequest.contactPhone || ''}</span>
                    </div>
                  </div>
                </div>
                {selectedRequest.quantityBreakdown && (
                  <div>
                    <h4 className="text-sm font-medium text-slate-500 mb-1.5">Quantity Breakdown</h4>
                    <p className="whitespace-pre-wrap text-slate-800">{selectedRequest.quantityBreakdown}</p>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="messages" className="px-6 py-4">
            <div className="space-y-4">
              {/* Messages List */}
              <div className="max-h-96 overflow-y-auto space-y-3">
                {messages.length === 0 ? (
                  <p className="text-center text-slate-500 py-8">No messages yet.</p>
                ) : (
                  messages.map((msg: any, index: number) => (
                    <div key={index} className={`rounded-lg p-3 max-w-xs ml-auto ${
                      msg.sentBy === 'You' ? 'bg-blue-300' : 'bg-blue-500'
                    }`}>
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-medium text-white">{msg.sentBy}</span>
                        <span className="text-xs text-white">
                          {new Date(msg.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-white">{msg.message}</p>
                    </div>
                  ))
                )}
              </div>
              
              {/* Message Input */}
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
          </TabsContent>

          <TabsContent value="files" className="px-6 py-4">
            <div className="space-y-4">
              {/* Upload Section */}
              <div className="border-2 border-dashed border-slate-300 rounded-lg p-4 text-center">
                <input 
                  type="file" 
                  multiple 
                  accept="image/*,video/*,.pdf,.doc,.docx" 
                  className="hidden" 
                  id="fileUpload"
                  onChange={async (e) => {
                    const files = Array.from(e.target.files || []);
                    
                    for (const file of files) {
                      const formData = new FormData();
                      formData.append('file', file);
                      
                      try {
                        const response = await fetch('/api/upload', {
                          method: 'POST',
                          body: formData
                        });
                        
                        const result = await response.json();
                        if (result.success) {
                          // Update the request with new attachment
                          const updatedAttachments = [...attachments, result.url];
                          
                          await fetch(`/api/customer-requests/${selectedRequest._id || selectedRequest.id}`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ attachments: updatedAttachments })
                          });
                          
                          // Update local state to reflect in UI immediately
                          setAttachments(updatedAttachments);
                        }
                      } catch (error) {
                        console.error('Upload error:', error);
                      }
                    }
                  }}
                />
                <label htmlFor="fileUpload" className="cursor-pointer">
                  <div className="text-slate-500">
                    <p className="mb-2">Click to upload new files</p>
                    <p className="text-sm">Images, videos, or documents</p>
                  </div>
                </label>
              </div>
              
              {/* Existing Files */}
              {attachments && attachments.length > 0 ? (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-slate-700">Attached Files</h4>
                  {attachments.map((url: string, index: number) => {
                    const fileName = url.split('/').pop()?.replace(/^\d+_/, '') || `attachment-${index + 1}`;
                    const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(url);
                    
                    return (
                      <div key={`${selectedRequest._id || selectedRequest.id}-attachment-${index}`} className="flex items-center gap-3 p-2 border rounded">
                        {isImage ? (
                          <img 
                            src={url} 
                            alt={fileName} 
                            className="w-12 h-12 object-cover rounded cursor-pointer" 
                            onClick={() => window.open(url, '_blank')}
                          />
                        ) : (
                          <div className="w-12 h-12 bg-slate-100 rounded flex items-center justify-center">
                            <span className="text-xs">{fileName.split('.').pop()?.toUpperCase()}</span>
                          </div>
                        )}
                        <div className="flex-1">
                          <p className="text-sm font-medium truncate">{fileName}</p>
                        </div>
                        <button 
                          onClick={() => window.open(url, '_blank')}
                          className="text-blue-600 hover:text-blue-700 text-sm"
                        >
                          View
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center text-slate-500">No files attached</div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </Card>
    </>
  );
}