import React from 'react';
import { format, formatDistanceToNow } from 'date-fns';
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { 
  MessageCircle, 
  Instagram, 
  Facebook, 
  Phone,
  Globe,
  Clock,
  AlertCircle
} from 'lucide-react';

const channelIcons = {
  facebook: { icon: Facebook, color: 'text-blue-600', bg: 'bg-blue-50' },
  instagram: { icon: Instagram, color: 'text-pink-600', bg: 'bg-pink-50' },
  whatsapp: { icon: Phone, color: 'text-green-600', bg: 'bg-green-50' },
  website: { icon: Globe, color: 'text-slate-600', bg: 'bg-slate-50' },
  manual: { icon: MessageCircle, color: 'text-purple-600', bg: 'bg-purple-50' }
};

const priorityColors = {
  urgent: 'bg-red-500',
  high: 'bg-orange-500',
  medium: 'bg-yellow-500',
  low: 'bg-slate-300'
};

export default function ConversationList({ 
  conversations, 
  customers,
  selectedId, 
  onSelect,
  filter 
}) {
  const getCustomer = (customerId) => 
    customers.find(c => c.id === customerId) || { name: 'Unknown', avatar_url: '' };

  const filteredConversations = conversations.filter(conv => {
    if (filter === 'all') return true;
    if (filter === 'unassigned') return !conv.assigned_to;
    if (filter === 'open') return conv.status === 'open';
    return conv.status === filter;
  });

  const sortedConversations = [...filteredConversations].sort((a, b) => 
    new Date(b.last_message_at || b.created_date) - new Date(a.last_message_at || a.created_date)
  );

  const isSLABreached = (conv) => {
    if (!conv.sla_due_at) return false;
    return new Date(conv.sla_due_at) < new Date() && conv.status === 'open';
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto">
        {sortedConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 p-8">
            <MessageCircle className="w-12 h-12 mb-3 opacity-50" />
            <p className="text-sm">No conversations</p>
          </div>
        ) : (
          sortedConversations.map(conv => {
            const customer = getCustomer(conv.customer_id);
            const ChannelIcon = channelIcons[conv.channel]?.icon || MessageCircle;
            const channelStyle = channelIcons[conv.channel] || channelIcons.manual;
            const breached = isSLABreached(conv);

            return (
              <div
                key={conv.id}
                onClick={() => onSelect(conv)}
                className={cn(
                  "flex items-start gap-3 p-4 cursor-pointer border-b border-slate-100 transition-all",
                  "hover:bg-slate-50",
                  selectedId === conv.id && "bg-blue-50 border-l-2 border-l-blue-500",
                  breached && "bg-red-50/50"
                )}
              >
                <div className="relative">
                  <Avatar className="h-11 w-11">
                    <AvatarImage src={customer.avatar_url} />
                    <AvatarFallback className="bg-gradient-to-br from-slate-100 to-slate-200 text-slate-600 font-medium">
                      {customer.name?.charAt(0)?.toUpperCase() || '?'}
                    </AvatarFallback>
                  </Avatar>
                  <div className={cn(
                    "absolute -bottom-1 -right-1 p-1 rounded-full",
                    channelStyle.bg
                  )}>
                    <ChannelIcon className={cn("w-3 h-3", channelStyle.color)} />
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-slate-900 truncate">
                      {customer.name}
                    </span>
                    <span className="text-xs text-slate-400 whitespace-nowrap ml-2">
                      {conv.last_message_at 
                        ? formatDistanceToNow(new Date(conv.last_message_at), { addSuffix: true })
                        : 'New'
                      }
                    </span>
                  </div>

                  <p className="text-sm text-slate-500 truncate mb-2">
                    {conv.last_message || 'No messages yet'}
                  </p>

                  <div className="flex items-center gap-2">
                    {conv.unread_count > 0 && (
                      <Badge className="bg-blue-500 text-white text-xs px-1.5 py-0 h-5">
                        {conv.unread_count}
                      </Badge>
                    )}
                    {conv.priority && conv.priority !== 'medium' && (
                      <div className={cn(
                        "w-2 h-2 rounded-full",
                        priorityColors[conv.priority]
                      )} />
                    )}
                    {breached && (
                      <div className="flex items-center gap-1 text-red-500">
                        <AlertCircle className="w-3 h-3" />
                        <span className="text-xs">SLA</span>
                      </div>
                    )}
                    {conv.tags?.slice(0, 2).map(tag => (
                      <Badge key={tag} variant="outline" className="text-xs px-1.5 py-0 h-5">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}