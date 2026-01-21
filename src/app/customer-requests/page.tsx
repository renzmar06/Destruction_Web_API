'use client';

import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, ClipboardList, Calendar, Clock, CheckCircle, FileText, User, Phone } from "lucide-react";
import { createServiceRequest, fetchServiceRequests, clearError, updateServiceRequest, deleteServiceRequest } from '@/redux/slices/customerRequestsSlice';
import { RootState, AppDispatch } from '@/redux/store';
import { toast } from 'sonner';

const statusConfig: Record<string, { label: string; className: string; icon: any }> = {
  draft: { label: 'Draft', className: 'bg-slate-100 text-slate-700', icon: FileText },
  pending: { label: 'Pending Review', className: 'bg-amber-100 text-amber-700', icon: Clock },
  in_review: { label: 'In Review', className: 'bg-blue-100 text-blue-700', icon: Clock },
  quoted: { label: 'Quote Sent', className: 'bg-purple-100 text-purple-700', icon: FileText },
  approved: { label: 'Approved', className: 'bg-green-100 text-green-700', icon: CheckCircle },
  in_progress: { label: 'In Progress', className: 'bg-indigo-100 text-indigo-700', icon: Clock },
  completed: { label: 'Completed', className: 'bg-slate-100 text-slate-700', icon: CheckCircle }
};

export default function CustomerRequests() {
  const dispatch = useDispatch<AppDispatch>();
  const { requests, loading, error, submitLoading } = useSelector((state: RootState) => state.customerRequests);

  const [showForm, setShowForm] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState('1');
  const [serviceType, setServiceType] = useState('');
  const [mainServiceType, setMainServiceType] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  // Form state
  const [formData, setFormData] = useState({
    serviceType: '',
    productType: '',
    materialCondition: '',
    estimatedWeight: '',
    unitCount: '',
    palletCount: '',
    palletType: '',
    shrinkWrapped: false,
    destructionType: '',
    certificateRequired: false,
    logisticsType: '',
    pickupAddress: '',
    pickupHours: '',
    truckingService: false,
    palletSwap: false,
    additionalLabor: false,
    hazardousNotes: '',
    timeConstraints: '',
    preferredDate: '',
    urgency: 'normal',
    contactName: '',
    contactPhone: '',
    quantityBreakdown: '',
    scheduleFrequency: '',
    problemDescription: ''
  });

  // Mock user (admin for demo)
  const user = { role: 'admin', email: 'admin@example.com' };

  // Mock customers
  const customers = [
    { id: '1', legal_company_name: 'ABC Construction', display_name: 'ABC Construction' },
    { id: '2', legal_company_name: 'XYZ Demolition', display_name: 'XYZ Demolition' },
    { id: '3', legal_company_name: 'Smith Contractors', display_name: 'Smith Contractors' }
  ];

  useEffect(() => {
    dispatch(fetchServiceRequests());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (isDraft = false) => {
    const requestData = {
      ...formData,
      serviceType: mainServiceType,
      isDraft
    };

    try {
      if (selectedRequest) {
        await dispatch(updateServiceRequest({ id: selectedRequest._id || selectedRequest.id, requestData })).unwrap();
        toast.success('Request updated successfully');
      } else {
        await dispatch(createServiceRequest(requestData)).unwrap();
        toast.success(isDraft ? 'Request saved as draft' : 'Service request submitted successfully');
      }
      setShowForm(false);
      setSelectedRequest(null);
      setFormData({
        serviceType: '',
        productType: '',
        materialCondition: '',
        estimatedWeight: '',
        unitCount: '',
        palletCount: '',
        palletType: '',
        shrinkWrapped: false,
        destructionType: '',
        certificateRequired: false,
        logisticsType: '',
        pickupAddress: '',
        pickupHours: '',
        truckingService: false,
        palletSwap: false,
        additionalLabor: false,
        hazardousNotes: '',
        timeConstraints: '',
        preferredDate: '',
        urgency: 'normal',
        contactName: '',
        contactPhone: '',
        quantityBreakdown: '',
        scheduleFrequency: '',
        problemDescription: ''
      });
      setMainServiceType('');
      setServiceType('');
    } catch (err) {
      // Error handled by Redux
    }
  };

  const handleViewDetails = (request: any) => {
    setSelectedRequest(request);
    setShowDetails(true);
  };

  const handleEdit = (request: any) => {
    console.log("clicked")
    setSelectedRequest(request);
    setFormData({
      serviceType: request.serviceType || '',
      productType: request.productType || '',
      materialCondition: request.materialCondition || '',
      estimatedWeight: request.estimatedWeight || '',
      unitCount: request.unitCount || '',
      palletCount: request.palletCount || '',
      palletType: request.palletType || '',
      shrinkWrapped: request.shrinkWrapped || false,
      destructionType: request.destructionType || '',
      certificateRequired: request.certificateRequired || false,
      logisticsType: request.logisticsType || '',
      pickupAddress: request.pickupAddress || '',
      pickupHours: request.pickupHours || '',
      truckingService: request.truckingService || false,
      palletSwap: request.palletSwap || false,
      additionalLabor: request.additionalLabor || false,
      hazardousNotes: request.hazardousNotes || '',
      timeConstraints: request.timeConstraints || '',
      preferredDate: request.preferredDate || '',
      urgency: request.urgency || 'normal',
      contactName: request.contactName || '',
      contactPhone: request.contactPhone || '',
      quantityBreakdown: request.quantityBreakdown || '',
      scheduleFrequency: request.scheduleFrequency || '',
      problemDescription: request.problemDescription || ''
    });
    setMainServiceType(request.serviceType || '');
    setShowForm(true);
  };

  const handleDelete = async (request: any) => {
    if (confirm('Are you sure you want to delete this request?')) {
      try {
        await dispatch(deleteServiceRequest(request._id || request.id)).unwrap();
        toast.success('Request deleted successfully');
      } catch (err) {
        // Error handled by Redux
      }
    }
  };

  const getStatusConfig = (status: string) => {
    return statusConfig[status?.toLowerCase()] || statusConfig.pending;
  };

  if (showDetails && selectedRequest) {
    // ────────────────────────────────────────────────
    //               REQUEST DETAILS PAGE
    // ────────────────────────────────────────────────
    const config = getStatusConfig(selectedRequest.status);
    const Icon = config.icon;

    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Admin Preview */}
          {user?.role === 'admin' && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-8">
              <p className="text-sm font-medium text-amber-900 mb-2">Admin Preview Mode</p>
              <Select value={selectedCustomerId || ''} onValueChange={setSelectedCustomerId}>
                <SelectTrigger className="w-full md:w-96 bg-white">
                  <SelectValue placeholder="Select customer to preview" />
                </SelectTrigger>
                <SelectContent>
                  {customers.map(c => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.legal_company_name || c.display_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Service Requests</h1>
              <p className="text-slate-600 mt-1">Submit and track your service requests</p>
            </div>
            <div className="flex gap-3">
              <Button variant="ghost" onClick={() => { setShowDetails(false); setSelectedRequest(null); }}>← Back to List</Button>
              <Button onClick={() => setShowForm(true)} className="bg-blue-600 hover:bg-blue-700 gap-2">
                <Plus className="w-4 h-4" />New Request
              </Button>
            </div>
          </div>

          {/* Request Details */}
          <Card>
            <CardHeader className="pb-4 border-b bg-slate-50">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <CardTitle className="text-2xl font-bold">
                    Request #{selectedRequest.requestNumber || 'SR-0001'}
                  </CardTitle>
                  <p className="text-slate-600 mt-1.5">
                    Submitted: {new Date(selectedRequest.createdAt || Date.now()).toLocaleString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit',
                      hour12: true
                    })}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className={`${config.className} text-base px-5 py-1.5`}>
                    <Icon className="w-4 h-4 mr-1.5" />
                    {config.label}
                  </Badge>
                  <Button variant="outline" size="sm" onClick={() => handleEdit(selectedRequest)}>Edit</Button>
                  <Button variant="outline" size="sm" onClick={() => handleDelete(selectedRequest)}>Delete</Button>
                </div>
              </div>
            </CardHeader>

            <Tabs defaultValue="details" className="mt-0">
              <TabsList className="px-6 pt-1 pb-0 border-b bg-white rounded-none justify-start h-12">
                <TabsTrigger value="details" className="text-base">Details</TabsTrigger>
                <TabsTrigger value="messages" className="text-base">Messages</TabsTrigger>
                <TabsTrigger value="files" className="text-base">Files (1)</TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="px-6 py-6">
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-sm font-medium text-slate-500 mb-1.5">Service Type</h4>
                      <p className="font-medium text-slate-900 capitalize">
                        {selectedRequest.serviceType?.replace(/-/g, ' ') || '—'}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-slate-500 mb-1.5">Product Type</h4>
                      <p className="font-medium text-slate-900">{selectedRequest.productType || '—'}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-slate-500 mb-1.5">Estimated Volume</h4>
                      <p className="font-medium text-slate-900">
                        {selectedRequest.estimatedWeight || selectedRequest.unitCount || selectedRequest.quantityBreakdown?.substring(0, 60) + '...' || '—'}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-slate-500 mb-1.5">Preferred Date</h4>
                      <p className="font-medium text-slate-900">
                        {selectedRequest.preferredDate ? new Date(selectedRequest.preferredDate).toLocaleDateString('en-US', {
                          month: 'long', day: 'numeric', year: 'numeric'
                        }) : '—'}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-sm font-medium text-slate-500 mb-2">Contact</h4>
                      <div className="space-y-2.5 bg-slate-50 p-4 rounded-lg border">
                        <div className="flex items-center gap-3">
                          <User className="h-5 w-5 text-slate-600" />
                          <span className="font-medium">{selectedRequest.contactName || 'Renz Ramos'}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Phone className="h-5 w-5 text-slate-600" />
                          <span className="font-medium">{selectedRequest.contactPhone || '09957322939'}</span>
                        </div>
                      </div>
                    </div>
                    {selectedRequest.quantityBreakdown && (
                      <div>
                        <h4 className="text-sm font-medium text-slate-500 mb-1.5">Quantity Breakdown</h4>
                        <p className="whitespace-pre-wrap text-slate-800">{selectedRequest.quantityBreakdown}</p>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="messages" className="px-6 py-8 text-center text-slate-500">
                No messages yet.
              </TabsContent>

              <TabsContent value="files" className="px-6 py-8 text-center text-slate-500">
                1 file attached (preview/download coming soon)
              </TabsContent>
            </Tabs>
          </Card>
        </div>
      </div>
    );
  }

  if (showForm) {
    // ────────────────────────────────────────────────
    //               NEW REQUEST FORM
    // ────────────────────────────────────────────────
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="max-w-7xl mx-auto">
          {user?.role === 'admin' && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
              <p className="text-sm font-medium text-amber-900 mb-2">Admin Preview Mode</p>
              <Select value={selectedCustomerId || ''} onValueChange={setSelectedCustomerId}>
                <SelectTrigger className="w-full md:w-96 bg-white">
                  <SelectValue placeholder="Select customer to preview" />
                </SelectTrigger>
                <SelectContent>
                  {customers.map(c => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.legal_company_name || c.display_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">{selectedRequest ? 'Edit Service Request' : 'New Service Request'}</h1>
              <p className="text-slate-600 mt-1">Fill in the details below</p>
            </div>
            <Button variant="ghost" onClick={() => { setShowForm(false); setSelectedRequest(null); }}>
              ← Back to List
            </Button>
          </div>

          <Card>
            <CardContent className="pt-6 space-y-8">
              {/* Service Type */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Service Type *</label>
                <select
                  className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={mainServiceType}
                  onChange={(e) => {
                    setMainServiceType(e.target.value);
                    handleInputChange('serviceType', e.target.value);
                  }}
                >
                  <option value="">Select Service Type</option>
                  <option value="beverage-destruction">Beverage Destruction</option>
                  <option value="product-disposal">Product Disposal</option>
                  <option value="packaging-recycling">Packaging Recycling</option>
                  <option value="emergency-destruction">Emergency Destruction</option>
                  <option value="scheduled-disposal">Scheduled Disposal Program</option>
                </select>
              </div>

              {/* Conditional fields based on service type */}
              {(mainServiceType === 'product-disposal' || mainServiceType === 'beverage-destruction') && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Quantity Breakdown</label>
                  <textarea
                    className="w-full p-3 border border-slate-300 rounded-lg h-24 focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 200 cases of aluminum cans, 50 cases of glass bottles..."
                    maxLength={500}
                    value={formData.quantityBreakdown}
                    onChange={(e) => handleInputChange('quantityBreakdown', e.target.value)}
                  />
                  <div className="text-xs text-slate-500 mt-1 text-right">
                    {formData.quantityBreakdown.length}/500
                  </div>
                </div>
              )}

              {/* Material Details */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-slate-900 border-b pb-2">Material Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Product Type *</label>
                    <select
                      className="w-full p-2 border border-slate-300 rounded-lg"
                      value={formData.productType}
                      onChange={(e) => handleInputChange('productType', e.target.value)}
                    >
                      <option value="">Select Product Type</option>
                      <option value="Alcoholic Beverages">Alcoholic Beverages</option>
                      <option value="Non-Alcoholic Beverages">Non-Alcoholic Beverages</option>
                      <option value="Mixed Products">Mixed Products</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Material Condition</label>
                    <select className="w-full p-2 border border-slate-300 rounded-lg">
                      <option value="">Select condition</option>
                      <option value="Full">Full</option>
                      <option value="Partial">Partial</option>
                      <option value="Empty">Empty</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-900">Weight & Volume</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Estimated Total Weight</label>
                    <input type="text" className="w-full p-2 border border-slate-300 rounded-lg" placeholder="e.g., 5,000 lbs" value={formData.estimatedWeight} onChange={(e) => handleInputChange('estimatedWeight', e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Count of Units/Cases</label>
                    <input type="text" className="w-full p-2 border border-slate-300 rounded-lg" placeholder="e.g., 500 cases" value={formData.unitCount} onChange={(e) => handleInputChange('unitCount', e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Number of Pallets</label>
                    <input type="number" className="w-full p-2 border border-slate-300 rounded-lg" placeholder="e.g., 10" value={formData.palletCount} onChange={(e) => handleInputChange('palletCount', e.target.value)} />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-900">Pallet / Load Details</h3>
                <div className="grid grid-cols-2 gap-4 items-start">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Pallet Type</label>
                    <select className="w-full p-2 border border-slate-300 rounded-lg">
                      <option value="">Standard</option>
                      <option value="">Mixed</option>
                      <option value="">Needs Rework</option>
                    </select>
                  </div>
                  <div className="flex items-center">
                    <input type="checkbox" className="mr-2" />
                    <label className="text-sm">Pallets are shrink-wrapped</label>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-900">Service Requirements</h3>
                <div className="grid grid-cols-2 gap-4 ">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Destruction Type</label>
                    <select className="w-full p-2 border border-slate-300 rounded-lg">
                      <option value="">Standard</option>
                      <option value="">Secure</option>
                      <option value="">Witnessed</option>
                    </select>
                  </div>
                  <div className="flex items-center h-10 mt-6">
                    <input type="checkbox" className="mr-2" />
                    <label className="text-sm ">Certificate of Destruction Required</label>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-900">Logistics</h3>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Service Type</label>
                  <select 
                    className="w-1/2 p-2 border border-slate-300 rounded-lg"
                    value={serviceType}
                    onChange={(e) => setServiceType(e.target.value)}
                  >
                   
                    <option value="pickup">Pickup</option>
                    <option value="dropoff">Drop-off</option>
                  </select>
                </div>
                {serviceType === 'pickup' && (
                  <div className="grid gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Pickup Address</label>
                       <textarea className="w-full p-2 border border-slate-300 rounded-lg h-20" placeholder="Enter Pickup Address..." />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Pickup Hours/Availability</label>
                      <input 
                        type="text" 
                        className="w-full p-2 border border-slate-300 rounded-lg" 
                        placeholder="e.g., 9 AM - 5 PM" 
                      />
                    </div>
                  </div>
                )}
                <div className="space-y-2">
                  <div className="flex items-center">
                    <input type="checkbox" className="mr-2" />
                    <label className="text-sm">Need trucking service</label>
                  </div>
                  <div className="flex items-center">
                    <input type="checkbox" className="mr-2" />
                    <label className="text-sm">Need pallet swap</label>
                  </div>
                  <div className="flex items-center">
                    <input type="checkbox" className="mr-2" />
                    <label className="text-sm">Need additional labor</label>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-900">Special Notes</h3>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Hazardous Considerations</label>
                  <textarea className="w-full p-2 border border-slate-300 rounded-lg h-20" placeholder="Any leaking, liquids, or hazardous materials?" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Time Constraints / Deadlines</label>
                  <textarea className="w-full p-2 border border-slate-300 rounded-lg h-20" placeholder="Any specific deadlines or time requirements?" />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-900">Scheduling</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Preferred Service Date *</label>
                    <input type="date" className="w-full p-2 border border-slate-300 rounded-lg" value={formData.preferredDate} onChange={(e) => handleInputChange('preferredDate', e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Urgency</label>
                    <select className="w-full p-2 border border-slate-300 rounded-lg">
                      <option value="normal">Normal (5-7 days)</option>
                      <option value="normal">Expedited (2-3 days)</option>
                      <option value="normal">Urgent (24 hours)</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Contact Name *</label>
                  <input type="text" className="w-full p-2 border border-slate-300 rounded-lg" placeholder="Renz Ramos" value={formData.contactName} onChange={(e) => handleInputChange('contactName', e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Contact Phone *</label>
                  <input type="tel" className="w-full p-2 border border-slate-300 rounded-lg" placeholder="09957322939" value={formData.contactPhone} onChange={(e) => handleInputChange('contactPhone', e.target.value)} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Attachments (Photos of Product, Pallets, Documents)</label>
                <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-400 transition-colors">
                  <input 
                    type="file" 
                    multiple 
                    accept="image/*,video/*,.pdf,.doc,.docx" 
                    className="hidden" 
                    id="fileUpload"
                    onChange={(e) => {
                      const files = Array.from(e.target.files || []);
                      setUploadedFiles(prev => [...prev, ...files]);
                    }}
                  />
                  <label htmlFor="fileUpload" className="cursor-pointer">
                    <div className="text-slate-500">
                      <p className="mb-2">Click to upload files</p>
                      <p className="text-sm">Images, videos, or documents</p>
                    </div>
                  </label>
                </div>
                {uploadedFiles.length > 0 && (
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    {uploadedFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-slate-100 rounded">
                        <span className="text-sm truncate">{file.name}</span>
                        <button 
                          onClick={() => setUploadedFiles(prev => prev.filter((_, i) => i !== index))}
                          className="text-red-500 hover:text-red-700 ml-2"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-4 pt-6 border-t">
                <Button variant="outline" onClick={() => handleSubmit(true)} disabled={submitLoading}>
                  Save as Draft
                </Button>
                <Button
                  className="bg-blue-600 hover:bg-blue-700"
                  onClick={() => handleSubmit(false)}
                  disabled={submitLoading}
                >
                  {submitLoading ? (selectedRequest ? 'Updating...' : 'Submitting...') : (selectedRequest ? 'Update Request' : 'Submit Request')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Admin Preview */}
        {user?.role === 'admin' && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-8">
            <p className="text-sm font-medium text-amber-900 mb-2">Admin Preview Mode</p>
            <Select value={selectedCustomerId || ''} onValueChange={setSelectedCustomerId}>
              <SelectTrigger className="w-full md:w-96 bg-white">
                <SelectValue placeholder="Select customer to preview" />
              </SelectTrigger>
              <SelectContent>
                {customers.map(c => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.legal_company_name || c.display_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Service Requests</h1>
            <p className="text-slate-600 mt-1">Submit and track your service requests</p>
          </div>
          <Button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 hover:bg-blue-700 gap-2"
          >
            <Plus className="w-4 h-4" />
            New Request
          </Button>
        </div>

        {/* Requests List */}
        {loading ? (
          <div className="text-center py-12">Loading requests...</div>
        ) : requests.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <ClipboardList className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 mb-2">No Service Requests Yet</h3>
              <p className="text-slate-600 mb-6">
                {user?.role === 'admin'
                  ? "This customer hasn't submitted any requests."
                  : "You haven't submitted any service requests yet."}
              </p>
              <Button onClick={() => setShowForm(true)} className="bg-blue-600 hover:bg-blue-700">
                Create Your First Request
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {requests.map((request: any) => {
              const config = getStatusConfig(request.status);
              const Icon = config.icon;

              return (
                <Card key={request._id || request.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-slate-900">
                            #{request.requestNumber || 'SR-XXXXX'}
                          </h3>
                          <Badge className={`${config.className} px-3 py-1`}>
                            <Icon className="w-3.5 h-3.5 mr-1.5" />
                            {config.label}
                          </Badge>
                        </div>

                        <p className="text-slate-700 font-medium capitalize mb-1">
                          {request.serviceType?.replace(/-/g, ' ') || 'Unknown Service'}
                        </p>

                        <p className="text-slate-600 mb-3">{request.productType || '—'}</p>

                        <div className="flex flex-wrap items-center gap-5 text-sm text-slate-500">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-4 h-4" />
                            <span>
                              Submitted:{' '}
                              {new Date(request.createdAt).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </span>
                          </div>
                          {request.preferredDate && (
                            <div className="flex items-center gap-1.5">
                              <Clock className="w-4 h-4" />
                              Preferred: {new Date(request.preferredDate).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-3 shrink-0">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDetails(request)}
                        >
                          View Details
                        </Button>
                        {request.status === 'draft' && (
                          <Button variant="outline" size="sm" onClick={() => handleEdit(request)}>
                            Edit
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}


      </div>
    </div>
  );
}