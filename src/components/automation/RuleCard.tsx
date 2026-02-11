import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { 
  Zap, 
  MessageCircle, 
  UserPlus, 
  Tag, 
  Clock,
  Search,
  MoreHorizontal,
  Play,
  Edit,
  Trash2
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const triggerIcons = {
  new_message: { icon: MessageCircle, color: 'text-blue-500', bg: 'bg-blue-50' },
  new_customer: { icon: UserPlus, color: 'text-green-500', bg: 'bg-green-50' },
  tag_added: { icon: Tag, color: 'text-orange-500', bg: 'bg-orange-50' },
  no_reply_timeout: { icon: Clock, color: 'text-red-500', bg: 'bg-red-50' },
  keyword_match: { icon: Search, color: 'text-purple-500', bg: 'bg-purple-50' },
  new_conversation: { icon: MessageCircle, color: 'text-indigo-500', bg: 'bg-indigo-50' },
};

const triggerLabels = {
  new_message: 'New Message',
  new_customer: 'New Customer',
  tag_added: 'Tag Added',
  no_reply_timeout: 'No Reply Timeout',
  keyword_match: 'Keyword Match',
  new_conversation: 'New Conversation',
};

const actionLabels = {
  auto_reply: 'Send Auto Reply',
  add_tag: 'Add Tag',
  assign_agent: 'Assign to Agent',
  notify: 'Send Notification',
  update_status: 'Update Status',
  create_deal: 'Create Deal',
};

export default function RuleCard({ 
  rule, 
  onToggle, 
  onEdit, 
  onDelete,
  onRun 
}) {
  const triggerStyle = triggerIcons[rule.trigger_type] || triggerIcons.new_message;
  const TriggerIcon = triggerStyle.icon;

  return (
    <div className={cn(
      "bg-white rounded-2xl border border-slate-100 shadow-sm p-5 transition-all",
      !rule.is_active && "opacity-60"
    )}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={cn("p-2.5 rounded-xl", triggerStyle.bg)}>
            <TriggerIcon className={cn("w-5 h-5", triggerStyle.color)} />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900">{rule.name}</h3>
            <p className="text-sm text-slate-500">{rule.description}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Switch 
            checked={rule.is_active} 
            onCheckedChange={() => onToggle(rule)}
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onRun(rule)}>
                <Play className="w-4 h-4 mr-2" />
                Run Now
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(rule)}>
                <Edit className="w-4 h-4 mr-2" />
                Edit Rule
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onDelete(rule)}
                className="text-red-600"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <Badge variant="outline" className="text-xs">
          Trigger: {triggerLabels[rule.trigger_type] || rule.trigger_type}
        </Badge>
        {rule.conditions?.length > 0 && (
          <Badge variant="outline" className="text-xs">
            {rule.conditions.length} condition{rule.conditions.length > 1 ? 's' : ''}
          </Badge>
        )}
      </div>

      <div className="space-y-2">
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Actions</p>
        <div className="flex flex-wrap gap-2">
          {rule.actions?.map((action, index) => (
            <Badge 
              key={index}
              className="bg-slate-100 text-slate-700"
            >
              <Zap className="w-3 h-3 mr-1" />
              {actionLabels[action.type] || action.type}
            </Badge>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
        <span className="text-xs text-slate-400">
          Run {rule.run_count || 0} times
        </span>
        <span className="text-xs text-slate-400">
          Priority: {rule.priority || 0}
        </span>
      </div>
    </div>
  );
}