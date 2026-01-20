import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Eye, CheckCircle, Archive, Search } from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";

const statusConfig = {
  draft: { label: 'Draft', className: 'bg-slate-100 text-slate-700 border-slate-200' },
  submitted: { label: 'Submitted', className: 'bg-blue-100 text-blue-700 border-blue-200' },
  approved: { label: 'Approved', className: 'bg-green-100 text-green-700 border-green-200' },
  archived: { label: 'Archived', className: 'bg-slate-100 text-slate-500 border-slate-200' }
};

const expenseTypeLabels = {
  transportation: 'Transportation',
  disposal_processing: 'Disposal / Processing',
  equipment_rental: 'Equipment Rental',
  labor: 'Labor',
  utilities: 'Utilities',
  fuel: 'Fuel',
  storage: 'Storage',
  other: 'Other'
};

export default function ExpenseList({ expenses, onView, onApprove, onArchive, isLoading }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [sortBy, setSortBy] = useState('created_date');
  const [sortOrder, setSortOrder] = useState('desc');

  const filteredExpenses = expenses.filter(expense => {
    const matchesSearch = expense.expense_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         expense.vendor_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         expense.job_reference?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || expense.expense_status === statusFilter;
    const matchesType = typeFilter === 'all' || expense.expense_type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
      <div className="p-6 border-b border-slate-100 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search expenses..."
            className="pl-10 h-12 border-slate-200"
          />
        </div>
        
        <div className="flex gap-3">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="submitted">Submitted</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>

          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-52">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {Object.entries(expenseTypeLabels).map(([key, label]) => (
                <SelectItem key={key} value={key}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50">
              <TableHead className="font-semibold">Expense ID</TableHead>
              <TableHead className="font-semibold">Type</TableHead>
              <TableHead className="font-semibold">Vendor</TableHead>
              <TableHead className="font-semibold">Job</TableHead>
              <TableHead className="font-semibold">Amount</TableHead>
              <TableHead className="font-semibold">Date</TableHead>
              <TableHead className="font-semibold">Status</TableHead>
              <TableHead className="font-semibold text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array(5).fill(0).map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={8}>
                    <div className="h-4 bg-slate-100 rounded animate-pulse" />
                  </TableCell>
                </TableRow>
              ))
            ) : filteredExpenses.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-12 text-slate-500">
                  {searchTerm || statusFilter !== 'all' || typeFilter !== 'all' 
                    ? 'No expenses found' 
                    : 'No expenses yet. Add your first expense to get started.'}
                </TableCell>
              </TableRow>
            ) : (
              filteredExpenses.map((expense) => (
                <motion.tr
                  key={expense.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                >
                  <TableCell className="font-medium text-slate-900">{expense.expense_id}</TableCell>
                  <TableCell className="text-slate-700">{expenseTypeLabels[expense.expense_type]}</TableCell>
                  <TableCell className="text-slate-700">{expense.vendor_name}</TableCell>
                  <TableCell className="text-slate-600 text-sm">{expense.job_reference || '-'}</TableCell>
                  <TableCell className="font-semibold text-slate-900">${expense.amount?.toFixed(2)}</TableCell>
                  <TableCell className="text-slate-600 text-sm">
                    {expense.expense_date ? format(new Date(expense.expense_date), 'MMM d, yyyy') : 'N/A'}
                  </TableCell>
                  <TableCell>
                    <Badge className={statusConfig[expense.expense_status]?.className}>
                      {statusConfig[expense.expense_status]?.label}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onView(expense)}
                        className="h-8 gap-2"
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </Button>
                      {expense.expense_status === 'submitted' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onApprove(expense)}
                          className="h-8 gap-2 text-green-600 hover:text-green-700"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Approve
                        </Button>
                      )}
                      {expense.expense_status === 'approved' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onArchive(expense)}
                          className="h-8 gap-2 text-slate-600 hover:text-slate-700"
                        >
                          <Archive className="w-4 h-4" />
                          Archive
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </motion.tr>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}