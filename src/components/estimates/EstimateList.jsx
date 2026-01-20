import React, { useState } from 'react';
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { CheckCircle, ChevronDown, Settings, Printer, Mail, MessageSquare, Copy, Trash2, Activity, Link as LinkIcon, FileText } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import EstimateDetailsSidebar from './EstimateDetailsSidebar';
import ActivityLogModal from './ActivityLogModal';
import DeleteEstimateModal from './DeleteEstimateModal';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";

const statusConfig = {
  draft: { label: 'Draft', class: 'text-slate-700', icon: null },
  sent: { label: 'Pending', class: 'text-blue-700', icon: null },
  accepted: { label: 'Converted', class: 'text-green-700', icon: CheckCircle },
  expired: { label: 'Expired', class: 'text-red-700', icon: null },
  cancelled: { label: 'Cancelled', class: 'text-gray-700', icon: null }
};

export default function EstimateList({ estimates, customers, onView, onSend, onAccept, onConvert, isLoading }) {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('last_12');
  const [selectedEstimates, setSelectedEstimates] = useState([]);
  const [sendDialogOpen, setSendDialogOpen] = useState(false);
  const [selectedEstimate, setSelectedEstimate] = useState(null);
  const [sendMethod, setSendMethod] = useState('email');
  const [sendEmail, setSendEmail] = useState('');
  const [sendPhone, setSendPhone] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarEstimate, setSidebarEstimate] = useState(null);
  const [activityModalOpen, setActivityModalOpen] = useState(false);
  const [activityEstimate, setActivityEstimate] = useState(null);
  const [poDialogOpen, setPODialogOpen] = useState(false);
  const [selectedVendorId, setSelectedVendorId] = useState('');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [estimateToDelete, setEstimateToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState('');

  const { data: vendors = [] } = useQuery({
    queryKey: ['vendors'],
    queryFn: () => base44.entities.Vendor.list(),
  });

  // Fetch line items for sidebar estimate
  const { data: sidebarLineItems = [] } = useQuery({
    queryKey: ['estimateLineItems', sidebarEstimate?.id],
    queryFn: () => sidebarEstimate?.id ? base44.entities.EstimateLineItem.filter({ estimate_id: sidebarEstimate.id }, 'sort_order') : [],
    enabled: !!sidebarEstimate?.id
  });
  
  // Column visibility and rows settings
  const [visibleColumns, setVisibleColumns] = useState(() => {
    const saved = localStorage.getItem('estimateColumns');
    return saved ? JSON.parse(saved) : {
      date: true,
      number: true,
      customer: true,
      amount: true,
      status: true,
      expiration: false
    };
  });
  const [rowsPerPage, setRowsPerPage] = useState(() => {
    const saved = localStorage.getItem('estimateRowsPerPage');
    return saved ? parseInt(saved) : 100;
  });
  const [currentPage, setCurrentPage] = useState(1);

  const toggleSelectAll = () => {
    if (selectedEstimates.length === filteredEstimates.length) {
      setSelectedEstimates([]);
    } else {
      setSelectedEstimates(filteredEstimates.map(e => e.id));
    }
  };

  const toggleSelect = (estimateId) => {
    if (selectedEstimates.includes(estimateId)) {
      setSelectedEstimates(selectedEstimates.filter(id => id !== estimateId));
    } else {
      setSelectedEstimates([...selectedEstimates, estimateId]);
    }
  };

  const toggleColumn = (column) => {
    setVisibleColumns(prev => ({ ...prev, [column]: !prev[column] }));
  };

  const saveAsDefault = () => {
    localStorage.setItem('estimateColumns', JSON.stringify(visibleColumns));
    localStorage.setItem('estimateRowsPerPage', rowsPerPage.toString());
    alert('Settings saved as default');
  };

  const handleSendClick = (estimate) => {
    setSelectedEstimate(estimate);
    setSendEmail(estimate.customer_email || '');
    setSendPhone('');
    setSendMethod('email');
    setSendDialogOpen(true);
  };

  const handleSendSubmit = async () => {
    if (sendMethod === 'email' && sendEmail) {
      try {
        const response = await base44.functions.invoke('sendEstimate', {
          estimate_id: selectedEstimate.id,
          delivery_method: 'email',
          recipient: sendEmail
        });
        if (response.data.success) {
          queryClient.invalidateQueries({ queryKey: ['estimates'] });
          alert(response.data.message);
          setSendDialogOpen(false);
        }
      } catch (error) {
        alert('Failed to send estimate: ' + error.message);
      }
    } else if (sendMethod === 'sms' && sendPhone) {
      alert('SMS sending not yet implemented');
      setSendDialogOpen(false);
    }
  };

  const handleDuplicate = async (estimate) => {
    try {
      const response = await base44.functions.invoke('duplicateEstimate', { estimate_id: estimate.id });
      if (response.data.success) {
        queryClient.invalidateQueries({ queryKey: ['estimates'] });
        alert(`Estimate duplicated as ${response.data.estimate.estimate_number}`);
      }
    } catch (error) {
      alert('Failed to duplicate estimate: ' + error.message);
    }
  };

  const handleShareLink = async (estimate) => {
    try {
      const response = await base44.functions.invoke('generateEstimateShareLink', {
        estimate_id: estimate.id
      });
      if (response.data.success) {
        setSelectedEstimate(estimate);
        setShareUrl(response.data.share_url);
        setShareDialogOpen(true);
      }
    } catch (error) {
      toast.error('Unable to generate share link. Please try again.');
    }
  };

  const handlePrint = async (estimate) => {
    try {
      const response = await base44.functions.invoke('exportEstimatePDF', { estimateId: estimate.id });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');
      window.URL.revokeObjectURL(url);
    } catch (error) {
      alert('Failed to print estimate: ' + error.message);
    }
  };

  const handleUpdateStatus = async (estimate) => {
    const newStatus = prompt(
      `Update status for ${estimate.estimate_number}\n\nEnter new status (draft, sent, accepted, expired, cancelled):`,
      estimate.estimate_status
    );
    
    if (newStatus && newStatus !== estimate.estimate_status) {
      try {
        const response = await base44.functions.invoke('updateEstimateStatus', {
          estimate_id: estimate.id,
          new_status: newStatus
        });
        if (response.data.success) {
          queryClient.invalidateQueries({ queryKey: ['estimates'] });
          alert(response.data.message);
        }
      } catch (error) {
        alert('Failed to update status: ' + error.message);
      }
    }
  };

  const handleCopyToPO = (estimate) => {
    setSelectedEstimate(estimate);
    setPODialogOpen(true);
  };

  const handlePOSubmit = async () => {
    if (!selectedVendorId) {
      alert('Please select a vendor');
      return;
    }

    try {
      const response = await base44.functions.invoke('copyEstimateToPO', {
        estimate_id: selectedEstimate.id,
        vendor_id: selectedVendorId
      });
      
      if (response.data.success) {
        queryClient.invalidateQueries({ queryKey: ['purchaseOrders'] });
        alert(`Purchase Order ${response.data.po.po_number} created successfully`);
        setPODialogOpen(false);
        setSelectedVendorId('');
      }
    } catch (error) {
      alert('Failed to create PO: ' + error.message);
    }
  };

  const handleDelete = (estimate) => {
    setEstimateToDelete(estimate);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!estimateToDelete) return;

    setIsDeleting(true);
    try {
      const response = await base44.functions.invoke('deleteEstimate', { estimate_id: estimateToDelete.id });
      if (response.data.success) {
        queryClient.invalidateQueries({ queryKey: ['estimates'] });
        
        // Log activity
        await base44.functions.invoke('logActivity', {
          entity_type: 'estimate',
          entity_id: estimateToDelete.id,
          entity_reference: estimateToDelete.estimate_number,
          action_type: 'deleted',
          action_description: `Estimate ${estimateToDelete.estimate_number} was deleted`
        });
        
        toast.success(`Estimate ${estimateToDelete.estimate_number} was deleted.`);
        setDeleteModalOpen(false);
        setEstimateToDelete(null);
      }
    } catch (error) {
      toast.error('Failed to delete estimate: ' + error.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleViewActivity = (estimate) => {
    setActivityEstimate(estimate);
    setActivityModalOpen(true);
  };

  const handleRowClick = (estimate, e) => {
    // Don't open sidebar if clicking on action buttons or checkboxes
    if (e.target.closest('button') || e.target.closest('input[type="checkbox"]') || e.target.closest('a')) {
      return;
    }
    setSidebarEstimate(estimate);
    setSidebarOpen(true);
  };

  const handleSidebarEdit = () => {
    setSidebarOpen(false);
    if (sidebarEstimate) {
      onView(sidebarEstimate);
    }
  };

  const handleSidebarMoreActions = (action) => {
    const estimate = sidebarEstimate;
    
    switch (action) {
      case 'send':
        setSidebarOpen(false);
        handleSendClick(estimate);
        break;
      case 'convert':
        setSidebarOpen(false);
        onConvert(estimate);
        break;
      case 'accept':
        setSidebarOpen(false);
        if (onAccept) onAccept(estimate);
        break;
      case 'duplicate':
        setSidebarOpen(false);
        handleDuplicate(estimate);
        break;
      case 'share':
        handleShareLink(estimate);
        break;
      case 'print':
        handlePrint(estimate);
        break;
      case 'updateStatus':
        handleUpdateStatus(estimate);
        break;
      case 'copyToPO':
        setSidebarOpen(false);
        handleCopyToPO(estimate);
        break;
      case 'delete':
        setSidebarOpen(false);
        handleDelete(estimate);
        break;
      case 'viewActivity':
        setSidebarOpen(false);
        handleViewActivity(estimate);
        break;
      default:
        break;
    }
  };

  const filteredEstimates = estimates.filter(estimate => {
    const matchesStatus = statusFilter === 'all' || estimate.estimate_status === statusFilter;
    return matchesStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filteredEstimates.length / rowsPerPage);
  const paginatedEstimates = filteredEstimates.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  return (
    <div className="space-y-4">
      {/* Batch Actions & Filters Bar */}
      <div className="flex items-center gap-4">
        <Select defaultValue="batch">
          <SelectTrigger className="w-40 h-9 border-slate-300">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="batch">Batch actions</SelectItem>
            <SelectItem value="send">Send estimates</SelectItem>
            <SelectItem value="export">Export selected</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-slate-700">Status</label>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-32 h-9 border-slate-300">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="sent">Pending</SelectItem>
              <SelectItem value="accepted">Converted</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-slate-700">Date</label>
          <Select value={dateFilter} onValueChange={setDateFilter}>
            <SelectTrigger className="w-40 h-9 border-slate-300">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="last_12">Last 12 months</SelectItem>
              <SelectItem value="last_30">Last 30 days</SelectItem>
              <SelectItem value="last_90">Last 90 days</SelectItem>
              <SelectItem value="this_year">This year</SelectItem>
              <SelectItem value="all">All time</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="w-12 px-4 py-3">
                <Checkbox 
                  checked={selectedEstimates.length === paginatedEstimates.length && paginatedEstimates.length > 0}
                  onCheckedChange={toggleSelectAll}
                />
              </th>
              {visibleColumns.date && (
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">
                  DATE
                </th>
              )}
              {visibleColumns.number && (
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">
                  NO.
                </th>
              )}
              {visibleColumns.customer && (
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">
                  CUSTOMER / PROJECT
                </th>
              )}
              {visibleColumns.amount && (
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 uppercase">
                  AMOUNT
                </th>
              )}
              {visibleColumns.status && (
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase cursor-pointer hover:text-slate-900">
                  STATUS ▲
                </th>
              )}
              {visibleColumns.expiration && (
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">
                  EXPIRATION DATE
                </th>
              )}
              <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 uppercase">
                ACTION
                <Popover>
                  <PopoverTrigger asChild>
                    <button className="inline-flex items-center ml-1 hover:text-slate-900">
                      <Settings className="w-3 h-3" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80" align="end">
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold mb-3">Columns</h4>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              id="col-date" 
                              checked={visibleColumns.date}
                              onCheckedChange={() => toggleColumn('date')}
                            />
                            <label htmlFor="col-date" className="text-sm cursor-pointer">Date</label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              id="col-number" 
                              checked={visibleColumns.number}
                              onCheckedChange={() => toggleColumn('number')}
                            />
                            <label htmlFor="col-number" className="text-sm cursor-pointer">Estimate number</label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              id="col-customer" 
                              checked={visibleColumns.customer}
                              onCheckedChange={() => toggleColumn('customer')}
                            />
                            <label htmlFor="col-customer" className="text-sm cursor-pointer">Customer</label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              id="col-amount" 
                              checked={visibleColumns.amount}
                              onCheckedChange={() => toggleColumn('amount')}
                            />
                            <label htmlFor="col-amount" className="text-sm cursor-pointer">Amount</label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              id="col-status" 
                              checked={visibleColumns.status}
                              onCheckedChange={() => toggleColumn('status')}
                            />
                            <label htmlFor="col-status" className="text-sm cursor-pointer">Status</label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              id="col-expiration" 
                              checked={visibleColumns.expiration}
                              onCheckedChange={() => toggleColumn('expiration')}
                            />
                            <label htmlFor="col-expiration" className="text-sm cursor-pointer">Expiration date</label>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold mb-3">Rows</h4>
                        <RadioGroup value={rowsPerPage.toString()} onValueChange={(v) => setRowsPerPage(parseInt(v))}>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="50" id="rows-50" />
                            <Label htmlFor="rows-50" className="cursor-pointer">50</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="100" id="rows-100" />
                            <Label htmlFor="rows-100" className="cursor-pointer">100</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="200" id="rows-200" />
                            <Label htmlFor="rows-200" className="cursor-pointer">200</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="300" id="rows-300" />
                            <Label htmlFor="rows-300" className="cursor-pointer">300</Label>
                          </div>
                        </RadioGroup>
                      </div>

                      <Button 
                        onClick={saveAsDefault}
                        className="w-full bg-green-600 hover:bg-green-700"
                      >
                        Save as default
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, idx) => (
                <tr key={idx}>
                  <td className="px-4 py-3">
                    <div className="h-4 w-4 bg-slate-200 rounded animate-pulse"></div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="h-4 bg-slate-200 rounded animate-pulse w-20"></div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="h-4 bg-slate-200 rounded animate-pulse w-16"></div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="h-4 bg-slate-200 rounded animate-pulse w-32"></div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="h-4 bg-slate-200 rounded animate-pulse w-20 ml-auto"></div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="h-4 bg-slate-200 rounded animate-pulse w-24"></div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="h-8 bg-slate-200 rounded animate-pulse w-32 ml-auto"></div>
                  </td>
                </tr>
              ))
            ) : filteredEstimates.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-4 py-12 text-center text-slate-500">
                  {estimates.length === 0 ? 'No estimates yet.' : 'No estimates match your filters.'}
                </td>
              </tr>
            ) : (
              paginatedEstimates.map((estimate) => {
                const config = statusConfig[estimate?.estimate_status] || statusConfig.draft;
                const StatusIcon = config.icon;
                const isSelected = selectedEstimates.includes(estimate.id);
                
                return (
                  <tr 
                    key={estimate.id} 
                    className={`hover:bg-slate-50 cursor-pointer ${isSelected ? 'bg-blue-50' : ''}`}
                    onClick={(e) => handleRowClick(estimate, e)}
                  >
                    <td className="px-4 py-3">
                      <Checkbox 
                        checked={isSelected}
                        onCheckedChange={() => toggleSelect(estimate.id)}
                      />
                    </td>
                    {visibleColumns.date && (
                      <td className="px-4 py-3 text-sm text-slate-900">
                        {new Date(estimate.estimate_date).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: '2-digit' })}
                      </td>
                    )}
                    {visibleColumns.number && (
                      <td className="px-4 py-3 text-sm font-medium text-slate-900">
                        {estimate.estimate_number}
                      </td>
                    )}
                    {visibleColumns.customer && (
                      <td className="px-4 py-3 text-sm text-slate-900">
                        {estimate.customer_name}
                      </td>
                    )}
                    {visibleColumns.amount && (
                      <td className="px-4 py-3 text-sm text-right font-medium text-slate-900">
                        ${estimate.total_amount?.toFixed(2) || '0.00'}
                      </td>
                    )}
                    {visibleColumns.status && (
                      <td className="px-4 py-3">
                        <div className={`flex items-center gap-1.5 ${config.class}`}>
                          {StatusIcon && <StatusIcon className="w-4 h-4 text-green-600" />}
                          <div>
                            <div className="text-sm">{config.label}</div>
                            {estimate.estimate_status === 'sent' && estimate.sent_date && (
                              <div className="text-xs text-slate-500">
                                Sent {new Date(estimate.sent_date).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: '2-digit' })}
                              </div>
                            )}
                            {estimate.estimate_status === 'accepted' && estimate.accepted_date && (
                              <div className="text-xs text-slate-500">
                                Viewed {new Date(estimate.accepted_date).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: '2-digit' })}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    )}
                    {visibleColumns.expiration && (
                      <td className="px-4 py-3 text-sm text-slate-900">
                        {estimate.valid_until_date ? new Date(estimate.valid_until_date).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: '2-digit' }) : '-'}
                      </td>
                    )}
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="link"
                          size="sm"
                          onClick={() => onView(estimate)}
                          className="text-blue-600 hover:text-blue-700 h-auto p-0 text-sm font-normal"
                        >
                          View/Edit
                        </Button>
                        <span className="text-slate-400">|</span>
                        <Button
                          variant="link"
                          size="sm"
                          onClick={() => handleSendClick(estimate)}
                          className="text-blue-600 hover:text-blue-700 h-auto p-0 text-sm font-normal"
                        >
                          Send
                        </Button>
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="text-blue-600 hover:text-blue-700 ml-0.5">
                              <ChevronDown className="w-3 h-3" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-56">
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onView(estimate); }}>
                              View/Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleSendClick(estimate); }}>
                              <Mail className="w-4 h-4 mr-2" />
                              Send
                            </DropdownMenuItem>
                            
                            <DropdownMenuSeparator />
                            
                            {estimate.estimate_status === 'accepted' && (
                              <>
                                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onConvert(estimate); }}>
                                  <FileText className="w-4 h-4 mr-2" />
                                  Convert to invoice
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                              </>
                            )}
                            
                            {estimate.estimate_status === 'sent' && onAccept && (
                              <>
                                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onAccept(estimate); }}>
                                  <CheckCircle className="w-4 h-4 mr-2" />
                                  Mark accepted
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                              </>
                            )}
                            
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleDuplicate(estimate); }}>
                              <Copy className="w-4 h-4 mr-2" />
                              Duplicate
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleShareLink(estimate); }}>
                              <LinkIcon className="w-4 h-4 mr-2" />
                              Share estimate link
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handlePrint(estimate); }}>
                              <Printer className="w-4 h-4 mr-2" />
                              Print
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleUpdateStatus(estimate); }}>
                              Update Status
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleCopyToPO(estimate); }}>
                              Copy to purchase order
                            </DropdownMenuItem>
                            
                            <DropdownMenuSeparator />
                            
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleDelete(estimate); }} className="text-red-600">
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleViewActivity(estimate); }}>
                              <Activity className="w-4 h-4 mr-2" />
                              View activity
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-slate-200">
          <div className="text-sm text-slate-600">
            Showing {((currentPage - 1) * rowsPerPage) + 1} to {Math.min(currentPage * rowsPerPage, filteredEstimates.length)} of {filteredEstimates.length} estimates
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Send Dialog */}
      <Dialog open={sendDialogOpen} onOpenChange={setSendDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Send Estimate</DialogTitle>
            <DialogDescription>
              Choose how you want to send estimate {selectedEstimate?.estimate_number}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <RadioGroup value={sendMethod} onValueChange={setSendMethod}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="email" id="send-email" />
                <Label htmlFor="send-email" className="cursor-pointer flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="sms" id="send-sms" />
                <Label htmlFor="send-sms" className="cursor-pointer flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  SMS
                </Label>
              </div>
            </RadioGroup>

            {sendMethod === 'email' && (
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="customer@example.com"
                  value={sendEmail}
                  onChange={(e) => setSendEmail(e.target.value)}
                />
              </div>
            )}

            {sendMethod === 'sms' && (
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  value={sendPhone}
                  onChange={(e) => setSendPhone(e.target.value)}
                />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setSendDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSendSubmit}
              disabled={sendMethod === 'email' ? !sendEmail : !sendPhone}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Send Estimate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Sidebar */}
      {sidebarOpen && sidebarEstimate && sidebarEstimate.estimate_status && (
        <>
          <div 
            className="fixed inset-0 bg-black/20 z-40"
            onClick={() => setSidebarOpen(false)}
          />
          <EstimateDetailsSidebar
            estimate={sidebarEstimate}
            lineItems={sidebarLineItems}
            onClose={() => setSidebarOpen(false)}
            onEdit={handleSidebarEdit}
            onMoreActions={handleSidebarMoreActions}
          />
        </>
      )}

      {/* Activity Log Modal */}
      <ActivityLogModal
        estimate={activityEstimate}
        open={activityModalOpen}
        onClose={() => setActivityModalOpen(false)}
      />

      {/* Copy to PO Dialog */}
      <Dialog open={poDialogOpen} onOpenChange={setPODialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Copy to Purchase Order</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <p className="text-sm text-slate-600">
              Create a purchase order from estimate {selectedEstimate?.estimate_number}
            </p>
            
            <div className="space-y-2">
              <Label>Select Vendor</Label>
              <Select value={selectedVendorId} onValueChange={setSelectedVendorId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a vendor" />
                </SelectTrigger>
                <SelectContent>
                  {vendors.map((vendor) => (
                    <SelectItem key={vendor.id} value={vendor.id}>
                      {vendor.company_name || vendor.contact_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setPODialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handlePOSubmit} disabled={!selectedVendorId}>
              Create Purchase Order
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <DeleteEstimateModal
        estimate={estimateToDelete}
        open={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setEstimateToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
        />

        {/* Share Link Dialog */}
        <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Share estimate</DialogTitle>
            <DialogDescription>
              Use this link to share the estimate with your customer.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Textarea
                value={shareUrl}
                readOnly
                className="font-mono text-sm resize-none"
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShareDialogOpen(false)}>
              Close
            </Button>
            <Button 
              onClick={() => {
                navigator.clipboard.writeText(shareUrl);
                toast.success('Estimate link copied.');
                setShareDialogOpen(false);
              }}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Copy link
            </Button>
          </DialogFooter>
        </DialogContent>
        </Dialog>
        </div>
        );
        }