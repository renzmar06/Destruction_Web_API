import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Eye, XCircle, CheckCircle, Trash2, Search } from "lucide-react";
import { motion } from "framer-motion";

const categoryLabels = {
  recycling: 'Recycling',
  shredding: 'Shredding',
  data_destruction: 'Data Destruction',
  beverage_destruction: 'Beverage Destruction',
  liquid_processing: 'Liquid Processing',
  packaging_destruction: 'Packaging Destruction',
  transportation: 'Transportation',
  certificate_affidavit: 'Certificate / Affidavit',
  storage: 'Storage',
  other: 'Other'
};

const pricingUnitLabels = {
  per_case: 'Per Case',
  per_lb: 'Per LB',
  per_pallet: 'Per Pallet',
  per_load: 'Per Load',
  by_packaging_type: 'By Packaging Type',
  flat_fee: 'Flat Fee'
};

export default function ServiceList({ services, onView, onDeactivate, onReactivate, isLoading, onClearFilters }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Clear filters function
  const clearAllFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setCategoryFilter('all');
  };

  // Expose clear function to parent
  React.useEffect(() => {
    if (onClearFilters) {
      onClearFilters(clearAllFilters);
    }
  }, [onClearFilters]);

  const filteredServices = services.filter(service => {
    const matchesSearch = service.service_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || service.service_status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || service.service_category === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
      <div className="p-6 border-b border-slate-100 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search services..."
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
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>

          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-52">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {Object.entries(categoryLabels).map(([key, label]) => (
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
              <TableHead className="font-semibold">Service Name</TableHead>
              <TableHead className="font-semibold">Category</TableHead>
              <TableHead className="font-semibold">Pricing Unit</TableHead>
              <TableHead className="font-semibold text-right">Default Rate</TableHead>
              <TableHead className="font-semibold">Status</TableHead>
              <TableHead className="font-semibold text-right">Actions</TableHead>
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
            ) : filteredServices.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-slate-500">
                  {searchTerm || statusFilter !== 'all' || categoryFilter !== 'all'
                    ? 'No services found'
                    : 'No services yet. Add your first service to get started.'}
                </TableCell>
              </TableRow>
            ) : (
              filteredServices.map((service) => (
                <motion.tr
                  key={service._id || service.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                >
                  <TableCell className="font-medium text-slate-900">{service.service_name}</TableCell>
                  <TableCell className="text-slate-700">{categoryLabels[service.service_category]}</TableCell>
                  <TableCell className="text-slate-700">{pricingUnitLabels[service.pricing_unit]}</TableCell>
                  <TableCell className="text-right font-semibold text-slate-900">
                    ${service.default_rate?.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <Badge className={service.service_status === 'active' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-slate-100 text-slate-500'}>
                      {service.service_status === 'active' ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onView(service)}
                        className="h-8 gap-2"
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </Button>
                      {service.service_status === 'active' ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDeactivate(service)}
                          className="h-8 gap-2 text-slate-600"
                        >
                          <XCircle className="w-4 h-4" />
                          Deactivate
                        </Button>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onReactivate(service)}
                          className="h-8 gap-2 text-green-600"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Reactivate
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