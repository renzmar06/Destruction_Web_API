import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Invoice from '@/models/Invoice';
import Customer from '@/models/Customer';
import { sendEmail } from '@/lib/emailService';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const { invoiceId, email, message } = await request.json();

    // Get invoice details
    const invoice = await Invoice.findById(invoiceId);
    if (!invoice) {
      return NextResponse.json({ success: false, error: 'Invoice not found' }, { status: 404 });
    }

    // Get customer details
    const customer = await Customer.findById(invoice.customer_id);
    
    // Generate email HTML
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const paymentUrl = `${baseUrl}/invoice-payment?id=${invoiceId}`;
    
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Invoice ${invoice.invoice_number}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
          .invoice-details { background: #fff; border: 1px solid #dee2e6; border-radius: 8px; padding: 20px; margin-bottom: 20px; }
          .actions { text-align: center; margin: 30px 0; }
          .btn { display: inline-block; padding: 12px 24px; color: white !important; text-decoration: none; border-radius: 4px; margin: 0 10px; font-weight: bold; }
          .btn-pay { background: #28a745; }
          .footer { text-align: center; color: #6c757d; font-size: 14px; margin-top: 30px; }
          .amount { font-size: 24px; font-weight: bold; color: #28a745; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Invoice ${invoice.invoice_number}</h1>
            <p>Invoice Date: ${new Date(invoice.issue_date).toLocaleDateString()}</p>
            <p>Due Date: ${new Date(invoice.due_date).toLocaleDateString()}</p>
          </div>
          
          <div class="invoice-details">
            <h2>Invoice Details</h2>
            <p><strong>Customer:</strong> ${invoice.customer_name}</p>
            <p><strong>Payment Terms:</strong> ${invoice.payment_terms}</p>
            <p class="amount"><strong>Amount Due:</strong> $${invoice.total_amount?.toFixed(2) || '0.00'}</p>
            
            ${invoice.notes_to_customer ? `
              <h3>Notes:</h3>
              <p>${invoice.notes_to_customer}</p>
            ` : ''}
            
            ${message ? `
              <h3>Message:</h3>
              <p>${message}</p>
            ` : ''}
          </div>
          
          <div class="actions">
            <h3>Pay Your Invoice Online:</h3>
            <a href="${paymentUrl}" class="btn btn-pay">Pay Now</a>
          </div>
          
          <div class="footer">
            <p>Thank you for your business!</p>
            <p>Payment is due by ${new Date(invoice.due_date).toLocaleDateString()}</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Send email
    const emailResult = await sendEmail(
      email,
      `Invoice ${invoice.invoice_number} - ${invoice.customer_name}`,
      emailHtml
    );

    if (!emailResult.success) {
      return NextResponse.json({ success: false, error: emailResult.error }, { status: 500 });
    }

    // Update invoice status to 'sent' and set sent_date
    await Invoice.findByIdAndUpdate(invoiceId, {
      invoice_status: 'sent',
      sent_date: new Date()
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Invoice sent successfully',
      messageId: emailResult.messageId 
    });

  } catch (error) {
    console.error('Error sending invoice:', error);
    return NextResponse.json({ success: false, error: 'Failed to send invoice' }, { status: 500 });
  }
}