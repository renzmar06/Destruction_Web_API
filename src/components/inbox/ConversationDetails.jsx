import React, { useState } from 'react';
import { format } from 'date-fns';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { 
  User, 
  Mail, 
  Phone, 
  Tag, 
  Clock,
  MessageSquare,
  ShoppingBag,
  DollarSign,
  UserCircle,
  Plus,
  X,
  ExternalLink
} from 'lucide-react';
import { cn } from "@/lib/utils";

export default function ConversationDetails({ 
  conversation, 
  customer,
  agents,
  tags,
  onUpdateConversation,
  onUpdateCustomer
}) {
  const [newTag, setNewTag] = useState('');

  if (!conversation || !customer) {
    return null;
  }

  const handleAssign = (agentEmail) => {
    onUpdateConversation({ assigned_to: agentEmail || null });
  };

  const handlePriority = (priority) => {
    onUpdateConversation({ priority });
  };

  const handleStatus = (status) => {
    onUpdateConversation({ status });
  };

  const handleAddTag = () => {
    if (!newTag.trim()) return;
    const currentTags = conversation.tags || [];
    if (!currentTags.includes(newTag)) {
      onUpdateConversation({ tags: [...currentTags, newTag] });
    }
    setNewTag('');
  };

  const handleRemoveTag = (tag) => {
    const currentTags = conversation.tags || [];
    onUpdateConversation({ tags: currentTags.filter(t => t !== tag) });
  };

  return (
    <div className="h-full overflow-y-auto bg-white">
      {/* Customer Header */}
      <div className="p-6 border-b bg-gradient-to-br from-slate-50 to-white">
        <div className="flex items-center gap-4 mb-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={customer.avatar_url} />
            <AvatarFallback className="text-xl bg-gradient-to-br from-blue-500 to-purple-500 text-white">
              {customer.name?.charAt(0)?.toUpperCase() || '?'}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold text-lg text-slate-900">{customer.name}</h3>
            <Badge variant="outline" className="mt-1 capitalize">
              {customer.status || 'lead'}
            </Badge>
          </div>
        </div>

        <div className="space-y-2 text-sm">
          {customer.email && (
            <div className="flex items-center gap-2 text-slate-600">
              <Mail className="w-4 h-4" />
              <span>{customer.email}</span>
            </div>
          )}
          {customer.phone && (
            <div className="flex items-center gap-2 text-slate-600">
              <Phone className="w-4 h-4" />
              <span>{customer.phone}</span>
            </div>
          )}
        </div>
      </div>

      {/* Conversation Actions */}
      <div className="p-4 border-b space-y-4">
        <div>
          <Label className="text-xs text-slate-500 mb-1.5 block">Status</Label>
          <Select value={conversation.status} onValueChange={handleStatus}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="open">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  Open
                </div>
              </SelectItem>
              <SelectItem value="pending">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-yellow-500" />
                  Pending
                </div>
              </SelectItem>
              <SelectItem value="resolved">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-slate-400" />
                  Resolved
                </div>
              </SelectItem>
              <SelectItem value="spam">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-500" />
                  Spam
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-xs text-slate-500 mb-1.5 block">Assigned To</Label>
          <Select value={conversation.assigned_to || 'unassigned'} onValueChange={handleAssign}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Unassigned" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="unassigned">Unassigned</SelectItem>
              {agents.map(agent => (
                <SelectItem key={agent.email} value={agent.email}>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-5 w-5">
                      <AvatarFallback className="text-xs">
                        {agent.full_name?.charAt(0) || agent.email.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    {agent.full_name || agent.email}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-xs text-slate-500 mb-1.5 block">Priority</Label>
          <Select value={conversation.priority || 'medium'} onValueChange={handlePriority}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Tags */}
      <div className="p-4 border-b">
        <Label className="text-xs text-slate-500 mb-2 block">Tags</Label>
        <div className="flex flex-wrap gap-2 mb-3">
          {(conversation.tags || []).map(tag => (
            <Badge 
              key={tag} 
              variant="secondary"
              className="flex items-center gap-1 pr-1"
            >
              {tag}
              <button
                onClick={() => handleRemoveTag(tag)}
                className="ml-1 hover:bg-slate-300 rounded-full p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
        </div>
        <div className="flex gap-2">
          <Input
            placeholder="Add tag..."
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
            className="flex-1"
          />
          <Button size="icon" variant="outline" onClick={handleAddTag}>
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Customer Details Accordion */}
      <Accordion type="multiple" defaultValue={['info', 'stats']} className="px-4">
        <AccordionItem value="info">
          <AccordionTrigger className="text-sm font-medium">
            <div className="flex items-center gap-2">
              <UserCircle className="w-4 h-4" />
              Customer Info
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-3 text-sm">
              <div>
                <span className="text-slate-500">Channel:</span>
                <span className="ml-2 capitalize">{customer.channel || 'Unknown'}</span>
              </div>
              <div>
                <span className="text-slate-500">Created:</span>
                <span className="ml-2">
                  {format(new Date(customer.created_date), 'MMM d, yyyy')}
                </span>
              </div>
              {customer.last_contact_date && (
                <div>
                  <span className="text-slate-500">Last Contact:</span>
                  <span className="ml-2">
                    {format(new Date(customer.last_contact_date), 'MMM d, yyyy HH:mm')}
                  </span>
                </div>
              )}
              {customer.notes && (
                <div>
                  <span className="text-slate-500 block mb-1">Notes:</span>
                  <p className="text-slate-700 bg-slate-50 p-2 rounded">{customer.notes}</p>
                </div>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="stats">
          <AccordionTrigger className="text-sm font-medium">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4" />
              Statistics
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 rounded-lg p-3 text-center">
                <ShoppingBag className="w-5 h-5 mx-auto mb-1 text-slate-400" />
                <div className="text-2xl font-semibold text-slate-900">
                  {customer.total_orders || 0}
                </div>
                <div className="text-xs text-slate-500">Orders</div>
              </div>
              <div className="bg-slate-50 rounded-lg p-3 text-center">
                <DollarSign className="w-5 h-5 mx-auto mb-1 text-slate-400" />
                <div className="text-2xl font-semibold text-slate-900">
                  ${customer.total_spent?.toLocaleString() || 0}
                </div>
                <div className="text-xs text-slate-500">Total Spent</div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}