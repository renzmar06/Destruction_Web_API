import React, { useState, useMemo } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, Archive, Search, ChevronDown, FileText, Mail, DollarSign } from "lucide-react";
import { motion } from "framer-motion";
import Pagination from "../common/Pagination";
import AdvancedFilters from "../common/AdvancedFilters";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const companyTypeLabels = {
  brand_owner: 'Brand Owner',
  distributor: 'Distributor',
  co_packer: 'Co-Packer',
  retailer: 'Retailer',
  '3pl_warehouse': '3PL / Warehouse',
  broker: 'Broker'
};

export default function CustomerList({ 
  customers, 
  onView, 
  onArchive, 
  isLoading,
  onCreateInvoice,
  onCreateEstimate,
  onCreateJob,
  onReceivePayment 
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [sortBy, setSortBy] = useState('created_date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedCustomers, setSelectedCustomers] = useState([]);

  const filteredAndSortedCustomers = useMemo(() => {
    let filtered = customers.filter(customer =>
      (customer.legal_company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
       customer.display_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
       customer.email?.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (statusFilter === 'all' || customer.customer_status === statusFilter) &&
      (typeFilter === 'all' || customer.customer_type === typeFilter)
    );

    // Sort
    filtered.sort((a, b) => {
      let aVal = a[sortBy];
      let bVal = b[sortBy];
      
      if (sortBy === 'name') {
        aVal = a.legal_company_name;
        bVal = b.legal_company_name;
      }
      
      if (typeof aVal === 'string') {
        return sortOrder === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      return sortOrder === 'asc' ? (aVal > bVal ? 1 : -1) : (bVal > aVal ? 1 : -1);
    });

    return filtered;
  }, [customers, searchTerm, statusFilter, typeFilter, sortBy, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedCustomers.length / pageSize);
  const paginatedCustomers = filteredAndSortedCustomers.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (newSize) => {
    setPageSize(newSize);
    setCurrentPage(1);
  };

  const filters = [
    {
      id: 'status',
      label: 'Status',
      value: statusFilter,
      options: [
        { value: 'active', label: 'Active' },
        { value: 'archived', label: 'Archived' }
      ]
    },
    {
      id: 'type',
      label: 'Type',
      value: typeFilter,
      options: [
        { value: 'brand_owner', label: 'Brand Owner' },
        { value: 'distributor', label: 'Distributor' },
        { value: 'co_packer', label: 'Co-Packer' },
        { value: 'retailer', label: 'Retailer' },
        { value: '3pl_warehouse', label: '3PL / Warehouse' },
        { value: 'broker', label: 'Broker' }
      ]
    }
  ];

  const handleFilterChange = (filterId, value) => {
    if (filterId === 'status') setStatusFilter(value);
    if (filterId === 'type') setTypeFilter(value);
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setStatusFilter('all');
    setTypeFilter('all');
    setCurrentPage(1);
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedCustomers(paginatedCustomers.map(c => c.id));
    } else {
      setSelectedCustomers([]);
    }
  };

  const handleSelectCustomer = (customerId, checked) => {
    if (checked) {
      setSelectedCustomers([...selectedCustomers, customerId]);
    } else {
      setSelectedCustomers(selectedCustomers.filter(id => id !== customerId));
    }
  };

  // Calculate financial summary
  const totalReceivable = filteredAndSortedCustomers.reduce((sum, c) => sum + (c.opening_balance || 0), 0);
  const overdue = filteredAndSortedCustomers.filter(c => (c.opening_balance || 0) > 0).length;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
      {/* Financial Summary Bar */}
      <div className="bg-slate-800 text-white p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex gap-8">
            <div>
              <div className="text-3xl font-bold">${totalReceivable.toFixed(2)}</div>
              <div className="text-xs text-slate-300 mt-1">Total Receivable</div>
            </div>
            <div className="flex gap-6 items-center">
              <div className="text-center">
                <div className="text-lg font-semibold">$0.00</div>
                <div className="text-xs text-slate-300">Overdue</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold">${(totalReceivable * 0.3).toFixed(2)}</div>
                <div className="text-xs text-slate-300">Not Due</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold">${(totalReceivable * 0.4).toFixed(2)}</div>
                <div className="text-xs text-slate-300">1-30 Days</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold">${(totalReceivable * 0.3).toFixed(2)}</div>
                <div className="text-xs text-slate-300">31+ Days</div>
              </div>
            </div>
          </div>
        </div>
        {/* Progress bar */}
        <div className="h-3 bg-slate-700 rounded-full overflow-hidden flex">
          <div className="bg-blue-500" style={{ width: '40%' }} />
          <div className="bg-purple-500" style={{ width: '15%' }} />
          <div className="bg-orange-500" style={{ width: '20%' }} />
          <div className="bg-slate-500" style={{ width: '15%' }} />
          <div className="bg-green-500" style={{ width: '10%' }} />
        </div>
      </div>
      <div className="p-6 border-b border-slate-100 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <Input
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search customers..."
            className="pl-10 h-12 border-slate-200"
          />
        </div>
        <AdvancedFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          onClearFilters={handleClearFilters}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSortChange={(field, order) => {
            setSortBy(field || sortBy);
            setSortOrder(order || (sortOrder === 'asc' ? 'desc' : 'asc'));
          }}
        />
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50 border-b-2 border-slate-200">
              <TableHead className="w-12">
                <Checkbox
                  checked={selectedCustomers.length === paginatedCustomers.length && paginatedCustomers.length > 0}
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              <TableHead className="font-semibold text-slate-700">NAME ↕</TableHead>
              <TableHead className="font-semibold text-slate-700">COMPANY NAME ↕</TableHead>
              <TableHead className="font-semibold text-slate-700">PHONE</TableHead>
              <TableHead className="font-semibold text-slate-700 text-right">OPEN BALANCE ↕</TableHead>
              <TableHead className="font-semibold text-slate-700 text-right">ACTION</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array(5).fill(0).map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={6}>
                    <div className="h-4 bg-slate-100 rounded animate-pulse" />
                  </TableCell>
                </TableRow>
              ))
            ) : paginatedCustomers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-slate-500">
                  {searchTerm ? 'No customers found' : 'No customers yet. Add your first customer to get started.'}
                </TableCell>
              </TableRow>
            ) : (
              paginatedCustomers.map((customer) => {
                const isSelected = selectedCustomers.includes(customer.id);
                const customerName = customer.first_name || customer.last_name 
                  ? `${customer.first_name || ''} ${customer.last_name || ''}`.trim()
                  : customer.display_name || '—';
                const openBalance = customer.opening_balance || 0;
                
                return (
                  <motion.tr
                    key={customer.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                  >
                    <TableCell>
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={(checked) => handleSelectCustomer(customer.id, checked)}
                      />
                    </TableCell>
                    <TableCell className="font-medium text-blue-600 hover:underline cursor-pointer">
                      <button onClick={() => onView(customer)} className="text-left">
                        {customerName}
                      </button>
                    </TableCell>
                    <TableCell className="text-slate-700">
                      {customer.legal_company_name || customer.display_name || '—'}
                    </TableCell>
                    <TableCell className="text-slate-600">
                      {customer.phone || '—'}
                    </TableCell>
                    <TableCell className="text-right font-semibold text-slate-900">
                      ${openBalance.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 gap-1 text-blue-600">
                            Create invoice
                            <ChevronDown className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onView(customer)}>
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onCreateInvoice?.(customer)}>
                            Create Invoice
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onCreateEstimate?.(customer)}>
                            <FileText className="w-4 h-4 mr-2" />
                            Create Estimate
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onCreateJob?.(customer)}>
                            Create Job
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onReceivePayment?.(customer)}>
                            <DollarSign className="w-4 h-4 mr-2" />
                            Receive Payment
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Mail className="w-4 h-4 mr-2" />
                            Send Email
                          </DropdownMenuItem>
                          {customer.customer_status === 'active' && (
                            <DropdownMenuItem onClick={() => onArchive(customer)} className="text-red-600">
                              <Archive className="w-4 h-4 mr-2" />
                              Archive
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </motion.tr>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={filteredAndSortedCustomers.length}
        pageSize={pageSize}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
      />
    </div>
  );
}