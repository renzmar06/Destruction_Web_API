import React, { useState, useMemo } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, Archive, Search, DollarSign } from "lucide-react";
import { motion } from "framer-motion";
import Pagination from "../common/Pagination";
import AdvancedFilters from "../common/AdvancedFilters";

const categoryLabels = {
  transportation: 'Transportation',
  disposal_processing: 'Disposal/Processing',
  equipment_rental: 'Equipment Rental',
  utilities: 'Utilities',
  fuel: 'Fuel',
  storage: 'Storage',
  other: 'Other'
};

export default function VendorList({ vendors, expenses, onView, onArchive, isLoading }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('created_date');
  const [sortOrder, setSortOrder] = useState('desc');

  // Calculate total spending per vendor
  const getVendorSpending = (vendorId) => {
    return expenses
      .filter(exp => exp.vendor_id === vendorId && exp.expense_status === 'approved')
      .reduce((sum, exp) => sum + (exp.amount || 0), 0);
  };

  const filteredAndSortedVendors = useMemo(() => {
    let filtered = vendors.filter(vendor =>
      (vendor.vendor_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
       vendor.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
       vendor.contact_person?.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (statusFilter === 'all' || vendor.vendor_status === statusFilter) &&
      (categoryFilter === 'all' || vendor.vendor_category === categoryFilter)
    );

    // Sort
    filtered.sort((a, b) => {
      let aVal = a[sortBy];
      let bVal = b[sortBy];
      
      if (sortBy === 'name') {
        aVal = a.vendor_name;
        bVal = b.vendor_name;
      }
      
      if (typeof aVal === 'string') {
        return sortOrder === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      return sortOrder === 'asc' ? (aVal > bVal ? 1 : -1) : (bVal > aVal ? 1 : -1);
    });

    return filtered;
  }, [vendors, searchTerm, statusFilter, categoryFilter, sortBy, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedVendors.length / pageSize);
  const paginatedVendors = filteredAndSortedVendors.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handlePageChange = (page) => setCurrentPage(page);
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
      id: 'category',
      label: 'Category',
      value: categoryFilter,
      options: Object.entries(categoryLabels).map(([key, label]) => ({ value: key, label }))
    }
  ];

  const handleFilterChange = (filterId, value) => {
    if (filterId === 'status') setStatusFilter(value);
    if (filterId === 'category') setCategoryFilter(value);
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setStatusFilter('all');
    setCategoryFilter('all');
    setCurrentPage(1);
  };

  const renderVendorTable = (vendorList) => (
    <Table>
      <TableHeader>
        <TableRow className="bg-slate-50">
          <TableHead className="font-semibold">Vendor Name</TableHead>
          <TableHead className="font-semibold">Contact</TableHead>
          <TableHead className="font-semibold">Category</TableHead>
          <TableHead className="font-semibold">Payment Terms</TableHead>
          <TableHead className="font-semibold text-right">Total Spending</TableHead>
          <TableHead className="font-semibold text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {vendorList.length === 0 ? (
          <TableRow>
            <TableCell colSpan={6} className="text-center py-12 text-slate-500">
              {searchTerm ? 'No vendors found' : 'No vendors yet. Add your first vendor.'}
            </TableCell>
          </TableRow>
        ) : (
          vendorList.map((vendor) => {
            const totalSpending = getVendorSpending(vendor.id);
            return (
              <motion.tr
                key={vendor.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
              >
                <TableCell>
                  <div>
                    <p className="font-medium text-slate-900">{vendor.vendor_name}</p>
                    {vendor.contact_person && (
                      <p className="text-xs text-slate-500">{vendor.contact_person}</p>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    <p className="text-slate-700">{vendor.email}</p>
                    <p className="text-slate-500 text-xs">{vendor.phone}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-xs">
                    {categoryLabels[vendor.vendor_category] || 'Other'}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-slate-600">
                  {vendor.payment_terms?.replace('_', ' ').toUpperCase() || '-'}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <DollarSign className="w-4 h-4 text-slate-400" />
                    <span className="font-semibold text-slate-900">
                      {totalSpending.toFixed(2)}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onView(vendor)}
                      className="h-8 gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      View
                    </Button>
                    {vendor.vendor_status === 'active' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onArchive(vendor)}
                        className="h-8 gap-2 text-slate-600"
                      >
                        <Archive className="w-4 h-4" />
                        Archive
                      </Button>
                    )}
                  </div>
                </TableCell>
              </motion.tr>
            );
          })
        )}
      </TableBody>
    </Table>
  );

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search vendors..."
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

        {isLoading ? (
          <div className="p-6">
            {Array(5).fill(0).map((_, i) => (
              <div key={i} className="h-12 bg-slate-100 rounded animate-pulse mb-2" />
            ))}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              {renderVendorTable(paginatedVendors)}
            </div>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredAndSortedVendors.length}
              pageSize={pageSize}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
            />
          </>
        )}
      </div>
    </div>
  );
}