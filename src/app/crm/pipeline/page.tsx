'use client';

import React, { useState, useEffect } from 'react';
import PipelineBoard from '@/components/pipeline/PipelineBoard';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Plus, 
  DollarSign, 
  TrendingUp,
  Target,
  MoreHorizontal,
  CalendarIcon
} from 'lucide-react';
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

// Static pipeline data
const staticPipelines = [
  {
    id: 1,
    name: 'Sales Pipeline',
    is_default: true,
    stages: [
      { id: 'lead', name: 'Lead', color: '#3b82f6', order: 0 },
      { id: 'qualified', name: 'Qualified', color: '#8b5cf6', order: 1 },
      { id: 'proposal', name: 'Proposal', color: '#f59e0b', order: 2 },
      { id: 'negotiation', name: 'Negotiation', color: '#ef4444', order: 3 },
      { id: 'won', name: 'Won', color: '#10b981', order: 4 }
    ]
  }
];

export default function Pipeline() {
  const [selectedPipelineId, setSelectedPipelineId] = useState<any>(1);
  const [isAddDealOpen, setIsAddDealOpen] = useState(false);
  const [selectedStageId, setSelectedStageId] = useState<any>(null);
  const [pipelines] = useState(staticPipelines);
  const [deals, setDeals] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newDeal, setNewDeal] = useState({
    title: '',
    customer_id: '',
    value: '',
    probability: 50,
    notes: ''
  });
  const [dateRange, setDateRange] = useState<any>();

  // Fetch deals and customers from database
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dealsRes, customersRes] = await Promise.all([
          fetch('/api/pipeline'),
          fetch('/api/customers')
        ]);
        const dealsData = await dealsRes.json();
        const customersData = await customersRes.json();
        
        setDeals(dealsData.data || []);
        const mappedCustomers = (customersData.data || []).map((c: any) => ({
          ...c,
          id: c._id
        }));
        setCustomers(mappedCustomers);
        
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const selectedPipeline = pipelines.find(p => p.id === selectedPipelineId);
  const pipelineDeals = deals.filter(d => d.pipeline_id === selectedPipelineId);
console.log('Fetched customer:', customers);
  const handleDealMove = async (dealId: string, newStageId: string) => {
    setDeals(deals.map(d => 
      d._id === dealId ? { ...d, stage_id: newStageId } : d
    ));
    try {
      await fetch(`/api/pipeline/${dealId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage_id: newStageId })
      });
    } catch (error) {
      console.error('Failed to update deal:', error);
    }
  };

  const handleAddDeal = (stageId: string) => {
    setSelectedStageId(stageId);
    setIsAddDealOpen(true);
  };

  const handleCreateDeal = async () => {
    if (!newDeal.title.trim()) return;
    const dealData = {
      ...newDeal,
      value: parseFloat(newDeal.value) || 0,
      pipeline_id: selectedPipelineId,
      stage_id: selectedStageId,
      status: 'open',
      expected_close_date_from: dateRange?.from ? format(dateRange.from, 'yyyy-MM-dd') : '',
      expected_close_date_to: dateRange?.to ? format(dateRange.to, 'yyyy-MM-dd') : ''
    };
    try {
      const response = await fetch('/api/pipeline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dealData)
      });
      const result = await response.json();
      if (result.success) {
        setDeals([...deals, result.data]);
      }
    } catch (error) {
      console.error('Failed to create deal:', error);
    }
    setIsAddDealOpen(false);
    setNewDeal({
      title: '',
      customer_id: '',
      value: '',
      probability: 50,
      notes: ''
    });
    setDateRange(undefined);
  };

  // Stats
  const totalPipelineValue = pipelineDeals
    .filter(d => d.status === 'open')
    .reduce((sum, d) => sum + (d.value || 0), 0);
  
  const weightedValue = pipelineDeals
    .filter(d => d.status === 'open')
    .reduce((sum, d) => sum + ((d.value || 0) * (d.probability || 0) / 100), 0);
  
  const wonValue = pipelineDeals
    .filter(d => d.status === 'won')
    .reduce((sum, d) => sum + (d.value || 0), 0);

  if (loading) {
    return (
      <div className="p-6 space-y-6 bg-slate-50 min-h-screen">
        <Skeleton className="h-10 w-64" />
        <div className="flex gap-4">
          {[1, 2, 3, 4, 5].map(i => (
            <Skeleton key={i} className="h-96 w-80" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Sales Pipeline</h1>
          <p className="text-slate-500">Track and manage your deals</p>
        </div>
        <div className="flex items-center gap-3">
          {pipelines.length > 1 && (
            <Select value={selectedPipelineId} onValueChange={setSelectedPipelineId}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select pipeline" />
              </SelectTrigger>
              <SelectContent>
                {pipelines.map(p => (
                  <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-50">
              <DollarSign className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Pipeline Value</p>
              <p className="text-2xl font-bold text-slate-900">${totalPipelineValue.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-50">
              <Target className="w-5 h-5 text-purple-500" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Weighted Value</p>
              <p className="text-2xl font-bold text-slate-900">${weightedValue.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-green-50">
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Won Value</p>
              <p className="text-2xl font-bold text-slate-900">${wonValue.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Pipeline Board */}
      <PipelineBoard
        pipeline={selectedPipeline}
        deals={pipelineDeals}
        customers={customers}
        onDealMove={handleDealMove}
        onDealClick={(deal: any) => console.log('Deal clicked:', deal)}
        onAddDeal={handleAddDeal}
      />

      {/* Add Deal Dialog */}
      <Dialog open={isAddDealOpen} onOpenChange={setIsAddDealOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Deal</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label>Deal Title *</Label>
              <Input
                value={newDeal.title}
                onChange={(e) => setNewDeal({ ...newDeal, title: e.target.value })}
                placeholder="e.g., Enterprise Software License"
              />
            </div>
            <div>
              <Label>Customer</Label>
              <Select 
                value={newDeal.customer_id} 
                onValueChange={(v) => setNewDeal({ ...newDeal, customer_id: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select customer" />
                </SelectTrigger>
                <SelectContent>
                  {customers.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Deal Value ($)</Label>
                <Input
                  type="number"
                  value={newDeal.value}
                  onChange={(e) => setNewDeal({ ...newDeal, value: e.target.value })}
                  placeholder="10000"
                />
              </div>
              <div>
                <Label>Probability (%)</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={newDeal.probability}
                  onChange={(e) => setNewDeal({ ...newDeal, probability: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>
            <div>
              <Label>Expected Close Date Range</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !dateRange && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange?.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, "LLL dd, y")} -{" "}
                          {format(dateRange.to, "LLL dd, y")}
                        </>
                      ) : (
                        format(dateRange.from, "LLL dd, y")
                      )
                    ) : (
                      <span>Pick a date range</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={dateRange?.from}
                    selected={dateRange}
                    onSelect={setDateRange}
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <Label>Notes</Label>
              <Textarea
                value={newDeal.notes}
                onChange={(e) => setNewDeal({ ...newDeal, notes: e.target.value })}
                placeholder="Additional details..."
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setIsAddDealOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleCreateDeal}
                disabled={!newDeal.title.trim()}
              >
                Create Deal
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}