'use client';

import React, { useState, useEffect } from 'react';
import ConversationList from '@/components/inbox/ConversationList';
import MessageThread from '@/components/inbox/MessageThread';
import ConversationDetails from '@/components/inbox/ConversationDetails';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Search, 
  MoreHorizontal,
  PanelRightClose,
  PanelRightOpen,
  RefreshCw,
  Plus
} from 'lucide-react';
import MessageModal from '@/components/inbox/MessageModal';



export default function Inbox() {
  const [selectedConversation, setSelectedConversation] = useState<any>(null);
  const [showDetails, setShowDetails] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [conversations, setConversations] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showMessageModal, setShowMessageModal] = useState(false);
  
  const agents: any[] = [];
  const tags: any[] = [];
  const currentUser = { email: 'agent@example.com', name: 'Current Agent' };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation._id);
    }
  }, [selectedConversation]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [convRes, custRes] = await Promise.all([
        fetch('/api/conversations'),
        fetch('/api/customers')
      ]);
      
      const convData = await convRes.json();
      const custData = await custRes.json();
      
      if (convData.success) {
        const formatted = convData.data.map((conv: any) => ({
          id: conv._id,
          customer_id: conv.user_id?._id,
          status: conv.status || 'open',
          channel: 'email',
          last_message: conv.messages?.[conv.messages.length - 1]?.message || conv.service_type,
          last_message_at: conv.updatedAt,
          unread_count: 0,
          assigned_to: null,
          _id: conv._id
        }));
        setConversations(formatted);
      }
      
      if (custData.success) {
        const formatted = custData.data.map((cust: any) => ({
          id: cust._id,
          name: cust.name,
          email: cust.email,
          phone: cust.phone,
          created_date: cust.createdAt
        }));
        setCustomers(formatted);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId: string) => {
    try {
      const res = await fetch(`/api/messages?conversation_id=${conversationId}`);
      const data = await res.json();
      
      if (data.success) {
        const formatted = data.data.map((msg: any, idx: number) => ({
          id: idx + 1,
          conversation_id: conversationId,
          sender_type: msg.sentBy === currentUser.name ? 'agent' : 'customer',
          sender_id: msg.sentBy,
          content: msg.message,
          created_date: msg.timestamp
        }));
        setMessages(formatted);
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    }
  };

  const handleSelectConversation = (conv: any) => {
    setSelectedConversation(conv);
  };

  const handleSendMessage = async (messageData: any) => {
    if (!selectedConversation) return;
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversation_id: selectedConversation._id,
          content: messageData.content
        })
      });
      
      const data = await res.json();
      if (data.success) {
        fetchMessages(selectedConversation._id);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleSendNewMessage = async (content: string) => {
    if (!selectedConversation) return;
    await fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        conversation_id: selectedConversation._id,
        content
      })
    });
    fetchMessages(selectedConversation._id);
  };

  const handleUpdateConversation = (data: any) => {
    if (!selectedConversation) return;
    const updated = { ...selectedConversation, ...data };
    setSelectedConversation(updated);
    setConversations(conversations.map(c => 
      c.id === selectedConversation.id ? updated : c
    ));
  };

  const selectedCustomer = selectedConversation 
    ? customers.find(c => c.id === selectedConversation.customer_id)
    : null;

  // Filter counts
  const filterCounts = {
    all: conversations.length,
    open: conversations.filter(c => c.status === 'open').length,
    pending: conversations.filter(c => c.status === 'pending').length,
    unassigned: conversations.filter(c => !c.assigned_to).length
  };

  // Search filtered conversations
  const filteredConversations = conversations.filter(conv => {
    if (!searchQuery) return true;
    const customer = customers.find(c => c.id === conv.customer_id);
    return customer?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
           conv.last_message?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="h-screen flex bg-slate-50">
      {/* Conversations List */}
      <div className="w-80 border-r border-slate-200 bg-white flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900">Inbox</h2>
            <div className="flex gap-2">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => selectedConversation && setShowMessageModal(true)}
                disabled={!selectedConversation}
              >
                <Plus className="w-4 h-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={fetchData}
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="px-4 py-3 border-b border-slate-100">
          <Tabs value={filter} onValueChange={setFilter}>
            <TabsList className="w-full grid grid-cols-4 bg-slate-100">
              <TabsTrigger value="all" className="text-xs">
                All
                <Badge variant="secondary" className="ml-1 text-xs px-1">
                  {filterCounts.all}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="open" className="text-xs">
                Open
                <Badge className="ml-1 text-xs px-1 bg-green-100 text-green-700">
                  {filterCounts.open}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="pending" className="text-xs">
                Pending
              </TabsTrigger>
              <TabsTrigger value="unassigned" className="text-xs">
                Unassigned
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-hidden">
          <ConversationList
            conversations={filteredConversations}
            customers={customers}
            selectedId={selectedConversation?.id}
            onSelect={handleSelectConversation}
            filter={filter}
          />
        </div>
      </div>

      {/* Message Thread */}
      <div className="flex-1 flex flex-col">
        {selectedConversation && (
          <div className="h-14 px-4 border-b border-slate-200 bg-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h3 className="font-medium text-slate-900">{selectedCustomer?.name || 'Unknown'}</h3>
              <Badge variant="outline" className="capitalize">
                {selectedConversation.channel}
              </Badge>
              {selectedConversation.status === 'open' && (
                <Badge className="bg-green-100 text-green-700">Open</Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowDetails(!showDetails)}
              >
                {showDetails ? (
                  <PanelRightClose className="w-5 h-5" />
                ) : (
                  <PanelRightOpen className="w-5 h-5" />
                )}
              </Button>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="w-5 h-5" />
              </Button>
            </div>
          </div>
        )}

        <MessageThread
          conversation={selectedConversation}
          messages={messages}
          customer={selectedCustomer}
          currentUser={currentUser}
          onSendMessage={handleSendMessage}
        />
      </div>

      {/* Details Panel */}
      {showDetails && selectedConversation && (
        <div className="w-80 border-l border-slate-200 bg-white">
          <ConversationDetails
            conversation={selectedConversation}
            customer={selectedCustomer}
            agents={agents}
            tags={tags}
            onUpdateConversation={handleUpdateConversation}
            onUpdateCustomer={() => {}}
          />
        </div>
      )}

      <MessageModal
        open={showMessageModal}
        onClose={() => setShowMessageModal(false)}
        onSend={handleSendNewMessage}
        recipientName={selectedCustomer?.name}
      />
    </div>
  );
}