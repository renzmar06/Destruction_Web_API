import React, { useState, useRef, useEffect } from 'react';
import { format } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { 
  Send, 
  Paperclip, 
  Smile, 
  StickyNote,
  Image,
  MoreHorizontal,
  Check,
  CheckCheck
} from 'lucide-react';

export default function MessageThread({ 
  conversation, 
  messages, 
  customer,
  currentUser,
  onSendMessage 
}) {
  const [newMessage, setNewMessage] = useState('');
  const [isNote, setIsNote] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (!newMessage.trim()) return;
    onSendMessage({
      content: newMessage,
      is_internal_note: isNote,
      content_type: 'text'
    });
    setNewMessage('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const groupMessagesByDate = (msgs) => {
    const groups = {};
    msgs.forEach(msg => {
      const date = format(new Date(msg.created_date), 'yyyy-MM-dd');
      if (!groups[date]) groups[date] = [];
      groups[date].push(msg);
    });
    return groups;
  };

  const messageGroups = groupMessagesByDate(messages);

  if (!conversation) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-50">
        <div className="text-center text-slate-400">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
            <Send className="w-8 h-8" />
          </div>
          <p>Select a conversation to start messaging</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-gradient-to-b from-slate-50 to-white">
        {Object.entries(messageGroups).map(([date, msgs]) => (
          <div key={date}>
            <div className="flex items-center justify-center mb-4">
              <div className="bg-white px-3 py-1 rounded-full text-xs text-slate-500 shadow-sm border">
                {format(new Date(date), 'MMMM d, yyyy')}
              </div>
            </div>

            <div className="space-y-3">
              {msgs.map(msg => {
                const isAgent = msg.sender_type === 'agent';
                const isSystem = msg.sender_type === 'system' || msg.sender_type === 'bot';
                const isNote = msg.is_internal_note;

                if (isNote) {
                  return (
                    <div key={msg.id} className="flex justify-center">
                      <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-2 max-w-md">
                        <div className="flex items-center gap-2 text-amber-700 text-xs mb-1">
                          <StickyNote className="w-3 h-3" />
                          <span>Internal Note by {msg.sender_id}</span>
                        </div>
                        <p className="text-sm text-amber-900">{msg.content}</p>
                      </div>
                    </div>
                  );
                }

                if (isSystem) {
                  return (
                    <div key={msg.id} className="flex justify-center">
                      <div className="text-xs text-slate-400 bg-slate-100 px-3 py-1 rounded-full">
                        {msg.content}
                      </div>
                    </div>
                  );
                }

                return (
                  <div
                    key={msg.id}
                    className={cn(
                      "flex items-end gap-2",
                      isAgent ? "justify-end" : "justify-start"
                    )}
                  >
                    {!isAgent && (
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={customer?.avatar_url} />
                        <AvatarFallback className="text-xs bg-slate-200">
                          {customer?.name?.charAt(0) || '?'}
                        </AvatarFallback>
                      </Avatar>
                    )}

                    <div className={cn(
                      "max-w-[70%] rounded-2xl px-4 py-2.5",
                      isAgent 
                        ? "bg-blue-500 text-white rounded-br-md" 
                        : "bg-white border border-slate-200 rounded-bl-md shadow-sm"
                    )}>
                      {msg.content_type === 'image' && msg.attachments?.[0] && (
                        <img 
                          src={msg.attachments[0].url} 
                          alt="attachment" 
                          className="rounded-lg mb-2 max-w-full"
                        />
                      )}
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                      <div className={cn(
                        "flex items-center gap-1 mt-1",
                        isAgent ? "justify-end" : "justify-start"
                      )}>
                        <span className={cn(
                          "text-xs",
                          isAgent ? "text-blue-100" : "text-slate-400"
                        )}>
                          {format(new Date(msg.created_date), 'HH:mm')}
                        </span>
                        {isAgent && (
                          msg.read_at 
                            ? <CheckCheck className="w-3 h-3 text-blue-100" />
                            : <Check className="w-3 h-3 text-blue-200" />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t bg-white p-4">
        {isNote && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-3 flex items-center gap-2">
            <StickyNote className="w-4 h-4 text-amber-600" />
            <span className="text-sm text-amber-700">Writing internal note (not visible to customer)</span>
          </div>
        )}

        <div className="flex items-end gap-3">
          <div className="flex-1 relative">
            <Textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isNote ? "Write an internal note..." : "Type a message..."}
              className={cn(
                "min-h-[44px] max-h-32 resize-none pr-12",
                isNote && "bg-amber-50 border-amber-200"
              )}
              rows={1}
            />
            <div className="absolute right-2 bottom-2 flex items-center gap-1">
              <Button variant="ghost" size="icon" className="h-7 w-7">
                <Smile className="w-4 h-4 text-slate-400" />
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon"
              className="h-10 w-10"
            >
              <Paperclip className="w-5 h-5 text-slate-400" />
            </Button>

            <Button
              variant={isNote ? "outline" : "ghost"}
              size="icon"
              className={cn("h-10 w-10", isNote && "bg-amber-100 border-amber-300")}
              onClick={() => setIsNote(!isNote)}
            >
              <StickyNote className={cn("w-5 h-5", isNote ? "text-amber-600" : "text-slate-400")} />
            </Button>

            <Button
              onClick={handleSend}
              disabled={!newMessage.trim()}
              className="h-10 px-4 bg-blue-500 hover:bg-blue-600"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}