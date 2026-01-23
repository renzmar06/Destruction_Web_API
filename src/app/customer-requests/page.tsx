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
import { toast, Toaster } from 'sonner';
import ViewDetail from './ViewDetails';

const statusConfig = {
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
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

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

  const AdminPreview = () => (
    user?.role === 'admin' && (
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
    )
  );

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

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    
    if (!mainServiceType) {
      newErrors.serviceType = 'Service Type is required';
    }
    if (!formData.productType) {
      newErrors.productType = 'Product Type is required';
    }
    if (!formData.preferredDate) {
      newErrors.preferredDate = 'Preferred Date is required';
    }
    if (!formData.contactName) {
      newErrors.contactName = 'Contact Name is required';
    }
    if (!formData.contactPhone) {
      newErrors.contactPhone = 'Contact Phone is required';
    }
    
    setErrors(newErrors);
    
    // Focus on first error field
    if (Object.keys(newErrors).length > 0) {
      const firstErrorField = Object.keys(newErrors)[0];
      const element = document.querySelector(`[name="${firstErrorField}"]`) || 
                    document.querySelector(`#${firstErrorField}`);
      if (element && element instanceof HTMLElement) {
        element.focus();
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (isDraft = false) => {
    if (!validateForm()) {
      toast.error('Please fill in all required fields');
      return;
    }

    const requestData = {
      ...formData,
      serviceType: mainServiceType,
      attachments: uploadedUrls
    };

    try {
      if (selectedRequest) {
        await dispatch(updateServiceRequest({ id: selectedRequest._id || selectedRequest.id, requestData: requestData })).unwrap();
        toast.success('Request updated successfully');
      } else {
        await dispatch(createServiceRequest(requestData)).unwrap();
        toast.success('Request submitted successfully');
      }
    } catch (error) {
      toast.error('Failed to submit request');
      return;
    }

    setShowForm(false);
    setSelectedRequest(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
    setUploadedFiles([]);
    setUploadedUrls([]);
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
    
    // Load existing attachments
    if (request.attachments && request.attachments.length > 0) {
      setUploadedUrls(request.attachments);
      // Create mock file objects for display
      const mockFiles = request.attachments.map((url: string, index: number) => {
        const fileName = url.split('/').pop() || `attachment-${index + 1}`;
        return { name: fileName.replace(/^\d+_/, '') }; // Remove timestamp prefix
      });
      setUploadedFiles(mockFiles);
    } else {
      setUploadedUrls([]);
      setUploadedFiles([]);
    }
    
    setShowForm(true);
  };

  const handleDelete = async (request: any) => {
    try {
      await dispatch(deleteServiceRequest(request._id || request.id)).unwrap();
      toast.success('Request deleted successfully');
      // Navigate back to list after successful deletion
      setShowDetails(false);
      setSelectedRequest(null);
    } catch (err) {
      toast.error('Failed to delete request');
    }
  };

  const getStatusConfig = (status: string) => {
    return statusConfig[status?.toLowerCase() as keyof typeof statusConfig] || statusConfig.pending;
  };

  return (
    <>
      <Toaster position="top-right" duration={1000} />
      <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto">
        <AdminPreview />
        
        {showDetails && selectedRequest ? (
          <ViewDetail 
            selectedRequest={selectedRequest}
            onBack={() => { setShowDetails(false); setSelectedRequest(null); }}
            onNewRequest={() => setShowForm(true)}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ) : showForm ? (
          // NEW REQUEST FORM
          <>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-slate-900">{selectedRequest ? 'Edit Service Request' : 'New Service Request'}</h1>
                <p className="text-slate-600 mt-1">Fill in the details below</p>
              </div>
             
            </div>
            <div className='mb-3'> 
             <Button variant="outline" onClick={() => { 
                setShowForm(false); 
                setSelectedRequest(null);
                // Clear form data when going back
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
                setUploadedFiles([]);
                setUploadedUrls([]);
              }}>
                ← Back to List
              </Button>
              </div>

          <Card>
            <CardContent className="pt-6 space-y-8">
              {/* Service Type */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Service Type *</label>
                <select
                  id="serviceType"
                  name="serviceType"
                  className="w-full p-2 border border-slate-300 rounded-lg"
                  value={mainServiceType}
                  onChange={(e) => {
                    setMainServiceType(e.target.value);
                    handleInputChange('serviceType', e.target.value);
                    if (errors.serviceType) {
                      setErrors(prev => ({ ...prev, serviceType: '' }));
                    }
                  }}
                  required
                >
                  <option value="">Select Service Type</option>
                  <option value="beverage-destruction">Beverage Destruction</option>
                  <option value="product-disposal">Product Disposal</option>
                  <option value="packaging-recycling">Packaging Recycling</option>
                  <option value="emergency-destruction">Emergency Destruction</option>
                  <option value="scheduled-disposal">Scheduled Disposal Program</option>
                </select>
                {errors.serviceType && (
                  <p className="text-red-500 text-sm mt-1">{errors.serviceType}</p>
                )}
              </div>

              {/* Conditional fields based on service type */}
              {(mainServiceType === 'product-disposal' || mainServiceType === 'beverage-destruction') && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Quantity Breakdown</label>
                  <textarea
                    className="w-full p-3 border border-slate-300 rounded-lg h-24"
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

              {/* Emergency Destruction - Problem Description */}
              {mainServiceType === 'emergency-destruction' && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Problem Description *</label>
                  <p className="text-sm text-slate-600 mb-2">Describe the emergency situation requiring immediate destruction...</p>
                  <textarea
                    className="w-full p-3 border border-slate-300 rounded-lg h-24"
                    placeholder="Describe the emergency situation..."
                    maxLength={1000}
                    value={formData.problemDescription}
                    onChange={(e) => handleInputChange('problemDescription', e.target.value)}
                  />
                  <div className="text-xs text-slate-500 mt-1 text-right">
                    {formData.problemDescription.length}/1000
                  </div>
                </div>
              )}

              {/* Scheduled Disposal - Schedule Frequency */}
              {mainServiceType === 'scheduled-disposal' && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Schedule Frequency *</label>
                  <p className="text-sm text-slate-600 mb-2">How often would you like scheduled pickups?</p>
                  <select
                    className="w-full p-2 border border-slate-300 rounded-lg"
                    value={formData.scheduleFrequency}
                    onChange={(e) => handleInputChange('scheduleFrequency', e.target.value)}
                  >
                    <option value="">Select frequency</option>
                    <option value="weekly">Weekly</option>
                    <option value="bi-weekly">Bi-weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                  </select>
                </div>
              )}

              {/* Material Details */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-slate-900 border-b pb-2">Material Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Product Type *</label>
                    <select
                      id="productType"
                      name="productType"
                      className="w-full p-2 border border-slate-300 rounded-lg"
                      value={formData.productType}
                      onChange={(e) => {
                        handleInputChange('productType', e.target.value);
                        if (errors.productType) {
                          setErrors(prev => ({ ...prev, productType: '' }));
                        }
                      }}
                      required
                    >
                      <option value="">Select Product Type</option>
                      <option value="Alcoholic Beverages">Alcoholic Beverages</option>
                      <option value="Non-Alcoholic Beverages">Non-Alcoholic Beverages</option>
                      <option value="Mixed Products">Mixed Products</option>
                    </select>
                    {errors.productType && (
                      <p className="text-red-500 text-sm mt-1">{errors.productType}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Material Condition</label>
                    <select 
                      className="w-full p-2 border border-slate-300 rounded-lg"
                      value={formData.materialCondition}
                      onChange={(e) => handleInputChange('materialCondition', e.target.value)}
                    >
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
                    <input type="number" className="w-full p-2 border border-slate-300 rounded-lg" placeholder="e.g., 10" value={formData.palletCount || ''} onChange={(e) => handleInputChange('palletCount', e.target.value)} />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-900">Pallet / Load Details</h3>
                <div className="grid grid-cols-2 gap-4 items-start">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Pallet Type</label>
                    <select 
                      className="w-full p-2 border border-slate-300 rounded-lg"
                      value={formData.palletType}
                      onChange={(e) => handleInputChange('palletType', e.target.value)}
                    >
                      <option value="">Select pallet type</option>
                      <option value="Standard">Standard</option>
                      <option value="Mixed">Mixed</option>
                      <option value="Needs Rework">Needs Rework</option>
                    </select>
                  </div>
                  <div className="flex items-center">
                    <input 
                      type="checkbox" 
                      className="mr-2"
                      checked={formData.shrinkWrapped}
                      onChange={(e) => handleInputChange('shrinkWrapped', e.target.checked)}
                    />
                    <label className="text-sm">Pallets are shrink-wrapped</label>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-900">Service Requirements</h3>
                <div className="grid grid-cols-2 gap-4 ">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Destruction Type</label>
                    <select 
                      className="w-full p-2 border border-slate-300 rounded-lg"
                      value={formData.destructionType}
                      onChange={(e) => handleInputChange('destructionType', e.target.value)}
                    >
                      <option value="">Select destruction type</option>
                      <option value="Standard">Standard</option>
                      <option value="Secure">Secure</option>
                      <option value="Witnessed">Witnessed</option>
                    </select>
                  </div>
                  <div className="flex items-center h-10 mt-6">
                    <input 
                      type="checkbox" 
                      className="mr-2"
                      checked={formData.certificateRequired}
                      onChange={(e) => handleInputChange('certificateRequired', e.target.checked)}
                    />
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
                       <textarea 
                         className="w-full p-2 border border-slate-300 rounded-lg h-20" 
                         placeholder="Enter Pickup Address..."
                         value={formData.pickupAddress}
                         onChange={(e) => handleInputChange('pickupAddress', e.target.value)}
                       />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Pickup Hours/Availability</label>
                      <input 
                        type="text" 
                        className="w-full p-2 border border-slate-300 rounded-lg" 
                        placeholder="e.g., 9 AM - 5 PM"
                        value={formData.pickupHours}
                        onChange={(e) => handleInputChange('pickupHours', e.target.value)}
                      />
                    </div>
                  </div>
                )}
                <div className="space-y-2">
                  <div className="flex items-center">
                    <input 
                      type="checkbox" 
                      className="mr-2"
                      checked={formData.truckingService}
                      onChange={(e) => handleInputChange('truckingService', e.target.checked)}
                    />
                    <label className="text-sm">Need trucking service</label>
                  </div>
                  <div className="flex items-center">
                    <input 
                      type="checkbox" 
                      className="mr-2"
                      checked={formData.palletSwap}
                      onChange={(e) => handleInputChange('palletSwap', e.target.checked)}
                    />
                    <label className="text-sm">Need pallet swap</label>
                  </div>
                  <div className="flex items-center">
                    <input 
                      type="checkbox" 
                      className="mr-2"
                      checked={formData.additionalLabor}
                      onChange={(e) => handleInputChange('additionalLabor', e.target.checked)}
                    />
                    <label className="text-sm">Need additional labor</label>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-900">Special Notes</h3>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Hazardous Considerations</label>
                  <textarea 
                    className="w-full p-2 border border-slate-300 rounded-lg h-20" 
                    placeholder="Any leaking, liquids, or hazardous materials?"
                    value={formData.hazardousNotes}
                    onChange={(e) => handleInputChange('hazardousNotes', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Time Constraints / Deadlines</label>
                  <textarea 
                    className="w-full p-2 border border-slate-300 rounded-lg h-20" 
                    placeholder="Any specific deadlines or time requirements?"
                    value={formData.timeConstraints}
                    onChange={(e) => handleInputChange('timeConstraints', e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-900">Scheduling</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Preferred Service Date *</label>
                    <input 
                      type="date" 
                      id="preferredDate"
                      name="preferredDate"
                      className="w-full p-2 border border-slate-300 rounded-lg"
                      value={formData.preferredDate} 
                      onChange={(e) => {
                        handleInputChange('preferredDate', e.target.value);
                        if (errors.preferredDate) {
                          setErrors(prev => ({ ...prev, preferredDate: '' }));
                        }
                      }} 
                      required 
                    />
                    {errors.preferredDate && (
                      <p className="text-red-500 text-sm mt-1">{errors.preferredDate}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Urgency</label>
                    <select 
                      className="w-full p-2 border border-slate-300 rounded-lg"
                      value={formData.urgency}
                      onChange={(e) => handleInputChange('urgency', e.target.value)}
                    >
                      <option value="normal">Normal (5-7 days)</option>
                      <option value="expedited">Expedited (2-3 days)</option>
                      <option value="urgent">Urgent (24 hours)</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Contact Name *</label>
                  <input 
                    type="text" 
                    id="contactName"
                    name="contactName"
                    className="w-full p-2 border border-slate-300 rounded-lg"
                    placeholder="Renz Ramos" 
                    value={formData.contactName} 
                    onChange={(e) => {
                      handleInputChange('contactName', e.target.value);
                      if (errors.contactName) {
                        setErrors(prev => ({ ...prev, contactName: '' }));
                      }
                    }} 
                  />
                  {errors.contactName && (
                    <p className="text-red-500 text-sm mt-1">{errors.contactName}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Contact Phone *</label>
                  <input 
                    type="tel" 
                    id="contactPhone"
                    name="contactPhone"
                    className="w-full p-2 border border-slate-300 rounded-lg"
                    placeholder="09957322939" 
                    value={formData.contactPhone} 
                    onChange={(e) => {
                      handleInputChange('contactPhone', e.target.value);
                      if (errors.contactPhone) {
                        setErrors(prev => ({ ...prev, contactPhone: '' }));
                      }
                    }} 
                  />
                  {errors.contactPhone && (
                    <p className="text-red-500 text-sm mt-1">{errors.contactPhone}</p>
                  )}
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
                    onChange={async (e) => {
                      const files = Array.from(e.target.files || []);
                      console.log('Files selected:', files);
                      setUploadedFiles(prev => [...prev, ...files]);
                      
                      // Upload files immediately
                      for (const file of files) {
                        const formData = new FormData();
                        formData.append('file', file);
                        
                        try {
                          console.log('Uploading file:', file.name);
                          const response = await fetch('/api/upload', {
                            method: 'POST',
                            body: formData
                          });
                          
                          const result = await response.json();
                          console.log('Upload result:', result);
                          if (result.success) {
                            setUploadedUrls(prev => {
                              const newUrls = [...prev, result.url];
                              console.log('Updated uploadedUrls:', newUrls);
                              return newUrls;
                            });
                          } else {
                            toast.error(`Failed to upload ${file.name}: ${result.message}`);
                          }
                        } catch (error) {
                          console.error('Upload error:', error);
                          toast.error(`Failed to upload ${file.name}`);
                        }
                      }
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
                          onClick={() => {
                            const fileIndex = uploadedFiles.findIndex((_, i) => i === index);
                            setUploadedFiles(prev => prev.filter((_, i) => i !== index));
                            setUploadedUrls(prev => prev.filter((_, i) => i !== fileIndex));
                          }}
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
          </>
        ) : (
          // REQUESTS LIST
          <>
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-slate-900">Service Requests</h1>
                <p className="text-slate-600 mt-1">Submit and track your service requests</p>
              </div>
              <Button
                onClick={() => {
                  // Clear form data for new request
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
                  setUploadedFiles([]);
                  setUploadedUrls([]);
                  setSelectedRequest(null);
                  setShowForm(true);
                }}
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
            {requests.map((request: any, index: number) => {
              const config = getStatusConfig(request.status);
              const Icon = config.icon;

              return (
                <Card key={request._id || request.id || `request-${index}`} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-slate-900">
                            Request #{request.requestNumber || 'Service Request'}
                          </h3>
                        </div>

                        <p className="text-slate-700 font-medium capitalize mb-1">
                          {request.serviceType?.replace(/-/g, ' ') || 'Unknown Service'}
                        </p>

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
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
          </>
        )}
      </div>
      </div>
    </>
  );
}