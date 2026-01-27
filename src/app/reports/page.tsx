"use client";

import React, { useMemo, useState, useEffect } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/redux/store';
import { fetchServiceRequests } from '@/redux/slices/customerRequestsSlice';
import { fetchInvoices } from '@/redux/slices/invoicesSlice';
import { fetchJobs } from '@/redux/slices/jobsSlice';
import { fetchCustomers } from '@/redux/slices/customersSlice';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Clock, TrendingUp, AlertCircle } from "lucide-react";
import {
  format,
  subDays,
  startOfDay,
  endOfDay,
  parseISO,
  differenceInDays,
} from "date-fns";

/* ----------------------------------
   STATIC COLORS
---------------------------------- */

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];



/* ----------------------------------
   PAGE
---------------------------------- */

export default function ReportsPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { requests: customerRequests } = useSelector((state: RootState) => state.customerRequests);
  const { invoices } = useSelector((state: RootState) => state.invoices);
  const { jobs } = useSelector((state: RootState) => state.jobs);
  const { customers } = useSelector((state: RootState) => state.customers);
  
  const [timeRange, setTimeRange] = useState("monthly");
  const [isExporting, setIsExporting] = useState(false);

  const handleExportReport = async () => {
    setIsExporting(true);
    try {
      let csvContent = "Analytics Report\n\n";
      csvContent += "Summary\n";
      csvContent += `Total Requests,${customerRequests.length}\n`;
      csvContent += `In Progress,${stats.inProgress}\n`;
      csvContent += `Completed,${stats.completed}\n`;
      csvContent += `Avg Completion Time,${avgCompletionTime} days\n\n`;
      
      csvContent += "Service Types\n";
      csvContent += "Type,Count\n";
      serviceTypeData.forEach(item => {
        csvContent += `${item.name},${item.count}\n`;
      });
      
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics-report-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  useEffect(() => {
    dispatch(fetchServiceRequests());
    dispatch(fetchInvoices());
    dispatch(fetchJobs());
    dispatch(fetchCustomers());
  }, [dispatch]);

  /* ----------------------------------
     REQUEST VOLUME
  ---------------------------------- */

  const volumeData = useMemo(() => {
    const now = new Date();
    const ranges: Record<string, number> = {
      daily: 7,
      weekly: 12,
      monthly: 12,
    };

    const periods = ranges[timeRange];
    const data: Array<{ name: string; requests: number }> = [];

    for (let i = periods - 1; i >= 0; i--) {
      let startDate: Date, endDate: Date, label: string;

      if (timeRange === "daily") {
        startDate = startOfDay(subDays(now, i));
        endDate = endOfDay(subDays(now, i));
        label = format(startDate, "MMM dd");
      } else if (timeRange === "weekly") {
        startDate = startOfDay(subDays(now, i * 7));
        endDate = endOfDay(subDays(now, (i - 1) * 7));
        label = `Week ${periods - i}`;
      } else {
        const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
        startDate = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
        endDate = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0);
        label = format(monthDate, "MMM yyyy");
      }

      const count = customerRequests.filter((r) => {
        const createdDate = parseISO(r.createdAt);
        return createdDate >= startDate && createdDate <= endDate;
      }).length;

      data.push({ name: label, requests: count });
    }

    return data;
  }, [timeRange]);

  /* ----------------------------------
     STATUS BREAKDOWN
  ---------------------------------- */

  const statusData = useMemo(() => {
    const counts: Record<string, number> = {};

    customerRequests.forEach((r) => {
      const status = r.status || 'pending';
      counts[status] = (counts[status] || 0) + 1;
    });

    return Object.entries(counts).map(([status, count]) => ({
      name: status.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
      value: count,
    }));
  }, [customerRequests]);

  /* ----------------------------------
     URGENCY BREAKDOWN
  ---------------------------------- */

  const urgencyData = useMemo(() => {
    const counts: Record<string, number> = {};

    customerRequests.forEach((r) => {
      const urgency = r.urgency || 'medium';
      counts[urgency] = (counts[urgency] || 0) + 1;
    });

    return Object.entries(counts).map(([urgency, count]) => ({
      name: urgency.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
      value: count,
    }));
  }, [customerRequests]);

  /* ----------------------------------
     AVG COMPLETION TIME
  ---------------------------------- */

  const avgCompletionTime = useMemo(() => {
    const completed = customerRequests.filter(
      (r) => r.status === "completed"
    );

    if (!completed.length) return 0;

    const totalDays = completed.reduce((sum, r) => {
      const created = parseISO(r.createdAt);
      const resolved = parseISO(r.updatedAt);
      return sum + differenceInDays(resolved, created);
    }, 0);

    return (totalDays / completed.length).toFixed(1);
  }, [customerRequests]);

  /* ----------------------------------
     SERVICE TYPE DATA
  ---------------------------------- */

  const serviceTypeData = useMemo(() => {
    const counts: Record<string, number> = {};

    customerRequests.forEach((r) => {
      const type = r.serviceType || "Not Specified";
      counts[type] = (counts[type] || 0) + 1;
    });

    return Object.entries(counts)
      .map(([type, count]) => ({ name: type, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [customerRequests]);

  /* ----------------------------------
     STATS
  ---------------------------------- */

  const stats = useMemo(() => {
    const pending = customerRequests.filter((r) => r.status === "pending").length;
    const inProgress = customerRequests.filter((r) => r.status === "in_progress").length;
    const completed = customerRequests.filter((r) => r.status === "completed").length;
    const highUrgency = customerRequests.filter(
      (r) => r.urgency === "high" || r.urgency === "critical"
    ).length;

    return { pending, inProgress, completed, highUrgency };
  }, [customerRequests]);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Reports & Analytics</h1>
            <p className="text-slate-600 mt-2">
              Real-time service request insights and performance metrics
            </p>
          </div>
          
          <Button 
            onClick={handleExportReport}
            disabled={isExporting}
            className="h-12 px-6 bg-green-600 hover:bg-green-700 gap-2"
          >
            <FileText className="w-5 h-5" />
            {isExporting ? 'Exporting...' : 'Export Report'}
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">
                Total Requests
              </CardTitle>
              <FileText className="w-4 h-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">
                {customerRequests.length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">
                In Progress
              </CardTitle>
              <TrendingUp className="w-4 h-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">
                {stats.inProgress}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">
                Avg. Completion Time
              </CardTitle>
              <Clock className="w-4 h-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">
                {avgCompletionTime} days
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">
                High Priority
              </CardTitle>
              <AlertCircle className="w-4 h-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">
                {stats.highUrgency}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Request Volume */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Request Volume Over Time</CardTitle>
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>

          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={volumeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="requests" stroke="#3b82f6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Pie Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Requests by Status</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, percent }) =>
                      `${name} (${((percent || 0) * 100).toFixed(0)}%)`
                    }
                  >
                    {statusData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Requests by Urgency</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={urgencyData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, percent }) =>
                      `${name} (${((percent || 0) * 100).toFixed(0)}%)`
                    }
                  >
                    {urgencyData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Service Types */}
        <Card>
          <CardHeader>
            <CardTitle>Most Frequent Service Types</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={serviceTypeData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={160} />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
