import React, { useState } from 'react';
import { base44 } from "@/api/base44Client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Loader2, Package, MapPin, Calendar, Upload, X, Save, BookOpen, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ServiceRequestForm({ customerId, editingRequest, onSaved }) {
  const [showSuccess, setShowSuccess] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [showSaveTemplate, setShowSaveTemplate] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    service_type: '',
    product_type: '',
    material_condition: '',
    estimated_volume: '',
    estimated_weight: '',
    unit_count: '',
    pallet_count: '',
    pallet_type: '',
    shrink_wrapped: false,
    destruction_type: '',
    certificate_required: false,
    logistics_type: '',
    pickup_address: '',
    pickup_hours: '',
    needs_trucking: false,
    needs_pallet_swap: false,
    needs_labor: false,
    hazardous_notes: '',
    time_constraints: '',
    preferred_date: '',
    location_notes: '',
    special_requirements: '',
    contact_name: '',
    contact_phone: '',
    urgency: 'normal',
    problem_description: '',
    quantity_details: '',
    schedule_frequency: ''
  });
  
  const [errors, setErrors] = useState({});

  // Fetch customer data to pre-fill form
  const { data: customer } = useQuery({
    queryKey: ['customer', customerId],
    queryFn: async () => {
      const customers = await base44.entities.Customer.list();
      return customers.find(c => c.id === customerId);
    },
    enabled: !!customerId
  });

  React.useEffect(() => {
    if (editingRequest) {
      setFormData({
        service_type: editingRequest.service_type || '',
        product_type: editingRequest.product_type || '',
        material_condition: editingRequest.material_condition || '',
        estimated_volume: editingRequest.estimated_volume || '',
        estimated_weight: editingRequest.estimated_weight || '',
        unit_count: editingRequest.unit_count || '',
        pallet_count: editingRequest.pallet_count || '',
        pallet_type: editingRequest.pallet_type || '',
        shrink_wrapped: editingRequest.shrink_wrapped || false,
        destruction_type: editingRequest.destruction_type || '',
        certificate_required: editingRequest.certificate_required || false,
        logistics_type: editingRequest.logistics_type || '',
        pickup_address: editingRequest.pickup_address || '',
        pickup_hours: editingRequest.pickup_hours || '',
        needs_trucking: editingRequest.needs_trucking || false,
        needs_pallet_swap: editingRequest.needs_pallet_swap || false,
        needs_labor: editingRequest.needs_labor || false,
        hazardous_notes: editingRequest.hazardous_notes || '',
        time_constraints: editingRequest.time_constraints || '',
        preferred_date: editingRequest.preferred_date || '',
        location_notes: editingRequest.location_notes || '',
        special_requirements: editingRequest.special_requirements || '',
        contact_name: editingRequest.contact_name || '',
        contact_phone: editingRequest.contact_phone || '',
        urgency: editingRequest.urgency || 'normal',
        problem_description: editingRequest.problem_description || '',
        quantity_details: editingRequest.quantity_details || '',
        schedule_frequency: editingRequest.schedule_frequency || ''
      });
      if (editingRequest.attachments) {
        setAttachments(JSON.parse(editingRequest.attachments));
      }
    } else if (customer && !formData.contact_name) {
      // Pre-fill customer data for new requests
      const customerName = `${customer.first_name || ''} ${customer.last_name || ''}`.trim() || customer.display_name || '';
      const customerPhone = customer.phone || customer.mobile || '';
      const billingAddress = [
        customer.billing_street_1,
        customer.billing_street_2,
        customer.billing_city,
        customer.billing_state,
        customer.billing_zip
      ].filter(Boolean).join(', ');
      
      setFormData(prev => ({
        ...prev,
        contact_name: customerName,
        contact_phone: customerPhone,
        pickup_address: billingAddress
      }));
    }
  }, [editingRequest, customer]);

  const { data: locations = [] } = useQuery({
    queryKey: ['customerLocations', customerId],
    queryFn: () => base44.entities.Location.filter({ customer_id: customerId })
  });

  const { data: templates = [] } = useQuery({
    queryKey: ['serviceRequestTemplates', customerId],
    queryFn: () => base44.entities.ServiceRequestTemplate.filter({ customer_id: customerId })
  });

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploading(true);
    try {
      const uploadedUrls = [];
      for (const file of files) {
        const response = await base44.integrations.Core.UploadFile({ file });
        const fileUrl = response.file_url || response.data?.file_url;
        if (fileUrl) {
          uploadedUrls.push(fileUrl);
        }
      }
      setAttachments([...attachments, ...uploadedUrls]);
    } catch (error) {
      alert('Failed to upload files: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveAttachment = (index) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Phone validation (US format)
    const phoneRegex = /^[\d\s\-\(\)]+$/;
    if (formData.contact_phone && !phoneRegex.test(formData.contact_phone)) {
      newErrors.contact_phone = 'Please enter a valid phone number';
    }
    
    // Character limits
    if (formData.contact_name && formData.contact_name.length > 100) {
      newErrors.contact_name = 'Contact name must be under 100 characters';
    }
    
    if (formData.location_notes && formData.location_notes.length > 500) {
      newErrors.location_notes = 'Location notes must be under 500 characters';
    }
    
    if (formData.special_requirements && formData.special_requirements.length > 1000) {
      newErrors.special_requirements = 'Special requirements must be under 1000 characters';
    }
    
    if (formData.problem_description && formData.problem_description.length > 1000) {
      newErrors.problem_description = 'Problem description must be under 1000 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const submitMutation = useMutation({
    mutationFn: async ({ data, isDraft }) => {
      const customers = await base44.entities.Customer.list();
      const customer = customers.find(c => c.id === customerId);
      
      const requestData = {
        customer_id: customerId,
        customer_name: customer?.legal_company_name || customer?.display_name || '',
        customer_email: customer?.email || '',
        request_status: isDraft ? 'draft' : 'pending',
        service_type: data.service_type,
        product_type: data.product_type,
        material_condition: data.material_condition,
        estimated_volume: data.estimated_volume,
        estimated_weight: data.estimated_weight,
        unit_count: data.unit_count,
        pallet_count: data.pallet_count,
        pallet_type: data.pallet_type,
        shrink_wrapped: data.shrink_wrapped,
        destruction_type: data.destruction_type,
        certificate_required: data.certificate_required,
        logistics_type: data.logistics_type,
        pickup_address: data.pickup_address,
        pickup_hours: data.pickup_hours,
        needs_trucking: data.needs_trucking,
        needs_pallet_swap: data.needs_pallet_swap,
        needs_labor: data.needs_labor,
        hazardous_notes: data.hazardous_notes,
        time_constraints: data.time_constraints,
        preferred_date: data.preferred_date,
        location_notes: data.location_notes,
        special_requirements: data.special_requirements,
        contact_name: data.contact_name,
        contact_phone: data.contact_phone,
        urgency: data.urgency,
        problem_description: data.problem_description,
        quantity_details: data.quantity_details,
        schedule_frequency: data.schedule_frequency,
        attachments: JSON.stringify(attachments),
        is_draft: isDraft
      };

      let result;
      if (editingRequest) {
        // Update existing request
        result = await base44.entities.ServiceRequest.update(editingRequest.id, requestData);
      } else {
        // Generate request number for new requests
        const allRequests = await base44.entities.ServiceRequest.list();
        const requestNumbers = allRequests
          .map(r => r.request_number)
          .filter(num => num && num.startsWith('SR-'))
          .map(num => parseInt(num.replace('SR-', '')))
          .filter(num => !isNaN(num));
        
        const maxNumber = requestNumbers.length > 0 ? Math.max(...requestNumbers) : 0;
        const nextNumber = maxNumber + 1;
        const requestNumber = `SR-${String(nextNumber).padStart(4, '0')}`;

        result = await base44.entities.ServiceRequest.create({
          ...requestData,
          request_number: requestNumber
        });
        
        // Send notification for new requests (not drafts)
        if (!isDraft) {
          try {
            await base44.functions.invoke('sendServiceRequestNotification', {
              requestId: result.id,
              notificationType: 'request_submitted'
            });
          } catch (error) {
            console.error('Failed to send notification:', error);
          }
        }
      }
      
      return result;
    },
    onSuccess: (data, variables) => {
      if (!variables.isDraft) {
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 5000);
      }
      setFormData({
        service_type: '',
        product_type: '',
        material_condition: '',
        estimated_volume: '',
        estimated_weight: '',
        unit_count: '',
        pallet_count: '',
        pallet_type: '',
        shrink_wrapped: false,
        destruction_type: '',
        certificate_required: false,
        logistics_type: '',
        pickup_address: '',
        pickup_hours: '',
        needs_trucking: false,
        needs_pallet_swap: false,
        needs_labor: false,
        hazardous_notes: '',
        time_constraints: '',
        preferred_date: '',
        location_notes: '',
        special_requirements: '',
        contact_name: '',
        contact_phone: '',
        urgency: 'normal',
        problem_description: '',
        quantity_details: '',
        schedule_frequency: ''
      });
      setAttachments([]);
      setErrors({});
      queryClient.invalidateQueries({ queryKey: ['serviceRequests'] });
      queryClient.invalidateQueries({ queryKey: ['myServiceRequests'] });
      if (onSaved) onSaved();
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    submitMutation.mutate({ data: formData, isDraft: false });
  };

  const handleSaveDraft = () => {
    submitMutation.mutate({ data: formData, isDraft: true });
  };

  const saveTemplateMutation = useMutation({
    mutationFn: (templateData) => base44.entities.ServiceRequestTemplate.create(templateData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['serviceRequestTemplates'] });
      setShowSaveTemplate(false);
      setTemplateName('');
      alert('Template saved successfully!');
    }
  });

  const deleteTemplateMutation = useMutation({
    mutationFn: (templateId) => base44.entities.ServiceRequestTemplate.delete(templateId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['serviceRequestTemplates'] });
    }
  });

  const handleSaveTemplate = () => {
    if (!templateName.trim()) {
      alert('Please enter a template name');
      return;
    }

    saveTemplateMutation.mutate({
      customer_id: customerId,
      template_name: templateName,
      service_type: formData.service_type,
      product_type: formData.product_type,
      material_condition: formData.material_condition,
      destruction_type: formData.destruction_type,
      certificate_required: formData.certificate_required,
      logistics_type: formData.logistics_type,
      needs_trucking: formData.needs_trucking,
      needs_pallet_swap: formData.needs_pallet_swap,
      needs_labor: formData.needs_labor,
      urgency: formData.urgency,
      special_requirements: formData.special_requirements,
      location_notes: formData.location_notes
    });
  };

  const handleLoadTemplate = (template) => {
    setFormData({
      ...formData,
      service_type: template.service_type || '',
      product_type: template.product_type || '',
      material_condition: template.material_condition || '',
      destruction_type: template.destruction_type || '',
      certificate_required: template.certificate_required || false,
      logistics_type: template.logistics_type || '',
      needs_trucking: template.needs_trucking || false,
      needs_pallet_swap: template.needs_pallet_swap || false,
      needs_labor: template.needs_labor || false,
      urgency: template.urgency || 'normal',
      special_requirements: template.special_requirements || '',
      location_notes: template.location_notes || ''
    });
  };

  const handleDeleteTemplate = (templateId) => {
    if (confirm('Delete this template?')) {
      deleteTemplateMutation.mutate(templateId);
    }
  };

  return (
    <div className="space-y-6">
      {/* Templates Section */}
      {templates.length > 0 && !editingRequest && (
        <Card className="mb-6">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-white border-b">
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-purple-600" />
              Quick Start with Templates
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-2 gap-3">
              {templates.map((template) => (
                <div
                  key={template.id}
                  className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-all"
                >
                  <div>
                    <p className="font-medium text-slate-900">{template.template_name}</p>
                    <p className="text-sm text-slate-600 capitalize">
                      {template.service_type?.replace(/_/g, ' ')}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => handleLoadTemplate(template)}
                    >
                      Use Template
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDeleteTemplate(template.id)}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-900">
              <Package className="w-6 h-6 text-blue-600" />
              {editingRequest ? 'Edit Service Request' : 'New Service Request'}
            </div>
            {!editingRequest && formData.service_type && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowSaveTemplate(true)}
                className="gap-2"
              >
                <Save className="w-4 h-4" />
                Save as Template
              </Button>
            )}
          </CardTitle>
          <p className="text-sm text-slate-600 mt-2">
            Submit a request for destruction services. Our team will review and contact you within 24 hours.
          </p>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Service Type */}
            <div className="space-y-2">
              <Label htmlFor="service_type">Service Type *</Label>
              <Select 
                value={formData.service_type}
                onValueChange={(value) => setFormData({...formData, service_type: value})}
                required
              >
                <SelectTrigger id="service_type">
                  <SelectValue placeholder="Select service type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beverage_destruction">Beverage Destruction</SelectItem>
                  <SelectItem value="product_disposal">Product Disposal</SelectItem>
                  <SelectItem value="packaging_recycling">Packaging Recycling</SelectItem>
                  <SelectItem value="emergency_destruction">Emergency Destruction</SelectItem>
                  <SelectItem value="scheduled_disposal">Scheduled Disposal Program</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Conditional Fields */}
            <AnimatePresence>
              {formData.service_type === 'emergency_destruction' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-2"
                >
                  <Label htmlFor="problem_description">Problem Description *</Label>
                  <Textarea 
                    id="problem_description"
                    placeholder="Describe the emergency situation requiring immediate destruction..."
                    value={formData.problem_description}
                    onChange={(e) => setFormData({...formData, problem_description: e.target.value})}
                    rows={4}
                    maxLength={1000}
                    required
                  />
                  {errors.problem_description && (
                    <p className="text-sm text-red-600">{errors.problem_description}</p>
                  )}
                  <p className="text-xs text-slate-500">{formData.problem_description.length}/1000 characters</p>
                </motion.div>
              )}

              {formData.service_type === 'scheduled_disposal' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-2"
                >
                  <Label htmlFor="schedule_frequency">Schedule Frequency *</Label>
                  <Select 
                    value={formData.schedule_frequency}
                    onValueChange={(value) => setFormData({...formData, schedule_frequency: value})}
                    required
                  >
                    <SelectTrigger id="schedule_frequency">
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="bi_weekly">Bi-Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-slate-500">How often would you like scheduled pickups?</p>
                </motion.div>
              )}

              {(formData.service_type === 'beverage_destruction' || formData.service_type === 'product_disposal') && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-2"
                >
                  <Label htmlFor="quantity_details">Quantity Breakdown</Label>
                  <Textarea 
                    id="quantity_details"
                    placeholder="Provide detailed quantity information (e.g., 200 cases of aluminum cans, 50 cases of glass bottles...)"
                    value={formData.quantity_details}
                    onChange={(e) => setFormData({...formData, quantity_details: e.target.value})}
                    rows={3}
                    maxLength={500}
                  />
                  <p className="text-xs text-slate-500">{formData.quantity_details.length}/500 characters</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Material Details Section */}
            <div className="border-t pt-6 space-y-4">
              <h3 className="font-semibold text-slate-900 text-lg">Material Details</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="product_type">Product Type *</Label>
                  <Select 
                    value={formData.product_type}
                    onValueChange={(value) => setFormData({...formData, product_type: value})}
                    required
                  >
                    <SelectTrigger id="product_type">
                      <SelectValue placeholder="Select product" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="alcoholic_beverages">Alcoholic Beverages</SelectItem>
                      <SelectItem value="non_alcoholic_beverages">Non-Alcoholic Beverages</SelectItem>
                      <SelectItem value="mixed_products">Mixed Products</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="material_condition">Material Condition</Label>
                  <Select 
                    value={formData.material_condition}
                    onValueChange={(value) => setFormData({...formData, material_condition: value})}
                  >
                    <SelectTrigger id="material_condition">
                      <SelectValue placeholder="Select condition" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full">Full</SelectItem>
                      <SelectItem value="partial">Partial</SelectItem>
                      <SelectItem value="empty">Empty</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Weight & Volume Section */}
            <div className="border-t pt-6 space-y-4">
              <h3 className="font-semibold text-slate-900 text-lg">Weight & Volume</h3>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="estimated_weight">Estimated Total Weight</Label>
                  <Input 
                    id="estimated_weight"
                    placeholder="e.g., 5,000 lbs"
                    value={formData.estimated_weight}
                    onChange={(e) => setFormData({...formData, estimated_weight: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="unit_count">Count of Units/Cases</Label>
                  <Input 
                    id="unit_count"
                    placeholder="e.g., 500 cases"
                    value={formData.unit_count}
                    onChange={(e) => setFormData({...formData, unit_count: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pallet_count">Number of Pallets</Label>
                  <Input 
                    id="pallet_count"
                    type="number"
                    placeholder="e.g., 10"
                    value={formData.pallet_count}
                    onChange={(e) => setFormData({...formData, pallet_count: e.target.value})}
                  />
                </div>
              </div>
            </div>

            {/* Pallet Details Section */}
            <div className="border-t pt-6 space-y-4">
              <h3 className="font-semibold text-slate-900 text-lg">Pallet / Load Details</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="pallet_type">Pallet Type</Label>
                  <Select 
                    value={formData.pallet_type}
                    onValueChange={(value) => setFormData({...formData, pallet_type: value})}
                  >
                    <SelectTrigger id="pallet_type">
                      <SelectValue placeholder="Select pallet type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">Standard</SelectItem>
                      <SelectItem value="mixed">Mixed</SelectItem>
                      <SelectItem value="rework_needed">Needs Rework</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.shrink_wrapped}
                      onChange={(e) => setFormData({...formData, shrink_wrapped: e.target.checked})}
                      className="rounded"
                    />
                    Pallets are shrink-wrapped
                  </Label>
                </div>
              </div>
            </div>

            {/* Service Requirements Section */}
            <div className="border-t pt-6 space-y-4">
              <h3 className="font-semibold text-slate-900 text-lg">Service Requirements</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="destruction_type">Destruction Type</Label>
                  <Select 
                    value={formData.destruction_type}
                    onValueChange={(value) => setFormData({...formData, destruction_type: value})}
                  >
                    <SelectTrigger id="destruction_type">
                      <SelectValue placeholder="Select destruction type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">Standard</SelectItem>
                      <SelectItem value="secure">Secure</SelectItem>
                      <SelectItem value="witnessed">Witnessed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.certificate_required}
                      onChange={(e) => setFormData({...formData, certificate_required: e.target.checked})}
                      className="rounded"
                    />
                    Certificate of Destruction Required
                  </Label>
                </div>
              </div>
            </div>

            {/* Logistics Section */}
            <div className="border-t pt-6 space-y-4">
              <h3 className="font-semibold text-slate-900 text-lg">Logistics</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="logistics_type">Service Type</Label>
                  <Select 
                    value={formData.logistics_type}
                    onValueChange={(value) => setFormData({...formData, logistics_type: value})}
                  >
                    <SelectTrigger id="logistics_type">
                      <SelectValue placeholder="Pickup or drop-off?" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pickup">Pickup</SelectItem>
                      <SelectItem value="drop_off">Drop-off</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {formData.logistics_type === 'pickup' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <Label htmlFor="pickup_address">Pickup Address</Label>
                    <Textarea 
                      id="pickup_address"
                      placeholder="Enter pickup address..."
                      value={formData.pickup_address}
                      onChange={(e) => setFormData({...formData, pickup_address: e.target.value})}
                      rows={2}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pickup_hours">Pickup Hours/Availability</Label>
                    <Input 
                      id="pickup_hours"
                      placeholder="e.g., Mon-Fri 8am-5pm"
                      value={formData.pickup_hours}
                      onChange={(e) => setFormData({...formData, pickup_hours: e.target.value})}
                    />
                  </div>
                </motion.div>
              )}

              <div className="space-y-3 pt-2">
                <Label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.needs_trucking}
                    onChange={(e) => setFormData({...formData, needs_trucking: e.target.checked})}
                    className="rounded"
                  />
                  Need trucking service
                </Label>
                <Label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.needs_pallet_swap}
                    onChange={(e) => setFormData({...formData, needs_pallet_swap: e.target.checked})}
                    className="rounded"
                  />
                  Need pallet swap
                </Label>
                <Label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.needs_labor}
                    onChange={(e) => setFormData({...formData, needs_labor: e.target.checked})}
                    className="rounded"
                  />
                  Need additional labor
                </Label>
              </div>
            </div>

            {/* Special Notes Section */}
            <div className="border-t pt-6 space-y-4">
              <h3 className="font-semibold text-slate-900 text-lg">Special Notes</h3>
              
              <div className="space-y-2">
                <Label htmlFor="hazardous_notes">Hazardous Considerations</Label>
                <Textarea 
                  id="hazardous_notes"
                  placeholder="Any leaking, liquids, or hazardous materials?"
                  value={formData.hazardous_notes}
                  onChange={(e) => setFormData({...formData, hazardous_notes: e.target.value})}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="time_constraints">Time Constraints / Deadlines</Label>
                <Textarea 
                  id="time_constraints"
                  placeholder="Any specific deadlines or time requirements?"
                  value={formData.time_constraints}
                  onChange={(e) => setFormData({...formData, time_constraints: e.target.value})}
                  rows={2}
                />
              </div>
            </div>

            {/* Preferred Date & Urgency */}
            <div className="border-t pt-6 space-y-4">
              <h3 className="font-semibold text-slate-900 text-lg">Scheduling</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="preferred_date">Preferred Service Date *</Label>
                  <Input 
                    id="preferred_date"
                    type="date"
                    value={formData.preferred_date}
                    onChange={(e) => setFormData({...formData, preferred_date: e.target.value})}
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="urgency">Urgency</Label>
                  <Select 
                    value={formData.urgency}
                    onValueChange={(value) => setFormData({...formData, urgency: value})}
                  >
                    <SelectTrigger id="urgency">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="normal">Normal (5-7 days)</SelectItem>
                      <SelectItem value="expedited">Expedited (2-3 days)</SelectItem>
                      <SelectItem value="urgent">Urgent (24 hours)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Contact Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contact_name">Contact Name *</Label>
                <Input 
                  id="contact_name"
                  placeholder="Primary contact for this request"
                  value={formData.contact_name}
                  onChange={(e) => setFormData({...formData, contact_name: e.target.value})}
                  maxLength={100}
                  required
                />
                {errors.contact_name && (
                  <p className="text-sm text-red-600">{errors.contact_name}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact_phone">Contact Phone *</Label>
                <Input 
                  id="contact_phone"
                  type="tel"
                  placeholder="(555) 123-4567"
                  value={formData.contact_phone}
                  onChange={(e) => setFormData({...formData, contact_phone: e.target.value})}
                  required
                />
                {errors.contact_phone && (
                  <p className="text-sm text-red-600">{errors.contact_phone}</p>
                )}
              </div>
            </div>

            {/* Attachments */}
            <div className="border-t pt-6 space-y-2">
              <Label>Attachments (Photos of Product, Pallets, Documents)</Label>
              <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                <input
                  type="file"
                  multiple
                  accept="image/*,video/*,.pdf,.doc,.docx,.xlsx,.xls"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                  disabled={uploading}
                />
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer flex flex-col items-center gap-2"
                >
                  <Upload className="w-8 h-8 text-slate-400" />
                  <p className="text-sm text-slate-600">
                    {uploading ? 'Uploading...' : 'Click to upload files'}
                  </p>
                  <p className="text-xs text-slate-500">Images, videos, or documents</p>
                </label>
              </div>
              
              {attachments.length > 0 && (
                <div className="grid grid-cols-3 gap-3 mt-3">
                  {attachments.map((url, idx) => (
                    <div key={idx} className="relative border border-slate-200 rounded-lg p-3">
                      <button
                        type="button"
                        onClick={() => handleRemoveAttachment(idx)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                      <a href={url} target="_blank" rel="noopener noreferrer" className="block">
                        <Package className="w-8 h-8 text-slate-400 mx-auto mb-1" />
                        <p className="text-xs text-slate-600 text-center truncate">File {idx + 1}</p>
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={handleSaveDraft}
                disabled={submitMutation.isPending}
              >
                Save as Draft
              </Button>
              <Button
                type="submit"
                disabled={submitMutation.isPending}
                className="bg-blue-600 hover:bg-blue-700 gap-2 px-8"
              >
                {submitMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  editingRequest ? 'Update Request' : 'Submit Service Request'
                )}
              </Button>
            </div>
          </form>
          </CardContent>
          </Card>

          {/* Save Template Dialog */}
          <AnimatePresence>
          {showSaveTemplate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setShowSaveTemplate(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl p-6 max-w-md w-full mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold text-slate-900 mb-4">Save as Template</h3>
              <p className="text-sm text-slate-600 mb-4">
                Create a template to quickly reuse these settings for future requests.
              </p>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="template_name">Template Name</Label>
                  <Input
                    id="template_name"
                    value={templateName}
                    onChange={(e) => setTemplateName(e.target.value)}
                    placeholder="e.g., Weekly Pickup Request"
                    autoFocus
                  />
                </div>
                <div className="flex gap-3 justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowSaveTemplate(false);
                      setTemplateName('');
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    onClick={handleSaveTemplate}
                    disabled={saveTemplateMutation.isPending}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    {saveTemplateMutation.isPending ? 'Saving...' : 'Save Template'}
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
          )}
          </AnimatePresence>

          {/* Success Message */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed bottom-8 right-8 bg-green-600 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 z-50"
          >
            <CheckCircle className="w-5 h-5" />
            <div>
              <p className="font-semibold">Service Request Submitted!</p>
              <p className="text-sm text-green-100">We'll contact you within 24 hours.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}