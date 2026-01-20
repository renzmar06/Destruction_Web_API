import React, { useState } from 'react';
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Activity, User, Clock, ChevronRight, ChevronDown, Eye } from "lucide-react";

export default function ActivityLogModal({ estimate, open, onClose }) {
  const [expandedViews, setExpandedViews] = useState(false);

  const { data: activities = [], isLoading } = useQuery({
    queryKey: ['activityLog', estimate?.id],
    queryFn: () => estimate?.id ? base44.entities.ActivityLog.filter({ 
      entity_type: 'estimate',
      entity_id: estimate.id 
    }, 'created_date') : [],
    enabled: !!estimate?.id && open
  });

  const { data: views = [] } = useQuery({
    queryKey: ['estimateViews', estimate?.id],
    queryFn: () => estimate?.id ? base44.entities.EstimateView.filter({ 
      estimate_id: estimate.id 
    }, 'created_date') : [],
    enabled: !!estimate?.id && open
  });

  const actionColors = {
    created: 'text-green-600',
    updated: 'text-blue-600',
    status_changed: 'text-purple-600',
    sent: 'text-indigo-600',
    accepted: 'text-green-600',
    duplicated: 'text-orange-600',
    converted: 'text-teal-600',
    deleted: 'text-red-600',
    viewed: 'text-blue-500',
    other: 'text-slate-600'
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Activity Log - {estimate?.estimate_number}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="h-[500px] pr-4">
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="border border-slate-200 rounded-lg p-4 animate-pulse">
                  <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : activities.length === 0 && views.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <Activity className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>Activity data unavailable. Please refresh.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {activities.map((activity) => (
                <div key={activity.id} className="border border-slate-200 rounded-lg p-4 hover:bg-slate-50 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className={`mt-1 ${actionColors[activity.action_type] || 'text-slate-600'}`}>
                      <Activity className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-900">
                        {activity.action_description}
                      </p>
                      
                      {activity.old_value && activity.new_value && (
                        <div className="mt-2 text-xs text-slate-600 bg-slate-50 rounded p-2">
                          <span className="line-through text-red-600">{activity.old_value}</span>
                          {' → '}
                          <span className="text-green-600 font-medium">{activity.new_value}</span>
                        </div>
                      )}
                      
                      <div className="mt-2 flex items-center gap-4 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {activity.performed_by_name || activity.performed_by || 'System'}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(activity.created_date).toLocaleString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: 'numeric',
                            minute: '2-digit',
                            hour12: true
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {views.length > 0 && (
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setExpandedViews(!expandedViews)}
                    className="w-full p-4 hover:bg-slate-50 transition-colors flex items-start gap-3"
                  >
                    <div className="mt-1 text-blue-500">
                      <Eye className="w-4 h-4" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-sm font-medium text-slate-900">
                        Viewed by customer ({views.length} {views.length === 1 ? 'time' : 'times'})
                      </p>
                      <div className="mt-2 flex items-center gap-4 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          Customer
                        </span>
                      </div>
                    </div>
                    <div className="mt-1">
                      {expandedViews ? (
                        <ChevronDown className="w-4 h-4 text-slate-400" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                      )}
                    </div>
                  </button>
                  
                  {expandedViews && (
                    <div className="px-4 pb-4 space-y-2 bg-slate-50">
                      {views.map((view, idx) => (
                        <div key={view.id} className="flex items-center justify-between text-xs text-slate-600 py-2 border-t border-slate-200">
                          <span>Viewed on {new Date(view.created_date).toLocaleDateString('en-US', {
                            month: '2-digit',
                            day: '2-digit',
                            year: 'numeric'
                          })}</span>
                          <span>{new Date(view.created_date).toLocaleTimeString('en-US', {
                            hour: 'numeric',
                            minute: '2-digit',
                            hour12: true
                          })}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}