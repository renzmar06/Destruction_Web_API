import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, X } from "lucide-react";

export default function AdvancedFilters({ 
  filters, 
  onFilterChange, 
  onSortChange,
  sortBy,
  sortOrder,
  onClearFilters 
}) {
  const hasActiveFilters = filters && filters.some(f => f.value && f.value !== 'all');

  return (
    <div className="flex items-center gap-3 flex-wrap">
      {filters?.map((filter) => (
        <Select
          key={filter.id}
          value={filter.value || 'all'}
          onValueChange={(value) => onFilterChange(filter.id, value)}
        >
          <SelectTrigger className="h-10 w-[180px]">
            <SelectValue placeholder={filter.label} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All {filter.label}</SelectItem>
            {filter.options.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ))}

      {sortBy && (
        <Select value={sortBy} onValueChange={onSortChange}>
          <SelectTrigger className="h-10 w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="created_date">Date Created</SelectItem>
            <SelectItem value="updated_date">Date Modified</SelectItem>
            <SelectItem value="name">Name</SelectItem>
            <SelectItem value="amount">Amount</SelectItem>
          </SelectContent>
        </Select>
      )}

      {sortOrder && (
        <Button
          variant="outline"
          size="icon"
          className="h-10 w-10"
          onClick={() => onSortChange(sortBy, sortOrder === 'asc' ? 'desc' : 'asc')}
        >
          <ArrowUpDown className="h-4 w-4" />
        </Button>
      )}

      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearFilters}
          className="h-10 gap-2"
        >
          <X className="h-4 w-4" />
          Clear Filters
        </Button>
      )}
    </div>
  );
}