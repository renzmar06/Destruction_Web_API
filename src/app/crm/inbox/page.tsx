'use client';

import React, { useState } from 'react';
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
  RefreshCw
} from 'lucide-react';

// Static data
const staticConversations = [
  { id: 1, customer_id: 1, status: 'open', channel: 'email', last_message: 'Need help with my order', last_message_at: '2024-01-15T10:30:00Z', unread_count: 2, assigned_to: 'agent1' },
  { id: 2, customer_id: 2, status: 'pending', channel: 'chat', last_message: 'When will my service start?', last_message_at: '2024-01-15T09:15:00Z', unread_count: 0, assigned_to: null },
  { id: 3, customer_id: 3, status: 'open', channel: 'phone', last_message: 'Thank you for the update', last_message_at: '2024-01-14T16:45:00Z', unread_count: 1, assigned_to: 'agent2' }
];

const staticCustomers = [
  { id: 1, name: 'John Doe', email: 'john@example.com', phone: '555-0101', created_date: '2024-01-15T10:00:00Z' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', phone: '555-0102', created_date: '2024-01-14T09:00:00Z' },
  { id: 3, name: 'Bob Johnson', email: 'bob@example.com', phone: '555-0103', created_date: '2024-01-13T08:00:00Z' }
];

const staticMessages = [
  { id: 1, conversation_id: 1, sender_type: 'customer', sender_id: 'john@example.com', content: 'Need help with my order', created_date: '2024-01-15T10:30:00Z' },
  { id: 2, conversation_id: 1, sender_type: 'agent', sender_id: 'agent@example.com', content: 'How can I help you?', created_date: '2024-01-15T10:35:00Z' }
];

const staticAgents = [
  { id: 'agent1', name: 'Agent One', email: 'agent1@example.com' },
  { id: 'agent2', name: 'Agent Two', email: 'agent2@example.com' }
];

const staticTags = [
  { id: 1, name: 'urgent', category: 'conversation' },
  { id: 2, name: 'follow-up', category: 'conversation' }
];

export default function Inbox() {
  const [selectedConversation, setSelectedConversation] = useState<any>(null);
  const [showDetails, setShowDetails] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [conversations, setConversations] = useState(staticConversations);
  const [messages, setMessages] = useState(staticMessages);
  
  const customers = staticCustomers;
  const agents = staticAgents;
  const tags = staticTags;
  const currentUser = { email: 'agent@example.com', name: 'Current Agent' };

  const handleSelectConversation = (conv: any) => {
    setSelectedConversation(conv);
    if (conv.unread_count > 0) {
      setConversations(conversations.map(c => 
        c.id === conv.id ? { ...c, unread_count: 0 } : c
      ));
    }
  };

  const handleSendMessage = (messageData: any) => {
    if (!selectedConversation) return;
    const newMessage = {
      id: messages.length + 1,
      conversation_id: selectedConversation.id,
      sender_type: 'agent',
      sender_id: currentUser?.email,
      created_date: new Date().toISOString(),
      ...messageData
    };
    setMessages([...messages, newMessage]);
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
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setConversations([...staticConversations])}
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
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
    </div>
  );
}