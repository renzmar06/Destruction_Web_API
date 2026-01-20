import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { MessageSquare, Send } from "lucide-react";

export default function SMSDeliverySection({ invoice, customer, serviceProvider, onSend, sending }) {
  const [recipientPhone, setRecipientPhone] = useState(customer?.primary_phone || '');
  const secureLink = `https://invoices.example.com/${invoice.id}`;
  const [messageText, setMessageText] = useState(
    `${serviceProvider?.legal_company_name || 'Service Provider'}: Invoice ${invoice.invoice_number} for $${invoice.total_amount?.toFixed(2) || '0.00'} is ready. View here: ${secureLink}`
  );

  const characterCount = messageText.length;
  const maxCharacters = 160;

  const handleSend = () => {
    if (!recipientPhone) {
      alert('Please enter a recipient phone number');
      return;
    }

    if (recipientPhone.length < 10) {
      alert('Please enter a valid phone number');
      return;
    }

    onSend({
      method: 'sms',
      recipient: recipientPhone,
      messageText
    });
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
      <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
        <MessageSquare className="w-5 h-5 text-slate-700" />
        <h3 className="font-semibold text-slate-900">Send via SMS</h3>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="recipient_phone">
            Recipient Phone Number <span className="text-red-500">*</span>
          </Label>
          <Input
            id="recipient_phone"
            type="tel"
            value={recipientPhone}
            onChange={(e) => setRecipientPhone(e.target.value)}
            placeholder="(555) 123-4567"
            className="h-12"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="message_text">Message Text</Label>
          <Textarea
            id="message_text"
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            rows={5}
            className="resize-none"
            maxLength={maxCharacters}
          />
          <p className={`text-xs ${characterCount > maxCharacters ? 'text-red-500' : 'text-slate-500'}`}>
            {characterCount} / {maxCharacters} characters
          </p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
          <p className="font-medium mb-1">Secure Invoice Link:</p>
          <p className="text-xs break-all">{secureLink}</p>
          <p className="text-xs mt-2">This link is unique, non-editable, and read-only.</p>
        </div>

        <div className="flex justify-end">
          <Button
            onClick={handleSend}
            disabled={sending}
            className="h-12 px-6 bg-green-600 hover:bg-green-700 gap-2"
          >
            {sending ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Sending...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Send SMS</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}