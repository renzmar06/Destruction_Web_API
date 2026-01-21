import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "lucide-react";

export default function SchedulingSection({ data, onChange, errors, isReadOnly }) {
  const handleChange = (field, value) => {
    onChange({ ...data, [field]: value });
  };

  // Convert date to YYYY-MM-DD format for input
  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    return date.toISOString().split('T')[0];
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
      <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
        <Calendar className="w-5 h-5 text-slate-700" />
        <h3 className="font-semibold text-slate-900">Scheduling</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="scheduled_date">
            Scheduled Date <span className="text-red-500">*</span>
          </Label>
          <Input
            id="scheduled_date"
            type="date"
            value={formatDateForInput(data.scheduled_date)}
            onChange={(e) => handleChange('scheduled_date', e.target.value)}
            disabled={isReadOnly}
            className={errors.scheduled_date ? 'border-red-400' : ''}
          />
          {errors.scheduled_date && <p className="text-xs text-red-500">{errors.scheduled_date}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="actual_start_date">Actual Start Date</Label>
          <Input
            id="actual_start_date"
            type="date"
            value={formatDateForInput(data.actual_start_date)}
            onChange={(e) => handleChange('actual_start_date', e.target.value)}
            disabled={isReadOnly}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="actual_completion_date">Actual Completion Date</Label>
          <Input
            id="actual_completion_date"
            type="date"
            value={formatDateForInput(data.actual_completion_date)}
            onChange={(e) => handleChange('actual_completion_date', e.target.value)}
            disabled={isReadOnly}
          />
          <p className="text-xs text-slate-500">Required to mark job as Completed</p>
        </div>
      </div>
    </div>
  );
}