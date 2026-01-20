import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Package } from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, startOfWeek, endOfWeek } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

const statusConfig = {
  draft: { label: 'Draft', className: 'bg-slate-100 text-slate-700' },
  pending: { label: 'Pending', className: 'bg-amber-100 text-amber-700' },
  in_review: { label: 'In Review', className: 'bg-blue-100 text-blue-700' },
  quoted: { label: 'Quoted', className: 'bg-purple-100 text-purple-700' },
  approved: { label: 'Approved', className: 'bg-green-100 text-green-700' },
  in_progress: { label: 'In Progress', className: 'bg-indigo-100 text-indigo-700' },
  completed: { label: 'Completed', className: 'bg-slate-100 text-slate-700' },
  cancelled: { label: 'Cancelled', className: 'bg-red-100 text-red-700' }
};

export default function CalendarView({ requests, onSelectRequest }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const getRequestsForDate = (date) => {
    return requests.filter(req => {
      if (!req.preferred_date) return false;
      return isSameDay(new Date(req.preferred_date), date);
    });
  };

  const handlePreviousMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const handleToday = () => setCurrentMonth(new Date());

  const selectedDateRequests = selectedDate ? getRequestsForDate(selectedDate) : [];

  return (
    <div className="space-y-4">
      {/* Calendar Header */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900">
              {format(currentMonth, 'MMMM yyyy')}
            </h3>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleToday}>
                Today
              </Button>
              <Button variant="outline" size="icon" onClick={handlePreviousMonth}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={handleNextMonth}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-2">
            {/* Day Headers */}
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center text-xs font-semibold text-slate-600 py-2">
                {day}
              </div>
            ))}

            {/* Calendar Days */}
            {calendarDays.map((day, idx) => {
              const dayRequests = getRequestsForDate(day);
              const isCurrentMonth = isSameMonth(day, currentMonth);
              const isToday = isSameDay(day, new Date());
              const isSelected = selectedDate && isSameDay(day, selectedDate);

              return (
                <button
                  key={idx}
                  onClick={() => {
                    if (dayRequests.length > 0) {
                      setSelectedDate(day);
                    }
                  }}
                  className={`
                    relative min-h-[80px] p-2 rounded-lg border transition-all
                    ${!isCurrentMonth ? 'bg-slate-50 text-slate-400' : 'bg-white text-slate-900'}
                    ${isToday ? 'border-blue-500 border-2' : 'border-slate-200'}
                    ${isSelected ? 'bg-blue-50 border-blue-400' : ''}
                    ${dayRequests.length > 0 ? 'hover:bg-blue-50 cursor-pointer' : 'cursor-default'}
                  `}
                >
                  <div className="text-right text-sm font-medium mb-1">
                    {format(day, 'd')}
                  </div>
                  
                  {dayRequests.length > 0 && (
                    <div className="space-y-1">
                      {dayRequests.slice(0, 2).map(req => {
                        const config = statusConfig[req.request_status] || statusConfig.pending;
                        return (
                          <div
                            key={req.id}
                            className={`text-xs px-1.5 py-0.5 rounded truncate ${config.className}`}
                          >
                            {req.request_number}
                          </div>
                        );
                      })}
                      {dayRequests.length > 2 && (
                        <div className="text-xs text-slate-500 font-medium">
                          +{dayRequests.length - 2} more
                        </div>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Selected Date Details */}
      <AnimatePresence mode="wait">
        {selectedDate && selectedDateRequests.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-base font-semibold text-slate-900">
                    Requests for {format(selectedDate, 'MMMM d, yyyy')}
                  </h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedDate(null)}
                  >
                    Close
                  </Button>
                </div>

                <div className="space-y-3">
                  {selectedDateRequests.map(request => {
                    const config = statusConfig[request.request_status] || statusConfig.pending;
                    return (
                      <div
                        key={request.id}
                        onClick={() => onSelectRequest(request)}
                        className="p-3 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold text-slate-900">
                                {request.request_number}
                              </span>
                              <Badge className={config.className}>{config.label}</Badge>
                            </div>
                            <p className="text-sm text-slate-600">{request.customer_name}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Package className="w-4 h-4" />
                          <span className="capitalize">
                            {request.service_type?.replace(/_/g, ' ') || 'Not specified'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty State */}
      {selectedDate && selectedDateRequests.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <CalendarIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">No requests scheduled for {format(selectedDate, 'MMMM d, yyyy')}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}