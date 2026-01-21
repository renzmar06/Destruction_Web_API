import React, { useState } from 'react';
import { Mail, Phone, MapPin, Plus, FileText, Download, X } from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import PriceRuleManager from "../../price-rules/PriceRuleManager";

export default function CustomerDetailsTab({ customer, locations }) {
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);

  // Mock data for now
  const estimates = [];
  const allAttachments = [];

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingFile(true);
    try {
      // Mock file upload - just show alert for now
      alert('File upload functionality will be implemented later');
      setShowUploadDialog(false);
    } catch (error) {
      alert('Failed to upload file: ' + error.message);
    } finally {
      setUploadingFile(false);
    }
  };
  const displayName = customer.first_name || customer.last_name 
    ? `${customer.first_name || ''} ${customer.last_name || ''}`.trim()
    : customer.display_name || '—';

  const billingAddress = customer.billing_street_1
    ? `${customer.billing_street_1}${customer.billing_street_2 ? ', ' + customer.billing_street_2 : ''}, ${customer.billing_city}, ${customer.billing_state} ${customer.billing_zip}`
    : '—';

  const shippingAddress = customer.shipping_street_1
    ? `${customer.shipping_street_1}${customer.shipping_street_2 ? ', ' + customer.shipping_street_2 : ''}, ${customer.shipping_city}, ${customer.shipping_state} ${customer.shipping_zip}`
    : '—';

  const paymentTermsLabels = {
    cod: 'COD',
    net_15: 'Net 15',
    net_30: 'Net 30',
    net_45: 'Net 45',
    net_60: 'Net 60'
  };

  const deliveryMethodLabels = {
    email: 'Email',
    mail: 'Mail',
    none: 'None'
  };

  return (
    <div className="bg-white">
      <div className="grid grid-cols-2 gap-12 p-8">
        {/* Contact Info */}
        <div>
          <h3 className="text-sm font-semibold text-slate-900 mb-4">Contact info</h3>
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-4 py-2 border-b border-slate-200">
              <div className="text-sm text-slate-600">Customer</div>
              <div className="col-span-2 text-sm text-slate-900">{displayName}</div>
            </div>
            
            <div className="grid grid-cols-3 gap-4 py-2 border-b border-slate-200">
              <div className="text-sm text-slate-600">Email</div>
              <div className="col-span-2 flex items-center gap-2">
                {customer.email ? (
                  <>
                    <span className="text-sm text-slate-900">{customer.email}</span>
                    <Mail className="w-4 h-4 text-slate-400" />
                  </>
                ) : (
                  <span className="text-sm text-slate-500">—</span>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4 py-2 border-b border-slate-200">
              <div className="text-sm text-slate-600">Cc</div>
              <div className="col-span-2 text-sm text-slate-900">{customer.cc_email || '—'}</div>
            </div>
            
            <div className="grid grid-cols-3 gap-4 py-2 border-b border-slate-200">
              <div className="text-sm text-slate-600">Bcc</div>
              <div className="col-span-2 text-sm text-slate-900">{customer.bcc_email || '—'}</div>
            </div>
            
            <div className="grid grid-cols-3 gap-4 py-2 border-b border-slate-200">
              <div className="text-sm text-slate-600">Phone</div>
              <div className="col-span-2 flex items-center gap-2">
                {customer.phone ? (
                  <>
                    <span className="text-sm text-slate-900">{customer.phone}</span>
                    <Phone className="w-4 h-4 text-slate-400" />
                  </>
                ) : (
                  <span className="text-sm text-slate-500">—</span>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4 py-2 border-b border-slate-200">
              <div className="text-sm text-slate-600">Mobile</div>
              <div className="col-span-2 text-sm text-slate-900">{customer.mobile || '—'}</div>
            </div>
            
            <div className="grid grid-cols-3 gap-4 py-2 border-b border-slate-200">
              <div className="text-sm text-slate-600">Fax</div>
              <div className="col-span-2 text-sm text-slate-900">{customer.fax || '—'}</div>
            </div>
            
            <div className="grid grid-cols-3 gap-4 py-2 border-b border-slate-200">
              <div className="text-sm text-slate-600">Other</div>
              <div className="col-span-2 text-sm text-slate-900">{customer.other_contact || '—'}</div>
            </div>
            
            <div className="grid grid-cols-3 gap-4 py-2 border-b border-slate-200">
              <div className="text-sm text-slate-600">Website</div>
              <div className="col-span-2 text-sm text-slate-900">{customer.website || '—'}</div>
            </div>
            
            <div className="grid grid-cols-3 gap-4 py-2 border-b border-slate-200">
              <div className="text-sm text-slate-600">Notes</div>
              <div className="col-span-2 text-sm text-slate-900">{customer.internal_notes || '—'}</div>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div>
          <h3 className="text-sm font-semibold text-slate-900 mb-4">Additional info</h3>
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-4 py-2 border-b border-slate-200">
              <div className="text-sm text-slate-600">Billing address</div>
              <div className="col-span-2 flex items-center gap-2">
                <span className="text-sm text-slate-900">{billingAddress}</span>
                {customer.billing_street_1 && <MapPin className="w-4 h-4 text-slate-400" />}
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4 py-2 border-b border-slate-200">
              <div className="text-sm text-slate-600">Shipping address</div>
              <div className="col-span-2 flex items-center gap-2">
                <span className="text-sm text-slate-900">{shippingAddress}</span>
                {customer.shipping_street_1 && <MapPin className="w-4 h-4 text-slate-400" />}
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4 py-2 border-b border-slate-200">
              <div className="text-sm text-slate-600">Terms</div>
              <div className="col-span-2 text-sm text-slate-900">
                {customer.payment_terms ? paymentTermsLabels[customer.payment_terms] || customer.payment_terms : '—'}
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4 py-2 border-b border-slate-200">
              <div className="text-sm text-slate-600">Credit Limit</div>
              <div className="col-span-2 text-sm text-slate-900">
                {customer.credit_limit ? `$${customer.credit_limit.toFixed(2)}` : '—'}
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4 py-2 border-b border-slate-200">
              <div className="text-sm text-slate-600">Payment method</div>
              <div className="col-span-2 text-sm text-slate-900">
                {customer.primary_payment_method?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || '—'}
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4 py-2 border-b border-slate-200">
              <div className="text-sm text-slate-600">Preferred delivery method</div>
              <div className="col-span-2 text-sm text-slate-900">
                {customer.delivery_method ? deliveryMethodLabels[customer.delivery_method] || customer.delivery_method : 'None'}
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4 py-2 border-b border-slate-200">
              <div className="text-sm text-slate-600">Customer type</div>
              <div className="col-span-2 text-sm text-slate-900">
                {customer.customer_role?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || '—'}
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4 py-2 border-b border-slate-200">
              <div className="text-sm text-slate-600">Customer language</div>
              <div className="col-span-2 text-sm text-slate-900">{customer.invoice_language || 'English'}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Attachments Section */}
      <div className="border-t border-slate-200 p-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-slate-900">Attachments</h3>
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-2"
            onClick={() => setShowUploadDialog(true)}
          >
            <Plus className="w-4 h-4" />
            Add New
          </Button>
        </div>
        
        {allAttachments.length === 0 ? (
          <div className="text-sm text-slate-500">No attachments</div>
        ) : (
          <div className="space-y-2">
            {allAttachments.map((attachment) => (
              <div 
                key={attachment.id} 
                className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200"
              >
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-slate-400" />
                  <div>
                    <div className="text-sm font-medium text-slate-900">
                      {attachment.file_name || 'Untitled'}
                    </div>
                    <div className="text-xs text-slate-500">
                      From: {attachment.estimate?.estimate_number || 'Estimate'}
                      {' • '}
                      {attachment.attachment_type?.replace(/_/g, ' ')}
                    </div>
                  </div>
                </div>
                <a 
                  href={attachment.file_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700"
                >
                  <Download className="w-4 h-4" />
                </a>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upload Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Attachment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center">
              <input
                type="file"
                id="file-upload"
                className="hidden"
                onChange={handleFileUpload}
                disabled={uploadingFile}
              />
              <label 
                htmlFor="file-upload" 
                className="cursor-pointer flex flex-col items-center gap-2"
              >
                <FileText className="w-12 h-12 text-slate-400" />
                <div className="text-sm font-medium text-slate-900">
                  {uploadingFile ? 'Uploading...' : 'Click to upload file'}
                </div>
                <div className="text-xs text-slate-500">
                  PDF, images, or documents
                </div>
              </label>
            </div>
            {estimates.length === 0 && (
              <div className="text-xs text-amber-600 bg-amber-50 p-3 rounded">
                Note: Customer has no estimates yet. Attachment will be available here once estimates are created.
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Price Rules Section */}
      <div className="border-t border-slate-200 p-8">
        <PriceRuleManager customerId={customer.id} />
      </div>
    </div>
  );
}