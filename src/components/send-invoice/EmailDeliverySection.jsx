import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Mail, Send } from "lucide-react";

export default function EmailDeliverySection({ invoice, customer, serviceProvider, onSend, sending }) {
  const [recipientEmail, setRecipientEmail] = useState(customer?.billing_email || customer?.primary_email || '');
  const [ccEmails, setCcEmails] = useState('');
  const [subject, setSubject] = useState(
    `Invoice ${invoice.invoice_number} from ${serviceProvider?.legal_company_name || 'Your Service Provider'}`
  );
  const [messageBody, setMessageBody] = useState(
    `Dear ${customer?.primary_contact_name || 'Customer'},\n\nPlease find attached Invoice ${invoice.invoice_number} for ${invoice.job_reference}.\n\nTotal Amount Due: $${invoice.total_amount?.toFixed(2) || '0.00'}\nDue Date: ${invoice.due_date || 'N/A'}\n\nThank you for your business.\n\nBest regards,\n${serviceProvider?.legal_company_name || 'Your Service Provider'}`
  );

  const handleSend = () => {
    if (!recipientEmail) {
      alert('Please enter a recipient email address');
      return;
    }

    if (!recipientEmail.includes('@')) {
      alert('Please enter a valid email address');
      return;
    }

    onSend({
      method: 'email',
      recipient: recipientEmail,
      ccRecipients: ccEmails,
      subject,
      messageBody
    });
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
      <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
        <Mail className="w-5 h-5 text-slate-700" />
        <h3 className="font-semibold text-slate-900">Send via Email</h3>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="recipient_email">
            Recipient Email <span className="text-red-500">*</span>
          </Label>
          <Input
            id="recipient_email"
            type="email"
            value={recipientEmail}
            onChange={(e) => setRecipientEmail(e.target.value)}
            placeholder="customer@example.com"
            className="h-12"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="cc_emails">CC Email(s) (Optional)</Label>
          <Input
            id="cc_emails"
            type="text"
            value={ccEmails}
            onChange={(e) => setCcEmails(e.target.value)}
            placeholder="email1@example.com, email2@example.com"
            className="h-12"
          />
          <p className="text-xs text-slate-500">Separate multiple emails with commas</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="subject">Subject</Label>
          <Input
            id="subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="h-12"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="message_body">Message</Label>
          <Textarea
            id="message_body"
            value={messageBody}
            onChange={(e) => setMessageBody(e.target.value)}
            rows={8}
            className="resize-none"
          />
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm text-slate-600">
          <p className="font-medium mb-1">Attachments:</p>
          <p>• Invoice PDF (automatically attached)</p>
        </div>

        <div className="flex justify-end">
          <Button
            onClick={handleSend}
            disabled={sending}
            className="h-12 px-6 bg-blue-600 hover:bg-blue-700 gap-2"
          >
            {sending ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Sending...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Send Email</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}