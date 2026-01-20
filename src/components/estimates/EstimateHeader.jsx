import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { FileText, MapPin } from "lucide-react";

const statusConfig = {
  draft: { label: 'Draft', className: 'bg-slate-100 text-slate-700' },
  sent: { label: 'Sent', className: 'bg-blue-100 text-blue-700' },
  accepted: { label: 'Accepted', className: 'bg-green-100 text-green-700' },
  expired: { label: 'Expired', className: 'bg-red-100 text-red-700' },
  cancelled: { label: 'Cancelled', className: 'bg-red-100 text-red-700' }
};

export default function EstimateHeader({ data, onChange, customers, locations, errors, isReadOnly }) {
  const handleChange = (field, value) => {
    onChange({ ...data, [field]: value });
  };

  const handleCustomerChange = (customerId) => {
    const customer = customers.find(c => c.id === customerId);
    
    // Build formatted addresses
    const billingAddr = customer?.billing_street_1 ? 
      `${customer.billing_street_1}${customer.billing_street_2 ? ', ' + customer.billing_street_2 : ''}, ${customer.billing_city}, ${customer.billing_state} ${customer.billing_zip}` : '';
    
    const shippingAddr = customer?.shipping_same_as_billing ? billingAddr :
      customer?.shipping_street_1 ?
      `${customer.shipping_street_1}${customer.shipping_street_2 ? ', ' + customer.shipping_street_2 : ''}, ${customer.shipping_city}, ${customer.shipping_state} ${customer.shipping_zip}` : '';
    
    onChange({
      ...data,
      customer_id: customerId,
      customer_name: customer?.legal_company_name || '',
      customer_email: customer?.email || '',
      bill_to_address: billingAddr,
      ship_to_address: shippingAddr,
      payment_terms: customer?.payment_terms || 'net_30',
      primary_service_location_id: '' // Reset location when customer changes
    });
  };

  return (
    <div className="bg-white rounded-2xl border-2 border-slate-200 p-8 space-y-6 shadow-lg">
      <div className="flex items-center justify-between pb-4 border-b-2 border-slate-200">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-100 rounded-xl">
            <FileText className="w-5 h-5 text-blue-700" />
          </div>
          <h3 className="text-xl font-bold text-slate-900">Estimate Details</h3>
        </div>
        {data.estimate_status && (
          <Badge className={statusConfig[data.estimate_status]?.className}>
            {statusConfig[data.estimate_status]?.label}
          </Badge>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="estimate_number">Estimate Number</Label>
          <Input
            id="estimate_number"
            value={data.estimate_number || 'Auto-generated'}
            disabled
            className="bg-slate-50"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="estimate_date">
            Estimate Date <span className="text-red-500">*</span>
          </Label>
          <Input
            id="estimate_date"
            type="date"
            value={data.estimate_date || ''}
            onChange={(e) => handleChange('estimate_date', e.target.value)}
            disabled={isReadOnly}
            className={errors.estimate_date ? 'border-red-400' : ''}
          />
          {errors.estimate_date && <p className="text-xs text-red-500">{errors.estimate_date}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="customer_id">
            Customer <span className="text-red-500">*</span>
          </Label>
          <Select 
            value={data.customer_id || ''} 
            onValueChange={handleCustomerChange}
            disabled={isReadOnly}
          >
            <SelectTrigger className={errors.customer_id ? 'border-red-400' : ''}>
              <SelectValue placeholder="Select customer" />
            </SelectTrigger>
            <SelectContent>
              {customers.filter(c => c.customer_status === 'active').map(customer => (
                <SelectItem key={customer.id} value={customer.id}>
                  {customer.legal_company_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.customer_id && <p className="text-xs text-red-500">{errors.customer_id}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="valid_until_date">
            Expiration Date <span className="text-red-500">*</span>
          </Label>
          <Input
            id="valid_until_date"
            type="date"
            value={data.valid_until_date || ''}
            onChange={(e) => handleChange('valid_until_date', e.target.value)}
            disabled={isReadOnly}
            className={errors.valid_until_date ? 'border-red-400' : ''}
          />
          {errors.valid_until_date && <p className="text-xs text-red-500">{errors.valid_until_date}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="destruction_type">Destruction Type</Label>
          <Select 
            value={data.destruction_type || ''} 
            onValueChange={(value) => handleChange('destruction_type', value)}
            disabled={isReadOnly}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select destruction type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="beverage_destruction">Beverage Destruction</SelectItem>
              <SelectItem value="liquid_waste_processing">Liquid Waste Processing</SelectItem>
              <SelectItem value="packaging_destruction">Packaging Destruction</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="primary_service_location_id">Primary Service Location</Label>
          <Select 
            value={data.primary_service_location_id || ''} 
            onValueChange={(value) => handleChange('primary_service_location_id', value)}
            disabled={isReadOnly || !data.customer_id}
          >
            <SelectTrigger>
              <SelectValue placeholder={data.customer_id ? "Select location" : "Select customer first"} />
            </SelectTrigger>
            <SelectContent>
              {locations.map(location => (
                <SelectItem key={location.id} value={location.id}>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3 h-3" />
                    {location.location_name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="job_reference">Job Reference (Optional)</Label>
          <Input
            id="job_reference"
            value={data.job_reference || ''}
            onChange={(e) => handleChange('job_reference', e.target.value)}
            placeholder="Pre-assign job reference"
            disabled={isReadOnly}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="estimate_status">Status</Label>
          <Input
            id="estimate_status"
            value={statusConfig[data.estimate_status]?.label || 'Draft'}
            disabled
            className="bg-slate-50"
          />
        </div>

        <div className="md:col-span-2 space-y-2">
          <Label htmlFor="internal_notes">Internal Notes</Label>
          <Textarea
            id="internal_notes"
            value={data.internal_notes || ''}
            onChange={(e) => handleChange('internal_notes', e.target.value)}
            placeholder="Internal notes (not visible to customer)..."
            className="resize-none"
            rows={3}
          />
        </div>
      </div>
    </div>
  );
}