import React, { useState } from 'react';
import { X, ChevronDown, ChevronRight, Eye, Activity as ActivityIcon } from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const statusConfig = {
  draft: { label: 'Draft', color: 'text-slate-700' },
  sent: { label: 'Pending', color: 'text-blue-700' },
  accepted: { label: 'Converted', color: 'text-green-700' },
  expired: { label: 'Expired', color: 'text-red-700' },
  cancelled: { label: 'Cancelled', color: 'text-gray-700' }
};

export default function EstimateDetailsSidebar({ estimate, lineItems, onClose, onEdit, onMoreActions }) {
  const [expandedSections, setExpandedSections] = useState({
    customer: false,
    activity: true,
    products: true
  });
  const [expandedViews, setExpandedViews] = useState(false);

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const activities = [];
  const views = [];

  const config = statusConfig[estimate?.estimate_status] || statusConfig.draft;

  const activityItems = [
    { 
      label: 'Created', 
      date: estimate.created_date || estimate.estimate_date,
      completed: true 
    },
    { 
      label: 'Sent', 
      date: estimate.sent_date,
      completed: !!estimate.sent_date 
    },
    { 
      label: 'Accepted', 
      date: estimate.accepted_date,
      completed: estimate.estimate_status === 'accepted' 
    }
  ];

  return (
    <div className="fixed right-0 top-0 h-full w-96 bg-white border-l border-slate-200 shadow-xl z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
        <h2 className="text-lg font-semibold">Estimate {estimate.estimate_number}</h2>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Status & Total */}
        <div className="px-6 py-4 border-b border-slate-200">
          <div className={`text-sm font-medium mb-3 ${config.color}`}>
            {config.label}
          </div>
          <div className="mb-1 text-sm text-slate-600">Estimate total</div>
          <div className="text-3xl font-bold text-slate-900">
            ${estimate.total_amount?.toFixed(2) || '0.00'}
          </div>
        </div>

        {/* Transaction Date */}
        <div className="px-6 py-4 border-b border-slate-200">
          <div className="text-sm font-semibold text-slate-900 mb-1">Transaction date</div>
          <div className="text-sm text-slate-600">
            {new Date(estimate.estimate_date).toLocaleDateString('en-US', { 
              month: 'numeric', 
              day: 'numeric', 
              year: 'numeric' 
            })}
          </div>
        </div>

        {/* Customer Section */}
        <div className="border-b border-slate-200">
          <button
            onClick={() => toggleSection('customer')}
            className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50"
          >
            <span className="text-sm font-semibold text-slate-900">{estimate.customer_name}</span>
            {expandedSections.customer ? (
              <ChevronDown className="w-4 h-4 text-slate-400" />
            ) : (
              <ChevronRight className="w-4 h-4 text-slate-400" />
            )}
          </button>
          {expandedSections.customer && (
            <div className="px-6 pb-4">
              {estimate.customer_email && (
                <a 
                  href={`mailto:${estimate.customer_email}`}
                  className="text-sm text-blue-600 hover:underline"
                >
                  {estimate.customer_email}
                </a>
              )}
            </div>
          )}
        </div>

        {/* Estimate Activity */}
        <div className="border-b border-slate-200">
          <button
            onClick={() => toggleSection('activity')}
            className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50"
          >
            <span className="text-sm font-semibold text-slate-900">Estimate activity</span>
            {expandedSections.activity ? (
              <ChevronDown className="w-4 h-4 text-slate-400" />
            ) : (
              <ChevronRight className="w-4 h-4 text-slate-400" />
            )}
          </button>
          {expandedSections.activity && (
            <div className="px-6 pb-4">
              <div className="space-y-3">
                {/* Timeline Activities */}
                <div className="relative">
                  {activityItems.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-3 pb-4 last:pb-0">
                      <div className="relative">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          item.completed 
                            ? 'bg-green-500 border-green-500' 
                            : 'bg-white border-slate-300'
                        }`}>
                          {item.completed && (
                            <div className="w-2 h-2 rounded-full bg-white"></div>
                          )}
                        </div>
                        {idx < activityItems.length - 1 && (
                          <div className={`absolute left-1/2 top-5 w-0.5 h-8 -translate-x-1/2 ${
                            item.completed ? 'bg-green-500' : 'bg-slate-200'
                          }`}></div>
                        )}
                      </div>
                      <div className="flex-1 pt-0.5">
                        <div className="text-sm font-medium text-slate-900">{item.label}</div>
                        {item.date && (
                          <div className="text-xs text-slate-500">
                            {new Date(item.date).toLocaleDateString('en-US', { 
                              month: 'numeric', 
                              day: 'numeric', 
                              year: 'numeric' 
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Customer Views */}
                {views.length > 0 && (
                  <div className="pt-2 border-t border-slate-200">
                    <button
                      onClick={() => setExpandedViews(!expandedViews)}
                      className="w-full flex items-start gap-3 hover:bg-slate-50 -mx-2 px-2 py-2 rounded"
                    >
                      <Eye className="w-4 h-4 text-blue-500 mt-0.5" />
                      <div className="flex-1 text-left">
                        <div className="text-sm font-medium text-slate-900">
                          Viewed by customer ({views.length})
                        </div>
                      </div>
                      {expandedViews ? (
                        <ChevronDown className="w-4 h-4 text-slate-400 mt-0.5" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-slate-400 mt-0.5" />
                      )}
                    </button>
                    
                    {expandedViews && (
                      <div className="mt-2 ml-7 space-y-1">
                        {views.map((view) => (
                          <div key={view.id} className="text-xs text-slate-600">
                            {new Date(view.created_date).toLocaleDateString('en-US', {
                              month: '2-digit',
                              day: '2-digit',
                              year: 'numeric'
                            })} at {new Date(view.created_date).toLocaleTimeString('en-US', {
                              hour: 'numeric',
                              minute: '2-digit',
                              hour12: true
                            })}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Recent Activities */}
                {activities.length > 0 && (
                  <div className="pt-2 border-t border-slate-200">
                    <div className="text-xs font-semibold text-slate-500 mb-2">RECENT ACTIVITY</div>
                    {activities.slice(0, 3).map((activity) => (
                      <div key={activity.id} className="flex items-start gap-2 mb-2">
                        <ActivityIcon className="w-3 h-3 text-slate-400 mt-0.5" />
                        <div className="flex-1">
                          <div className="text-xs text-slate-900">{activity.action_description}</div>
                          <div className="text-xs text-slate-500">
                            {new Date(activity.created_date).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric'
                            })}
                          </div>
                        </div>
                      </div>
                    ))}
                    <button 
                      onClick={() => onMoreActions('viewActivity')}
                      className="text-xs text-blue-600 hover:underline"
                    >
                      View all activity
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Products and Services */}
        <div className="border-b border-slate-200">
          <button
            onClick={() => toggleSection('products')}
            className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50"
          >
            <span className="text-sm font-semibold text-slate-900">Products and services</span>
            {expandedSections.products ? (
              <ChevronDown className="w-4 h-4 text-slate-400" />
            ) : (
              <ChevronRight className="w-4 h-4 text-slate-400" />
            )}
          </button>
          {expandedSections.products && (
            <div className="px-6 pb-4">
              {lineItems && lineItems.length > 0 ? (
                <div className="space-y-3">
                  {lineItems.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="text-sm font-medium text-slate-900">
                          {item.description || item.service_name}
                        </div>
                        {item.pricing_unit && (
                          <div className="text-xs text-slate-500">
                            {item.quantity} × ${item.unit_price?.toFixed(2)} per {item.pricing_unit}
                          </div>
                        )}
                      </div>
                      <div className="text-sm font-semibold text-slate-900">
                        ${item.line_total?.toFixed(2) || '0.00'}
                      </div>
                    </div>
                  ))}
                  <button className="text-sm text-blue-600 hover:underline">
                    Fewer details
                  </button>
                </div>
              ) : (
                <div className="text-sm text-slate-500">No line items</div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="px-6 py-4 border-t border-slate-200 flex gap-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex-1 border-green-600 text-green-700 hover:bg-green-50">
              More actions
              <ChevronDown className="w-4 h-4 ml-2" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" side="top" className="w-56" sideOffset={8}>
            <DropdownMenuItem onSelect={() => onMoreActions('send')}>
              Send
            </DropdownMenuItem>
            
            {estimate.estimate_status === 'accepted' && (
              <DropdownMenuItem onSelect={() => onMoreActions('convert')}>
                Convert to invoice
              </DropdownMenuItem>
            )}
            
            {estimate.estimate_status === 'sent' && (
              <DropdownMenuItem onSelect={() => onMoreActions('accept')}>
                Mark accepted
              </DropdownMenuItem>
            )}
            
            <DropdownMenuItem onSelect={() => onMoreActions('duplicate')}>
              Duplicate
            </DropdownMenuItem>
            
            <DropdownMenuItem onSelect={() => onMoreActions('share')}>
              Share estimate link
            </DropdownMenuItem>
            
            <DropdownMenuItem onSelect={() => onMoreActions('print')}>
              Print
            </DropdownMenuItem>
            
            <DropdownMenuItem onSelect={() => onMoreActions('updateStatus')}>
              Update status
            </DropdownMenuItem>
            
            <DropdownMenuItem onSelect={() => onMoreActions('copyToPO')}>
              Copy to purchase order
            </DropdownMenuItem>
            
            <DropdownMenuItem onSelect={() => onMoreActions('delete')} className="text-red-600">
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        
        <Button 
          onClick={onEdit}
          className="flex-1 bg-green-600 hover:bg-green-700"
        >
          Edit
        </Button>
      </div>
    </div>
  );
}